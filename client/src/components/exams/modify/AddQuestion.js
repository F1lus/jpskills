import React, {useState} from 'react'

export default function AddQuestion(props){

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

    return (
        <div>
           { props.display ? 
                <form>
                    <input type='text' name='question' 
                        value={question || ''} placeholder='A kérdés szövege' onChange={handleChange}/>
                    <input type='number' name='points' 
                        value={points || ''} placeholder='Pontszám' onChange={handleChange}/>
                    <input type='submit' value='Feltöltés' />
                </form>
            : null} 
        </div>
    )
}