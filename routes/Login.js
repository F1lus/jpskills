const login = require('express').Router()

const dbconnect = require('../model/DbConnect')
const session = require('../model/SessionSetup')

login.use(session)

login.post('/login', async (req, res) => {
    if(req.body.cardNum && req.body.password){
        dbconnect.userExists(req.body.cardNum, req.body.password).then(exists => {
            if(exists){
                req.session.cardNum = req.body.cardNum
            }
            res.json({access: exists})
        }).catch(err => console.log(err))
    }
})

login.get('/login', (req, res) =>{    
        if(req.session.cardNum){
            dbconnect.findUser(req.session.cardNum).then(userData =>{
                req.session.user = userData[0]
                if(userData[1] === 'Adminisztrátor' || userData[1] === 'admin'){
                    req.session.perm = 'admin'
                }else{
                    req.session.perm = userData[1]
                }
                res.status(200).json({user: req.session.user, permission: req.session.perm})
            }).catch(err => console.log(err))
        }
})

module.exports = login