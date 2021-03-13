const DbConnect = require("../../model/DbConnect")

module.exports = socket => {

    const session = socket.handshake.session

    const getExistingUsers = () => {
        if(session.perm === 'superuser'){
            socket.emit('existing-users', await DbConnect.getExistingUsers())
        }
    }
    socket.on('request-users', getExistingUsers)
}