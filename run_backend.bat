@echo off
call .venv\Scripts\activate.bat
cd sms
py manage.py populate_ledger
py manage.py runserver