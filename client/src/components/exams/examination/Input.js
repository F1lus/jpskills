import React, {useCallback} from 'react'

export default function Input({onChange, inputText, className}){

    const handleClick = useCallback(e => {
        if(e.target.checked){
            e.target.parentElement.classList.add('check-bg')
        }else{
            e.target.parentElement.classList.remove('check-bg')
        }
    }, [])

    return (
        <div className='my-2'>
            <label className={`checkbox-label checker ${className}`}>
                <input type='checkbox' onClick={handleClick} onChange={onChange}/>{inputText}
            </label>
        </div>
    )
}