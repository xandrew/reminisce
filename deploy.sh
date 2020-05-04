#!/bin/bash

set -xue

rm -rf prod_ui || true
mkdir prod_ui
pushd web/foldwithme-ui
ng build --baseHref=/ui/ --outputHashing=all
popd
cp -r web/foldwithme-ui/dist/foldwithme-ui/* prod_ui

gcloud app deploy --project=foldwithme --quiet || true

rm -rf prod_ui
