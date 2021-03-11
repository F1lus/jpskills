import React, { useCallback, useState } from 'react'
import CryptoJS from 'crypto-js'

import API from '../BackendAPI'

export default function Login() {

    const [cardNum, setCardNum] = useState(null)
    const [password, setPassword] = useState('')
    const [password2, setPassword2] = useState('')
    const [alert, setAlert] = useState(null)
    const [register, setRegister] = useState(false)

    const handleSubmit = useCallback(event => {
        event.preventDefault()
        let data = null
        if (register) {
            if (cardNum == null || password == null || password2 == null) {
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

            data = {
                cardNum: CryptoJS.AES.encrypt(cardNum, 'RcdNum@jp-$k-s3c#r3t').toString(),
                password: CryptoJS.AES.encrypt(password, 'Rpw@jp-$k-s3c#r3t').toString(),
                newUser: true
            }
        } else {
            if (cardNum == null || password == null) {
                setAlert('A kártyaszám, vagy jelszó mező hiányos!')
                return
            }

            data = {
                cardNum: CryptoJS.AES.encrypt(cardNum, 'LcdNum@jp-$k-s3c#r3t').toString(),
                password: CryptoJS.AES.encrypt(password, 'Lpw@jp-$k-s3c#r3t').toString()
            }
        }
        API.post('/login', data)
            .then(result => {
                if (result.data.access) {
                    window.location.reload()
                } else if (result.data.error) {
                    setAlert(result.data.error)
                } else {
                    if (register) {
                        setAlert('A kártyaszám valószínűleg már foglalt!')
                    } else {
                        setAlert('A megadott adatok egyike hibás!')
                    }
                }
            }).catch(err => {
                setAlert('Hiba történt! Próbálja újra!')
                console.log(err)
            })
    }, [cardNum, password, password2, register])

    const handleChange = useCallback(event => {
        switch (event.target.name) {
            case 'cardNum':
                setCardNum(event.target.value)
                break
            case 'password':
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
                }
                if (event.target.value.length <= 16) {
                    setPassword(event.target.value)
                }
                break
            case 'password2':
                if (event.target.value.length <= 16) {
                    setPassword2(event.target.value)
                }
                break
            default:
                return
        }
    }, [register, password.length])

    const newUser = useCallback(event => {
        if (event.target.checked) {
            setRegister(true)
        } else {
            setRegister(false)
        }
    }, [])

    return (
        <div className="d-flex container text-center align-items-center justify-content-center vh-100 w-50">
            <div className="container shadow rounded bg-light p-3">
                {register ? <h1><p>Kérjük adja meg adatait!</p></h1> : <h1><p>Kérjük jelentkezzen be!</p></h1>}
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

                    <div className="form-group m-auto">
                        <input type="password" name="password" autoComplete="off" value={password || ''} onChange={handleChange} required />
                        <label htmlFor="password" className="label-name">
                            <span className="content-name">
                                Jelszó
                            </span>
                        </label>
                    </div>
                    {register && password.length > 0 ? (
                        <div className='alert alert-primary ml-5 w-50 text-justify'>
                            <h6>A jelszó tartalma:</h6>
                            <ul>
                                <li id='hossz' className='text-danger'>- 8-16 karakter hosszú</li>
                                <li id='szam' className='text-danger'>- Minimum egy szám</li>
                                <li id='nagybetu' className='text-danger'>- Minimum egy nagybetű</li>
                            </ul>
                        </div>) : null}



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
                    <label className="checkbox-label">
                        <input type="checkbox" name="regisztráció" onChange={e => newUser(e)} className="m-2" />
                        {register ? 'Vegye ki a pipát, ha már van fiókja!' : 'Pipálja be, ha még nincs fiókja!'}
                    </label>
                </div>
            </div>
        </div>
    )
}