import re

from flask import g
from flask_restful import Resource

from models import Artwork, Order, OrderItem, db
from resources.auth import auth_required, body

# Accepts 07XXXXXXXX, 01XXXXXXXX, 2547XXXXXXXX, +2547XXXXXXXX
PHONE_RE = re.compile(r'^(?:\+?254|0)([17]\d{8})$')


def normalize_phone(raw):
    """Returns the number in M-Pesa's 2547XXXXXXXX format, or None if invalid."""
    match = PHONE_RE.match(re.sub(r'[\s-]', '', raw or ''))
    return f'254{match.group(1)}' if match else None


class OrderListResource(Resource):
    @auth_required('customer')
    def get(self):
        orders = Order.query.filter_by(customer_id=g.user.id).order_by(Order.id.desc()).all()
        return [order.to_dict() for order in orders], 200

    @auth_required('customer')
    def post(self):
        data = body()
        ids = data.get('artwork_ids') or []
        phone = normalize_phone(data.get('phone'))
        if not ids or not isinstance(ids, list):
            return {'error': 'Your cart is empty'}, 400
        if not phone:
            return {'error': 'Enter a valid Safaricom number, e.g. 0712 345 678'}, 400

        artworks = Artwork.query.filter(Artwork.id.in_(ids)).all()
        if len(artworks) != len(set(ids)):
            return {'error': 'Some artworks in your cart no longer exist'}, 409
        unavailable = [a.title for a in artworks if (a.status or 'available') != 'available']
        if unavailable:
            return {'error': f"Already reserved or sold: {', '.join(unavailable)}",
                    'unavailable_ids': [a.id for a in artworks if (a.status or 'available') != 'available']}, 409

        order = Order(customer_id=g.user.id, phone=phone, status='pending_payment',
                      total=sum(a.price for a in artworks))
        for artwork in artworks:
            order.items.append(OrderItem(artwork_id=artwork.id, title=artwork.title, price=artwork.price))
            artwork.status = 'reserved'  # hold it for this buyer until payment
        db.session.add(order)
        db.session.commit()

        # TODO (M-Pesa): trigger a Daraja STK push to `order.phone` for `order.total` here,
        # and add a callback route that sets order.status = 'paid', order.payment_ref,
        # and each artwork.status = 'sold'.
        return order.to_dict(), 201


class OrderResource(Resource):
    @auth_required('customer')
    def patch(self, id):
        """Customers can cancel an unpaid order, which releases the artworks."""
        order = db.session.get(Order, id)
        if not order or order.customer_id != g.user.id:
            return {'error': 'Order not found'}, 404
        if body().get('status') != 'cancelled':
            return {'error': 'You can only cancel an order'}, 400
        if order.status != 'pending_payment':
            return {'error': f'This order is already {order.status}'}, 409

        order.status = 'cancelled'
        for item in order.items:
            if item.artwork and item.artwork.status == 'reserved':
                item.artwork.status = 'available'
        db.session.commit()
        return order.to_dict(), 200


class SalesResource(Resource):
    """An artist's view of orders that include their work."""
    @auth_required('artist')
    def get(self):
        items = (OrderItem.query.join(Artwork).join(Order)
                 .filter(Artwork.artist_id == g.user.id)
                 .order_by(Order.id.desc()).all())
        return [{
            'id': item.id,
            'order_id': item.order_id,
            'title': item.title,
            'price': item.price,
            'artwork': item.artwork.to_dict() if item.artwork else None,
            'status': item.order.status,
            'buyer': item.order.customer.name if item.order.customer else None,
            'created_at': item.order.created_at.isoformat() if item.order.created_at else None,
        } for item in items], 200
