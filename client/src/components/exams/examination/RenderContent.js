import React, {useState} from 'react'

export default function RenderContent(props){

    const list = props.list
    const socket = props.socket

    const [answers, setAnswers] = useState([])
    const [disable, setDisable] = useState(false)

    function createImage(picture){
        const arrayBufferView = new Uint8Array(picture)
        const blob = new Blob([arrayBufferView], {type: 'image/jpeg'}) 
        const urlCreator = window.URL || window.webkitURL

        return urlCreator.createObjectURL(blob)
    }

    function handleChange(event, qId, aId){
        const answersCopy = answers.slice()
        const answerObj = {id: qId, answers: []}
        if(event.target.checked){
            if(answersCopy.length === 0){
                answerObj.answers.push(aId)
                answersCopy.push(answerObj)
            }else{
                const index = answersCopy.findIndex(value => value.id === qId)
                if(index === -1){
                    answerObj.answers.push(aId)
                    answersCopy.push(answerObj)
                }else{
                    if(answersCopy[index].answers.findIndex(value => value === aId) === -1){
                        answersCopy[index].answers.push(aId)
                    }
                }
            }
        }else{
            const index = answersCopy.findIndex(value => value.id === qId)
            if(index !== -1){
                const answerIndex = answersCopy[index].answers.findIndex(value => value === aId)
                if(answerIndex !== -1){
                    answersCopy[index].answers.splice(answerIndex, 1)
                    if(answersCopy[index].answers.length === 0){
                        answersCopy.splice(index, 1)
                    }
                }

            }
        }
        setAnswers(answersCopy)
    }

    function handleSubmit(event){
        event.preventDefault()
        if(answers.length === 0){
            alert('Még nem jelölt meg egy választ sem! Kérjük adjon meg legalább egyet!')
        }else{
            socket.emit('exam-finished', answers, props.exam)
        }
    }

    return (
        <div>
            <ul>
                {list.map((question, qId) => {
                    return question.map((content, innerIndex) => {
                        if(innerIndex === 1){
                            return (
                                <li key={innerIndex}>
                                    <b><span>{qId+1}. </span></b> {content} ({question[2]} pont)
                                </li>)
                        }else if(innerIndex === 3 && content != null){
                            return (
                                <li key={innerIndex}>
                                    <img className='img-fluid' src={createImage(content)} alt=''/>
                                </li>
                            )
                        }else if(innerIndex === 4){
                            return (
                                <li key={innerIndex} className="my-3">
                                    {content.map((text, index) => {
                                        return(
                                            <div className="container" key={index}>
                                                <input type="checkbox" name={index} onChange={e => {
                                                    handleChange(e, question[0], text[0])
                                                }}/>
                                                <label htmlFor={index} className="pl-1"> {text[1]}</label>
                                            </div>
                                        )
                                    })}
                                </li>
                            )
                        }else{
                            return null
                        }
                    })
                })}
            </ul>
            <button onClick={handleSubmit} disabled={disable}>Leadás</button>
        </div>
    )
}