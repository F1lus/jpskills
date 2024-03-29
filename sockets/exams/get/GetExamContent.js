const dbconnect = require('../../../model/DbConnect')
const fs = require('fs')
const path = require('path')

module.exports = (socket) => {
    const session = socket.handshake.session

    const getExamContent = async (examCode) => socket.emit('exam-content', await dbconnect.selectExamContent(examCode))
    const getExamProps = async (examCode) => socket.emit('exam-props', await dbconnect.selectExamProps(examCode))

    const beginTimer = () => {

        if(!session.perm || !session.cardNum){
            return
        }

        if (session.perm !== 'admin') {
            const object = {
                timer: {
                    begin: new Date().getTime() / 1000
                }
            }
            if(fs.existsSync(path.join(__dirname, `../../../temp_files`))){
                if(!fs.existsSync(path.join(__dirname, `../../../temp_files/user_timer`))){
                    fs.mkdirSync(path.join(__dirname, `../../../temp_files/user_timer`)) 
                }
            }else{
                fs.mkdirSync(path.join(__dirname, `../../../temp_files`))
                fs.mkdirSync(path.join(__dirname, `../../../temp_files/user_timer`))
            }

            const location = path.join(__dirname, `../../../temp_files/user_timer/${session.cardNum}.json`)
            const data = JSON.stringify(object)

            fs.writeFileSync(location, data)
        }
    }

    socket.on('request-exam-content', getExamContent)
    socket.on('request-exam-props', getExamProps)
    socket.on('begin-timer', beginTimer)

}