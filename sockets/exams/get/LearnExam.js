const dbconnect = require('../../../model/DbConnect')

module.exports = (socket) => {

    const getExamDoc = async (examCode) => {
        const result = await dbconnect.selectExamDoc(examCode, socket.handshake.session.cardNum)
            
        socket.emit('examDoc-emitter', result[0], Buffer.from(result[1]))
    }

    socket.on('examDoc-signal', getExamDoc)
}