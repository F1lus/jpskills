const dbconnect = require('../../../model/DbConnect')

module.exports = (socket) => {

    const removeAnswer = async (answerId, examCode) => {
        if(examCode && answerId){
            const removed = await dbconnect.removeAnswer(socket.handshake.session.cardNum, answerId, examCode)
            if(removed){
                socket.emit('server-accept')
            }
        }
    }

    const removeQuestion = async (questionId, examCode) => {
        if(examCode && questionId){
            const removed = await dbconnect.removeQuestion(socket.handshake.session.cardNum, questionId, examCode)
            if(removed){
                socket.emit('server-accept')
            }
        }
    }

    socket.on('remove-answer', removeAnswer)

    socket.on('remove-question', removeQuestion)
}