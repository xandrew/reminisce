#!/bin/bash

set -xue

cd web/foldwithme-ui
ng serve --baseHref=/ui/ --liveReload=false
