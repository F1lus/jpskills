import React, {useState, useEffect} from 'react'
import {useParams} from 'react-router-dom'

import API from '../../BackendAPI'

export default function Modifier(props){

    const [param,] = useState(useParams())
    const [type, setType] = useState(null)
    const [index,] = useState(props.index)
    const [value, setValue] = useState(props.value || false)
    const [isAnswer,] = useState(props.isAnswer || false)
    const [modifyResult, setModifyResult] = useState(null)

    useEffect(() => {
        let valueType = typeof props.value
        if(valueType === 'number' || valueType === 'bigint'){
            setType('number')
        }else if(valueType === 'boolean'){
            setType('bool')
        }else if(valueType === 'string'){
            setType('text')
        }
    },[props.value, index, modifyResult])

    function handleChange(event){
        console.log(event.target.value)
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
                        setModifyResult(response.data.updated)
                    }
                }).catch(err => console.log(err))
            }else{
                API.post(`/exams/modify/${param.examName}`, 
                    {answerId: index, value: value, isBoolean: type === 'bool'})
                .then(response  => {
                    if(response){
                        setModifyResult(response.data.updated)
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
                    {value ?
                        <select name='modify' className="rounded pl-2 w-25" onChange={handleChange}>
                            <option defaultValue={true} value={true}>Helyes</option>
                            <option value={false}>Helytelen</option>
                        </select>
                    :
                        <select name='modify' className="rounded pl-2 w-25" onChange={handleChange}>
                            <option defaultValue={false} value={true}>Helyes</option>
                            <option defaultValue={true} value={false}>Helytelen</option>
                        </select> 
                    }
                    
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