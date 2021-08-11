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
        if(!session || session.perm !== 'admin'){
            return
        }

        socket.emit('detailStat', {
            admin: await dbconnect.adminCompletionRate(cardcode),
            global: await dbconnect.adminGlobal()
        })
    }
    socket.on('get-details', adminDetailedStats)

}