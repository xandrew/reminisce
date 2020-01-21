#!/bin/bash

set -xue

rm -rf prod_ui || true
mkdir prod_ui
pushd web/electrocuted-snail-ui
ng build --baseHref=/ui/ --outputHashing=all
popd
cp web/electrocuted-snail-ui/dist/electrocuted-snail-ui/* prod_ui

source sendgrid.env

sed "s/__SENDGRID_SECRET__/$SENDGRID_API_KEY/g" app.yaml.shadow > app.yaml

gcloud app deploy || true

rm app.yaml
rm -rf prod_ui
