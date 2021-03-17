const dbconnect = require('../../model/DbConnect')

module.exports = socket => {

    const logout = async () => {
        const session = socket.handshake.session
        if(session && session.cardNum){
            await dbconnect.userLogout(session.cardNum)
            session.destroy(err => {
                err ? console.log(err) : socket.emit('logged-out')
            })
        }
    }
    socket.on('logout', logout)
}