const dbconnect = require('../../../model/DbConnect')

module.exports = (socket) => {
    
    const removeTest = async (examCode) => {
        if(socket.handshake.session.user && examCode){
            const removed = await dbconnect.removeTest(socket.handshake.session.cardNum, examCode)
            if(removed){
                socket.emit('removed-exam')
            }
        }
    }

    socket.on('remove-test', removeTest)
}