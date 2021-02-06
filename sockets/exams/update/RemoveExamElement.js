const dbconnect = require('../../../model/DbConnect')

module.exports = (socket) => {

    const removeAnswer = (answerId, examCode) => {
        if(examCode && answerId){
            dbconnect.removeAnswer(socket.handshake.session.cardNum, answerId, examCode)
            .then(result => {
                if(result){
                    socket.emit('server-accept')
                }
            }).catch(err => console.log(err))
        }
    }

    const removeQuestion = (questionId, examCode) => {
        if(examCode && questionId){
            dbconnect.removeQuestion(socket.handshake.session.cardNum, questionId, examCode)
            .then(result => {
                if(result){
                    socket.emit('server-accept')
                }
            }).catch(err => console.log(err))
        }
    }

    socket.on('remove-answer', removeAnswer)

    socket.on('remove-question', removeQuestion)
}