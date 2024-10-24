#!/bin/bash
# Create a non-login user 'csye6225'
sudo groupadd -f csye6225
sudo useradd -r -s /usr/sbin/nologin -g csye6225 csye6225

# Set up directories and permissions
sudo mkdir -p /opt/webapp
sudo chown -R csye6225:csye6225 /opt
sudo chmod -R 755 /opt/webapp

# Copy service file to systemd
sudo cp /tmp/csye6225.service /etc/systemd/system/csye6225.service

# Install Node.js LTS and unzip utility
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo bash -
sudo apt-get install -y nodejs unzip apache2

# Unzip web application and set ownership
sudo unzip /tmp/webapp.zip -d /opt/webapp
sudo chown -R csye6225:csye6225 /opt/webapp

# Install application dependencies
cd /opt/webapp || exit
sudo npm install

# Enable and start the web service
sudo systemctl daemon-reload
sudo systemctl enable apache2
sudo systemctl start apache2
sudo systemctl enable csye6225
sudo systemctl start csye6225
journalctl -xe