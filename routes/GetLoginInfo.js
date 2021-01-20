function getLoginInfo(socket){
    if(socket.handshake.session.cardNum){
        socket.emit('login-info', socket.handshake.session.user, socket.handshake.session.perm)
    }
}

module.exports = getLoginInfo