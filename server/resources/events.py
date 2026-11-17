from datetime import datetime

from flask import g, request
from flask_restful import Resource

from models import Event, db
from resources.auth import auth_required, body

TEXT_FIELDS = ('title', 'description', 'venue', 'image', 'ticket_link')


def _parse_dt(value):
    if not value:
        return None
    try:
        return datetime.fromisoformat(str(value).replace('Z', ''))
    except ValueError:
        raise ValueError('Dates must look like 2026-12-01T18:00')


def _validate(data, partial=False):
    if not partial:
        missing = [k for k in ('title', 'venue', 'starts_at') if not data.get(k)]
        if missing:
            return None, f"Missing required fields: {', '.join(missing)}"
    clean = {}
    for key in TEXT_FIELDS:
        if key in data:
            clean[key] = (data[key] or '').strip() or None
    if partial and any(k in clean and not clean[k] for k in ('title', 'venue')):
        return None, 'Title and venue cannot be empty'
    try:
        if 'starts_at' in data:
            clean['starts_at'] = _parse_dt(data['starts_at'])
            if not clean['starts_at']:
                return None, 'Start date is required'
        if 'ends_at' in data:
            clean['ends_at'] = _parse_dt(data['ends_at'])
    except ValueError as err:
        return None, str(err)
    if 'price' in data:
        if data['price'] in (None, ''):
            clean['price'] = None
        else:
            try:
                clean['price'] = float(data['price'])
            except (TypeError, ValueError):
                return None, 'Price must be a number'
    return clean, None


class EventListResource(Resource):
    def get(self):
        query = Event.query
        when = request.args.get('when', 'upcoming')
        now = datetime.now()
        if request.args.get('artist_id'):
            query = query.filter(Event.artist_id == request.args.get('artist_id', type=int))
        if when == 'upcoming':
            query = query.filter(Event.starts_at >= now).order_by(Event.starts_at)
        elif when == 'past':
            query = query.filter(Event.starts_at < now).order_by(Event.starts_at.desc())
        else:
            query = query.order_by(Event.starts_at.desc())
        return [event.to_dict() for event in query.all()], 200

    @auth_required('artist')
    def post(self):
        clean, error = _validate(body())
        if error:
            return {'error': error}, 400
        if clean.get('ends_at') and clean['ends_at'] < clean['starts_at']:
            return {'error': 'The event cannot end before it starts'}, 400
        event = Event(**clean, artist_id=g.user.id)
        db.session.add(event)
        db.session.commit()
        return event.to_dict(), 201


class EventResource(Resource):
    def get(self, id):
        event = db.session.get(Event, id)
        if not event:
            return {'error': 'Event not found'}, 404
        return event.to_dict(), 200

    @auth_required('artist')
    def patch(self, id):
        event = db.session.get(Event, id)
        if not event:
            return {'error': 'Event not found'}, 404
        if event.artist_id != g.user.id:
            return {'error': 'You can only edit your own events'}, 403
        clean, error = _validate(body(), partial=True)
        if error:
            return {'error': error}, 400
        for key, value in clean.items():
            setattr(event, key, value)
        if event.ends_at and event.ends_at < event.starts_at:
            db.session.rollback()
            return {'error': 'The event cannot end before it starts'}, 400
        db.session.commit()
        return event.to_dict(), 200

    @auth_required('artist')
    def delete(self, id):
        event = db.session.get(Event, id)
        if not event:
            return {'error': 'Event not found'}, 404
        if event.artist_id != g.user.id:
            return {'error': 'You can only delete your own events'}, 403
        db.session.delete(event)
        db.session.commit()
        return {'message': 'Event deleted'}, 200
