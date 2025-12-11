## Setup and Running Instructions

### Install Django:

```bash
pip install django
```

or with uv:

```bash
uv pip install django
```

### Create the project structure:

Create the directories and files as shown in the project structure
Copy the code into each file

### Run migrations:

```bash
python manage.py makemigrations
python manage.py migrate
```

### Create a superuser (optional, for admin access):

```bash
python manage.py createsuperuser
```

### Run the tests:

```bash
python manage.py test
```

#### Start the development server:

```bash
python manage.py runserver
```

### Access the application:
Open your browser and go to http://127.0.0.1:8000/
For the admin interface, go to http://127.0.0.1:8000/admin/