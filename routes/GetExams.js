const exams = require('express').Router()
const dbconnect = require('../model/DbConnect')

exams.get('/exams', (req, res) => {
    dbconnect.selectExams()
    .then(results => {
        let examNames = []
        let itemcodes = []
        results.forEach(result => {
            examNames.push(result.examName)
            itemcodes.push(result.itemCode)
        })
        res.json({names: examNames, codes: itemcodes})
    })
    .catch(err => {console.log(err)})
})

module.exports = exams