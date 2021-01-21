//Külső modulok
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const http = require('http')
const socketio = require('socket.io')
const sharedSession = require('express-socket.io-session')

//Saját modulok (route-ok)

//Vizsga lekérdezések
const getExams = require('./routes/exams/get/GetExams')
const getExamDoc = require('./routes/exams/LearnExam')
const getExamContent = require('./routes/exams/get/GetExamContent')
const getProducts = require('./routes/exams/get/GetProducts')

//Felhasználó kezelés
const login = require('./routes/users/Login')
const getLoginInfo = require('./routes/users/GetLoginInfo')
const handleLogout = require('./routes/users/Logout')

//Vizsgához kapcsolódó műveletek
const uploadExam = require('./routes/exams/update/UploadExam')
const updater = require('./routes/exams/update/ExamUpdate')
const removeAnswer = require('./routes/exams/update/RemoveAnswer')
const removeQuestion = require('./routes/exams/update/RemoveQuestion')

//Session előkészítés
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

//Middleware-ek
app.use(cors({
    origin: 'http://localhost:3000',
    methods: 'GET, POST',
    allowedHeaders: 'Content-Type',
    credentials: true
}))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(session)

io.use(sharedSession(session, {autoSave: true}))

//Routing

io.on('connection', (socket) => {
    
    socket.on('exams-get-signal', () => {
        getExams(socket)
    })

    socket.on('request-login-info', () => {
        getLoginInfo(socket)
    })

    socket.on('get-products', () => {
        getProducts(socket)
    })

    socket.on('examDoc-signal', examCode => {
        getExamDoc(socket, examCode)
    })

    socket.on('request-exam-content', examCode => {
        getExamContent(socket, examCode)
    })

    socket.on('exam-modified', () => {
        socket.emit('server-accept')
    })

    socket.on('remove-answer', (answerId, examCode) => {
        removeAnswer(socket, examCode, answerId)
    })

    socket.on('remove-question', (questionId, examCode) => {
        removeQuestion(socket, examCode, questionId)
    })
})

app.use(uploadExam)

app.use(updater)

app.use(login)

app.use(handleLogout)

//Szerver setup
server.listen(PORT)