const update = require('express').Router()

const dbconnect = require('../../../model/DbConnect')

update.post('/exams/modify/:examCode', async (req, res) => {
    try {
        if (req.session.user && req.session.cardNum) {
            if (req.session.perm === 'admin') {
                const user = req.session.cardNum
                const examCode = req.params.examCode

                if (req.body.questionName && req.body.questionPoints) {
                    //Kérdés beszúrása, ha nincs kép
                    if (!req.files || !req.files.picture) {
                        res.json({
                            updated: await dbconnect.insertQuestion(user, examCode,
                                req.body.questionName, req.body.questionPoints, null)
                        })

                        //Kérdés beszúrása, ha van kép
                    } else if (!['.png', '.jpeg', '.jpg'].some(value => req.files.picture.name.toLowerCase().endsWith(value))) {
                        throw new Error('invalid_mime')
                    } else if (req.files.picture.truncated) {
                        throw new Error('oversize')
                    } else {
                        res.json({
                            updated: await dbconnect.insertQuestion(user, examCode,
                                req.body.questionName, req.body.questionPoints, req.files.picture.data)
                        })
                    }

                } else if (req.body.questionModifyId) {
                    if (!req.files || !req.files.newPic) {
                        return
                    } else if (!['.png', '.jpeg', '.jpg'].some(value => req.files.newPic.name.toLowerCase().endsWith(value))) {
                        throw new Error('invalid_mime')
                    } else if (req.files.newPic.truncated) {
                        throw new Error('oversize')
                    } else {
                        res.json({
                            updated: await dbconnect.updateQuestionPic(user, examCode,
                                req.body.questionModifyId, req.files.newPic.data)
                        })
                    }
                }
            }
        }
    } catch (error) {
        res.json({ error: error.message })
    }
})

module.exports = update