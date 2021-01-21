const dbconnect = require('../../../model/DbConnect')

function removeQuestion(socket, examCode, questionId){
    if(examCode && questionId){
        dbconnect.removeQuestion(socket.handshake.session.user, questionId, examCode)
        .then(result => {
            if(result){
                socket.emit('server-accept')
            }
        }).catch(err => console.log(err))
    }
}

module.exports = removeQuestion