const dbconnect = require('../../../model/DbConnect')

module.exports = (socket) => {

    const updatePoints = (examCode, points) => {
        if(socket.handshake.session.user){
            dbconnect.updateExamPoints(socket.handshake.session.user, examCode, points)
            .catch(err => console.log(err))
        }
    }

    socket.on('examPoints-mislead', updatePoints)
}