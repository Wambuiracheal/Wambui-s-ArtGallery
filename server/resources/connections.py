from datetime import datetime

from flask import g
from flask_restful import Resource

from models import Connection, User, db
from resources.auth import auth_required, body

PAIRS = {'artist': 'company', 'company': 'artist'}


class ConnectionListResource(Resource):
    @auth_required('artist', 'company')
    def get(self):
        uid = g.user.id
        connections = (Connection.query
                       .filter(db.or_(Connection.requester_id == uid, Connection.recipient_id == uid))
                       .order_by(Connection.id.desc()).all())
        return [c.to_dict() for c in connections], 200

    @auth_required('artist', 'company')
    def post(self):
        data = body()
        recipient = db.session.get(User, data.get('recipient_id') or 0)
        if not recipient:
            return {'error': 'That profile does not exist'}, 404
        if recipient.role != PAIRS[g.user.role]:
            return {'error': f'{g.user.role.title()}s can only connect with {PAIRS[g.user.role]} accounts'}, 400

        existing = Connection.query.filter(
            Connection.status.in_(('pending', 'accepted')),
            db.or_(
                db.and_(Connection.requester_id == g.user.id, Connection.recipient_id == recipient.id),
                db.and_(Connection.requester_id == recipient.id, Connection.recipient_id == g.user.id),
            )).first()
        if existing:
            msg = 'You are already connected' if existing.status == 'accepted' else 'A request is already pending'
            return {'error': msg}, 409

        connection = Connection(requester_id=g.user.id, recipient_id=recipient.id,
                                message=(data.get('message') or '').strip() or None)
        db.session.add(connection)
        db.session.commit()
        return connection.to_dict(), 201


class ConnectionResource(Resource):
    @auth_required('artist', 'company')
    def patch(self, id):
        """The recipient accepts or declines."""
        connection = db.session.get(Connection, id)
        if not connection or connection.recipient_id != g.user.id:
            return {'error': 'Request not found'}, 404
        status = body().get('status')
        if status not in ('accepted', 'declined'):
            return {'error': 'Status must be accepted or declined'}, 400
        if connection.status != 'pending':
            return {'error': f'This request was already {connection.status}'}, 409
        connection.status = status
        connection.responded_at = datetime.utcnow()
        db.session.commit()
        return connection.to_dict(), 200

    @auth_required('artist', 'company')
    def delete(self, id):
        """Either side can withdraw a request or remove a connection."""
        connection = db.session.get(Connection, id)
        if not connection or g.user.id not in (connection.requester_id, connection.recipient_id):
            return {'error': 'Connection not found'}, 404
        db.session.delete(connection)
        db.session.commit()
        return {'message': 'Connection removed'}, 200
