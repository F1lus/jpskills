import React, { useState } from 'react'

export function Admin(props) {

    const [permissions,] = useState(['admin', 'superuser'])

    return (
        <div>
            {permissions.includes(props.permission) ? props.children : null}
        </div>
    )
}

export function User(props) {

    const [permissions,] = useState(['admin'])

    return (
        <div>
            {!permissions.includes(props.permission) ? props.children : null}
        </div>
    )
}