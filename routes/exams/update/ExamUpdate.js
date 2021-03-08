const update = require('express').Router()

const dbconnect = require('../../../model/DbConnect')

update.post('/exams/modify/:examCode', async (req,res) => {
    if(req.session.user && req.session.cardNum){
        if(req.session.perm === 'admin'){
            const user = req.session.cardNum
            const examCode = req.params.examCode

            if(req.body.questionName && req.body.questionPoints){
                //Kérdés beszúrása, ha nincs kép
                if(!req.files || !req.files.picture){
                    res.json({updated: await dbconnect.insertQuestion(user, examCode, 
                        req.body.questionName, req.body.questionPoints, null)})

                //Kérdés beszúrása, ha van kép
                }else if(!['.png', '.jpeg', '.jpg'].some(value => req.files.picture.name.toLowerCase().endsWith(value))){
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
                }else if(!['.png', '.jpeg', '.jpg'].some(value => req.files.newPic.name.toLowerCase().endsWith(value))){
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