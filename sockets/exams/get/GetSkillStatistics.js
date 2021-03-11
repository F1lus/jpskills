const dbconnect = require('../../../model/DbConnect')

module.exports = (socket) => {

    const statistics = async () => {
        const session = socket.handshake.session
        if (session.perm === 'admin') {
            socket.emit('sending-statistics', await dbconnect.globalStatisticsForAdmin(session.cardNum))
        } else {
            socket.emit('sending-statistics', await dbconnect.globalStatisticsForUser(session.cardNum))
        }
    }

    socket.on('requesting-statistics', statistics)
}