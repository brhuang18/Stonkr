#!/bin/bash

sudo apt update
sudo apt install python3-pip

sudo apt-get install libpq-dev
pip3 install -r requirements.txt

cd stonk_backend
python3 manage.py runserver --noreload
