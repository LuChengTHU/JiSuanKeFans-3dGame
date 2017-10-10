#!/bin/sh

service start mysql

coverage run manage.py test
coverage html -d Coverage_Python
