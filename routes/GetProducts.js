const products = require('express').Router()

const dbconnect = require('../model/DbConnect')

products.get('/products', (req, res) => {
    dbconnect.selectProducts().then(result => {
        res.json({products: result})
    }).catch(err => console.log(err))
})

module.exports= products