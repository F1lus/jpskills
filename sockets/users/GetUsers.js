const DbConnect = require("../../model/DbConnect")

module.exports = socket => {

    const session = socket.handshake.session

    const getExistingUsers = async () => {
        if(session.perm === 'superuser'){
            socket.emit('existing-users', await DbConnect.getExistingUsers(session.cardNum))
        }
    }
    socket.on('request-users', getExistingUsers)
}