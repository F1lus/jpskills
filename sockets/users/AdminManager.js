const DbConnect = require("../../model/DbConnect")

function dateFormat(rawDate) {
    let date = new Date(rawDate)

    month = '' + (date.getMonth() + 1)
    day = '' + date.getDate()
    year = date.getFullYear()

    if (month.length < 2) {
        month = '0' + month
    }
    if (day.length < 2) {
        day = '0' + day
    }

    return [year, month, day].join('.')
}

module.exports = socket => {

    const session = socket.handshake.session

    const getAdminExams = async cardcode => {
        if(!session.perm || !session.cardNum){
            return
        }

        if(session.perm === 'superuser'){
            const exams = await DbConnect.selectExamsByCreator(cardcode)

            const formatted = []
            exams.forEach(exam => {
                formatted.push({
                    id: exam.id,
                    examName: exam.examName,
                    examCode: exam.examCode,
                    created: dateFormat(exam.created),
                    modified: exam.modified === '-' ? '-' : dateFormat(exam.modified) 
                })
            })
            
            socket.emit('admin-exams', formatted)
        }
    }

    const deleteAdmin = async (cardcode, replaceAdmin) => {
        if(!session.perm || !session.cardNum){
            return
        }

        if(session.perm === 'superuser'){
            await DbConnect.deleteAdmin(cardcode, replaceAdmin)
            socket.emit('admin-removed')
        }
    }

    socket
        .on('get-admin-exams', getAdminExams)
        .on('delete-admin', deleteAdmin)
}