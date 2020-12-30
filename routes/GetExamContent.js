const exam = require('express').Router()

const dbconnect = require('../model/DbConnect')

exam.get('/exams/:examcode', async (req, res) =>{
    let code = req.params.examcode
    await dbconnect.selectWholeExam(code)
        .then(results => {
            res.json({name: results[0], questions: results[1]})
        })
})

module.exports = exam