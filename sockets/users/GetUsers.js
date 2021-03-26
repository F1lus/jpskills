const DbConnect = require("../../model/DbConnect")

module.exports = socket => {

    const session = socket.handshake.session

    const getExistingUsers = async () => {
        if(session.perm === 'superuser'){
            socket.emit('existing-users', await DbConnect.getExistingUsers(session.cardNum))
        }
    }

    const getSpecificUser = async cardcode => {
        if(session.perm === 'superuser'){
            socket.emit('userinfo', await DbConnect.getSpecificUser(cardcode))
        }
    }

    const getAdmins = async user => {
        if(session.perm === 'superuser'){
            socket.emit('admin-list', await DbConnect.getAdmins(user))
        }
    }

    socket
        .on('get-userinfo', getSpecificUser)
        .on('request-users', getExistingUsers)
        .on('get-admins', getAdmins)
}