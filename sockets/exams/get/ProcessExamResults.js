const dbconnect = require('../../../model/DbConnect')
const fs = require('fs')
const path = require('path')

module.exports = (socket) => {

    const removeFile = () => {
        const location = path.join(__dirname, `../../../temp_files/user_timer/${socket.handshake.session.cardNum}.json`)
        if(fs.existsSync(location)){
            const rawFileData = fs.readFileSync(location)
            const time = Math.floor(((new Date().getTime() / 1000 - JSON.parse(rawFileData).timer.begin)))
        
            fs.unlinkSync(location)

            return time
        }
        return 0
    }

    const process = (answers, examCode) => {
        const session = socket.handshake.session

        const time = removeFile()

        dbconnect.processAnswers(answers, examCode, session.cardNum, time)
        .then(result => {
            if(result){
                socket.emit('exam-processed')
            }
        })
    }

    socket.on('cancel-timer', () => {
        const location = path.join(__dirname, `../../../temp_files/user_timer/${socket.handshake.session.cardNum}.json`)
        if(fs.existsSync(location)){
            fs.unlinkSync(location)
        }
    })
    
    socket.on('exam-finished', process)
}