from django.shortcuts import render, redirect, get_object_or_404
from django.urls import reverse
from .models import Todo
from django.utils import timezone
from django.http import HttpResponseRedirect

def home(request):
    todos = Todo.objects.all()
    return render(request, 'todo_app/home.html', {'todos': todos})

def todo_detail(request, pk):
    todo = get_object_or_404(Todo, pk=pk)
    return render(request, 'todo_app/todo_detail.html', {'todo': todo})

def todo_create(request):
    if request.method == 'POST':
        title = request.POST.get('title')
        description = request.POST.get('description')
        due_date_str = request.POST.get('due_date')
        
        due_date = None
        if due_date_str:
            due_date = timezone.datetime.strptime(due_date_str, '%Y-%m-%dT%H:%M')
            due_date = timezone.make_aware(due_date)
        
        Todo.objects.create(
            title=title,
            description=description,
            due_date=due_date
        )
        return redirect('home')
    
    return render(request, 'todo_app/todo_create.html')

def todo_edit(request, pk):
    todo = get_object_or_404(Todo, pk=pk)
    
    if request.method == 'POST':
        todo.title = request.POST.get('title')
        todo.description = request.POST.get('description')
        due_date_str = request.POST.get('due_date')
        
        if due_date_str:
            due_date = timezone.datetime.strptime(due_date_str, '%Y-%m-%dT%H:%M')
            todo.due_date = timezone.make_aware(due_date)
        else:
            todo.due_date = None
        
        todo.save()
        return redirect('todo_detail', pk=todo.pk)
    
    # Format due_date for datetime-local input
    initial_due_date = ''
    if todo.due_date:
        initial_due_date = todo.due_date.strftime('%Y-%m-%dT%H:%M')
    
    return render(request, 'todo_app/todo_edit.html', {
        'todo': todo,
        'initial_due_date': initial_due_date
    })

def todo_delete(request, pk):
    todo = get_object_or_404(Todo, pk=pk)
    todo.delete()
    return redirect('home')

def todo_toggle_complete(request, pk):
    todo = get_object_or_404(Todo, pk=pk)
    todo.completed = not todo.completed
    todo.save()
    return HttpResponseRedirect(request.META.get('HTTP_REFERER', reverse('home')))