document.addEventListener('DOMContentLoaded', () => {
    // Selectores del DOM para las tareas principales
    const taskForm = document.getElementById('task-form');
    const taskNameInput = document.getElementById('task-name');
    const taskDetailsInput = document.getElementById('task-details');
    const taskDateInput = document.getElementById('task-date');
    const taskPriorityInput = document.getElementById('task-priority');
    const addTaskBtn = document.getElementById('add-task-btn');
    
    const importantList = document.getElementById('important-tasks');
    const intermediateList = document.getElementById('intermediate-tasks');
    const notImportantList = document.getElementById('not-important-tasks');
    const completedList = document.getElementById('completed-tasks');
    const todayTasksList = document.getElementById('today-tasks-list');
    const overdueTasksList = document.getElementById('overdue-tasks-list');
    const progressBarFill = document.getElementById('progress-bar-fill');
    const progressPercentage = document.getElementById('progress-percentage');
    const clearCompletedBtn = document.getElementById('clear-completed-btn');
    const exportTasksBtn = document.getElementById('export-tasks-btn');
    const calendarContainer = document.getElementById('calendar-container');
    const currentMonthYearHeader = document.getElementById('current-month-year');
    const prevMonthBtn = document.getElementById('prev-month-btn');
    const nextMonthBtn = document.getElementById('next-month-btn');

    // NUEVOS SELECTORES
    const importTasksBtn = document.getElementById('import-tasks-btn');
    const csvFileInput = document.getElementById('csv-file-input');

    // Selectores del DOM para el modo de proyectos
    const startProjectBtn = document.getElementById('start-project-btn');
    const projectModal = document.getElementById('project-modal');
    const projectTasksModal = document.getElementById('project-tasks-modal');
    const closeProjectModalBtn = document.querySelector('.close-btn');
    const closeProjectTasksBtn = document.querySelector('.close-btn-tasks');
    const projectForm = document.getElementById('project-form');
    const projectNameInput = document.getElementById('project-name');
    const projectDetailsInput = document.getElementById('project-details');
    const projectListContainer = document.getElementById('project-list-container');
    const projectTasksList = document.getElementById('project-tasks-list');
    const projectTasksTitle = document.getElementById('project-tasks-title');
    const projectTasksDescription = document.getElementById('project-tasks-description');
    const projectTaskForm = document.getElementById('project-task-form');
    const projectTaskNameInput = document.getElementById('project-task-name');
    const addProjectBtn = document.getElementById('add-project-btn');
    const editProjectDescriptionBtn = document.getElementById('edit-project-description-btn');
    const deleteProjectBtn = document.getElementById('delete-project-btn');

    // Variables de estado
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let projects = JSON.parse(localStorage.getItem('projects')) || [];
    let currentEditTaskId = null;
    let currentProjectId = null;
    let currentEditProjectTaskId = null;
    let currentCalendarDate = new Date();

    // Inicializar la aplicación
    renderAll();

    // Event Listeners para la gestión de tareas principales
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();

        if (currentEditTaskId) {
            tasks = tasks.map(task => 
                task.id === currentEditTaskId ? {
                    ...task,
                    name: taskNameInput.value,
                    details: taskDetailsInput.value,
                    date: taskDateInput.value,
                    priority: taskPriorityInput.value,
                } : task
            );
            currentEditTaskId = null;
            addTaskBtn.innerHTML = '<i class="fas fa-plus-circle"></i> Añadir Tarea';
        } else {
            const newTask = {
                id: Date.now(),
                name: taskNameInput.value,
                details: taskDetailsInput.value,
                date: taskDateInput.value,
                priority: taskPriorityInput.value,
                completed: false
            };
            tasks.push(newTask);
        }

        taskForm.reset();
        saveTasks();
        renderAll();
    });

    clearCompletedBtn.addEventListener('click', () => {
        if (confirm('¿Estás seguro de que quieres eliminar todas las tareas completadas?')) {
            tasks = tasks.filter(task => !task.completed);
            saveTasks();
            renderAll();
        }
    });

    exportTasksBtn.addEventListener('click', exportTasksToCSV);

    // NUEVOS EVENT LISTENERS
    importTasksBtn.addEventListener('click', () => {
        csvFileInput.click();
    });

    csvFileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const csvData = e.target.result;
                importTasksFromCSV(csvData);
            };
            reader.readAsText(file);
        }
    });

    prevMonthBtn.addEventListener('click', () => {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
        renderCalendar();
    });

    function renderAll() {
        renderTasks();
        renderTodayTasks();
        renderOverdueTasks();
        renderCalendar();
        updateProgress();
    }

    function renderTasks() {
        importantList.innerHTML = '';
        intermediateList.innerHTML = '';
        notImportantList.innerHTML = '';
        completedList.innerHTML = '';

        const pendingTasks = tasks.filter(task => !task.completed).sort((a, b) => new Date(a.date) - new Date(b.date));
        const completedTasks = tasks.filter(task => task.completed);
        const today = new Date().toISOString().slice(0, 10);

        pendingTasks.forEach(task => {
            if (task.date > today) {
                const taskItem = createTaskElement(task);
                if (task.priority === 'important') {
                    importantList.appendChild(taskItem);
                } else if (task.priority === 'intermediate') {
                    intermediateList.appendChild(taskItem);
                } else {
                    notImportantList.appendChild(taskItem);
                }
            }
        });

        completedTasks.forEach(task => {
            const taskItem = createTaskElement(task, true);
            completedList.appendChild(taskItem);
        });
    }

    function renderTodayTasks() {
        todayTasksList.innerHTML = '';
        const today = new Date().toISOString().slice(0, 10);
        const todayTasks = tasks.filter(task => task.date === today && !task.completed);
        
        if (todayTasks.length === 0) {
            todayTasksList.innerHTML = '<p class="empty-state">🎉 ¡Sin tareas pendientes para hoy! 🎉</p>';
            return;
        }
        
        todayTasks.forEach(task => {
            const taskItem = createTaskElement(task);
            todayTasksList.appendChild(taskItem);
        });
    }
    
    function renderOverdueTasks() {
        overdueTasksList.innerHTML = '';
        const today = new Date().toISOString().slice(0, 10);
        const overdueTasks = tasks.filter(task => task.date < today && !task.completed);

        if (overdueTasks.length === 0) {
            overdueTasksList.innerHTML = '<p class="empty-state">✅ ¡Todo al día! ✅</p>';
            return;
        }

        overdueTasks.forEach(task => {
            const taskItem = createTaskElement(task);
            overdueTasksList.appendChild(taskItem);
        });
    }

    function renderCalendar() {
        calendarContainer.innerHTML = '';
        const today = new Date();
        const currentMonth = currentCalendarDate.getMonth();
        const currentYear = currentCalendarDate.getFullYear();
        
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Domingo, 1 = Lunes...

        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        currentMonthYearHeader.innerHTML = `<i class="fas fa-calendar-alt"></i> ${monthNames[currentMonth]} ${currentYear}`;

        const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        daysOfWeek.forEach(day => {
            const header = document.createElement('div');
            header.classList.add('calendar-day-header');
            header.textContent = day;
            calendarContainer.appendChild(header);
        });

        for (let i = 0; i < firstDayOfMonth; i++) {
            const emptyDay = document.createElement('div');
            calendarContainer.appendChild(emptyDay);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const dayElement = document.createElement('div');
            dayElement.classList.add('calendar-day');
            dayElement.textContent = i;
            
            const dateString = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
            if (tasks.some(task => task.date === dateString && !task.completed)) {
                dayElement.classList.add('has-task');
            }

            if (i === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()) {
                dayElement.classList.add('today');
            }

            calendarContainer.appendChild(dayElement);
        }
    }

    function createTaskElement(task, isCompleted = false) {
        const li = document.createElement('li');
        li.classList.add('task-item', task.priority);
        if (isCompleted) {
            li.classList.add('completed');
        }

        const dateFormatted = task.date ? new Date(task.date + 'T00:00:00').toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Sin fecha';
        
        li.innerHTML = `
            <div class="task-item-header">
                <h4>${task.name}</h4>
                <span class="task-item-date"><i class="fas fa-calendar-alt"></i> ${dateFormatted}</span>
            </div>
            <p class="task-item-details">${task.details}</p>
            <div class="task-actions">
                ${!isCompleted ? `
                    <button class="complete-btn btn-base" data-id="${task.id}"><i class="fas fa-check"></i> Completada</button>
                    <button class="edit-btn btn-base" data-id="${task.id}"><i class="fas fa-edit"></i> Editar</button>
                    <button class="delete-btn btn-base" data-id="${task.id}"><i class="fas fa-trash-alt"></i> Eliminar</button>
                ` : `
                    <button class="uncomplete-btn btn-base" data-id="${task.id}"><i class="fas fa-undo"></i> Devolver</button>
                    <button class="delete-btn btn-base" data-id="${task.id}"><i class="fas fa-trash-alt"></i> Eliminar</button>
                `}
            </div>
        `;

        li.querySelector('.delete-btn').addEventListener('click', () => deleteTask(task.id));
        if (isCompleted) {
            li.querySelector('.uncomplete-btn').addEventListener('click', () => unmarkTaskAsCompleted(task.id));
        } else {
            li.querySelector('.complete-btn').addEventListener('click', () => markTaskAsCompleted(task.id));
            li.querySelector('.edit-btn').addEventListener('click', () => editTask(task.id));
        }
        
        return li;
    }

    function markTaskAsCompleted(id) {
        tasks = tasks.map(task => task.id === id ? { ...task, completed: true } : task);
        saveTasks();
        renderAll();
    }

    function unmarkTaskAsCompleted(id) {
        tasks = tasks.map(task => task.id === id ? { ...task, completed: false } : task);
        saveTasks();
        renderAll();
    }

    function deleteTask(id) {
        if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
            tasks = tasks.filter(task => task.id !== id);
            saveTasks();
            renderAll();
        }
    }

    function editTask(id) {
        const taskToEdit = tasks.find(task => task.id === id);
        if (taskToEdit) {
            taskNameInput.value = taskToEdit.name;
            taskDetailsInput.value = taskToEdit.details;
            taskDateInput.value = taskToEdit.date;
            taskPriorityInput.value = taskToEdit.priority;
            
            addTaskBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Actualizar Tarea';
            currentEditTaskId = id;
            
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    function updateProgress() {
        const totalTasks = tasks.length;
        const completedTasksCount = tasks.filter(task => task.completed).length;
        
        const percentage = totalTasks > 0 ? (completedTasksCount / totalTasks) * 100 : 0;
        
        progressBarFill.style.width = `${percentage}%`;
        progressPercentage.textContent = `${Math.round(percentage)}%`;
    }

    function exportTasksToCSV() {
        const headers = ["ID", "Nombre", "Detalles", "Fecha", "Prioridad", "Completada"];
        const rows = tasks.map(task => [
            task.id,
            `"${task.name.replace(/"/g, '""')}"`,
            `"${task.details.replace(/"/g, '""')}"`,
            task.date,
            task.priority,
            task.completed
        ]);

        let csvContent = headers.join(",") + "\n";
        rows.forEach(row => {
            csvContent += row.join(",") + "\n";
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        
        link.setAttribute("href", url);
        link.setAttribute("download", "mis_tareas_magicas.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    // NUEVA FUNCIÓN: Importar tareas desde un archivo CSV
    function importTasksFromCSV(csvData) {
        try {
            const rows = csvData.trim().split('\n').slice(1);
            const newTasks = rows.map(row => {
                const values = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
                return {
                    id: parseInt(values[0]),
                    name: values[1].replace(/"/g, '').trim(),
                    details: values[2].replace(/"/g, '').trim(),
                    date: values[3].trim(),
                    priority: values[4].trim(),
                    completed: values[5].trim() === 'true'
                };
            });

            if (newTasks.length > 0) {
                tasks = [...tasks, ...newTasks];
                saveTasks();
                renderAll();
                alert('¡Tareas importadas con éxito!');
            } else {
                alert('El archivo CSV está vacío o no tiene el formato correcto.');
            }
        } catch (error) {
            console.error('Error al importar el archivo CSV:', error);
            alert('Hubo un error al leer el archivo. Asegúrate de que tenga el formato CSV correcto.');
        }
    }

    // --- Lógica del modo de proyecto mágico ---

    startProjectBtn.addEventListener('click', () => {
        projectModal.style.display = 'flex';
        renderProjects();
    });

    closeProjectModalBtn.addEventListener('click', () => {
        projectModal.style.display = 'none';
        resetProjectForm();
    });

    closeProjectTasksBtn.addEventListener('click', () => {
        projectTasksModal.style.display = 'none';
        resetProjectTaskForm();
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === projectModal) {
            projectModal.style.display = 'none';
            resetProjectForm();
        }
        if (e.target === projectTasksModal) {
            projectTasksModal.style.display = 'none';
            resetProjectTaskForm();
        }
    });

    function resetProjectForm() {
        currentEditProjectId = null;
        addProjectBtn.innerHTML = '<i class="fas fa-plus"></i> Añadir Proyecto';
        projectForm.reset();
    }

    function resetProjectTaskForm() {
        currentEditProjectTaskId = null;
        projectTaskForm.reset();
        projectTaskForm.querySelector('button').innerHTML = '<i class="fas fa-plus"></i> Añadir Tarea';
    }

    projectForm.addEventListener('submit', (e) => {
        e.preventDefault();

        if (currentEditProjectId) {
            projects = projects.map(project => 
                project.id === currentEditProjectId ? {
                    ...project,
                    name: projectNameInput.value,
                    details: projectDetailsInput.value
                } : project
            );
            resetProjectForm();
        } else {
            const newProject = {
                id: Date.now(),
                name: projectNameInput.value,
                details: projectDetailsInput.value,
                tasks: []
            };
            projects.push(newProject);
            projectForm.reset();
        }
        
        saveProjects();
        renderProjects();
    });

    function renderProjects() {
        projectListContainer.innerHTML = '';
        if (projects.length === 0) {
            projectListContainer.innerHTML = '<p class="empty-state">Aún no hay proyectos. ¡Crea el primero!</p>';
        }

        projects.forEach(project => {
            const totalTasks = project.tasks.length;
            const completedTasks = project.tasks.filter(t => t.completed).length;
            const percentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

            const projectCard = document.createElement('div');
            projectCard.classList.add('project-card');
            projectCard.dataset.id = project.id;
            projectCard.innerHTML = `
                <h4><i class="fas fa-folder"></i> ${project.name}</h4>
                <p>${project.details}</p>
                <div class="project-progress-bar">
                    <div class="project-progress-bar-fill" style="width: ${percentage}%"></div>
                </div>
                <div class="project-actions">
                    <button class="view-project-btn btn-base" data-id="${project.id}"><i class="fas fa-eye"></i> Ver</button>
                    <button class="edit-project-btn btn-base" data-id="${project.id}"><i class="fas fa-edit"></i> Editar</button>
                    <button class="delete-project-btn btn-base" data-id="${project.id}"><i class="fas fa-trash-alt"></i> Eliminar</button>
                </div>
            `;
            projectListContainer.appendChild(projectCard);

            projectCard.querySelector('.view-project-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                currentProjectId = project.id;
                showProjectTasks(project);
            });
            projectCard.querySelector('.edit-project-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                editProject(project.id);
            });
            projectCard.querySelector('.delete-project-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('¿Estás seguro de que quieres eliminar este proyecto y todas sus tareas?')) {
                    deleteProject(project.id);
                }
            });
        });
    }

    function editProject(id) {
        const projectToEdit = projects.find(project => project.id === id);
        if (projectToEdit) {
            projectNameInput.value = projectToEdit.name;
            projectDetailsInput.value = projectToEdit.details;
            addProjectBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Actualizar Proyecto';
            currentEditProjectId = id;
            projectModal.style.display = 'flex';
        }
    }

    function deleteProject(id) {
        projects = projects.filter(project => project.id !== id);
        saveProjects();
        renderProjects();
    }

    function showProjectTasks(project) {
        projectTasksTitle.textContent = project.name;
        projectTasksDescription.textContent = project.details;
        projectTasksModal.style.display = 'flex';
        renderProjectTasks(project.tasks);
        
        editProjectDescriptionBtn.onclick = () => {
            projectTasksModal.style.display = 'none';
            editProject(project.id);
        };
        deleteProjectBtn.onclick = () => {
            if (confirm('¿Estás seguro de que quieres eliminar este proyecto y todas sus tareas?')) {
                deleteProject(project.id);
                projectTasksModal.style.display = 'none';
            }
        };
    }

    function renderProjectTasks(tasks) {
        projectTasksList.innerHTML = '';
        if (tasks.length === 0) {
            projectTasksList.innerHTML = '<p class="empty-state">No hay tareas en este proyecto.</p>';
        }
        
        tasks.forEach(task => {
            const li = document.createElement('li');
            li.classList.add('project-task-list-item');
            if (task.completed) {
                li.classList.add('completed');
            }
            li.innerHTML = `
                <span>${task.name}</span>
                <div class="project-task-actions">
                    <button class="complete-project-task-btn" data-id="${task.id}" ${task.completed ? 'disabled' : ''}><i class="fas fa-check-circle"></i></button>
                    <button class="edit-project-task-btn" data-id="${task.id}"><i class="fas fa-edit"></i></button>
                    <button class="delete-project-task-btn" data-id="${task.id}"><i class="fas fa-trash-alt"></i></button>
                </div>
            `;
            projectTasksList.appendChild(li);

            li.querySelector('.complete-project-task-btn').addEventListener('click', () => completeProjectTask(currentProjectId, task.id));
            li.querySelector('.edit-project-task-btn').addEventListener('click', () => editProjectTask(currentProjectId, task.id));
            li.querySelector('.delete-project-task-btn').addEventListener('click', () => deleteProjectTask(currentProjectId, task.id));
        });
    }

    projectTaskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const project = projects.find(p => p.id === currentProjectId);
        if (!project) return;

        if (currentEditProjectTaskId) {
            project.tasks = project.tasks.map(t =>
                t.id === currentEditProjectTaskId ? { ...t, name: projectTaskNameInput.value } : t
            );
            resetProjectTaskForm();
        } else {
            const newTask = {
                id: Date.now(),
                name: projectTaskNameInput.value,
                completed: false
            };
            project.tasks.push(newTask);
        }
        
        saveProjects();
        renderProjectTasks(project.tasks);
        renderProjects();
    });

    function completeProjectTask(projectId, taskId) {
        const project = projects.find(p => p.id === projectId);
        if (project) {
            const task = project.tasks.find(t => t.id === taskId);
            if (task) {
                task.completed = true;
                saveProjects();
                renderProjectTasks(project.tasks);
                renderProjects();
            }
        }
    }

    function editProjectTask(projectId, taskId) {
        const project = projects.find(p => p.id === projectId);
        if (project) {
            const taskToEdit = project.tasks.find(t => t.id === taskId);
            if (taskToEdit) {
                projectTaskNameInput.value = taskToEdit.name;
                projectTaskForm.querySelector('button').innerHTML = '<i class="fas fa-sync-alt"></i> Actualizar Tarea';
                currentEditProjectTaskId = taskId;
                projectTaskNameInput.focus();
            }
        }
    }

    function deleteProjectTask(projectId, taskId) {
        if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
            const project = projects.find(p => p.id === projectId);
            if (project) {
                project.tasks = project.tasks.filter(t => t.id !== taskId);
                saveProjects();
                renderProjectTasks(project.tasks);
                renderProjects();
            }
        }
    }

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function saveProjects() {
        localStorage.setItem('projects', JSON.stringify(projects));
    }
});
