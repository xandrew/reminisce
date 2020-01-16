#!/bin/bash

set -xue

source sendgrid.env

sed "s/__SENDGRID_SECRET__/$SENDGRID_API_KEY/g" app.yaml.shadow > app.yaml

gcloud app deploy || true

rm app.yaml
