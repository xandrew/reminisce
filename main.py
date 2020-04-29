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
import random
import timeago

from flask import Flask, render_template, request, redirect, url_for
from flask_login import LoginManager
from flask_login import login_user, current_user, login_required, logout_user
from flask_dance.contrib.google import make_google_blueprint, google
from flask_dance.consumer import oauth_authorized

import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

# ========== FireStore connection ================
# Use the application default credentials
cred = credentials.ApplicationDefault()
firebase_admin.initialize_app(cred, {
    'projectId': 'foldwithme',
})
db = firestore.client()

# ========== Flask setup ==========================
# If `entrypoint` is not defined in app.yaml, App Engine will look for an app
# called `app` in `main.py`.
app = Flask(__name__, template_folder='views')
app.secret_key = 'not so top secret'
app.logger.setLevel(logging.DEBUG)
h1 = logging.StreamHandler(sys.stderr)
h1.setFormatter(logging.Formatter('%(levelname)-8s %(asctime)s %(filename)s:%(lineno)s] %(message)s'))
app.logger.addHandler(h1)


# ============ User =========================
def user_db_ref(email):
    return db.collection('users').document(email)
        
def user_from_db(email):
    doc = user_db_ref(email).get()
    as_dict = doc.to_dict()
    picture = ''
    given_name = ''
    if as_dict is not None:
        picture = as_dict.get('picture', '')
        given_name = as_dict.get('given_name', '')
    return FoldUser(email, picture, given_name)

class FoldUser:
    def __init__(self, email, picture, given_name):
        self.email = email
        self.picture = picture
        self.given_name = given_name

    def save_to_db(self):
        ref = user_db_ref(self.email)
        initial_data = {'picture': self.picture, 'given_name': self.given_name}
        if ref.get().exists:
            ref.update(initial_data)
        else:
            ref.set(initial_data)
    
    @property
    def is_active(self):
        return True
    @property
    def is_authenticated(self):
        return True
    @property
    def is_anonymous(self):
        return False

    def get_id(self):
        return self.email

    def __str__(self):
        return f'User with email {self.email}'


# ========== Login setup ===========================
login_manager = LoginManager()
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    return user_from_db(user_id)


secret = open("google_client_secret").read()

google_blueprint = make_google_blueprint(
    client_id='594397528159-gb303qan1ci6mna9vthin8qsohae95k8.apps.googleusercontent.com',
    client_secret=secret,
    scope=[
        'openid',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
    ]
)
app.register_blueprint(google_blueprint, url_prefix='/auth')

@oauth_authorized.connect
def _on_signin(blueprint, token):
    user_json = google.get('oauth2/v1/userinfo').json()
    print(user_json)
    us = FoldUser(user_json['email'], user_json.get('picture', ''), user_json.get('given_name', ''))
    us.save_to_db()
    login_user(us)
    
@app.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('root'))


# ============== Main endpoints ========================
# Just redirects to where angular asserts are served from.
@app.route('/')
def root():
    return redirect('/ui/')

# In dev mode, we proxy /ui over to ng serve. In prod, static assets are served as
# configured in app.yaml. (See deploy.sh for exact details on how app.yaml is generated.)
if not os.getenv('GAE_ENV', '').startswith('standard'):
    @app.route('/ui/', defaults={'path': ''})
    @app.route('/ui/<path:path>')
    def ui_proxy(path):
        resp = get(f'http://localhost:4200/ui/{path}', stream=True)
        return resp.raw.read(), resp.status_code, resp.headers.items()




@firestore.transactional
def increment_last_id(transaction):
  id_doc = db.collection('globals').document('id')
  snapshot = id_doc.get(transaction=transaction)
  if snapshot.exists:
      last_id = snapshot.get('last_id')
  else:
      last_id = -1
  next_id = last_id + 1
  transaction.set(id_doc, {'last_id': next_id})
  return next_id

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
    transaction = db.transaction()
    return as_string_id(increment_last_id(transaction))

def link_ref(link_id):
    return db.collection('links').document(link_id)

def add_chain_link(parent, image_url, user, revealed):
    next_id = get_next_id()
    link_ref(next_id).set({'parent': parent, 'image_url': image_url, 'user': user, 'revealed': revealed})
    return next_id

def get_chain_link(link_id):
    snapshot = link_ref(link_id).get()
    res = snapshot.to_dict()
    res['create_time'] = snapshot.create_time
    return res

def gallery_ref(code):
    return db.collection('galleries').document(code)

def user_galleries_collection(user_id):
    return user_db_ref(user_id).collection('galleries')

def gallery_pictures_collection(code):
    return gallery_ref(code).collection('pictures')

def user_galleries(user_id):
    return [
        { 'code': snapshot.id,
          'title': gallery_ref(snapshot.id).get().get('title') }
        for snapshot in user_galleries_collection(user_id).stream()]

def gallery_has_picture(code, picture_id):
    return gallery_pictures_collection(code).document(picture_id).get().exists

@firestore.transactional
def add_picture_to_gallery_transaction(transaction, code, picture_id):
    doc = gallery_pictures_collection(code).document(picture_id)
    if not doc.get(transaction=transaction).exists:
        transaction.set(doc, {})

def add_picture_to_gallery(code, picture_id):
    transaction = db.transaction()
    add_picture_to_gallery_transaction(transaction, code, picture_id)

def random_code():
    return ''.join(random.choices('0123456789', k=5))

