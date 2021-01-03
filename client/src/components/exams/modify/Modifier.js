import React, {useState} from 'react'

export default function Modifier(props){

    const [type, setType] = useState(props.type)
    const [placeholder, setPlaceholder] = useState(props.placeholder)
    const [value, setValue] = useState(props.value)

    return (
    <div>
        <form>
            <input type={type || 'text'} placeholder={placeholder || ''} value={value || ''} />
            <input type='submit' value="Módosítás" />
        </form>
    </div>)
}