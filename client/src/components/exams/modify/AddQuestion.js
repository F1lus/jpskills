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
        <div className="container text-center rounded">
           { props.display ? 
                <form>
                    <div className="form-group m-auto mb-3">
                        <input type='text' name='question' value={question || ''} onChange={handleChange} required/>
                        <label htmlFor="question" className="label-name">
                            <span className="content-name">
                                A kérdés szövege
                            </span>
                        </label>
                    </div>

                    <div className="form-group m-auto">
                        <input type='number' name='points' value={points || ''} onChange={handleChange} required/>
                        <label htmlFor="points" className="label-name">
                            <span className="content-name">
                                Pontszám
                            </span>
                        </label>
                    </div>

                    <div className="container text-center">
                        <input type="file"/>
                    </div>
                    <button className="btn btn-warning">Feltöltés!</button>
                </form>
            : null} 
        </div>
    )
}