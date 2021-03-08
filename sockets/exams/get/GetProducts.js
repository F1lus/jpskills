const dbconnect = require('../../../model/DbConnect')

module.exports = socket => {

    const getProducts = async productType => socket.emit('products-emitter', await dbconnect.selectProducts(productType))

    const getTypes = async () => socket.emit('types-emitter', await dbconnect.selectProductTypes())

    socket.on('get-products', getProducts)
    socket.on('get-types', getTypes)
}