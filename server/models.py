from datetime import datetime

from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import inspect, text
from sqlalchemy_serializer import SerializerMixin
from werkzeug.security import check_password_hash, generate_password_hash

db = SQLAlchemy()

ROLES = ('artist', 'customer', 'company')
CATEGORIES = ('painting', 'sculpture', 'photography')
ORDER_STATUSES = ('pending_payment', 'paid', 'cancelled')
CONNECTION_STATUSES = ('pending', 'accepted', 'declined')


def iso(dt):
    return dt.isoformat() if dt else None


class User(db.Model, SerializerMixin):
    """One account table for every role: artist, customer (buyer) or company."""
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255))
    role = db.Column(db.String(20), nullable=False, server_default='customer')
    bio = db.Column(db.Text)
    avatar = db.Column(db.String(500))
    location = db.Column(db.String(120))
    phone = db.Column(db.String(30))
    website = db.Column(db.String(255))
    industry = db.Column(db.String(120))  # companies
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # relationships
    exhibitions = db.relationship('Exhibition', back_populates='user', cascade='all,delete-orphan')
    artworks = db.relationship('Artwork', back_populates='owner')
    events = db.relationship('Event', back_populates='artist', cascade='all,delete-orphan')
    orders = db.relationship('Order', back_populates='customer')

    serialize_rules = ('-exhibitions.user',)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return bool(self.password_hash) and check_password_hash(self.password_hash, password)

    def to_dict(self, private=False):
        data = {
            'id': self.id,
            'name': self.name,
            'role': self.role,
            'bio': self.bio,
            'avatar': self.avatar,
            'location': self.location,
            'website': self.website,
            'industry': self.industry,
            'created_at': iso(self.created_at),
        }
        if private:
            data['email'] = self.email
            data['phone'] = self.phone
        return data

    def summary(self):
        return {'id': self.id, 'name': self.name, 'role': self.role, 'avatar': self.avatar}


class Artwork(db.Model, SerializerMixin):
    __tablename__ = 'artworks'
    id = db.Column(db.Integer, primary_key=True)
    artist = db.Column(db.String(120), nullable=False)  # display name (kept for older rows)
    artist_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    title = db.Column(db.String(120), nullable=False)
    image = db.Column(db.String(500), nullable=False)
    price = db.Column(db.Float, nullable=False)
    category = db.Column(db.Enum(*CATEGORIES))
    description = db.Column(db.Text)
    # available -> reserved (order placed) -> sold (paid)
    status = db.Column(db.String(20), nullable=False, server_default='available', default='available')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "artist": self.artist,
            "artist_id": self.artist_id,
            "title": self.title,
            "image": self.image,
            "price": self.price,
            "category": self.category,
            "description": self.description,
            "status": self.status or 'available',
            "created_at": iso(self.created_at),
        }

    # relationships
    owner = db.relationship('User', back_populates='artworks')
    exhibitions = db.relationship('Exhibition', back_populates='artwork', cascade='all,delete-orphan')

    serialize_rules = ('-exhibitions.artwork',)


class Event(db.Model):
    """Exhibitions, workshops, open studios… advertised by artists."""
    __tablename__ = 'events'
    id = db.Column(db.Integer, primary_key=True)
    artist_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(160), nullable=False)
    description = db.Column(db.Text)
    venue = db.Column(db.String(200), nullable=False)
    starts_at = db.Column(db.DateTime, nullable=False)
    ends_at = db.Column(db.DateTime)
    image = db.Column(db.String(500))
    ticket_link = db.Column(db.String(500))
    price = db.Column(db.Float)  # None / 0 = free
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    artist = db.relationship('User', back_populates='events')

    def to_dict(self):
        return {
            'id': self.id,
            'artist_id': self.artist_id,
            'artist': self.artist.summary() if self.artist else None,
            'title': self.title,
            'description': self.description,
            'venue': self.venue,
            'starts_at': iso(self.starts_at),
            'ends_at': iso(self.ends_at),
            'image': self.image,
            'ticket_link': self.ticket_link,
            'price': self.price,
            'created_at': iso(self.created_at),
        }


