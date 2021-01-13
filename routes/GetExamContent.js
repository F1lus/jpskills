const exam = require('express').Router()

const dbconnect = require('../model/DbConnect')

exam.get('/exams/:examcode', (req, res) =>{
    let code = req.params.examcode
    dbconnect.selectWholeExam(code)
    .then(results => {
        if(results){
            if(Array.isArray(results[1])){
                res.json({name: results[0], questions: results[1], notes: results[2], active: results[3], points: results[4]})
            }else{
                res.json({name: results[0], notes: results[1], active: results[2], points: results[3]})
            }
        }
    }).catch(err => console.log(err))
})

module.exports = exam