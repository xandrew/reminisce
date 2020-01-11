from flask import Flask, render_template, request, redirect, url_for
from flask_login import LoginManager
from flask_login import login_user, current_user, login_required, logout_user
import logging
import sys
from flask_dance.contrib.google import make_google_blueprint, google
from flask_dance.consumer import oauth_authorized
#import requests_toolbelt.adapters.appengine

from my_pretty_form import MyPrettyForm

# If `entrypoint` is not defined in app.yaml, App Engine will look for an app
# called `app` in `main.py`.
app = Flask(__name__, template_folder='views')
app.secret_key = 'not so top secret'
app.logger.setLevel(logging.DEBUG)
h1 = logging.StreamHandler(sys.stderr)
h1.setFormatter(logging.Formatter('%(levelname)-8s %(asctime)s %(filename)s:%(lineno)s] %(message)s'))
app.logger.addHandler(h1)


alma = 15

login_manager = LoginManager()
login_manager.init_app(app)
#login_manager.anonymous_user = "BELA" # accountmodels.AnonymousUser
login_manager.login_view = 'login'

my_users = {}

@login_manager.user_loader
def load_user(user_id):
    return my_users.get(user_id, SnailUser({'email': user_id}))

google_blueprint = make_google_blueprint(
    client_id='387666456097-gpv671f9feq2s66ul0goi4c51913uqj7.apps.googleusercontent.com',
    client_secret='OLfJlshhM_BJ86o3x3cvLw2i',
    scope=[
        'openid',
        'https://www.googleapis.com/auth/userinfo.email',
    ]
)
app.register_blueprint(google_blueprint, url_prefix='/auth')

class SnailUser:
    def __init__(self, json):
        self.json = json
    
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
        return self.json['email']

    def __str__(self):
        return str(self.json)

@oauth_authorized.connect
def _on_signin(blueprint, token):
    us = SnailUser(google.get('oauth2/v1/userinfo').json())
    my_users[us.get_id()] = us
    login_user(us)
    
@app.route('/login')
def login():
    return redirect(url_for('google.login'))

@app.route('/logout')
def logout():
    logout_user()
    return "OK"

@app.route('/')
@login_required
def root():
    """Return a friendly HTTP greeting."""
    global alma
    alma += 1
    return render_template(
            './alma.html',
            slug=current_user,
            alma=alma)

@app.route('/bla/<slug>')
def hello(slug):
    """Return a friendly HTTP greeting."""
    global alma
    alma += 1
    return render_template(
            './alma.html',
            slug=slug,
            alma=alma)


@app.route('/form', methods=['POST', 'GET'])
def pretty_form():
    form = MyPrettyForm(request.form)
    form.validate()
    return render_template('./my_pretty_form.html', form=form, blu=form.name.data)




if __name__ == '__main__':
    # This is used when running locally only. When deploying to Google App
    # Engine, a webserver process such as Gunicorn will serve the app. This
    # can be configured by adding an `entrypoint` to app.yaml.
    app.run(host='127.0.0.1', port=8080, debug=True)
# [END gae_python37_app]
