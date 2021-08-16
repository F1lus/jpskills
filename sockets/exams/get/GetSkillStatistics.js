const dbconnect = require('../../../model/DbConnect')

module.exports = (socket) => {

    const session = socket.handshake.session

    const statistics = async cardNum => {
        if(!session.perm || !cardNum){
            return
        }

        if (session.perm === 'admin') {
            if(cardNum === session.cardNum){
                socket.emit('sending-statistics', await dbconnect.globalStatisticsForAdmin(cardNum))
            }else{
                socket.emit('sending-statistics', await dbconnect.globalStatisticsForUser(cardNum, false))
            }
        } else {
            socket.emit('sending-statistics', await dbconnect.globalStatisticsForUser(cardNum, false))
        }
    }
    socket.on('requesting-statistics', statistics)

    const userStatsByCardcode = async cardcode => {
        if(!session.perm || !session.cardNum){
            return
        }

        if(session.perm === 'superuser'){
            socket.emit('user-exams', await dbconnect.globalStatisticsForUser(cardcode, false))
        }
    }
    socket.on('exams-by-cardcode', userStatsByCardcode)

    const adminDetailedStats = async cardcode => {
        if(!session){
            return
        }

        if(session.perm === 'admin'){
            if(cardcode === session.cardNum){
                socket.emit('detailStat', {
                    completion: await dbconnect.adminCompletionRate(session.cardNum),
                    global: await dbconnect.adminGlobal()
                })
            }else{
                socket.emit('detailStat', {
                    completion: await dbconnect.userVisualizer(cardcode)
                })
            }
        }else{
            socket.emit('detailStat', {
                completion: await dbconnect.userVisualizer(session.cardNum)
            })
        }
        
    }
    socket.on('get-details', adminDetailedStats)

    const examCompletion = async examCode => {
        if(!session || session.perm !== 'admin'){
            return
        }

        socket.emit('examCompletion', await dbconnect.examCompletion(session.cardNum, examCode))
    }
    socket.on('get-examCompletion', examCompletion)

}