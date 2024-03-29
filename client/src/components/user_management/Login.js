import React, { useCallback, useState } from 'react'
import { useStore } from 'react-redux'
import WOW from 'react-wow'

import { NavLink } from 'react-router-dom'

import API from '../BackendAPI'
import { setLoad } from '../store/ActionHandler'

import Input from '../exams/examination/Input'

export default function Login() {

    const store = useStore()

    const [cardNum, setCardNum] = useState(null)
    const [password, setPassword] = useState('')
    const [password2, setPassword2] = useState('')
    const [email, setEmail] = useState('')
    const [alert, setAlert] = useState(null)
    const [register, setRegister] = useState(false)

    const handleSubmit = useCallback(event => {
        event.preventDefault()
        let data = null
        if (register) {
            if (cardNum == null || password == null || password2 == null || email == null) {
                setAlert('Valamelyik mező hiányos!')
                return
            }

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

            if (password !== password2) {
                setAlert('A jelszavak nem egyeznek!')
                return
            }

            setLoad(store, true)
            data = {
                cardNum: cardNum,
                password: password,
                email: email,
                newUser: true
            }
        } else {
            if (cardNum == null || password == null) {
                setAlert('A kártyaszám, vagy jelszó mező hiányos!')
                return
            }

            setLoad(store, true)
            data = {
                cardNum: cardNum,
                password: password
            }
        }

        API.post('/login', data)
            .then(result => {
                setLoad(store, false)
                if (result.data.access) {
                    window.location.reload()
                } else if (result.data.error) {
                    setAlert(result.data.error)
                } else {
                    if (register) {
                        setAlert('A kártyaszám, vagy az email-cím már foglalt!')
                    } else {
                        setAlert('A megadott adatok egyike hibás!')
                    }
                }
            }).catch(err => {
                setLoad(store, false)
                setAlert('Hiba történt! Próbálja újra!')
            })
    }, [cardNum, password, password2, register, store, email])

    const handleChange = useCallback(event => {
        switch (event.target.name) {
            case 'cardNum':
                setCardNum(event.target.value)
                break
            case 'password':
                if (event.target.value.length <= 16) {
                    setPassword(event.target.value)
                }

                if (register && password.length > 0) {
                    if (event.target.value.length >= 8 && event.target.value.length <= 17) {
                        document.getElementById('hossz').classList.remove('text-danger')
                        document.getElementById('hossz').classList.add('text-success')
                    } else {
                        document.getElementById('hossz').classList.add('text-danger')
                        document.getElementById('hossz').classList.remove('text-success')
                    }

                    if (event.target.value.toLowerCase() !== event.target.value) {
                        document.getElementById('nagybetu').classList.remove('text-danger')
                        document.getElementById('nagybetu').classList.add('text-success')
                    } else {
                        document.getElementById('nagybetu').classList.add('text-danger')
                        document.getElementById('nagybetu').classList.remove('text-success')
                    }

                    if (event.target.value.split('').some(letter => !isNaN(letter))) {
                        document.getElementById('szam').classList.remove('text-danger')
                        document.getElementById('szam').classList.add('text-success')
                    } else {
                        document.getElementById('szam').classList.add('text-danger')
                        document.getElementById('szam').classList.remove('text-success')
                    }

                    if (password === password2) {
                        document.getElementById('egyeztet').classList.remove('text-danger')
                        document.getElementById('egyeztet').classList.add('text-success')
                    } else {
                        document.getElementById('egyeztet').classList.remove('text-success')
                        document.getElementById('egyeztet').classList.add('text-danger')
                    }
                }

                break
            case 'password2':
                if (event.target.value.length <= 16) {
                    setPassword2(event.target.value)
                }

                if (register && password2.length > 0) {
                    if (password === event.target.value) {
                        document.getElementById('egyeztet').classList.remove('text-danger')
                        document.getElementById('egyeztet').classList.add('text-success')
                    } else {
                        document.getElementById('egyeztet').classList.remove('text-success')
                        document.getElementById('egyeztet').classList.add('text-danger')
                    }
                }

                break
            case 'email':
                setEmail(event.target.value)
                break
            default:
                return
        }
    }, [register, password, password2])

    const newUser = useCallback(event => {
        if (event.target.checked) {
            setRegister(true)
        } else {
            setRegister(false)
        }
    }, [])

    return (
        <div className="d-flex flex-column container text-center align-items-center justify-content-center vh-100 w-50">
            <WOW animation='bounceInDown'>
                <div id='login' className="container shadow rounded bg-light p-3 mb-3 w-75">
                    {register ? <h2><p>Kérjük töltse ki a mezőket!</p></h2> : <h2><p>A folytatáshoz jelentkezzen be!</p></h2>}
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

                        {register ?
                            <div className="form-group m-auto">
                                <input type="email" name="email" autoComplete="off" value={email || ''} onChange={handleChange} required />
                                <label htmlFor="email" className="label-name">
                                    <span className="content-name">
                                        Email cím
                                    </span>
                                </label>
                            </div>
                            :
                            null}

                        <div className="form-group m-auto">
                            <input type="password" name="password" autoComplete="off" value={password || ''} onChange={handleChange} required />
                            <label htmlFor="password" className="label-name">
                                <span className="content-name">
                                    Jelszó
                                </span>
                            </label>
                        </div>

                        {register ?
                            <div>
                                <div className="form-group m-auto">
                                    <input type="password" name="password2" autoComplete="off" value={password2 || ''} onChange={handleChange} required />
                                    <label htmlFor="password" className="label-name">
                                        <span className="content-name">
                                            Jelszó megerősítése
                                        </span>
                                    </label>
                                </div>

                                <div className='mt-3 ml-4 w-50 text-justify'>
                                    <h6>A jelszavak megkötései:</h6>
                                    <ul>
                                        <li id='hossz' className='text-danger'>- 8-16 karakter hosszú</li>
                                        <li id='szam' className='text-danger'>- Minimum egy szám</li>
                                        <li id='nagybetu' className='text-danger'>- Minimum egy nagybetű</li>
                                        <li id='egyeztet' className='text-danger'>- A jelszavak megegyeznek</li>
                                    </ul>
                                </div>

                                <div className="text-center">
                                    <button className="btn btn-warning mt-3">Regisztráció</button>
                                </div>
                            </div>
                            :
                            <div className="text-center">
                                <button className="btn btn-warning mt-3">Bejelentkezés</button>
                            </div>
                        }
                    </form>
                    <div className="container mt-3">
                        <Input inputText={register ? 'Kattintson ide, ha már van fiókja!' : 'Kattintson ide, ha még nincs fiókja!'} onChange={newUser} />
                    </div>

                    <div className="text-center">
                        <NavLink to="/resetRequest">Elfelejtettem a jelszavam</NavLink>
                    </div>
                </div>
            </WOW>

            <WOW animation='fadeInUp'>
                <div className="container alert alert-primary shadow text-center rounded w-25 px-1" id="modify">
                    <h6>Az oldal megfelelő működéséhez elengedhetetlen a sütik használata!</h6>
                    <a href="https://ec.europa.eu/info/cookies_hu" target="_blank" rel="noopener noreferrer">További információért kattintson ide!</a>
                </div>
            </WOW>
        </div>
    )
}