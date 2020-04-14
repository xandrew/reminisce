#!/bin/bash

set -xue

rm -rf prod_ui || true
mkdir prod_ui
pushd web/foldwithme-ui
ng build --baseHref=/ui/ --outputHashing=all
popd
cp web/foldwithme-ui/dist/electrocuted-snail-ui/* prod_ui

gcloud app deploy --quiet || true

rm -rf prod_ui
