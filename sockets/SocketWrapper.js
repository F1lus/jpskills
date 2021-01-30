//Vizsga lekérdezések
const getExamContent = require('./exams/get/GetExamContent')
const getExams = require('./exams/get/GetExams')
const getProducts = require('./exams/get/GetProducts')
const learnExam = require('./exams/get/LearnExam')

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

    //Egyéb események
    socket.on('exam-modified', () => {
        socket.emit('server-accept')
    })
}