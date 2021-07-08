const reset = require('express').Router()
const JWT = require('jsonwebtoken')
const crypto = require('crypto')
const bcrypt = require('bcrypt')

const mail = require('../../model/Mail')
const dbconnect = require('../../model/DbConnect')
const config = require('../../config')

reset
    .post('/requestReset', async (req, res) => {
        try {
            const cardNum = req.body.cardNum

            const userId = await dbconnect.findUserId(cardNum)
            const userInfo = await dbconnect.getUserForMail(userId)

            if (!userId || userId === -1 || !userInfo) {
                throw new Error('Az adatok egyike hiányos, vagy nem megfelelő!')
            }

            const key = crypto.randomBytes(32).toString('hex')
            const date = new Date()
            const token = await bcrypt.hash(key, 10)

            date.setMinutes(date.getMinutes() + 10)

            await dbconnect.registerToken(userId, token, date)

            res.json({
                response: await mail(userInfo.email, 'Új jelszó beállítása', {
                    name: userInfo.name,
                    link: `${config.client}/resetPassword?token=${token}&id=${userId}`
                }, 'newpass')
            })
        } catch (error) {
            res.json({ err: error.message })
        }
    })

    .post('/resetPassword', async (req, res) => {
        try {
            const newPw = req.body.password
            const token = req.body.token
            const id = req.body.id

            if (!newPw || !token || !id) {
                throw new Error('Az adatok egyike hiányos, vagy nem megfelelő!')
            }

            await dbconnect.clearExpiredTokens()

            const storedToken = await dbconnect.selectUserToken(id)

            if (!storedToken || new Date().getTime() > new Date(storedToken.expires).getTime()) {
                throw new Error('A link érvényessége lejárt!')
            }

            const isValid = await bcrypt.compare(token, storedToken.token)

            if (!isValid) {
                throw new Error('A link nem megfelelő!')
            }

            res.json({ response: await dbconnect.resetUserPassword(token.admin_id, newPw) })
        } catch (error) {
            res.json({ err: error.message })
        }
    })

module.exports = reset