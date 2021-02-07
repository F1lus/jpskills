import React, {useState, useEffect} from 'react'
import {Redirect} from 'react-router-dom'

import API from '../../BackendAPI'

export default function CreateTest(props){

    const permission = props.permission
    const socket = props.socket

    const [item, setItem] = useState(null)
    const [examName, setExamName] = useState(null)
    const [comment, setComment] = useState(null)
    const [examDoc, setExamDoc] = useState(null)
    const [result, setResult] = useState(null)
    const [items, setItems] = useState([])
    const [uploaded, setUploaded] = useState(false)

    useEffect(() => {
        socket.on('products-emitter', products => {
            if(products){
                setItems(products)
            }else{
                setItems([])
            }
        })
    })

    function handleChange(event){
        switch(event.target.name){
            case 'item':
                if(event.target.value === 'A vizsga terméke'){
                    break
                }else{
                    setItem(event.target.value)
                    break
                }
            case 'examName':
                setExamName(event.target.value)
                break
            case 'comment':
                setComment(event.target.value)
                break
            case 'examDoc':
                console.log(event.target.files[0])
                setExamDoc(event.target.files[0])
                break
            default:
                break
        }
    }

    function handleSubmit(event){
        event.preventDefault()

        if(permission !== 'admin'){
            setResult('Parancs megtagadva! Nincs megfelelő jogosultsága!')
            return
        }

        if(examDoc == null){
            setResult('A fájl feltöltése kötelező!')
            return
        }
        if(item == null || examName == null){
            setResult('Legalább egy kötelező mező üresen maradt!')
            return
        }

        const data = new FormData()
        data.append('item', item)
        data.append('examName', examName)
        data.append('comment', comment)
        data.append('examDoc', examDoc)

        setResult(null)
        API.post('/exams/upload', data, {headers: {'Content-Type': `multipart/form-data; boundary=${data._boundary}`}})
            .then(res => {
                switch(res.data.result){
                    case 'invalid_file_type':
                        setResult('A fájl kiterjesztése nem PDF!')
                        break
                    case 200:
                        setResult('A vizsga felvétele sikeres volt!')
                        setUploaded(true)
                        break
                    case 'invalid_file_size':
                        setResult('A fájl mérete meghaladta a maximális méretet! (2 Mb)')
                        break
                    case 'mysql_form_exists_error':
                        setResult('A vizsga felvétele nem sikerült, mivel a megadott formalapszámhoz már hozzárendeltek egy vizsgát!')
                        break
                    case 'mysql_item_exists_error':
                        setResult('A vizsga felvétele nem sikerült, mivel a megadott termékkódhoz már hozzárendeltek egy vizsgát!')
                        break
                    case 'mysql_name_exists_error':
                        setResult('A vizsga felvétele nem sikerült, mivel ilyen névvel már létezik vizsga')
                        break
                    case 'mysql_invalid_itemcode':
                        setResult('A vizsga felvétele nem sikerült, mivel ilyen termékkód nem létezik!')
                        break
                    default:
                        setResult(null)
                        return
                }
            })
            .catch(err => console.log(err))
    }

    return (
        <div className="container shadow rounded p-3 bg-light mt-3">
            {uploaded ? <Redirect from='/exams' to={`/exams/modify/${item}`} /> : null}
            <h1 className="text-center m-3"><p>Új vizsga feltöltése:</p></h1>
            <form onSubmit={handleSubmit}>
                <div className="container text-center mb-2">
                    <select name="item" className="pl-2 w-50 rounded" onChange={handleChange}>
                        <option defaultValue={-1}>A vizsga terméke</option>
                        {items.length === 0 ? <></> : items.map((elem, index) =>{
                            return(
                                <option key={index} value={elem[1]}>{elem[0]}</option>
                            )
                        })}
                    </select>
                </div>
                
                <div className="form-group m-auto w-75">
                    <input type="text" name="examName" onChange={handleChange} value={examName || ''} required autoComplete="off"/>
                    <label htmlFor="examName" className="label-name">
                        <span className="content-name">
                            A vizsga megnevezése:
                        </span>
                    </label>
                </div>
                <div className="form-group m-auto w-75">
                    <input type="text" name="comment" onChange={handleChange} value={comment || ''} autoComplete="off"/>
                    <label htmlFor="comment" className="label-name">
                        <span className="content-name">
                            Megjegyzés:
                        </span>
                    </label>
                </div>
                <div className="container">
                    <input type="file" onChange={handleChange} name="examDoc"/>
                </div>
                <div className="container text-center">
                    <button type="submit" className="btn btn-warning mt-3" value="Létrehozás">Feltöltés!</button>
                </div>
            </form>
            {result ? <h3 className="alert alert-secondary mt-3 text-center" role="alert">{result}</h3> : <></>}
        </div>
    )
    
}