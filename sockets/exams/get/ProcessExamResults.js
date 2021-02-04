const dbconnect = require('../../../model/DbConnect')

module.exports = (socket) => {

    function process(answers, examCode){
        const session = socket.handshake.session
        dbconnect.processAnswers(answers, session.user, examCode, session.cardNum)
        .then(result => {
            console.log(result)
        })
    }

    socket.on('exam-finished', process)
}