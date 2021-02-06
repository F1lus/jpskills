const dbconnect = require('../../../model/DbConnect')

module.exports = (socket) => {
    
    const removeTest = (examCode) => {
        if(socket.handshake.session.user && examCode){
            dbconnect.removeTest(socket.handshake.session.cardNum, examCode)
            .then(response => {
                if(response){
                    socket.emit('removed-exam')
                }
            })
        }
    }

    socket.on('remove-test', removeTest)
}