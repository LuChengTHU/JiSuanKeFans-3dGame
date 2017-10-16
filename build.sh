#!/bin/sh

service mysql start

python3 manage.py makemigrations
python3 manage.py migrate

coverage run manage.py test
coverage html
