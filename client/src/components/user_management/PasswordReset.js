import React, { useCallback, useState } from 'react'

import { useLocation } from 'react-router'

import API from '../BackendAPI'

export default function PasswordReset() {

    const query = useLocation().search.replace('?', '').split('&')

    const [password, setPassword] = useState(null)
    const [confirm, setConfirm] = useState(null)
    const [alert, setAlert] = useState(null)

    const handleChange = useCallback(event => {
        event.target.name === 'password' ? setPassword(event.target.value) : setConfirm(event.target.value)
    }, [])

    const handleSubmit = useCallback(event => {
        event.preventDefault()

        if (password.length < 8 || password.length > 16) {
            setAlert('A jelszó legalább 8, legfeljebb 16 karakter hosszú legyen!')
            return
        }

        if (password.toLowerCase() === password) {
            setAlert('A jelszóban szerepelnie kell legalább egy nagybetűnek!')
            return
        }

        if (!password.split('').some(letter => !isNaN(letter))) {
            setAlert('A jelszóban szerepelnie kell legalább egy számnak!')
            return
        }

        if (password !== confirm) {
            setAlert('A jelszavak nem egyeznek!')
            return
        }

        const data = {
            password: password,
            token: query[0].split('=')[1],
            id: query[1].split('=')[1]
        }

        API.post('/resetPassword', data)
            .then(result => {
                if(result.data.response){
                    setAlert('A módosítást végrehajtottuk!')
                }else if(result.data.err){
                    setAlert(result.data.err)
                }else{
                    setAlert('A módosítást nem lehetett végrehajtani, kérjük, próbálja újra!')
                }
            })
            .catch(err => {
                setAlert('Belső hiba történt! Kérjük próbálja újra később!')
            })

    }, [password, confirm, query])

    return (
        <div className="d-flex flex-column container text-center align-items-center justify-content-center vh-100 w-50">
            <div className="container shadow rounded bg-light p-3 mb-3 w-75">
                <h2>
                    <p>Jelszóváltoztatás!</p>
                </h2>

                {alert ? <h3 className="alert alert-danger text-center" id="hiba">{alert}</h3> : null}

                <form onSubmit={handleSubmit}>
                    <div className="form-group m-auto">
                        <input type="password" name="password" value={password || ''} onChange={handleChange} autoComplete="off" required />
                        <label htmlFor="password" className="label-name">
                            <span className="content-name">
                                Jelszó
                            </span>
                        </label>
                    </div>

                    <div className="form-group m-auto">
                        <input type="password" name="confirm" value={confirm || ''} onChange={handleChange} autoComplete="off" required />
                        <label htmlFor="confirm" className="label-name">
                            <span className="content-name">
                                Jelszó újra
                            </span>
                        </label>
                    </div>

                    <div className="text-center">
                        <button className="btn btn-warning mt-3">Módosítás</button>
                    </div>
                </form>
            </div>
        </div>
    )
}