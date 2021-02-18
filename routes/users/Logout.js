const logout = require('express').Router()

const dbconnect = require('../../model/DbConnect')

logout.post('/logout', (req, res) => {
    if(req.session.cardNum && req.session.user && req.session.perm && req.body.cmd){
        if(req.body.cmd === 'jp-logout'){
            dbconnect.userLogout(req.session.cardNum)
            req.session.destroy(err => {
                err ? console.log(err) : res.json({success: true})
            })
        }
    }
})

module.exports = logout