from datetime import datetime

from flask import request
from flask_restful import Resource

from models import Artwork, Event, User, db


def _with_counts(user):
    data = user.to_dict()
    if user.role == 'artist':
        data['artworks_count'] = Artwork.query.filter_by(artist_id=user.id).count()
        data['events_count'] = Event.query.filter(
            Event.artist_id == user.id, Event.starts_at >= datetime.now()
        ).count()
    return data


class UserListResource(Resource):
    """Public directories: /users?role=artist or /users?role=company"""
    def get(self):
        role = request.args.get('role')
        if role not in ('artist', 'company'):
            return {'error': 'role must be artist or company'}, 400
        query = User.query.filter_by(role=role)
        if request.args.get('q'):
            like = f"%{request.args['q']}%"
            query = query.filter(db.or_(User.name.ilike(like), User.location.ilike(like),
                                        User.industry.ilike(like), User.bio.ilike(like)))
        return [_with_counts(user) for user in query.order_by(User.name).all()], 200


class UserDetailResource(Resource):
    """Public profile for an artist or company (customers are private)."""
    def get(self, id):
        user = db.session.get(User, id)
        if not user or user.role == 'customer':
            return {'error': 'Profile not found'}, 404
        data = _with_counts(user)
        if user.role == 'artist':
            data['artworks'] = [a.to_dict() for a in
                                Artwork.query.filter_by(artist_id=user.id).order_by(Artwork.id.desc())]
            data['events'] = [e.to_dict() for e in
                              Event.query.filter(Event.artist_id == user.id, Event.starts_at >= datetime.now())
                              .order_by(Event.starts_at)]
        return data, 200
