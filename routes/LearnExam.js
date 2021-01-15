const dbconnect = require('../model/DbConnect')

function getExamDoc(socket, examCode){
    dbconnect.selectExamDoc(examCode).then(result => {
        socket.emit('examDoc-emitter', Buffer.from(result))
    }).catch(err => {
        console.log(err)
    })
}

module.exports = getExamDoc