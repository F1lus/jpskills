const dbconnect = require('../../../model/DbConnect')

module.exports = (socket) => {

    const updatePoints = async (examCode, points) => {
        if(socket.handshake.session.user){
            await dbconnect.updateExamPoints(socket.handshake.session.cardNum, examCode, points)
        }
    }

    socket.on('examPoints-mislead', updatePoints)
}