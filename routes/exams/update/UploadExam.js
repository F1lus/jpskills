const upload = require('express').Router()

const dbconnect = require('../../../model/DbConnect')
const session = require('../../../model/SessionSetup')

upload.use(session)

upload.post('/exams/upload', async (req, res) =>{
    if(req.session.perm !== 'admin'){
        return
    }else if(!req.files || !req.files.examDoc){
        return
    }else if(req.files.examDoc.mimetype !== 'application/pdf'){
        res.send({result: 'invalid_file_type'})
    }else{
        if(req.files.examDoc.truncated){
            res.send({result: 'invalid_file_size'})
        }
        let arrayOfData = []
        arrayOfData.push(
            req.body.item, req.body.examName, 
            req.body.comment, req.files.examDoc.data, req.session.user,
            req.session.user
        )
        dbconnect.insertExam(arrayOfData)
        .then(response =>{
            res.send({result: response})
        })
        .catch(err => console.log(err))
    }
})

module.exports = upload