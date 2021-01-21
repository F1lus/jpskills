const update = require('express').Router()

const dbconnect = require('../../../model/DbConnect')
const session = require('../../../model/SessionSetup')

update.use(session)

update.post('/exams/modify/:examCode', (req,res) => {
    if(req.session.user){
        if(req.session.perm === 'admin'){
            const user = req.session.user
            const examCode = req.params.examCode
            if(req.body.examName && req.body.status && req.body.points != null){
                //exam tábla adatainak módosítása
                dbconnect.updateExam(user, req.body.examName, 
                    examCode, req.body.notes, req.body.status, req.body.points)
                .then(response => {
                    res.json({updated: response})
                }).catch(err => console.log(err))

            }else if(req.body.questionId && req.body.value && req.body.isNumber != null){
                //Kérdés módosítás
                dbconnect.updateQuestion(user, examCode, 
                    req.body.questionId, req.body.value, req.body.isNumber)
                .then(response => {
                    res.json({updated: response})
                }).catch(err => console.log(err))

            }else if(req.body.answerId && req.body.value && req.body.isBoolean != null){
                //Válasz módosítás
                dbconnect.updateAnswer(user, examCode, req.body.answerId, req.body.value, req.body.isBoolean)
                .then(response => {
                    res.json({updated: response})
                })

            }else if(req.body.questionId && req.body.answerText && req.body.value != null){
                //Válasz beszúrás
                dbconnect.insertAnswer(user, examCode, 
                    req.body.questionId, req.body.answerText, req.body.value)
                .then(response => {
                    res.json({updated: response})
                })
            }
        }
    }
})

module.exports = update