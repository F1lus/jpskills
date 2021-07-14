const login = require('express').Router()

const dbconnect = require('../../model/DbConnect')

login.post('/login', async (req, res) => {
    if (req.session.perm || req.session.cardNum) {
        return
    }

    try {
        if (req.body.newUser) {
            const cardNum = req.body.cardNum
            const email = req.body.email
            const password = req.body.password

            if (password.length < 8 || password.length > 16 || password.toLowerCase() === password || !password.split('').some(letter => !isNaN(letter))) {
                throw new Error('A jelszava nem felel meg a követelményeknek!')
            }

            const userData = await dbconnect.findUser(cardNum)
            if (Array.isArray(userData) && userData.length !== 0) {
                const success = await dbconnect.registerUser(cardNum, email, password)
                if (success) {
                    req.session.cardNum = cardNum
                    req.session.user = userData[0]
                    if (userData[1] === 'Adminisztrátor' || userData[1] === 'admin') {
                        req.session.perm = 'admin'
                    } else {
                        req.session.perm = userData[1]
                    }
                    res.json({ access: true })
                }else{
                    res.json({ access: false })
                }
            } else {
                throw new Error('A kártyaszám nem található!')
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
                        res.json({ access: true })
                    } else {
                        res.json({ access: false })
                    }

                } else {
                    throw new Error('A felhasználó nem található!')
                }
            }
        }
    } catch (error) {
        res.json({ error: error.message })
    }
})

module.exports = login