const login = require('express').Router()

const dbconnect = require('../model/DbConnect')
const session = require('../model/SessionSetup')

login.use(session)

login.post('/login', async (req, res) => {
    if(req.body.cardNum && req.body.password){
        if(await dbconnect.userExists(req.body.cardNum, req.body.password)){
            req.session.cardNum = req.body.cardNum
            res.json({access: true})
        }else{
            res.json({access: false})
        }
    }else{
        res.json({access: false})
    }
})

module.exports = login