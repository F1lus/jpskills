const exams = require('express').Router()
const dbconnect = require('../model/DbConnect')

exams.get('/exams/learn/:examCode', async (req, res) => {
    dbconnect.selectExamDoc(req.params.examCode).then(result => {
        res.status(200).json({document: result})
    }).catch(err => {
        res.status(404).json({error: err})
    })
})

module.exports = exams