class Order(db.Model):
    """A customer checkout. Payment (M-Pesa) will move it from pending_payment to paid."""
    __tablename__ = 'orders'
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    phone = db.Column(db.String(30), nullable=False)  # M-Pesa number for the STK push
    total = db.Column(db.Float, nullable=False, default=0)
    status = db.Column(db.String(20), nullable=False, default='pending_payment')
    payment_ref = db.Column(db.String(64))  # M-Pesa receipt number, once paid
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    customer = db.relationship('User', back_populates='orders')
    items = db.relationship('OrderItem', back_populates='order', cascade='all,delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'customer': self.customer.summary() if self.customer else None,
            'phone': self.phone,
            'total': self.total,
            'status': self.status,
            'payment_ref': self.payment_ref,
            'created_at': iso(self.created_at),
            'items': [item.to_dict() for item in self.items],
        }


class OrderItem(db.Model):
    __tablename__ = 'order_items'
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    artwork_id = db.Column(db.Integer, db.ForeignKey('artworks.id'))  # null if the artwork was later deleted
    title = db.Column(db.String(120), nullable=False)  # snapshot at purchase time
    price = db.Column(db.Float, nullable=False)

    order = db.relationship('Order', back_populates='items')
    artwork = db.relationship('Artwork')

    def to_dict(self):
        return {
            'id': self.id,
            'artwork_id': self.artwork_id,
            'title': self.title,
            'price': self.price,
            'artwork': self.artwork.to_dict() if self.artwork else None,
        }


class Connection(db.Model):
    """A request between an artist and a company (either side can start it)."""
    __tablename__ = 'connections'
    id = db.Column(db.Integer, primary_key=True)
    requester_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    recipient_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    message = db.Column(db.Text)
    status = db.Column(db.String(20), nullable=False, default='pending')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    responded_at = db.Column(db.DateTime)

    requester = db.relationship('User', foreign_keys=[requester_id])
    recipient = db.relationship('User', foreign_keys=[recipient_id])

    def to_dict(self):
        # Contact details are only shared once both sides have agreed
        accepted = self.status == 'accepted'

        def party(user):
            data = user.summary()
            data['location'] = user.location
            data['industry'] = user.industry
            if accepted:
                data['email'] = user.email
                data['phone'] = user.phone
                data['website'] = user.website
            return data

        return {
            'id': self.id,
            'requester': party(self.requester),
            'recipient': party(self.recipient),
            'message': self.message,
            'status': self.status,
            'created_at': iso(self.created_at),
            'responded_at': iso(self.responded_at),
        }


class Exhibition(db.Model, SerializerMixin):
    __tablename__ = 'exhibitions'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    artwork_id = db.Column(db.Integer, db.ForeignKey('artworks.id'))
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    # relationships
    user = db.relationship('User', back_populates='exhibitions')
    artwork = db.relationship('Artwork', back_populates='exhibitions')

    serialize_rules = ('-user.exhibitions', '-artwork.exhibitions')


def add_missing_columns():
    """db.create_all() creates new tables but never alters existing ones.
    This adds any new columns to tables from an older art.db so it keeps working."""
    inspector = inspect(db.engine)
    for table in db.metadata.sorted_tables:
        if not inspector.has_table(table.name):
            continue
        existing = {col['name'] for col in inspector.get_columns(table.name)}
        for col in table.columns:
            if col.name in existing:
                continue
            col_type = col.type.compile(db.engine.dialect)
            default = ''
            if col.server_default is not None:
                default = f" DEFAULT '{col.server_default.arg}'"
            db.session.execute(text(f'ALTER TABLE {table.name} ADD COLUMN {col.name} {col_type}{default}'))
    db.session.commit()
