const login = require('express').Router()

const dbconnect = require('../model/DbConnect')
const session = require('../model/SessionSetup')

login.use(session)

login.post('/login', async (req, res) => {
    console.log(req.body)
    if(req.body.cardNum && req.body.password){
        if(await dbconnect.userExists(req.body.cardNum, req.body.password)){
            req.session.cardNum = req.body.cardNum
            res.json({access: true})
        }else{
            res.json({access: false})
        }
    }
})

login.get('/login', async (req, res) =>{    
        if(req.session.cardNum){
            let userData = await dbconnect.findUser(req.session.cardNum)
            req.session.user = userData[0]
            if(userData[1] === 'Adminisztrátor' || userData[1] === 'admin'){
                req.session.perm = 'admin'
            }else{
                req.session.perm = userData[1]
            }
            res.status(200).json({user: req.session.user, permission: req.session.perm})
        }else{
            console.log('hello')
        }
})

module.exports = login