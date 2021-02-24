const dbconnect = require('../../../model/DbConnect')

module.exports = (socket) => {

    const getExamDoc = (examCode) => {
        dbconnect.selectExamDoc(examCode, socket.handshake.session.cardNum).then(result => {
            socket.emit('examDoc-emitter', result[0], Buffer.from(result[1]))
        }).catch(err => {
            console.log(err)
        })
    }

    socket.on('examDoc-signal', getExamDoc)
}