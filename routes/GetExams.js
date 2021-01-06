const exams = require('express').Router()
const dbconnect = require('../model/DbConnect')

function dateFormat(rawDate){
    let date = new Date(rawDate)
    month = '' + (date.getMonth() + 1)
    day = '' + date.getDate()
    year = date.getFullYear()

    if(month.length < 2){
        month = '0' + month
    }
    if(day.length < 2){
        day = '0' + day
    }

    return [year, month, day].join('.')
}

exams.get('/exams', (req, res) => {
    dbconnect.selectExams()
    .then(results => {
        let exams = []
        results.forEach(result => {
            exams.push([result.examName, 
                result.itemCode, 
                result.comment, 
                result.creator, 
                dateFormat((''+result.created))
            ])
        })
        res.json({examInfo: exams})
    })
    .catch(err => {console.log(err)})
})

module.exports = exams