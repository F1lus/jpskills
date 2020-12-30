const check = require('express').Router()

const dbconnect = require('../model/DbConnect')
const session = require('../model/SessionSetup')

check.use(session)

check.get('/login', async (req, res) =>{    
    if(req.session.cardNum){
        let userData = await dbconnect.findUser(req.session.cardNum)
        req.session.user = userData[0]
        if(userData[1] === 'Adminisztrátor' || userData[1] === 'admin'){
            req.session.perm = 'admin'
        }else{
            req.session.perm = userData[1]
        }
        res.status(200).json({user: req.session.user, permission: req.session.perm})
    }
})

module.exports = check