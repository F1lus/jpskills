const login = require('express').Router()

const session = require('../../model/SessionSetup')
const dbconnect = require('../../model/DbConnect')

login.use(session)

login.post('/login', (req, res) => {
    if(req.body.cardNum && req.body.password){
        dbconnect.userExists(req.body.cardNum, req.body.password).then(exists => {
            if(exists){
                req.session.cardNum = req.body.cardNum
                dbconnect.findUser(req.session.cardNum).then(userData =>{
                    req.session.user = userData[0]
                    if(userData[1] === 'Adminisztrátor' || userData[1] === 'admin'){
                        req.session.perm = 'admin'
                    }else{
                        req.session.perm = userData[1]
                    }
                    res.json({access: true})
                }).catch(err => console.log(err))
            }else{
                res.json({access: false})
            }
        }).catch(err => console.log(err))
    }
})

module.exports = login