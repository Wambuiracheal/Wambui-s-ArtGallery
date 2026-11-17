from flask import g, request
from flask_restful import Resource

from models import CATEGORIES, Artwork, OrderItem, db
from resources.auth import auth_required, body


def _validate(data, partial=False):
    """Returns (clean_data, error)."""
    clean = {}
    required = ['title', 'image', 'price', 'category']
    if not partial:
        missing = [key for key in required if data.get(key) in (None, '')]
        if missing:
            return None, f"Missing required fields: {', '.join(missing)}"

    for key in ('title', 'image', 'description'):
        if key in data:
            clean[key] = (data[key] or '').strip() or None
    if partial and ('title' in clean and not clean['title'] or 'image' in clean and not clean['image']):
        return None, 'Title and image cannot be empty'

    if 'price' in data and data['price'] not in (None, ''):
        try:
            clean['price'] = float(data['price'])
        except (TypeError, ValueError):
            return None, 'Price must be a number'
        if clean['price'] < 0:
            return None, 'Price cannot be negative'

    if 'category' in data and data['category']:
        category = str(data['category']).lower()
        if category not in CATEGORIES:
            return None, f"Category must be one of: {', '.join(CATEGORIES)}"
        clean['category'] = category
    return clean, None


# ARTWORK
class ArtworkDisplayResource(Resource):
    def get(self):
        query = Artwork.query
        args = request.args
        if args.get('category'):
            query = query.filter(Artwork.category == args['category'].lower())
        if args.get('artist_id'):
            query = query.filter(Artwork.artist_id == args.get('artist_id', type=int))
        if args.get('available') in ('1', 'true'):
            query = query.filter(db.or_(Artwork.status == 'available', Artwork.status.is_(None)))
        if args.get('q'):
            like = f"%{args['q']}%"
            query = query.filter(db.or_(Artwork.title.ilike(like), Artwork.artist.ilike(like)))
        artworks = query.order_by(Artwork.id.desc()).all()
        return [artwork.to_dict() for artwork in artworks]

    @auth_required('artist')
    def post(self):
        clean, error = _validate(body())
        if error:
            return {'error': error}, 400

        new_artwork = Artwork(**clean, artist=g.user.name, artist_id=g.user.id, status='available')
        db.session.add(new_artwork)
        db.session.commit()
        return new_artwork.to_dict(), 201


class ArtworkResource(Resource):
    def get(self, id):
        artwork = db.session.get(Artwork, id)
        if not artwork:
            return {'error': 'Artwork not found'}, 404
        return artwork.to_dict(), 200

    @auth_required('artist')
    def patch(self, id):
        artwork = db.session.get(Artwork, id)
        if not artwork:
            return {'error': 'Artwork trying to update cannot be found'}, 404
        if artwork.artist_id != g.user.id:
            return {'error': 'You can only edit your own artworks'}, 403

        clean, error = _validate(body(), partial=True)
        if error:
            return {'error': error}, 400
        for key, value in clean.items():
            setattr(artwork, key, value)

        db.session.commit()
        return artwork.to_dict(), 200

    @auth_required('artist')
    def delete(self, id):
        artwork = db.session.get(Artwork, id)
        if not artwork:
            return {'error': 'Artwork not found'}, 404
        if artwork.artist_id != g.user.id:
            return {'error': 'You can only delete your own artworks'}, 403
        if artwork.status in ('reserved', 'sold'):
            return {'error': f'This artwork is {artwork.status} and can no longer be deleted'}, 409

        # Past (cancelled) orders keep their title/price snapshot
        OrderItem.query.filter_by(artwork_id=id).update({'artwork_id': None})
        db.session.delete(artwork)
        db.session.commit()
        return {'message': 'Artwork Deleted'}, 200
