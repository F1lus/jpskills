const update = require('express').Router()

const dbconnect = require('../../../model/DbConnect')

update.post('/exams/modify/:examCode', async (req,res) => {
    if(req.session.user && req.session.cardNum){
        if(req.session.perm === 'admin'){
            const user = req.session.cardNum
            const examCode = req.params.examCode

            if(req.body.status != null){

                res.json({updated: await dbconnect.updateExamStatus(user, examCode, req.body.status)})

            }else if(req.body.examName && req.body.points != null){
                //exam tábla adatainak módosítása
                res.json({updated: await dbconnect.updateExam(user, req.body.examName, 
                    examCode, req.body.notes, req.body.points)})

            }else if(req.body.questionId && req.body.value && req.body.isNumber != null){
                //Kérdés módosítás
                res.json({updated: await dbconnect.updateQuestion(user, examCode, 
                    req.body.questionId, req.body.value, req.body.isNumber)})

            }else if(req.body.answerId && req.body.value && req.body.isBoolean != null){
                //Válasz módosítás
                res.json({updated: await dbconnect.updateAnswer(user, examCode, 
                    req.body.answerId, req.body.value, req.body.isBoolean)})
                

            }else if(req.body.questionId && req.body.answerText && req.body.value != null){
                //Válasz beszúrás
                res.json({updated: await dbconnect.insertAnswer(user, examCode, 
                    req.body.questionId, req.body.answerText, req.body.value)})

            }else if(req.body.questionName && req.body.questionPoints){
                //Kérdés beszúrása
                
                if(!req.files || !req.files.picture){

                    res.json({updated: await dbconnect.insertQuestion(user, examCode, 
                        req.body.questionName, req.body.questionPoints, null)})

                }else if(!['.png', '.jpeg', '.jpg'].map(value => req.files.picture.name.toLowerCase().includes(value))){
                    res.json({error: 'invalid_mime'})
                    return
                }else if(req.files.picture.truncated){
                    res.json({error: 'oversize'})
                    return
                }else{

                    res.json({updated: await dbconnect.insertQuestion(user, examCode, 
                        req.body.questionName, req.body.questionPoints, req.files.picture.data)})
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
                    
                    res.json({updated: await dbconnect.updateQuestionPic(user, examCode, 
                        req.body.questionModifyId, req.files.newPic.data)})
                }
            }
        }
    }
})

module.exports = update