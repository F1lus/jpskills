//Szükséges külső modulok
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')

//Szükséges saját modulok (route-ok)
const getExams = require('./routes/GetExams')
const learnExams = require('./routes/LearnExam')
const uploadExam = require('./routes/UploadExam')
const getExamContent = require('./routes/GetExamContent')
const login = require('./routes/Login')

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

app.use(bodyParser.json())


//Route kezelés
app.use(getExams)

app.use(learnExams)

app.use(uploadExam)

app.use(getExamContent)

app.use(login)

//Szerver setup
app.listen(PORT, () => {
    console.log(`Online: http://localhost:${PORT}`)
})