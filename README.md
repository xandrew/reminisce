# electrocuted-snail

For development, create a python environment called snailenv in your home dir:
python3 -m venv snailenv

Activate and install dependencies:
source ~/snailenv/bin/activate
pip install -r requirements.txt

To add a new dependency, install locally with pip into the above env and add
to requirements.txt.

For development, run both of ./run_dev_ui.sh and ./run_dev_server.sh. Access the UI on localhost:8080. Flask will proxy ui asset requests to ng serve.

For prod deployment, just run ./deploy.sh.

