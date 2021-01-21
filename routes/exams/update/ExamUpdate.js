const update = require('express').Router()

const dbconnect = require('../../../model/DbConnect')

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
                }).catch(err => console.log(err))

            }else if(req.body.questionId && req.body.answerText && req.body.value != null){
                //Válasz beszúrás
                dbconnect.insertAnswer(user, examCode, 
                    req.body.questionId, req.body.answerText, req.body.value)
                .then(response => {
                    res.json({updated: response})
                }).catch(err => console.log(err))

            }else if(req.body.questionName && req.body.questionPoints){
                //Kérdés beszúrása
                
                if(!req.files || !req.files.picture){
                    dbconnect.insertQuestion(user, examCode, 
                        req.body.questionName, req.body.questionPoints, null)
                    .then(response => {
                        res.json({updated: response})
                    }).catch(err => console.log(err))
                }else if(req.files.picture.mimetype !== 'image/jpeg' || req.files.picture.mimetype === 'image/png'){
                    return
                }else if(req.files.picture.truncated){
                    return
                }else{
                    dbconnect.insertQuestion(user, examCode, 
                        req.body.questionName, req.body.questionPoints, req.files.picture.data)
                    .then(response => {
                        res.json({updated: response})
                    }).catch(err => console.log(err))
                }
            }
        }
    }
})

module.exports = update