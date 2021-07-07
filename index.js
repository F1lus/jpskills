//Külső modulok
const express = require('express')
const cors = require('cors')
const http = require('http')
const socketio = require('socket.io')
const fileUpload = require('express-fileupload')
const helmet = require('helmet')

//Socketek
const socketWrapper = require('./sockets/SocketWrapper') 

//Előkészítés
const config = require('./config')

const app = express()
const server = http.createServer(app)

const session = require('./model/SessionSetup')

const socketSession = middleware => (socket, next) => middleware(socket.handshake, {}, next)

const io = socketio(server, {
    cors: {
        origin: config.client,
        methods: ['GET', 'POST'],
        allowedHeaders: 'Content-Type',
        credentials: true
    }
})

//Middleware-ek
app.use(helmet())

app.use(express.json())

app.use(cors({
    origin: config.client,
    methods: 'GET, POST',
    allowedHeaders: 'Content-Type',
    credentials: true
}))

app.use(fileUpload({
    limits: { fileSize: 2 * 1024 * 1024 * 1024 }
}))

app.use(session)

io.use(socketSession(session))

//Valós idejű kommunikáció
io.on('connection', socketWrapper)

//Routing
app.use(require('./routes/exams/update/UploadExam'))

app.use(require('./routes/exams/update/ExamUpdate'))

app.use(require('./routes/users/Login'))

//Szerver indítás
server.listen(config.server_port, config.server_host, () => console.log('A szerver készen áll!'))