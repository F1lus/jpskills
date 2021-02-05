const dbconnect = require('../../../model/DbConnect')
const fs = require('fs')
const path = require('path')

module.exports = (socket) => {

    function process(answers, examCode){
        const session = socket.handshake.session

        const location = path.join(__dirname, `../../../temp_files/user_timer/${session.cardNum}.json`)
        const rawFileData = fs.readFileSync(location)
        const time = Math.floor(((new Date().getTime() / 1000 - JSON.parse(rawFileData).timer.begin)))
        fs.unlinkSync(location)

        dbconnect.processAnswers(answers, examCode, session.cardNum, time)
        .then(result => {
            if(result){
                socket.emit('exam-processed')
            }
        })
    }

    socket.on('exam-finished', process)
}