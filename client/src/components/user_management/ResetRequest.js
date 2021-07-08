import React, { useCallback, useState } from 'react'

import { NavLink } from 'react-router-dom'

import API from '../BackendAPI'

export default function ResetRequest() {


    const [cardNum, setCardNum] = useState(null)

    const handleChange = useCallback(event => {
        setCardNum(event.target.value)
    }, [])

    const handleSubmit = useCallback(event => {
        event.preventDefault()

    }, [])

    return (
        <div className="d-flex flex-column container text-center align-items-center justify-content-center vh-100 w-50">
            <div className="container shadow rounded bg-light p-3 mb-3 w-75">
                <h2>
                    <p>Jelszóvisszaállítási kérelem!</p>
                </h2>

                <form onSubmit={handleSubmit}>
                    <div className="form-group m-auto">
                        <input type="text" name="cardNum" autoComplete="off" value={cardNum || ''} onChange={handleChange} required />
                        <label htmlFor="cardNum" className="label-name">
                            <span className="content-name">
                                Kártyaszám
                            </span>
                        </label>
                    </div>

                    <div className="text-center">
                        <button className="btn btn-warning mt-3">Bejelentkezés</button>
                    </div>
                </form>
                <br/>
                <div className="text-center">
                    <NavLink to="/">Vissza a bejelentkezéshez</NavLink>
                </div>
            </div>
        </div>
    )
}