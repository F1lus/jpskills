const login = require('express').Router()

const dbconnect = require('../../model/DbConnect')

login.post('/login', async (req, res) => {
    
    if (req.body.newUser) {
        const userData = await dbconnect.findUser(req.body.cardNum)
        if (Array.isArray(userData) && userData.length !== 0) {
            res.json({ access: await dbconnect.registerUser(req.body.cardNum, req.body.password) })
        } else {
            res.json({ error: 'cardnum_not_found' })
        }

    } else {
        if (req.body.cardNum && req.body.password) {
            const exists = await dbconnect.userExists(req.body.cardNum, req.body.password)
            if (exists) {
                req.session.cardNum = req.body.cardNum
                const userData = await dbconnect.findUser(req.session.cardNum)
                if (Array.isArray(userData) && userData.length !== 0) {
                    req.session.user = userData[0]
                    if (userData[1] === 'Adminisztrátor' || userData[1] === 'admin') {
                        req.session.perm = 'admin'
                    } else {
                        req.session.perm = userData[1]
                    }
                    res.json({ access: true })
                } else {
                    res.json({ access: false })
                }

            } else {
                res.json({ access: false })
            }
        }
    }
})

module.exports = login