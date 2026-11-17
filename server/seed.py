"""Adds demo accounts, artworks and events so every part of the site has something to show.

Run:  python seed.py        (or: docker compose exec server python seed.py)
Safe to run more than once — it skips accounts that already exist.
All demo accounts use the password:  password123
"""
from datetime import datetime, timedelta

from app import app
from models import Artwork, Event, User, db

PASSWORD = 'password123'

USERS = [
    dict(name='Amani Wanjiru', email='artist@horizon.test', role='artist', location='Nairobi',
         bio='Painter working with bold colour and Kenyan city life.'),
    dict(name='Juma Otieno', email='artist2@horizon.test', role='artist', location='Kisumu',
         bio='Sculptor and photographer inspired by the lake.'),
    dict(name='Savannah Studios Ltd', email='company@horizon.test', role='company', location='Nairobi',
         industry='Interior design', website='https://example.com',
         bio='We commission original art for hotels and offices across East Africa.'),
    dict(name='Wanjiku Collector', email='customer@horizon.test', role='customer', location='Mombasa'),
]

ARTWORKS = {
    'artist@horizon.test': [
        ('Golden Hour Over the City', 'painting', 45000, 'https://images6.alphacoders.com/476/476288.jpg'),
        ('Market Day', 'painting', 28000, 'https://images7.alphacoders.com/406/406736.jpg'),
        ('Blue Dreams', 'painting', 36000, 'https://images6.alphacoders.com/341/341236.jpg'),
    ],
    'artist2@horizon.test': [
        ('Lakeside Stillness', 'photography', 15000, 'https://images5.alphacoders.com/134/1345268.png'),
        ('Forms of the Shore', 'sculpture', 60000, 'https://picfiles.alphacoders.com/302/302369.jpg'),
    ],
}


def seed():
    with app.app_context():
        accounts = {}
        for data in USERS:
            user = User.query.filter_by(email=data['email']).first()
            if not user:
                user = User(**data)
                user.set_password(PASSWORD)
                db.session.add(user)
                print(f"Added {data['role']}: {data['email']}")
            accounts[data['email']] = user
        db.session.commit()

        for email, works in ARTWORKS.items():
            artist = accounts[email]
            if Artwork.query.filter_by(artist_id=artist.id).count():
                continue
            for title, category, price, image in works:
                db.session.add(Artwork(artist=artist.name, artist_id=artist.id, title=title, category=category,
                                       price=price, image=image, status='available',
                                       description=f'An original {category} by {artist.name}.'))

        amani = accounts['artist@horizon.test']
        if not Event.query.filter_by(artist_id=amani.id).count():
            soon = datetime.now().replace(hour=18, minute=0, second=0, microsecond=0) + timedelta(days=10)
            db.session.add(Event(artist_id=amani.id, title='Colours of Nairobi — Solo Show',
                                 venue='Circle Art Gallery, Nairobi', starts_at=soon,
                                 ends_at=soon + timedelta(hours=3), price=None,
                                 description='Opening night with the artist. Drinks and music.'))
            db.session.add(Event(artist_id=amani.id, title='Painting Workshop for Beginners',
                                 venue='Kuona Artists Collective', starts_at=soon + timedelta(days=14),
                                 price=1500, description='Bring your curiosity — all materials provided.'))
        db.session.commit()
        print(f'Done. Log in with any demo email and the password "{PASSWORD}".')


if __name__ == '__main__':
    seed()
