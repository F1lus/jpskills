const dbconnect = require('../../../model/DbConnect')
const Buffer = require('safe-buffer').Buffer

module.exports = socket => {

    const getExamDoc = async examCode => {
        const session = socket.handshake.session
        
        const result = await dbconnect.selectExamDoc(examCode, session.cardNum, session.perm === 'admin')

        socket.emit('examDoc-emitter', result[0], Buffer.from(result[1]))
    }

    socket.on('examDoc-signal', getExamDoc)
}