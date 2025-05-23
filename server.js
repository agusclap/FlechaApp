//librerias
const express = require('express'); //framework para crear el servidor
const mysql = require('mysql'); //libreria para conectarse a la base de datos
const bodyParser = require('body-parser'); //libreria para parsear el body de las peticiones
const cors = require('cors'); //libreria para permitir peticiones de otros dominios
const jwt = require('jsonwebtoken'); //libreria para crear tokens
const SECRET_KEY = 'mi_clave'; //clave secreta para firmar los tokens

/*Parsear significa analizar o descomponer una estructura de datos o texto según ciertas reglas para entender su contenido y trabajar con él */

const app = express(); //crear una instancia de express

//Configuracion de middleware

app.use(cors()); //permitir peticiones de otros dominios
app.use(bodyParser.json()); //parsear el body de las peticiones a json
app.use(express.static('public')); //servir archivos estaticos desde la carpeta public
app.use(express.urlencoded({ extended: true })); // para formularios tipo HTML
app.use(express.json()); 


//asignacion de puerto
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

//Configuracion de la base de datos

let db; // Esta variable contendrá la conexión global a la base de datos "tikitaka"
let userLoggedIn ; // Esta variable contendrá el id del usuario logueado
//Crear conexión sin base de datos para poder crearla

const tempDb = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: ''
});

tempDb.connect((err) => {
  if (err) throw err;
  console.log('✅ Conectado a MySQL (sin DB)');

  //Crear base de datos si no existe
  tempDb.query('CREATE DATABASE IF NOT EXISTS flecha', (err, res) => {
    if (err) throw err;
    console.log('✅ Base de datos flecha creada o ya existía');

    //Cerrar conexión temporal
    tempDb.end((err) => {
      if (err) throw err;

      //Crear conexión a la base de datos tikitaka
      db = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'flecha'
      });

      db.connect((err) => {
        if (err) throw err;
        console.log('✅ Conectado a la base de datos flecha');

        //Crear la tabla usuarios si no existe
        const createTableQuery = `
          CREATE TABLE IF NOT EXISTS usuarios (
            user_id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) NOT NULL,
            name VARCHAR(255) NOT NULL,
            lastname VARCHAR(255) NOT NULL,
            password VARCHAR(255) NOT NULL
          )
        `;
        db.query(createTableQuery, (err, res) => {
          if (err) throw err;
          console.log('✅ Tabla usuarios creada o ya existía');
        });
        //Crear la tabla tareas si no existe
        
      });
    });
  });
});

//Rutas POST para procesar login y registro 

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/splashscreen.html');
});

const bcrypt = require('bcrypt'); //libreria para encriptar contraseñas

//Ruta para el login de usuarios
app.post('/login', (req, res) => {
    const {email, password} = req.body;

    const sql = 'SELECT * FROM usuarios WHERE email = ?';
    db.query(sql, [email], async (err, result) => {
        if (err) return res.status(500).send('Error en la conexion');
        if(result.length > 0) {
            const user = result[0];
            const match = await bcrypt.compare(password, user.password);
            if (match) {
                userLoggedIn = result[0].user_id 
                const token = jwt.sign(
                { user_id: userLoggedIn, email: user.email },
                SECRET_KEY,
                { expiresIn: '2h' });
                res.send({success: true, message: 'Login exitoso'});
            } else {
                res.send({success: false, message: 'Usuario o contraseña incorrectos'});
            }
        } else {
            res.send({success: false, message: 'Usuario o contraseña incorrectos'});
        }
    });
});

//Ruta para el registro de usuarios
app.post('/register', async (req, res) => {
    const { email, name, lastname, password, repPassword} = req.body;
    console.log(req.body);
    //verificar si el usuario ya existe
    const sql = 'SELECT * FROM usuarios WHERE email = ?';
    db.query(sql, [email], async (err, result) => {
        if (err) return res.status(500).send('Mail en uso');
        if(result.length > 0) {
            // Cambiado: mensaje claro si el mail ya está en uso
            return res.send({success: false, message: 'El correo electrónico ya está en uso'});
        } else {
            if(password.length < 8) {
                return res.send({success: false, message: 'La contraseña debe tener al menos 8 caracteres'});
            }
            if(password !== repPassword) {
                return res.send({success: false, message: 'Las contraseñas no coinciden'});
            } else {
                // Hashear la contraseña antes del INSERT
                try {
                    const hashedPassword = await bcrypt.hash(password, 10);
                    const sql = 'INSERT INTO usuarios (email, name, lastname, password) VALUES (?, ?, ?, ?)';
                    db.query(sql, [email, name, lastname, hashedPassword], (err, result) => {
                        if (err) return res.status(500).json({ success: false, message: 'error en la carga de los datos' });
                        res.send({success: true, message: 'Registro exitoso'});
                    });
                } catch (e) {
                    return res.status(500).json({ success: false, message: 'Error al encriptar la contraseña' });
                }
            }
        }
    });
});
//Ruta para crear tareas
app.post('/tareas', authenticateToken, (req, res) => {
    const userId = req.user.user_id;
    const createTableQuery = `
          CREATE TABLE IF NOT EXISTS task (
            task_id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            final_date DATETIME DEFAULT NULL,
            name VARCHAR(255) NOT NULL,
            description TEXT NOT NULL,
            priority INT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES usuarios(user_id)
          )
        `;
        db.query(createTableQuery, (err, res) => {
          if (err) throw err;
          console.log('✅ Tabla Tareas creada o ya existía');
        });
    

    if (!userLoggedIn) {
        return res.status(400).json({ success: false, message: 'Usuario no autenticado' });
    }

    const { name, description, priority, fecha_fin, fecha_inicio} = req.body;
    
    console.log(req.body);

    console.log(name, description, priority, fecha_fin, fecha_inicio);

    // Validar datos
    if (!name || !description || !priority ) {
        return res.status(400).json({ success: false, message: 'Faltan datos de la tarea' });
    }



    // Insertar tarea
    const sql = 'INSERT INTO task (user_id, start_date, final_date, name, description, priority) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(sql, [userLoggedIn, fecha_inicio, fecha_fin, name, description, priority], (err, result) => {
        if (err) {
            console.error('Error al insertar tarea:', err);
            return res.status(500).json({ success: false, message: 'Error en la conexion' });
        }
        res.json({success: true, message: 'Tarea creada'});
    });
});

app.get('/vertareas', (req, res) => {
    if (!userLoggedIn) {
        return res.status(400).json({ success: false, message: 'Usuario no autenticado' });
    }
    db.query('SELECT * FROM task WHERE user_id = ?', [userLoggedIn], (err, results) => {
        if (err) {
            console.log(results);
            console.error('Error al obtener tareas:', err);
            return res.status(500).json({ success: false, message: 'Error al obtener tareas' });
        }
        res.json({ success: true, tareas: results });
    });
});

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Token requerido' });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ success: false, message: 'Token inválido' });
        req.user = user;
        next();
    });
}