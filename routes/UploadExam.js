const upload = require('express').Router()
const fileUpload = require('express-fileupload')

const dbconnect = require('../model/DbConnect')
const session = require('../model/SessionSetup')

upload.use(fileUpload())

upload.use(session)

upload.post('/exams/upload', async (req, res) =>{
    if(req.session.perm !== 'admin'){
        return
    }
    if(!req.files){
        return
    }
    if(!req.files.examDoc){
        return
    }else if(req.files.examDoc.mimetype !== 'application/pdf'){
        res.send({result: 'invalid_file_type'})
    }else{
        let arrayOfData = []
        arrayOfData.push(
            req.body.item, req.body.formNum, req.body.examName, 
            req.body.comment, req.files.examDoc.data, req.session.user,
            req.session.user, '0', '0'
        )

        dbconnect.insertExam(arrayOfData)
        .then(response =>{
            res.send({result: response})
        })
        .catch(err => console.log(err))
    }
})

module.exports = upload