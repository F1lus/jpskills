import React, {useState} from 'react'
import API from '../BackendAPI'

export default function Login(){

    const [cardNum, setCardNum] = useState(null)
    const [password, setPassword] = useState(null)
    const [alert, setAlert] = useState(null)

    function handleSubmit(event){
        event.preventDefault()
        if(cardNum == null || password == null){
            setAlert('A kártyaszám, vagy jelszó mező hiányos!')
            return
        }

        const data = {
            cardNum: cardNum,
            password: password
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
            default:
                return
        }
    }

    return (
        <div className="d-flex align-items-center vh-100">
                <div className="container shadow rounded bg-light p-3">
                    <h1 className="text-center"><p>Jelentkezzen be!</p></h1>
                    {alert ? <h3 className="alert alert-danger text-center" id="hiba">{alert}</h3> : <></>}
                    <form onSubmit={handleSubmit}>
                        <div className="form-group m-auto">
                            <input type="text" name="cardNum" value={cardNum || ''} onChange={handleChange} required/>
                            <label htmlFor="cardNum" className="label-name">
                                <span className="content-name">
                                    Kártyaszám:
                                </span>
                            </label>
                        </div>
                        <div className="form-group m-auto">
                            <input type="password" name="password" value={password || ''} onChange={handleChange} required/>
                            <label htmlFor="password" className="label-name">
                                <span className="content-name">
                                    Jelszó:
                                </span>
                            </label>
                        </div>
                        <div className="text-center">
                            <input type='submit' className="btn btn-warning mt-3" value='Bejelentkezés'/>
                        </div>
                    </form>
                </div>
            </div>
    )
}