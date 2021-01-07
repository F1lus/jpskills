import React, {useState, useEffect} from 'react'

export default function AddQuestion(props){

    const [renderedQuestions, setRenderedQuestions] = useState([])
    const [question, setQuestion] = useState(null)
    const [points, setPoints] = useState(null)

    function handleChange(event){
        switch(event.target.name){
            case 'question':
                setQuestion(event.target.value)
                break
            case 'points':
                setPoints(event.target.value)
                break
            default:
                return
        }
    }

    useEffect(() => {
        let result = []
        for(let i = 0; i < props.count; i++){
            result.push(
                <form key={i}>
                    <input type='text' name='question' 
                        value={question || ''} placeholder='A kérdés szövege' onChange={handleChange}/>
                    <input type='number' name='points' 
                        value={points || ''} placeholder='Pontszám' onChange={handleChange}/>
                    <input type='submit' value='Feltöltés' />
                </form>
            )
        }
        setRenderedQuestions(result)
    }, [props.count])

    return (
        <div>
           { renderedQuestions.length === 0 ? null : renderedQuestions.map(value => {
               return value
           })} 
        </div>
    )
}