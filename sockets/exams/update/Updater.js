const dbconnect = require('../../../model/DbConnect')

module.exports = socket => {

    const user = socket.handshake.session.cardNum
    const isAdmin = socket.handshake.session.perm === 'admin'

    //Status
    const updateStatus = async data => {
        if(!isAdmin){
            return
        }
        if(data && data.examCode && data.status != null || data.status != undefined){
            socket.emit('updated', await dbconnect.updateExamStatus(user, data.examCode, data.status))
        }
    }
    socket.on('update-status', updateStatus)

    //ExamProps
    const updateExamProps = async data => {
        if(!isAdmin){
            return
        }
        if(data && data.examCode && data.examName && data.points != null){
            socket.emit('updated', await dbconnect.updateExam(user, data.examName, 
                data.examCode, data.notes, data.points))
        }
    }
    socket.on('update-exam-props', updateExamProps)

    //Question Modify
    const modifyQuestion = async data => {
        if(!isAdmin){
            return
        }
        if(data && data.examCode && data.questionId && data.value != null){
            socket.emit('updated', await dbconnect.updateQuestion(user, data.examCode,
                data.questionId, data.value))
        }
    }
    socket.on('update-question', modifyQuestion)

    //Answer Modify
    const modifyAnswer = async data => {
        if(!isAdmin){
            return
        }
        if(data && data.examCode && data.answerId && data.value != null){
            socket.emit('updated', await dbconnect.updateAnswer(user, data.examCode,
                data.answerId, data.value))
        }
    }
    socket.on('update-answer', modifyAnswer)

    //Insert Question
    const insertAnswer = async data => {
        if(!isAdmin){
            return
        }
        if(data && data.examCode && data.questionId && data.answerText && data.value != null){
            socket.emit('updated', await dbconnect.insertAnswer(user, data.examCode, data.questionId,
                data.answerText, data.value))
        }
    }
    socket.on('insert-answer', insertAnswer)
}