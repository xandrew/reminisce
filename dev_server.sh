#!/bin/bash
set -xue

python2.7 `which dev_appserver.py` app.yaml \
	  --application electrocuted-snail \
	  --port=2222 --admin_port=2223 \
          --env_var OAUTHLIB_INSECURE_TRANSPORT=1
