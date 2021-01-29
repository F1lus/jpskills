const dbconnect = require('../../../model/DbConnect')

module.exports = (socket) => {

    const removeAnswer = (examCode, answerId) => {
        if(examCode && answerId){
            dbconnect.removeAnswer(socket.handshake.session.user, answerId, examCode)
            .then(result => {
                if(result){
                    socket.emit('server-accept')
                }
            }).catch(err => console.log(err))
        }
    }

    const removeQuestion = (examCode, questionId) => {
        if(examCode && questionId){
            dbconnect.removeQuestion(socket.handshake.session.user, questionId, examCode)
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