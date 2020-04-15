#!/bin/bash

set -xue

source ~/foldenv/bin/activate
export GOOGLE_CLOUD_PROJECT='foldwithme'
export GOOGLE_APPLICATION_CREDENTIALS=./foldwithme-key.json
#export OAUTHLIB_INSECURE_TRANSPORT=1
python main.py
