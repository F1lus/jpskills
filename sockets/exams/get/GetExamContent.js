const dbconnect = require('../../../model/DbConnect')
const fs = require('fs')
const path = require('path')

module.exports = (socket) => {

    const getExamContent = (examCode) => {

        dbconnect.selectWholeExam(examCode)
        .then(results => {
            if(results){
                socket.emit('exam-content', results[0], results[1], results[2], results[3], results[4])
            }
        }).catch(err => console.log(err))
    }

    const beginTimer = () => {
        if(socket.handshake.session.perm !== 'admin'){
            const object = {
                timer: {
                    begin: new Date().getTime() / 1000
                }
            }
            const location = path.join(__dirname, `../../../temp_files/user_timer/${socket.handshake.session.cardNum}.json`)
            const data = JSON.stringify(object)

            fs.writeFileSync(location, data)
        }
    }

    socket.on('request-exam-content', getExamContent)
    socket.on('begin-timer', beginTimer)

}