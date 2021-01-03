const exam = require('express').Router()

const dbconnect = require('../model/DbConnect')

exam.get('/exams/:examcode', (req, res) =>{
    let code = req.params.examcode
    dbconnect.selectWholeExam(code)
    .then(results => {
        if(results){
            if(results[1]){
                res.json({name: results[0], questions: results[1]})
            }else{
                res.json({name: results[0]})
            }
        }
    })
})

module.exports = exam