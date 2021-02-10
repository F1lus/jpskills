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
const removeExam = require('./exams/update/RemoveExam')
const removeExamElement = require('./exams/update/RemoveExamElement')
const updatePoints = require('./exams/update/UpdatePoints')

//Felhasználó kezelés
const getLoginInfo = require('./users/GetLoginInfo')

/**
 * Socket kapcsolat kezelése
 * @param {any} socket 
 * 
 * Socket.io csomag
 * 
 * Ez a modul gyűjti össze és regisztrálja az összes Socket.io eseményt.
 */
module.exports = (socket) => {

    var timer = null

    //Lekérdezések regisztrálása
    getExamContent(socket)
    getExams(socket)
    getProducts(socket)
    learnExam(socket)

    //Frissítések regisztrálása
    removeExam(socket)
    removeExamElement(socket)
    updatePoints(socket)

    //Felhasználói művelet(ek) regisztrálása
    getLoginInfo(socket)
    processExam(socket)

    //Vizsgaeredmény eseményének regisztrálása
    getResults(socket)

    //Statisztika
    getSkillStatistics(socket)

    //Egyéb események
    socket.on('exam-modified', () => {
        socket.emit('server-accept')
    })

    socket.on('request-timer', () => {
        
    })

    socket.on('disconnect', () => {
        if(timer){
            clearInterval(timer)
        }
    })
}