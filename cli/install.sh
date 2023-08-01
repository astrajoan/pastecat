#!/bin/bash

set -e

if [[ $EUID != 0 ]];
    then echo "Please run as root!"
    exit 1
fi

npm pack &> /dev/null

cli_path="pastecat-cli-1.0.0.tgz"
config_path="../config.js"
bin_path=$(npm root -g)

npm install -g $cli_path 1> /dev/null
cp $config_path "${bin_path}/pastecat-cli/node_modules/pastecat-utils/"
rm $cli_path

echo "Successfully installed pastecat-cli 🐿️ 🐖!"