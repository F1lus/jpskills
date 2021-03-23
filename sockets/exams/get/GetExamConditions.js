const dbconnect = require('../../../model/DbConnect')

module.exports = socket => {

    const getProducts = async productType => socket.emit('products-emitter', await dbconnect.selectProducts(productType))

    const getTypes = async () => socket.emit('types-emitter', await dbconnect.selectProductTypes())

    const getGroups = async () => socket.emit('groups-emitter', await dbconnect.selectUserGroups())

    socket
        .on('get-products', getProducts)
        .on('get-types', getTypes)
        .on('get-groups', getGroups)
}