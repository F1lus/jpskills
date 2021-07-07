const login = require('express').Router()

const dbconnect = require('../../model/DbConnect')

login.post('/login', async (req, res) => {
    if (req.body.newUser) {
        const cardNum = req.body.cardNum
        const email = req.body.email
        const password = req.body.password

        if (password.length < 8 || password.length > 16 || password.toLowerCase() === password || !password.split('').some(letter => !isNaN(letter))) {
            res.json({ error: 'A jelszava nem felel meg a követelményeknek!' })
            return
        }

        const userData = await dbconnect.findUser(cardNum)
        if (Array.isArray(userData) && userData.length !== 0) {
            res.json({ access: await dbconnect.registerUser(cardNum, email, password) })
        } else {
            res.json({ error: 'cardnum_not_found' })
        }

    } else {
        const cardNum = req.body.cardNum
        const password = req.body.password

        if (cardNum && password) {
            const exists = await dbconnect.userExists(cardNum, password)
            if (exists) {
                req.session.cardNum = cardNum
                const userData = await dbconnect.findUser(cardNum)
                if (Array.isArray(userData) && userData.length !== 0) {
                    req.session.user = userData[0]
                    if (userData[1] === 'Adminisztrátor' || userData[1] === 'admin') {
                        req.session.perm = 'admin'
                    } else {
                        req.session.perm = userData[1]
                    }
                    res.status(200).json({ access: true })
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