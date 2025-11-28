## Question 1: Install Django

The most common command that AI would suggest for installing Django is:

```bash
pip install django
```

Alternatively, since the instructions mention using uv (a faster Python package installer), the command might be:

```bash
uv pip install django
```

## Question 2: Project and App

After creating a Django project and app, we need to include the app in the project's configuration. The file we need to edit for that is:

`settings.py`

This is where we add our app to the INSTALLED_APPS list in the project's settings.

## Question 3: Django Models

After creating models for our TODO app, the next step we need to take is:

`Run migrations`

This typically involves running `python manage.py makemigrations` followed by `python manage.py migrate` to create the database schema based on your models.

## Question 4: TODO Logic

The logic for the TODO app (creating, editing, deleting, etc.) would be implemented in:

`views.py`

This is where Django handles the request/response cycle and contains the functions or classes that process user requests.

## Question 5: Templates

To register the directory with the templates, you need to modify:

`TEMPLATES['DIRS'] in project's settings.py`

This tells Django where to look for template files outside of the app directories.

## Question 6: Tests

The command to run tests in Django is:

`python manage.py test`

This will discover and run all tests in your application.