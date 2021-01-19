import React, {useState, useEffect} from 'react'
import {useParams} from 'react-router-dom'

import API from '../../BackendAPI'

export default function Modifier(props){

    const [param,] = useState(useParams())
    const [type, setType] = useState(null)
    const [index,] = useState(props.index)
    const [value, setValue] = useState(props.value || false)
    const [isAnswer,] = useState(props.isAnswer || false)

    useEffect(() => {
        let valueType = typeof props.value
        if(valueType === 'number' || valueType === 'bigint'){
            setType('number')
        }else if(valueType === 'boolean'){
            setType('bool')
        }else if(valueType === 'string'){
            setType('text')
        }
    },[props.value, index])

    function handleChange(event){
        if(event.target.value === 'Állapotváltás...'){
            return
        }
        setValue(event.target.value)
    }

    function handleSubmit(event){
        event.preventDefault()
        if(index && value){
            if(!isAnswer){
                API.post(`/exams/modify/${param.examName}`, 
                    {questionId: index, value: value, isNumber: type === 'number'})
                .then(response  => {
                    if(response){
                        props.socket.emit('exam-modified')
                    }
                }).catch(err => console.log(err))
            }else{
                API.post(`/exams/modify/${param.examName}`, 
                    {answerId: index, value: value, isBoolean: type === 'bool'})
                .then(response  => {
                    if(response){
                        props.socket.emit('exam-modified')
                    }
                }).catch(err => console.log(err))
            }
        }
    }

    function renderInput(){
        if(type === 'number' || type === 'text'){
            return (
                <form onSubmit={handleSubmit}>
                    <input name='modify' type={type || 'text'} 
                        value={value || ''} onChange={handleChange}/>
                    <input type='submit' value="Módosítás" />
                </form>)
        }else if(type === 'bool'){
            return (
                <form onSubmit={handleSubmit}>
                    <select name='modify' className="rounded pl-2 w-25" onChange={handleChange}>
                        <option value={null}>Állapotváltás...</option>
                        <option value={1}>Helyes</option>
                        <option value={0}>Helytelen</option>
                    </select>
                    
                    <input type='submit' value="Módosítás" />
                </form>
            )
        }
    }

    return (
    <div>
        {renderInput()}
    </div>)
}