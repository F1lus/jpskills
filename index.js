//Szükséges külső modulok
const express = require('express')
const cors = require('cors')

//Szükséges saját modulok (route-ok)
const getExams = require('./routes/GetExams')
const learnExams = require('./routes/LearnExam')
const uploadExam = require('./routes/UploadExam')
const getExamContent = require('./routes/GetExamContent')
const login = require('./routes/Login')
const checker = require('./routes/LoginChecker')

//Előkészítés
const app = express()

const PORT = process.env.PORT || 5000;

//Middleware-ek
app.use(cors({
    origin: 'http://localhost:3000',
    methods: 'PUT, GET, POST, DELETE, OPTIONS',
    allowedHeaders: 'Content-Type',
    credentials: true
}))

app.use(express.json())

//Route kezelés
app.get('/exams', getExams)

app.get('/exams/learn/:examCode', learnExams)

app.post('/exams/upload', uploadExam)

app.get('/exams/:examcode', getExamContent)

app.post('/login', login)

app.get('/login', checker)

//Szerver setup
app.listen(PORT, () => {
    console.log(`Online: http://localhost:${PORT}`)
})