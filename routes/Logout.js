const logout = require('express').Router()

const session = require('../model/SessionSetup')

logout.use(session)

logout.post('/logout', (req, res) => {
    if(req.session.user && req.session.cardNum && req.session.perm && req.body.logoutCommand){
        if(req.body.logoutCommand === 'jp-logout'){
            req.session.destroy(err => {
                if(err){
                    console.log(err)
                }
                res.json({completed: true})
            })
        }
    }
})

module.exports = logout