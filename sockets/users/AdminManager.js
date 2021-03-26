const DbConnect = require("../../model/DbConnect")

module.exports = socket => {

    const session = socket.handshake.session

    const getAdminExams = async cardcode => {
        if(session.perm === 'superuser'){
            socket.emit('admin-exams', await DbConnect.selectExamsByCreator(cardcode))
        }
    }

    socket.on('get-admin-exams', getAdminExams)
}