const dbconnect = require('../../../model/DbConnect')

module.exports = (socket) => {

    const getProducts = async (producType) => socket.emit('products-emitter', await dbconnect.selectProducts(producType))

    const getTypes = async () => socket.emit('types-emitter', await dbconnect.selectProductTypes())

    socket.on('get-products', getProducts)
    socket.on('get-types', getTypes)
}