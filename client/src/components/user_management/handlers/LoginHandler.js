import React, { useState } from 'react'
import { Redirect } from 'react-router-dom'

export default function LoginHandler(props) {

    const [permission,] = useState(props.permission)
    const [allowed,] = useState(props.allowed)


    return (
        <div>
            {
            props.login ?
                props.loggedIn ? <Redirect to='/home' /> : props.children

            : 
                props.loggedIn ?
                    allowed.findIndex(perm => perm === '*' ? true : perm === permission) !== -1 ?
                        props.children 
                    : 
                        <Redirect to='/home' />
                :
                    <Redirect to='/' />
            }
        </div>
    )
}