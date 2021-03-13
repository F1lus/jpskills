import React, { useCallback, useState } from 'react'
import { useSelector } from 'react-redux'
import { Redirect } from 'react-router'

export default function Management(){

    const [user] = useSelector(state => [state.userReducer.user])

    const [redirect, setRedirect] = useState(false)

    const logout = useCallback(event => {
        event.preventDefault()
        setRedirect(true)
    }, [])
    
    return(
        <div className='container-lg mx-auto bg-light'>
            {redirect? <Redirect to='/logout' /> : null}
            <button onClick={logout}>Kilépés</button>
            <h2>Üdvözöljük, {user}</h2>

            
        </div>
    )
}