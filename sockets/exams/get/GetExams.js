const dbconnect = require('../../../model/DbConnect')

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

module.exports = (socket) => {

    const session = socket.handshake.session

    const getExams = async () => {
        if(!session.cardNum || !session.perm){
            return
        }

        const exams = await dbconnect.selectExams(session.cardNum, session.perm === 'admin')

        let examResult = []

        exams.forEach(result => {
            examResult.push([
                result.examName,
                result.itemCode,
                result.comment,
                result.status,
                dateFormat(('' + result.created)),
                result.group
            ])
        })

        socket.emit('exams-get-emitter', examResult)
    }

    socket.on('exams-get-signal', getExams)

    const learnExams = async () => {

        if(!session.cardNum || !session.perm){
            return
        }

        let results = []

        if(session.perm === 'superuser'){
            results = await dbconnect.selectAllDocuments()
        }else{
            results = await dbconnect.selectLearnExams(session.perm === 'admin', session.cardNum)
        }

        let examResult = []
        results.forEach(result => {
            examResult.push([result.examName,
                result.itemCode,
                result.comment,
                result.status,
                dateFormat(('' + result.created))
            ])
        })
        socket.emit('exams-learn-emitter', examResult)
    }

    socket.on('exams-learn-signal', learnExams)
}