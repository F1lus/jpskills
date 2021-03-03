//Külső modulok
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const http = require('http')
const socketio = require('socket.io')
const sharedSession = require('express-socket.io-session')
const fileUpload = require('express-fileupload')
const helmet = require('helmet')

//Socketek
const socketWrapper = require('./sockets/SocketWrapper')

//Felhasználó kezelés
const login = require('./routes/users/Login')
const handleLogout = require('./routes/users/Logout')

//Vizsgák kezeléséhez kapcsolódó műveletek
const uploadExam = require('./routes/exams/update/UploadExam')
const updater = require('./routes/exams/update/ExamUpdate')

//Session előkészítés
const session = require('./model/SessionSetup')

//Előkészítés
const config = require('./config')

const app = express()
const server = http.createServer(app)

const PORT = config.server_port

const io = socketio(server, {
    cors:{
        origin: config.client,
        methods: ['GET', 'POST'],
        allowedHeaders: 'Content-Type',
        credentials: true
    }
})

//Middleware-ek
app.use(helmet())

app.use(cors({
    origin: config.client,
    methods: 'GET, POST',
    allowedHeaders: 'Content-Type',
    credentials: true
}))

app.use(fileUpload({
    limits: { fileSize: 2 * 1024 * 1024 * 1024 }
}))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(session)

io.use(sharedSession(session, {autoSave: true}))

//Valós idejű kommunikáció
io.on('connection', socketWrapper)

//Routing
app.use(uploadExam)

app.use(updater)

app.use(login)

app.use(handleLogout)

//Szerver indítás
server.listen(PORT)