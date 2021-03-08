const dbconnect = require('../../../model/DbConnect')

module.exports = socket => {

    const getResult = async examCode => {
        socket.emit('exam-finalized', await dbconnect.selectSkill(examCode, socket.handshake.session.cardNum))
    }

    socket.on('request-results', getResult)

}