import logging
import json
import sys
import os
import datetime
from requests import get
import math

from flask import Flask, render_template, request, redirect, url_for
from flask_login import LoginManager
from flask_login import login_user, current_user, login_required, logout_user
from flask_dance.contrib.google import make_google_blueprint, google
from flask_dance.consumer import oauth_authorized

import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

from image_stuff import do_OCR
import mail


# ========== FireStore connection ================
# Use the application default credentials
cred = credentials.ApplicationDefault()
firebase_admin.initialize_app(cred, {
  'projectId': 'electrocuted-snail',
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


# ============ SnailUser =========================
def user_db_ref(db, email):
    return db.collection('users').document(email)
        
def user_from_db(db, email):
    doc = user_db_ref(db, email).get()
    as_dict = doc.to_dict()
    picture = ''
    if as_dict is not None:
        picture = as_dict.get('picture', '')
    return SnailUser(email, picture)

class SnailUser:
    def __init__(self, email, picture):
        self.email = email
        self.picture = picture

    def save_to_db(self, db):
        ref = user_db_ref(db, self.email)
        initial_data = {'picture': self.picture}
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
login_manager.login_view = 'login'

@login_manager.user_loader
def load_user(user_id):
    return user_from_db(db, user_id)

google_blueprint = make_google_blueprint(
    client_id='387666456097-gpv671f9feq2s66ul0goi4c51913uqj7.apps.googleusercontent.com',
    client_secret='OLfJlshhM_BJ86o3x3cvLw2i',
    scope=[
        'openid',
        'https://www.googleapis.com/auth/userinfo.email',
    ]
)
app.register_blueprint(google_blueprint, url_prefix='/auth')

@oauth_authorized.connect
def _on_signin(blueprint, token):
    user_json = google.get('oauth2/v1/userinfo').json()
    print(user_json)
    us = SnailUser(user_json['email'], user_json.get('picture', ''))
    us.save_to_db(db)
    login_user(us)
    
@app.route('/login')
def login():
    return render_template('./intro.html')

@app.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('root'))


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


# ============== Ajax endpoints =======================

# Endpoint for electrocuting a new document.
@app.route('/electrocute', methods=['POST'])
@login_required
def electrocute():
    non_empty = [(file, file.read())
                 for file in request.files.values()
                 if file.filename]
    ocrs = [do_OCR(image_data)
            for image_file,image_data in non_empty
            if image_file.content_type == 'image/jpeg']
    print(request.form);
    tags = []
    if request.form['tags']:
        tags = request.form['tags'].split(',')
    mail.send(current_user.email, request.form['notes'], non_empty, ocrs, request.form['folder'], request.form['docId'], tags)
    return json.dumps({})


# Endpoints for folder management
def folder_doc(email, year):
    return user_db_ref(db, email).collection('folders').document(f'folder_for_{year}')

def folder_response(year, ordinal):
    return json.dumps({'label': f'{year} #{ordinal}', 'ordinal': ordinal})

def process_year(year):
    if year != 'ethernity':
        return int(year)
    return year

@app.route('/folder_for_discard_year', methods=['GET'])
@login_required
def folder_for_discard_year():
    year = process_year(request.args['year'])
    folder = folder_doc(current_user.email, year).get()
    if folder.exists:
        ordinal = folder.get('ordinal')
        return folder_response(year, ordinal)
    else:
        return json.dumps({})
    
@app.route('/next_folder_for_discard_year', methods=['GET'])
@login_required
def next_folder_for_discard_year():
    year = process_year(request.args['year'])
    folder = folder_doc(current_user.email, year).get()
    if folder.exists:
        ordinal = folder.get('ordinal') + 1
    else:
        ordinal = 1
    return folder_response(year, ordinal)

@app.route('/set_folder_for_discard_year', methods=['GET'])
@login_required
def set_folder_for_discard_year():
    year = process_year(request.args['year'])
    ordinal = int(request.args['ordinal'])
    assert ordinal > 0
    folder = folder_doc(current_user.email, year)
    if ordinal == 1:
        folder.set({})
    folder.update({'ordinal': ordinal})
    return folder_response(year, ordinal)


@firestore.transactional
def increment_last_id(transaction, user):
  snapshot = user.get(transaction=transaction)
  try:
      last_id = snapshot.get('last_document_id')
  except KeyError:
      last_id = -1
  next_id = last_id + 1
  transaction.update(user, {'last_document_id': next_id})
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

@app.route('/get_next_id', methods=['GET'])
@login_required
def get_next_id():
    transaction = db.transaction()
    next_id = increment_last_id(transaction, user_db_ref(db, current_user.email))
    return json.dumps({'id': as_string_id(next_id)})
  

# Tags handling
def tags_collection(email):
    return user_db_ref(db, email).collection('tags')

@firestore.transactional
def replace_tags(transaction, tags_col, new_tags):
    for ds in tags_col.stream(transaction=transaction):
        transaction.delete(ds.reference)
    for t in new_tags:
        transaction.set(tags_col.document(t['tag_id']), t)

@app.route('/get_tags', methods=['GET'])
@login_required
def get_tags():    
    return json.dumps([t.to_dict() for t in tags_collection(current_user.email).stream()])

@app.route('/set_tags', methods=['POST'])
@login_required
def set_tags():
    transaction = db.transaction()
    replace_tags(transaction, tags_collection(current_user.email), request.json)
    return json.dumps({})

# Login state endpoint
@app.route('/login_state', methods=['GET'])
def login_state():
    if current_user.is_authenticated:
        return json.dumps({'email': current_user.email})
    else:
        return json.dumps({})

# ============= Boilerplate!!! ========================
if __name__ == '__main__':
    # This is used when running locally only. When deploying to Google App
    # Engine, a webserver process such as Gunicorn will serve the app. This
    # can be configured by adding an `entrypoint` to app.yaml.
    app.run(host='127.0.0.1', port=8080, debug=True)
# [END gae_python37_app]
