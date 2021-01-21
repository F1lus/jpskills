const dbconnect = require('../../../model/DbConnect')

function removeTest(socket, examCode){
    if(socket.handshake.session.user && examCode){
        dbconnect.removeTest(socket.handshake.session.user, examCode)
        .then(response => {
            if(response){
                socket.emit('removed-exam')
            }
        })
    }
}

module.exports = removeTest