async function register() {

    //Obtenemos lso valores del formulario

    const email = document.getElementById('email').value;
    const name = document.getElementById('name').value;
    const lastname = document.getElementById('lastname').value;
    const password = document.getElementById('password').value;
    const repPassword = document.getElementById('rePassword').value;

    console.log(email, name, lastname, password, repPassword);


    //obtenemos el div donde se mostrar mensajes

    const msgDiv = document.getElementById('message');
    msgDiv.style.display = 'none';
    msgDiv.className = "";

    //Enviamos la informacion al servidor
    const res = await fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email,
            name,
            lastname,
            password,
            repPassword
        })
    });
    const data = await res.json(); //Esperamos la respuesta del servidor
    if (data.success) {
        window.location.href = 'login.html'; //Redirigimos a la pantalla 2
    } else {
        msgDiv.style.display = 'block'; //Mostramos el mensaje de error
        msgDiv.className = "alert alert-danger"; //Agregamos la clase de bootstrap
        msgDiv.innerHTML = data.message; //Mostramos el mensaje de error
    }
}

async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const msgDiv = document.getElementById('message');
    msgDiv.style.display = 'none';
    msgDiv.className = "";
    const res = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email,
            password
        })
    });
    const data = await res.json(); //Esperamos la respuesta del servidor
    if (data.success) {
        window.location.href = 'vertareas.html'; //Redirigimos a la pantalla 2
    } else {
        msgDiv.style.display = 'block'; //Mostramos el mensaje de error
        msgDiv.className = "alert alert-danger"; //Agregamos la clase de bootstrap
        msgDiv.innerHTML = data.message; //Mostramos el mensaje de error
    }
}

async function createTask() {
    const taskForm = document.getElementById('taskForm');
    const name = taskForm.taskName.value.trim();
    const description = taskForm.taskDescription.value.trim();
    const priority = taskForm.taskPriority.value;
    console.log("nivel de prioridad", priority);
    const dueDate = taskForm.taskDueDate.value;

    if (name && priority) {
        // Puedes usar la fecha actual como fecha_inicio
        const fecha_inicio = new Date().toISOString().split('T')[0];
        const fecha_fin = dueDate || null;

        const res = await fetch('http://localhost:3000/tareas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fecha_inicio,
                fecha_fin,
                name,
                priority,
                description
            })
        });

        const data = await res.json();
        if (data.success) {
            alert('✅ Tarea agregada correctamente');
            taskForm.reset();
            taskForm.taskDueDate.min = new Date().toISOString().split('T')[0];
        } else {
            alert('❌ ' + data.message);
        }
    }
}

async function mostrarTareas() {
    const tasksList = document.getElementById('tasksList');
    tasksList.innerHTML = '<p style="color:#edcd3d;">Cargando tareas...</p>';

    try {
        const res = await fetch('http://localhost:3000/vertareas');
        const data = await res.json();

        if (!data.success || !data|| data.length === 0) {
            tasksList.innerHTML = '<p style="color:#edcd3d;">No hay tareas guardadas.</p>';
            return;
        }

        tasksList.innerHTML = '';
        data.tareas.forEach(task => {
            const card = document.createElement('div');
            card.className = 'task-card';

            card.innerHTML = `
                <div class="task-name">${task.name}</div>
                <div class="task-info">
                    <span>Estado: <span class="${task.status === 'completada' ? 'completed' : 'not-completed'}">${task.status === 'completada' ? 'Completada' : 'No completada'}</span></span>
                    <span>Prioridad: ${task.priority}</span>
                    <span>Vence: ${task.final_date ? task.final_date.split('T')[0] : ''}</span>
                </div>
            `;

            tasksList.appendChild(card);
        });
    } catch (error) {
        tasksList.innerHTML = '<p style="color:#edcd3d;">Error al cargar tareas.</p>';
    }
}


