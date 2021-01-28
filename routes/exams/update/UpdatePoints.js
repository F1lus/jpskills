const dbconnect = require('../../../model/DbConnect')

function updatePoints(socket, examCode, points){
    if(socket.handshake.session.user){
        dbconnect.updateExamPoints(socket.handshake.session.user, examCode, points).catch(err => console.log(err))
    }
}

module.exports = updatePoints