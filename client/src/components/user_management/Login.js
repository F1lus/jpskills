import React, {useState} from 'react'

import API from '../BackendAPI'

export default function Login(){

    const [cardNum, setCardNum] = useState(null)
    const [password, setPassword] = useState(null)
    const [password2, setPassword2] = useState(null)
    const [alert, setAlert] = useState(null)
    const [register, setRegister] = useState(false)

    function handleSubmit(event){
        event.preventDefault()
        let data = null
        if(register){
            if(cardNum == null || password == null || password2 == null){
                setAlert('Valamelyik mező hiányos!')
                return
            }

            if(password.length < 8 || password.length > 16){
                setAlert('A jelszó legalább 8, legfeljebb 16 karakter hosszúnak kell lennie!')
                return
            }

            if(password !== password2){
                setAlert('A jelszavak nem egyeznek!')
                return
            }

            data = {
                cardNum: cardNum,
                password: password,
                newUser: true
            }
        }else{
            if(cardNum == null || password == null){
                setAlert('A kártyaszám, vagy jelszó mező hiányos!')
                return
            }
    
            data = {
                cardNum: cardNum,
                password: password
            }
        }
        API.post('/login', data)
                .then(result => {
                    if(result.data.access){
                        window.location.reload()
                    }else{
                        setAlert('A megadott adatok egyike hibás!')
                    }
                }).catch(err =>{
                    setAlert('Hiba történt! Próbálja újra!')
                    console.log(err)
                })
    }

    function handleChange(event){
        switch(event.target.name){
            case 'cardNum':
                setCardNum(event.target.value)
                break
            case 'password':
                setPassword(event.target.value)
                break
            case 'password2':
                setPassword2(event.target.value)
                break
            default:
                return
        }
    }

    function newUser(event) {
        if(event.target.checked) {
            setRegister(true)
        } else {
            setRegister(false)
        }
    }

    return (
        <div className="d-flex container text-center align-items-center justify-content-center vh-100 w-50">
            <div className="container shadow rounded bg-light p-3">
                {register ? <h1 className="text-center"><p>Kérjük adja meg adatait!</p></h1> : <h1 className="text-center"><p>Kérjük jelentkezzen be!</p></h1>}
                {alert ? <h3 className="alert alert-danger text-center" id="hiba">{alert}</h3> : null}
                <form onSubmit={handleSubmit}>
                    <div className="form-group m-auto">
                        <input type="text" name="cardNum" autoComplete="off" value={cardNum || ''} onChange={handleChange} required/>
                        <label htmlFor="cardNum" className="label-name">
                            <span className="content-name">
                                Kártyaszám
                            </span>
                        </label>
                    </div>

                    <div className="form-group m-auto">
                        <input type="password" name="password" autoComplete="off" value={password || ''} onChange={handleChange} required/>
                        <label htmlFor="password" className="label-name">
                            <span className="content-name">
                                Jelszó
                            </span>
                        </label>
                    </div>

                    

                    { register ?
                    <div>
                        <div className="form-group m-auto">
                            <input type="password" name="password2" autoComplete="off" value={password2 || ''} onChange={handleChange} required/>
                            <label htmlFor="password" className="label-name">
                                <span className="content-name">
                                    Jelszó újra
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
                        <input type="checkbox" name="regisztráció" onChange={e => newUser(e)} className="m-2"/>
                        Pipálja be, ha még nincs fiókja!
                    </label>
                </div>
            </div>
        </div>
    )
}