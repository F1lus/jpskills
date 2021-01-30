const dbconnect = require('../../../model/DbConnect')

module.exports = (socket) => {

    const getExamDoc = (examCode) => {
        dbconnect.selectExamDoc(examCode).then(result => {
            socket.emit('examDoc-emitter', Buffer.from(result))
        }).catch(err => {
            console.log(err)
        })
    }

    socket.on('examDoc-signal', getExamDoc)
}