def new_gallery_code():
    code = random_code()
    while gallery_ref(code).get().exists:
      code = random_code()
    return code

def get_user_meta(user_id):
    if user_id != 'Anonymous':
        all_data = user_db_ref(user_id).get().to_dict()
        return {'picture': all_data['picture'],
                'given_name': all_data['given_name']}
    else:
        return {'picture': '', 'given_name': 'Anonymous'}

def get_author_list(last_id):
    if not last_id:
        return []
    chain = get_chain_link(last_id)
    return get_author_list(chain['parent']) + [get_user_meta(chain['user'])]

def image_to_url(img):
    data = BytesIO()
    img.save(data, "PNG")
    data64 = base64.b64encode(data.getvalue())
    return u'data:img/png;base64,'+data64.decode('utf-8')

def cropped_url(full_url):
    resp = urlopen(full_url)
    img = Image.open(resp.fp)
    cropped = img.crop((0, 350, 400, 400))
    return image_to_url(cropped)

def get_chain_display_data(last_id):
    chain = get_chain_link(last_id)
    image_url = chain['image_url']
    picture = cropped_url(image_url)
    create_time = chain['create_time'].ToDatetime()
    return {
        'id': last_id,
        'picture': picture,
        'authors': get_author_list(last_id),
        'timeago': timeago.format(create_time, datetime.datetime.utcnow()),
        'revealed': chain.get('revealed', False)
    }

def get_continuations(picture_id):
    res = [get_chain_display_data(d.id) for d
           in db.collection('links').where('parent', '==', picture_id).stream()]
    res.reverse()
    return res

def get_user_pictures(user_id):
    res = [get_chain_display_data(d.id) for d
           in db.collection('links').where('user', '==', user_id).stream()]
    res.reverse()
    return res

# ============== Ajax endpoints =======================

@app.route('/addFregment', methods=['POST'])
def add_fregment():
    params = request.json
    if current_user.is_authenticated:
        user = current_user.get_id()
    else:
        user = 'Anonymous'
    id = add_chain_link(
        params['parent'], params['image_url'], user, params['revealed'])
    if params['gallery']:
        add_picture_to_gallery(params['gallery'], id)
    return json.dumps({'id': id})


@app.route('/continue', methods=['GET'])
def cont():
    last_id = request.args['last_id']
    chain = get_chain_link(last_id)
    return json.dumps(
        {'last_id': last_id, 'cropped_url': cropped_url(chain['image_url'])})


def get_url_list(last_id):
    if not last_id:
        return []
    chain = get_chain_link(last_id)
    return get_url_list(chain['parent']) + [chain['image_url']]


@app.route('/reveal', methods=['GET'])
def reveal():
    last_id = request.args['last_id']
    return json.dumps(get_url_list(last_id))


def add_gallery_to_user(user, code):
    user_galleries_collection(user).document(code).set({})

@app.route('/new_gallery', methods=['POST'])
@login_required
def new_gallery():
    title = request.json['title']
    user = current_user.get_id()
    code = new_gallery_code()
    gallery_ref(code).set({'title': title})
    add_gallery_to_user(user, code)
    return json.dumps({})

@app.route('/join_gallery', methods=['POST'])
@login_required
def join_gallery():
    code = request.json['code']
    user = current_user.get_id()
    add_gallery_to_user(user, code)
    return json.dumps({})

@app.route('/user_galleries', methods=['GET'])
@login_required
def user_galleries_req():
    user = current_user.get_id()
    return json.dumps(user_galleries(user))

@app.route('/gallery_contents', methods=['GET'])
@login_required
def gallery_contents():
    code = request.args['code']
    user = current_user.get_id()
    res = [get_chain_display_data(snapshot.id)
           for snapshot in gallery_pictures_collection(code).stream()]
    res.reverse()
    return json.dumps(res)

@app.route('/picture_data', methods=['GET'])
def picture_data():
    return json.dumps(get_chain_display_data(request.args['id']))

@app.route('/picture_galleries', methods=['GET'])
@login_required
def picture_galleries():
    picture_id = request.args['id']
    return json.dumps([
        dict(
            list(gallery.items()) +
            [('has_picture', gallery_has_picture(gallery['code'], picture_id))])
        for gallery in user_galleries(current_user.get_id())])

@app.route('/add_picture_to_gallery', methods=['POST'])
@login_required
def add_picture_to_gallery_handler():
    add_picture_to_gallery(request.json['code'], request.json['picture_id'])
    return json.dumps({})

@app.route('/get_continuations', methods=['GET'])
def get_continuations_handler():
    return json.dumps(get_continuations(request.args['id']))

@app.route('/get_user_pictures', methods=['GET'])
def get_user_pictures_handler():
    return json.dumps(get_user_pictures(current_user.get_id()))

# Login state endpoint
@app.route('/login_state', methods=['GET'])
def login_state():
    if current_user.is_authenticated:
        return json.dumps({'email': current_user.email, 'given_name': current_user.given_name, 'picture': current_user.picture})
    else:
        return json.dumps({})

# ============= Boilerplate!!! ========================
if __name__ == '__main__':
    # This is used when running locally only. When deploying to Google App
    # Engine, a webserver process such as Gunicorn will serve the app. This
    # can be configured by adding an `entrypoint` to app.yaml.
    app.run(host='0.0.0.0', port=8080, debug=True)
# [END gae_python37_app]
