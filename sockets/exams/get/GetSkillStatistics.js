const dbconnect = require('../../../model/DbConnect')

module.exports = (socket) => {

    const statistics = async () => {
        if(socket.handshake.session.perm === 'admin'){
            socket.emit('sending-statistics', await dbconnect.globalStatisticsForAdmin(socket.handshake.session.cardNum))
        }else{
            socket.emit('sending-statistics', await dbconnect.globalStatisticsForUser(socket.handshake.session.cardNum))
        }
    }

    socket.on('requesting-statistics', statistics)
}