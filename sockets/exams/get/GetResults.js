const dbconnect = require('../../../model/DbConnect')

module.exports = (socket) => {

    const getResult = (examCode) => {
        dbconnect.selectSkill(examCode, socket.handshake.session.cardNum)
        .then(skill => {
            if(skill){
                socket.emit('exam-finalize', skill)
            }
        })
    }

    socket.on('request-results', getResult)

}