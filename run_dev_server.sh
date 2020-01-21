#!/bin/bash

set -xue

source ~/snailenv/bin/activate
export GOOGLE_CLOUD_PROJECT='electrocuted-snail'
export GOOGLE_APPLICATION_CREDENTIALS=./electrocuted-snail-key.json
export OAUTHLIB_INSECURE_TRANSPORT=1
source sendgrid.env
python main.py
