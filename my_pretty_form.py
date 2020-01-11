from wtforms import fields
from wtforms import Form
from wtforms import validators

from flask import request

class MyPrettyForm(Form):
  name = fields.TextField('Name',  [validators.regexp('a.*', message=
                                                    "Start with a you stupid.")])
  img = fields.FileField('Image')
