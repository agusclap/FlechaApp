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
        window.location.href = 'index.html'; //Redirigimos a la pantalla 2
    } else {
        msgDiv.style.display = 'block'; //Mostramos el mensaje de error
        msgDiv.className = "alert alert-danger"; //Agregamos la clase de bootstrap
        msgDiv.innerHTML = data.message; //Mostramos el mensaje de error
    }
}

