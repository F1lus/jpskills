const dbconnect = require('../../../model/DbConnect')

module.exports = (socket) => {

    const statistics = () => {
        if(socket.handshake.session.perm === 'admin'){
            dbconnect.globalStatisticsForAdmin(socket.handshake.session.cardNum)
            .then(stats => {
                if(stats){
                    socket.emit('sending-statistics', stats)
                }
            }).catch(err => console.log(err))
        }else{
            dbconnect.globalStatisticsForUser(socket.handshake.session.cardNum)
            .then(stats => {
                if(stats){
                    socket.emit('sending-statistics', stats)
                }
            }).catch(err => console.log(err))
        }
    }

    socket.on('requesting-statistics', statistics)
}