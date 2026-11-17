import os

from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from flask_restful import Api

from models import add_missing_columns, db
from resources.art import ArtworkDisplayResource, ArtworkResource
from resources.auth import LoginResource, MeResource, SignupResource
from resources.connections import ConnectionListResource, ConnectionResource
from resources.events import EventListResource, EventResource
from resources.orders import OrderListResource, OrderResource, SalesResource
from resources.users import UserDetailResource, UserListResource

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///art.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
# Set SECRET_KEY in production — it signs login tokens
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-only-change-me')
CORS(app)

db.init_app(app)
migrate = Migrate(app, db)
api = Api(app)

with app.app_context():
    db.create_all()
    add_missing_columns()

# Auth
api.add_resource(SignupResource, '/auth/signup')
api.add_resource(LoginResource, '/auth/login')
api.add_resource(MeResource, '/auth/me')

# Artworks
api.add_resource(ArtworkDisplayResource, '/artworks')
api.add_resource(ArtworkResource, '/artworks/<int:id>')

# Artist & company profiles
api.add_resource(UserListResource, '/users')
api.add_resource(UserDetailResource, '/users/<int:id>')

# Events
api.add_resource(EventListResource, '/events')
api.add_resource(EventResource, '/events/<int:id>')

# Shopping
api.add_resource(OrderListResource, '/orders')
api.add_resource(OrderResource, '/orders/<int:id>')
api.add_resource(SalesResource, '/sales')

# Artist <-> company connections
api.add_resource(ConnectionListResource, '/connections')
api.add_resource(ConnectionResource, '/connections/<int:id>')


@app.route('/')
def home():
    return '<h1>Welcome to the Artwork Page</h1>'


if __name__ == '__main__':
    app.run(debug=True)
