const dbconnect = require('../../../model/DbConnect')

function getExamContent(socket, examCode){
    dbconnect.selectWholeExam(examCode)
    .then(results => {
        if(results){
            if(results[0]){
                socket.emit('exam-content', results[1], results[2], results[3], results[4], results[5])
            }else{
                socket.emit('exam-content-no-question', results[1], results[2], results[3], results[4])
            }
        }
    }).catch(err => console.log(err))
}

module.exports = getExamContent