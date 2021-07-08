import React, { useCallback, useState } from 'react'

import { NavLink } from 'react-router-dom'

import API from '../BackendAPI'

export default function ResetRequest() {


    const [cardNum, setCardNum] = useState(null)
    const [alert, setAlert] = useState(null)

    const handleChange = useCallback(event => {
        setCardNum(event.target.value)
    }, [])

    const handleSubmit = useCallback(event => {
        event.preventDefault()

        if(!cardNum){
            setAlert('Kérjük ne hagyja a mezőt üresen!')
            return
        }

        API.post('/requestReset', {cardNum: cardNum})
            .then(result => {
                if(result.data.response){
                    setAlert('Új jelszó igényléséhez kérjük kattintson az emailben szereplő linkre!')
                }else if(result.data.err){
                    setAlert(result.data.err)
                }else{
                    setAlert('A kérelmét nem sikerült feldolgozni, kérjük próbálja újra később!')
                }
            })
            .catch(err => console.log(err))

    }, [cardNum])

    return (
        <div className="d-flex flex-column container text-center align-items-center justify-content-center vh-100 w-50">
            <div className="container shadow rounded bg-light p-3 mb-3 w-75">
                <h2>
                    <p>Jelszóvisszaállítási kérelem!</p>
                </h2>
                {alert ? <h3 className="alert alert-danger text-center" id="hiba">{alert}</h3> : null}
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
                        <button className="btn btn-warning mt-3">Kérelmezés</button>
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