from functools import wraps

from flask import current_app, g, request
from flask_restful import Resource
from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer

from models import ROLES, Artwork, User, db

TOKEN_MAX_AGE = 60 * 60 * 24 * 30  # 30 days


def _serializer():
    return URLSafeTimedSerializer(current_app.config['SECRET_KEY'], salt='horizon-auth')


def make_token(user):
    return _serializer().dumps({'uid': user.id})


def current_user():
    header = request.headers.get('Authorization', '')
    if not header.startswith('Bearer '):
        return None
    try:
        data = _serializer().loads(header[7:], max_age=TOKEN_MAX_AGE)
    except (BadSignature, SignatureExpired):
        return None
    return db.session.get(User, data.get('uid'))


def auth_required(*roles):
    """Require a logged-in user, optionally limited to certain roles. Sets g.user."""
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            user = current_user()
            if not user:
                return {'error': 'Please log in first'}, 401
            if roles and user.role not in roles:
                return {'error': f"Only {' or '.join(roles)} accounts can do this"}, 403
            g.user = user
            return fn(*args, **kwargs)
        return wrapper
    return decorator


def body():
    return request.get_json(silent=True) or {}


PROFILE_FIELDS = ('name', 'bio', 'avatar', 'location', 'phone', 'website', 'industry')


class SignupResource(Resource):
    def post(self):
        data = body()
        name = (data.get('name') or '').strip()
        email = (data.get('email') or '').strip().lower()
        password = data.get('password') or ''
        role = data.get('role') or 'customer'

        if not name or not email or not password:
            return {'error': 'Name, email and password are required'}, 400
        if '@' not in email:
            return {'error': 'Please enter a valid email'}, 400
        if len(password) < 6:
            return {'error': 'Password must be at least 6 characters'}, 400
        if role not in ROLES:
            return {'error': f"Role must be one of: {', '.join(ROLES)}"}, 400
        if User.query.filter(db.func.lower(User.email) == email).first():
            return {'error': 'An account with this email already exists'}, 409

        user = User(name=name, email=email, role=role)
        for field in PROFILE_FIELDS:
            if field != 'name' and data.get(field):
                setattr(user, field, data[field])
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        return {'token': make_token(user), 'user': user.to_dict(private=True)}, 201


class LoginResource(Resource):
    def post(self):
        data = body()
        email = (data.get('email') or '').strip().lower()
        user = User.query.filter(db.func.lower(User.email) == email).first()
        if not user or not user.check_password(data.get('password') or ''):
            return {'error': 'Incorrect email or password'}, 401
        return {'token': make_token(user), 'user': user.to_dict(private=True)}, 200


class MeResource(Resource):
    @auth_required()
    def get(self):
        return g.user.to_dict(private=True), 200

    @auth_required()
    def patch(self):
        data = body()
        user = g.user
        if 'name' in data and not (data['name'] or '').strip():
            return {'error': 'Name cannot be empty'}, 400
        for field in PROFILE_FIELDS:
            if field in data:
                value = data[field].strip() if isinstance(data[field], str) else data[field]
                setattr(user, field, value or None if field != 'name' else value)

        # Keep the artist name shown on artworks in sync
        if user.role == 'artist' and 'name' in data:
            Artwork.query.filter_by(artist_id=user.id).update({'artist': user.name})

        db.session.commit()
        return user.to_dict(private=True), 200
