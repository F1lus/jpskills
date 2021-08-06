const DbConnect = require("../../model/DbConnect")

module.exports = socket => {

    const session = socket.handshake.session

    const getExistingUsers = async () => {
        if(!session.perm || !session.cardNum){
            return
        }

        if(session.perm === 'superuser'){
            socket.emit('existing-users', await DbConnect.getExistingUsers(session.cardNum))
        }
    }

    const getSpecificUser = async cardcode => {
        if(!session.perm || !session.cardNum){
            return
        }

        socket.emit('userinfo', await DbConnect.getSpecificUser(cardcode))
    }

    const getAdmins = async user => {
        if(!session.perm || !session.cardNum){
            return
        }

        if(session.perm === 'superuser'){
            socket.emit('admin-list', await DbConnect.getAdmins(user))
        }
    }

    const getAll = async cardnum => {
        if(!session.perm || !session.cardNum){
            return
        }

        if(session.perm === 'admin'){
            socket.emit('user-list', await DbConnect.selectUsers(cardnum))
        }
    }

    const sameUser = cardnum => {
        if(!session || !session.cardNum){
            return false
        }

        socket.emit('sameUser', session.cardNum === cardnum)
    }

    socket
        .on('get-userinfo', getSpecificUser)
        .on('request-users', getExistingUsers)
        .on('get-admins', getAdmins)
        .on('get-user-list', getAll)
        .on('get-sameUser', sameUser)
}