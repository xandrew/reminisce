#!/bin/bash

set -xue

cd web/electrocuted-snail-ui
ng serve --baseHref=/ui/ --liveReload=false
