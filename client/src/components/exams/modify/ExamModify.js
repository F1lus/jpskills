import React, {useState, useEffect} from 'react'
import {useParams} from 'react-router-dom'

import API from '../../BackendAPI'

export default function ExamModify(){

    const examCode = useParams()
    var questionList = []

    const [warning, setWarning] = useState(null)
    const [examName, setExamName] = useState(null)
    const [questions, setQuestions] = useState(null)

    useEffect(() => {
        API.get(`/exams/${examCode.examName}`)
            .then(result => {
                if(!result){
                    setWarning('A vizsgához nem tartoznak még kérdések.')
                }else{
                    setExamName(result.data.examName)
                    result.data.questions.forEach((question) => {
                        let answerList = []
                        question[0].forEach((answer) => {
                            let answers = {
                                id: answer[0],
                                answer: answer[1],
                                correct: answer[2]
                            }
                            answerList.push(answers)
                        })

                        let questionObj = {
                            question_id: question[1],
                            exam_itemcode: question[2],
                            question: question[3],
                            points: question[4],
                            answers: answerList,
                            picture: question[5]
                        }

                        questionList.push(questionObj)
                    })
                    setQuestions(questionList)
                }
                console.log(examName)
                console.log(questions)
            }).catch(err => console.log(err))
    })

    return (
        <div>
            <h1>{examName}</h1>

            
        </div>
    )
}
