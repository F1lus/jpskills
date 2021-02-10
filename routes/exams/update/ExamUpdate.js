const update = require('express').Router()

const dbconnect = require('../../../model/DbConnect')

update.post('/exams/modify/:examCode', (req,res) => {
    if(req.session.user){
        if(req.session.perm === 'admin'){
            const user = req.session.cardNum
            const examCode = req.params.examCode

            if(req.body.status != null){
                dbconnect.updateExamStatus(user, examCode, req.body.status)
                .then(response => {
                    res.json({updated: response})
                }).catch(err => console.log(err))
                
            }else if(req.body.examName && req.body.points != null){
                //exam tábla adatainak módosítása
                dbconnect.updateExam(user, req.body.examName, 
                    examCode, req.body.notes, req.body.points)
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

                }else if(!['.png', '.jpeg', '.jpg'].map(value => req.files.picture.name.toLowerCase().includes(value))){
                    res.json({error: 'invalid_mime'})
                    return
                }else if(req.files.picture.truncated){
                    res.json({error: 'oversize'})
                    return
                }else{

                    dbconnect.insertQuestion(user, examCode, 
                        req.body.questionName, req.body.questionPoints, req.files.picture.data)
                    .then(response => {
                        res.json({updated: response})
                    }).catch(err => console.log(err))
                }

            }else if(req.body.questionModifyId){
                if(!req.files || !req.files.newPic){
                    return
                }else if(!['.png', '.jpeg', '.jpg'].map(value => req.files.newPic.name.toLowerCase().includes(value))){
                    res.json({error: 'invalid_mime'})
                    return
                }else if(req.files.newPic.truncated){
                    res.json({error: 'oversize'})
                    return
                }else{
                    dbconnect.updateQuestionPic(user, examCode, req.body.questionModifyId, req.files.newPic.data)
                    .then(response => res.json({updated: response}))
                    .catch(err => console.log(err))
                }
            }
        }
    }
})

module.exports = update