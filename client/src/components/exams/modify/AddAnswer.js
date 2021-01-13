import React, {useState} from 'react'
import {useParams} from 'react-router-dom'

import API from '../../BackendAPI'

export default function AddAnswer(props){

    const [param,] = useState(useParams())
    const [answer, setAnswer] = useState(null)
    const [isCorrect, setCorrect] = useState(true)
    const [updated, setUpdated] = useState(null)

    function handleChange(event){
        switch(event.target.name){
            case 'answer':
                setAnswer(event.target.value)
                break
            case 'value':
                setCorrect(event.target.value === 'Helyes')
                break
            default:
                return
        }
    }

    function handleSubmit(event){
        event.preventDefault()
        if(props.questionId && answer && isCorrect != null){
            console.log(isCorrect)
            API.post(`/exams/modify/${param.examName}`, 
                {questionId: props.questionId, answerText: answer, value: isCorrect})
            .then(result => {
                setUpdated(result)
                setAnswer(null)
            })
        }
    }

    return (
        <div>
           { props.display ? 
                <form onSubmit={handleSubmit}>
                    <input type='text' name='answer' 
                        value={answer || ''} placeholder='A kérdés szövege' onChange={handleChange}/>
                    <select name='value' className="rounded pl-2 w-25" onChange={handleChange}>
                        <option defaultValue={true}>Helyes</option>
                        <option value={false}>Helytelen</option>
                    </select>
                    <input type='submit' value='Feltöltés' />
                </form> 
                : null
            } 
        </div>
    )
}