//Külső modulok
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const http = require('http')
const socketio = require('socket.io')

//Saját modulok (route-ok)
const getExams = require('./routes/GetExams')
const getExamDoc = require('./routes/LearnExam')
const uploadExam = require('./routes/UploadExam')
const getExamContent = require('./routes/GetExamContent')
const login = require('./routes/Login')
const logout = require('./routes/Logout')
const getProducts = require('./routes/GetProducts')
const updater = require('./routes/ExamUpdate')

const session = require('./model/SessionSetup')

//Előkészítés
const app = express()
const server = http.createServer(app)

const PORT = process.env.PORT || 5000

const io = socketio(server, {
    cors:{
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
        allowedHeaders: 'Content-Type',
        credentials: true
    }
})

//Express-session + Socket.io kompatibilitás
const wrap = middleware => (socket, next) => middleware(socket.request, {}, next)

//Middleware-ek
app.use(cors({
    origin: 'http://localhost:3000',
    methods: 'GET, POST',
    allowedHeaders: 'Content-Type',
    credentials: true
}))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

io.use(wrap(session))


//Routing

io.on('connection', (socket) => {
    let examInterval = null

    socket.on('exams-get-signal', () => {
        getExams(socket)
        examInterval = setInterval(() => getExams(socket), 10000)
    })

    socket.on('get-products', () => {
        getProducts(socket)
    })

    socket.on('examDoc-signal', examCode => {
        getExamDoc(socket, examCode)
    })

    socket.on('disconnect', () => {
        clearInterval(examInterval)
    })
})

app.use(uploadExam)

app.use(getExamContent)

app.use(updater)

app.use(login)

app.use(logout)

//Szerver setup
server.listen(PORT)