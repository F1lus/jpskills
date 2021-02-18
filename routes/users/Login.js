const login = require('express').Router()

const dbconnect = require('../../model/DbConnect')

login.post('/login', (req, res) => {
    if (req.body.newUser) {
        dbconnect.findUser(req.body.cardNum).then(userData => {
            if(Array.isArray(userData) && userData.length !== 0){
                dbconnect.registerUser(req.body.cardNum, req.body.password).then(result => {
                    res.json({access: result})
                })
            }else{
                res.json({error: 'cardnum_not_found'})
            }
        })
    } else {
        if (req.body.cardNum && req.body.password) {
            dbconnect.userExists(req.body.cardNum, req.body.password).then(exists => {
                if (exists) {
                    req.session.cardNum = req.body.cardNum
                    dbconnect.findUser(req.session.cardNum).then(userData => {
                        req.session.user = userData[0]
                        if (userData[1] === 'Adminisztrátor' || userData[1] === 'admin') {
                            req.session.perm = 'admin'
                        } else {
                            req.session.perm = userData[1]
                        }
                        res.json({ access: true })
                    }).catch(err => console.log(err))
                } else {
                    res.json({ access: false })
                }
            }).catch(err => console.log(err))
        }
    }
})

module.exports = login