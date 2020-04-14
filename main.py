import logging
import json
import sys
import os
import datetime
from requests import get
import math
from urllib.request import urlopen
from io import BytesIO
import base64
from PIL import Image

from flask import Flask, render_template, request, redirect, url_for
from flask_login import LoginManager
from flask_login import login_user, current_user, login_required, logout_user
from flask_dance.contrib.google import make_google_blueprint, google
from flask_dance.consumer import oauth_authorized

#import firebase_admin
#from firebase_admin import credentials
#from firebase_admin import firestore

# # ========== FireStore connection ================
# # Use the application default credentials
# cred = credentials.ApplicationDefault()
# firebase_admin.initialize_app(cred, {
#     'projectId': 'electrocuted-snail',
# })
# db = firestore.client()


# ========== Flask setup ==========================
# If `entrypoint` is not defined in app.yaml, App Engine will look for an app
# called `app` in `main.py`.
app = Flask(__name__, template_folder='views')
app.secret_key = 'not so top secret'
app.logger.setLevel(logging.DEBUG)
h1 = logging.StreamHandler(sys.stderr)
h1.setFormatter(logging.Formatter('%(levelname)-8s %(asctime)s %(filename)s:%(lineno)s] %(message)s'))
app.logger.addHandler(h1)


# # ============ SnailUser =========================
# def user_db_ref(db, email):
#     return db.collection('users').document(email)
        
# def user_from_db(db, email):
#     doc = user_db_ref(db, email).get()
#     as_dict = doc.to_dict()
#     picture = ''
#     if as_dict is not None:
#         picture = as_dict.get('picture', '')
#     return SnailUser(email, picture)

# class SnailUser:
#     def __init__(self, email, picture):
#         self.email = email
#         self.picture = picture

#     def save_to_db(self, db):
#         ref = user_db_ref(db, self.email)
#         initial_data = {'picture': self.picture}
#         if ref.get().exists:
#             ref.update(initial_data)
#         else:
#             ref.set(initial_data)
#             transaction = db.transaction()
#             replace_tags(
#                 transaction,
#                 tags_collection(self.email),
#                 [{'tag_id': 'bill',
#                   'description': 'Bill',
#                   'icon': 'attach_money'},
#                  {'tag_id': 'warranty',
#                   'description': 'Warranty',
#                   'icon': 'card_giftcard'}])
    
#     @property
#     def is_active(self):
#         return True
#     @property
#     def is_authenticated(self):
#         return True
#     @property
#     def is_anonymous(self):
#         return False

#     def get_id(self):
#         return self.email

#     def __str__(self):
#         return f'User with email {self.email}'


# # ========== Login setup ===========================
# login_manager = LoginManager()
# login_manager.init_app(app)

# @login_manager.user_loader
# def load_user(user_id):
#     return user_from_db(db, user_id)

# google_blueprint = make_google_blueprint(
#     client_id='387666456097-gpv671f9feq2s66ul0goi4c51913uqj7.apps.googleusercontent.com',
#     client_secret='OLfJlshhM_BJ86o3x3cvLw2i',
#     scope=[
#         'openid',
#         'https://www.googleapis.com/auth/userinfo.email',
#     ]
# )
# app.register_blueprint(google_blueprint, url_prefix='/auth')

# @oauth_authorized.connect
# def _on_signin(blueprint, token):
#     user_json = google.get('oauth2/v1/userinfo').json()
#     print(user_json)
#     us = SnailUser(user_json['email'], user_json.get('picture', ''))
#     us.save_to_db(db)
#     login_user(us)
    
# @app.route('/logout')
# def logout():
#     logout_user()
#     return redirect(url_for('root'))


# ============== Main endpoints ========================
# Just redirects to where angular asserts are served from.
@app.route('/')
def root():
    return redirect('/ui')

# In dev mode, we proxy /ui over to ng serve. In prod, static assets are served as
# configured in app.yaml. (See deploy.sh for exact details on how app.yaml is generated.)
if not os.getenv('GAE_ENV', '').startswith('standard'):
    @app.route('/ui', defaults={'path': ''})
    @app.route('/ui/<path:path>')
    def ui_proxy(path):
        resp = get(f'http://localhost:4200/ui/{path}', stream=True)
        return resp.raw.read(), resp.status_code, resp.headers.items()


global_next_id = 0
letters = [chr(ord('A') + i) for i in range(ord('Z') - ord('A') + 1)]
num_letters = len(letters)
def as_string_id(num_id):
    num_digits = max(math.ceil(math.log(num_id + 1, num_letters)), 3)
    result = ''
    for i in range(num_digits):
        result = letters[num_id % num_letters] + result
        num_id //= num_letters
    assert num_id == 0
    return result

def get_next_id():
    global global_next_id
    res = as_string_id(global_next_id)
    global_next_id += 1
    return res

chains = {}
def add_chain_link(parent, image_url):
    next_id = get_next_id()
    chains[next_id] = {'parent': parent, 'image_url': image_url}
    return next_id

def get_chain(last_id):
    return chains[last_id]

# ============== Ajax endpoints =======================

@app.route('/addFregment', methods=['POST'])
def addFregment():
    params = request.json
    return json.dumps({
        'id': add_chain_link(params['parent'], params['image_url'])
    })

def image_to_url(img):
    data = BytesIO()
    img.save(data, "PNG")
    data64 = base64.b64encode(data.getvalue())
    return u'data:img/png;base64,'+data64.decode('utf-8')

@app.route('/continue', methods=['GET'])
def cont():
    last_id = request.args['last_id']
    chain = get_chain(last_id)
    resp = urlopen(chain['image_url'])
    img = Image.open(resp.fp)
    cropped = img.crop((0, 350, 400, 400))
    return json.dumps(
        {'last_id': last_id, 'cropped_url': image_to_url(cropped)})


def get_url_list(last_id):
    if not last_id:
        return []
    chain = get_chain(last_id)
    return get_url_list(chain['parent']) + [chain['image_url']]


@app.route('/reveal', methods=['GET'])
def reveal():
    last_id = request.args['last_id']
    return json.dumps(get_url_list(last_id))

# ============= Boilerplate!!! ========================
if __name__ == '__main__':
    # This is used when running locally only. When deploying to Google App
    # Engine, a webserver process such as Gunicorn will serve the app. This
    # can be configured by adding an `entrypoint` to app.yaml.
    app.run(host='127.0.0.1', port=8080, debug=True)
# [END gae_python37_app]
