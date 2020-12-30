const exams = require('express').Router()
const dbconnect = require('../model/DbConnect')

exams.get('/exams/learn/:examCode', async (req, res) => {
    let doc = await dbconnect.selectExamDoc(req.params.examCode)
    if(doc){
        //let contentType = await FileType.fromBuffer(doc.exam_docs)
        //res.type(contentType.mime)
        res.send('a')
    }
})

module.exports = exams