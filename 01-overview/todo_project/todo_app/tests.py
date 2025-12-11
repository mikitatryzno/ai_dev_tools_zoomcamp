from django.test import TestCase, Client
from django.urls import reverse
from .models import Todo
from django.utils import timezone
import datetime

class TodoModelTest(TestCase):
    def setUp(self):
        self.todo = Todo.objects.create(
            title="Test Todo",
            description="This is a test todo",
            due_date=timezone.now() + datetime.timedelta(days=1)
        )

    def test_todo_creation(self):
        self.assertEqual(self.todo.title, "Test Todo")
        self.assertEqual(self.todo.description, "This is a test todo")
        self.assertFalse(self.todo.completed)

    def test_todo_str_representation(self):
        self.assertEqual(str(self.todo), "Test Todo")

class TodoViewsTest(TestCase):
    def setUp(self):
        self.client = Client()
        self.todo = Todo.objects.create(
            title="Test Todo",
            description="This is a test todo",
            due_date=timezone.now() + datetime.timedelta(days=1)
        )

    def test_home_view(self):
        response = self.client.get(reverse('home'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'todo_app/home.html')
        self.assertContains(response, "Test Todo")

    def test_todo_detail_view(self):
        response = self.client.get(reverse('todo_detail', args=[self.todo.id]))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'todo_app/todo_detail.html')
        self.assertContains(response, "Test Todo")

    def test_todo_create_view_get(self):
        response = self.client.get(reverse('todo_create'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'todo_app/todo_create.html')

    def test_todo_create_view_post(self):
        todo_count = Todo.objects.count()
        response = self.client.post(reverse('todo_create'), {
            'title': 'New Todo',
            'description': 'This is a new todo',
            'due_date': '2023-12-31T12:00'
        })
        self.assertEqual(response.status_code, 302)  # Redirect after successful creation
        self.assertEqual(Todo.objects.count(), todo_count + 1)
        self.assertTrue(Todo.objects.filter(title='New Todo').exists())

    def test_todo_edit_view_get(self):
        response = self.client.get(reverse('todo_edit', args=[self.todo.id]))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'todo_app/todo_edit.html')
        self.assertContains(response, "Test Todo")

    def test_todo_edit_view_post(self):
        response = self.client.post(reverse('todo_edit', args=[self.todo.id]), {
            'title': 'Updated Todo',
            'description': 'This todo has been updated',
            'due_date': '2023-12-31T12:00'
        })
        self.assertEqual(response.status_code, 302)  # Redirect after successful update
        self.todo.refresh_from_db()
        self.assertEqual(self.todo.title, 'Updated Todo')
        self.assertEqual(self.todo.description, 'This todo has been updated')

    def test_todo_delete_view(self):
        todo_count = Todo.objects.count()
        response = self.client.get(reverse('todo_delete', args=[self.todo.id]))
        self.assertEqual(response.status_code, 302)  # Redirect after deletion
        self.assertEqual(Todo.objects.count(), todo_count - 1)

    def test_todo_toggle_complete_view(self):
        self.assertFalse(self.todo.completed)
        response = self.client.get(reverse('todo_toggle_complete', args=[self.todo.id]))
        self.assertEqual(response.status_code, 302)  # Redirect after toggle
        self.todo.refresh_from_db()
        self.assertTrue(self.todo.completed)
        
        # Toggle back to incomplete
        response = self.client.get(reverse('todo_toggle_complete', args=[self.todo.id]))
        self.todo.refresh_from_db()
        self.assertFalse(self.todo.completed)