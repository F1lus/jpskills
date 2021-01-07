import React, {useState, useEffect} from 'react'

export default function Modifier(props){

    const [type, setType] = useState(null)
    const [placeholder, ] = useState(props.value)
    const [value, setValue] = useState(props.value)
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
    })

    function renderInput(){
        if(type === 'number' || type === 'text'){
            return <input name='modify' type={type || 'text'} placeholder={placeholder || ''} value={value || ''} />
        }else if(type === 'bool'){
            return (
                <select name='modify' className="rounded pl-2 w-25">
                    <option defaultValue={value}>{value? 'Helyes':'Helytelen'}</option>
                    <option value={!value}>{!value? 'Helyes':'Helytelen'}</option>
                </select>
            )
        }
    }

    return (
    <div>
        <form>
            {renderInput()}
            <input type='submit' value="Módosítás" />
        </form>
    </div>)
}