const dbconnect = require('../../../model/DbConnect')

module.exports = socket => {

    const session = socket.handshake.session
    const isAdmin = session.perm === 'admin'

    //Answer
    const removeAnswer = async (answerId, examCode) => {
        if(!isAdmin){
            return
        }
        if(examCode && answerId){
            socket.emit('updated', await dbconnect.removeAnswer(session.cardNum, answerId, examCode))
        }
    }
    socket.on('remove-answer', removeAnswer)

    //Question
    const removeQuestion = async (questionId, examCode) => {
        if(!isAdmin){
            return
        }
        if(examCode && questionId){
            socket.emit('updated', await dbconnect.removeQuestion(session.cardNum, questionId, examCode))
        }
    }
    socket.on('remove-question', removeQuestion)

    //Exam
    const removeTest = async examCode => {
        if(!isAdmin){
            return
        }
        if(session.user && examCode){
            const removed = await dbconnect.removeTest(session.cardNum, examCode)
            if(removed){
                socket.emit('removed-exam')
            }
        }
    }
    socket.on('remove-test', removeTest)
}