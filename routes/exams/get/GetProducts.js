const dbconnect = require('../../../model/DbConnect')

function getProducts(socket){
    dbconnect.selectProducts().then(result => {
        socket.emit('products-emitter', result)
    }).catch(err => console.log(err))
}

module.exports= getProducts