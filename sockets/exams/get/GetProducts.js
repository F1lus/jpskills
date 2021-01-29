const dbconnect = require('../../../model/DbConnect')

module.exports = (socket) => {

    const getProducts = () => {
        dbconnect.selectProducts().then(result => {
            socket.emit('products-emitter', result)
        }).catch(err => console.log(err))
    }

    socket.on('get-products', getProducts)

}