service mysql start
python3 manage.py migrate
python3 manage.py runserver ${1}
