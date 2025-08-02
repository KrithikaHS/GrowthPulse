1.Django Project 

python -m venv venv
venv\Scripts\activate
pip install django djangorestframework pymongo djongo
django-admin startproject backend
cd backend
python manage.py startapp sales_api
---Changes in settings.py-------
---Add files---------
python manage.py migrate
python manage.py runserver

2.React App

npx create-react-app frontend
cd frontend
"# Bizlytics-" 
