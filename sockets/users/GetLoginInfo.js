module.exports = (socket) => {

    const getLoginInfo = () => {
        if(socket.handshake.session && socket.handshake.session.cardNum){
            socket.emit('login-info', socket.handshake.session.user, socket.handshake.session.perm)
        }
    }

    socket.on('request-login-info', getLoginInfo)
}