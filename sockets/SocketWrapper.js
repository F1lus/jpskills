//Vizsga lekérdezések
const getExamContent = require('./exams/get/GetExamContent')
const getExams = require('./exams/get/GetExams')
const getProducts = require('./exams/get/GetProducts')
const learnExam = require('./exams/get/LearnExam')

//Vizsga leadás
const processExam = require('./exams/get/ProcessExamResults')

//Vizsgaeredmény
const getResults = require('./exams/get/GetResults')
const getSkillStatistics = require('./exams/get/GetSkillStatistics')

//Vizsga frissítés
const remover = require('./exams/update/Remover')
const updater = require('./exams/update/Updater')

//Felhasználó kezelés
const getLoginInfo = require('./users/GetLoginInfo')
const getUsers = require('./users/GetUsers')

/**
 * Socket kapcsolat kezelése
 * @param {any} socket 
 * 
 * Socket.io csomag
 * 
 * Ez a modul gyűjti össze és regisztrálja az összes Socket.io eseményt.
 */
module.exports = (socket) => {

    //Login
    getLoginInfo(socket)

    //Lekérdezések regisztrálása
    getExamContent(socket)
    getExams(socket)
    getProducts(socket)
    learnExam(socket)

    //Frissítések regisztrálása
    remover(socket)
    updater(socket)

    //Felhasználói művelet(ek)
    processExam(socket)
    getUsers(socket)

    //Vizsgaeredmény eseményének regisztrálása
    getResults(socket)

    //Statisztika
    getSkillStatistics(socket)

    //Egyéb események
    socket.on('exam-modified', () => {
        socket.emit('server-accept')
    })
}