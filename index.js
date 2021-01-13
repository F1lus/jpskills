//Külső modulok
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const http = require('http')
const socketio = require('socket.io')

//Saját modulok (route-ok)
const getExams = require('./routes/GetExams')
const learnExams = require('./routes/LearnExam')
const uploadExam = require('./routes/UploadExam')
const getExamContent = require('./routes/GetExamContent')
const login = require('./routes/Login')
const logout = require('./routes/Logout')
const products = require('./routes/GetProducts')
const updater = require('./routes/ExamUpdate')

//Előkészítés
const app = express()

const PORT = process.env.PORT || 5000;

const io = socketio(http.createServer(app), {
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


//Routing

io.on('connection', (socket) => {
    socket.emit('hello', 'world')
})

app.use(getExams)

app.use(learnExams)

app.use(uploadExam)

app.use(getExamContent)

app.use(products)

app.use(updater)

app.use(login)

app.use(logout)

//Szerver setup
app.listen(PORT, () => {
    console.log(`Online: http://localhost:${PORT}`)
})