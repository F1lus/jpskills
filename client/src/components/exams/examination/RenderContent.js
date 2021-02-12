import React, {useState, useEffect} from 'react'

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
        if(event.target.checked){
            const index = answersCopy.findIndex(value => value.id === qId)
            if(answersCopy[index].answers.findIndex(value => value === aId) === -1){
                answersCopy[index].answers.push(aId)
            }
        }else{
            const index = answersCopy.findIndex(value => value.id === qId)
            if(index !== -1){
                const answerIndex = answersCopy[index].answers.findIndex(value => value === aId)
                if(answerIndex !== -1){
                    answersCopy[index].answers.splice(answerIndex, 1)
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
            setDisable(true)
        }
    }

    useEffect(() => {
        const temp = []
        list.forEach(question => {
            const answerObj = {id: question[0], answers:[]}
            temp.push(answerObj)
        })
        setAnswers(temp)

        // eslint-disable-next-line
    }, [list])

    return (
        <div>
                {list.map((question, qId) => {
                    return <ul className="container bg-white rounded shadow py-3 mb-3 text-center">
                        {question.map((content, innerIndex) => {
                        if(innerIndex === 1){
                            return (
                                <li key={innerIndex} className="container-fluid mb-2 mt-3">
                                    <b><span>{qId+1}. </span> {content} ({question[2]} pont)</b>
                                </li>)
                        }else if(innerIndex === 3 && content != null){
                            return (
                                <li key={innerIndex}>
                                    <img className='rounded img-fluid' src={createImage(content)} alt=''/>
                                </li>
                            )
                        }else if(innerIndex === 4){
                            return (
                                <li key={innerIndex}>
                                    {content.map((text, index) => {
                                        return(
                                            <div className="my-2" key={index}>
                                                <input type="checkbox"name={index} onChange={e => {
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
                    })}</ul>
                })}
            <div className="container text-center">
                <button className="btn btn-warning" onClick={handleSubmit} disabled={disable}>Leadás</button>
            </div>
        </div>
    )
}