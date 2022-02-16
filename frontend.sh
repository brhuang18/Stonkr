#!/bin/bash

sudo apt update

sudo apt install curl
curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
sudo apt install nodejs
sudo npm install --global yarn

wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo apt install ./google-chrome-stable_current_amd64.deb

cd frontend
yarn install
BROWSER=google-chrome-stable yarn start