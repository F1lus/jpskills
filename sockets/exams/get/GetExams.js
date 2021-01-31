const dbconnect = require('../../../model/DbConnect')

function dateFormat(rawDate){
    let date = new Date(rawDate)
    
    month = '' + (date.getMonth() + 1)
    day = '' + date.getDate()
    year = date.getFullYear()

    if(month.length < 2){
        month = '0' + month
    }
    if(day.length < 2){
        day = '0' + day
    }

    return [year, month, day].join('.')
}

module.exports = (socket) => {

    const getExams = (shouldBroadcast) => {
        dbconnect.selectExams()
        .then(results => {
            let examResult = []
            results.forEach(result => {
                examResult.push([result.examName, 
                    result.itemCode, 
                    result.comment, 
                    result.status, 
                    dateFormat((''+result.created))
                ])
            })
            if(shouldBroadcast){
                socket.broadcast.emit('exams-get-emitter', examResult)
            }else{
                socket.emit('exams-get-emitter', examResult)
            }
        })
        .catch(err => console.log(err))
    }

    socket.on('exams-get-signal', () => getExams(false))

    socket.on('exams-global-signal', () => getExams(true))
}