const dbconnect = require('../model/DbConnect')

function getExamContent(socket, examCode){
    dbconnect.selectWholeExam(examCode)
    .then(results => {
        if(results){
            if(Array.isArray(results[1])){
                socket.emit('exam-content', results[0], results[1], results[2], results[3] == 1, results[4])
            }else{
                socket.emit('exam-content-no-question', results[0], results[1], results[2], results[3])
            }
        }
    }).catch(err => console.log(err))
}

module.exports = getExamContent