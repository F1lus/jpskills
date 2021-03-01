const login = require('express').Router()
const CryptoJS = require('crypto-js')

const dbconnect = require('../../model/DbConnect')

login.post('/login', async (req, res) => {
    if (req.body.newUser) {
        const cardNum = CryptoJS.AES.decrypt(req.body.cardNum, 'RcdNum@jp-$k-s3c#r3t').toString(CryptoJS.enc.Utf8)
        const password = CryptoJS.AES.decrypt(req.body.password, 'Rpw@jp-$k-s3c#r3t').toString(CryptoJS.enc.Utf8)

        const userData = await dbconnect.findUser(cardNum)
        if (Array.isArray(userData) && userData.length !== 0) {
            res.json({ access: await dbconnect.registerUser(cardNum, password) })
        } else {
            res.json({ error: 'cardnum_not_found' })
        }

    } else {
        const cardNum = CryptoJS.AES.decrypt(req.body.cardNum, 'LcdNum@jp-$k-s3c#r3t').toString(CryptoJS.enc.Utf8)
        const password = CryptoJS.AES.decrypt(req.body.password, 'Lpw@jp-$k-s3c#r3t').toString(CryptoJS.enc.Utf8)

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
                res.json({ access: false })
            }
        }
    }
})

module.exports = login