const dbconnect = require('../../../model/DbConnect')

function removeAnswer(socket, examCode, answerId){
    if(examCode && answerId){
        dbconnect.removeAnswer(socket.handshake.session.user, answerId, examCode)
        .then(result => {
            if(result){
                socket.emit('server-accept')
            }
        }).catch(err => console.log(err))
    }
}

module.exports = removeAnswer