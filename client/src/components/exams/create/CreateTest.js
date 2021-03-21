import React, { useState, useEffect, useCallback } from 'react'
import { Redirect } from 'react-router-dom'

import API from '../../BackendAPI'
import {setLoad} from '../../store/ActionHandler'

export default function CreateTest(props) {

    const permission = props.permission
    const socket = props.socket

    const [item, setItem] = useState(null)
    const [examName, setExamName] = useState('')
    const [comment, setComment] = useState('')
    const [examDoc, setExamDoc] = useState(null)
    const [result, setResult] = useState(null)
    const [items, setItems] = useState([])
    const [types, setTypes] = useState([])
    const [uploaded, setUploaded] = useState(false)
    const [disable, setDisable] = useState(false)

    const handleTypes = useCallback(types => {
        if (types) {
            setTypes(types)
        } else {
            setTypes([])
        }
        setLoad(props.store, false)
    }, [props.store])

    const handleProducts = useCallback(products => {
        if (products) {
            setItems(products)
        } else {
            setItems([])
        }
        setLoad(props.store, false)
    }, [props.store])

    useEffect(() => {
        socket.on('types-emitter', handleTypes)

        socket.on('products-emitter', handleProducts)

        return () => {
            socket.off('types-emitter', handleTypes)

            socket.off('products-emitter', handleProducts)
        }
    })

    const handleChange = useCallback(event => {
        switch (event.target.name) {
            case 'type':
                if (event.target.value === 'A termék gyártója') {
                    setItems([])
                    break
                } else {
                    setLoad(props.store, true)
                    socket.emit('get-products', event.target.value)
                    break
                }
            case 'item':
                if (event.target.value === 'A vizsga terméke' || event.target.value === 'Nem található termék') {
                    break
                } else {
                    setItem(event.target.value)
                    break
                }
            case 'examName':
                if (examName.length < 100) {
                    setExamName(event.target.value)
                }
                break
            case 'comment':
                if (comment.length < 200) {
                    setComment(event.target.value)
                }
                break
            case 'examDoc':
                setExamDoc(event.target.files[0])
                break
            default:
                break
        }
    }, [comment.length, examName.length, socket, props.store])

    const handleSubmit = useCallback(event => {
        event.preventDefault()
        setDisable(true)
        setLoad(props.store, true)

        if (permission !== 'admin') {
            setResult('Parancs megtagadva! Nincs megfelelő jogosultsága!')
            return
        }

        if (examDoc == null) {
            setResult('A fájl feltöltése kötelező!')
            return
        }
        if (item == null || examName == null) {
            setResult('Legalább egy kötelező mező üresen maradt!')
            return
        }

        const data = new FormData()
        data.append('item', item)
        data.append('examName', examName)
        data.append('comment', comment)
        data.append('examDoc', examDoc)

        setResult(null)
        API.post('/exams/upload', data, { headers: { 'Content-Type': `multipart/form-data; boundary=${data._boundary}` } })
            .then(res => {
                setDisable(false)
                setLoad(props.store, false)
                switch (res.data.result) {
                    case 'invalid_file_type':
                        setResult('A fájl kiterjesztése nem PDF!')
                        break
                    case 200:
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
            .catch(err => {
                console.log(err)
                setDisable(false)
                setLoad(props.store, false)
            })
    }, [comment, examDoc, examName, item, permission, props.store])

    return (
        <div className="container shadow rounded p-3 bg-light mt-3">
            {uploaded ? <Redirect from='/exams' to={`/exams/modify/${item}`} /> : null}
            <h1 className="text-center m-3"><p>Új vizsga feltöltése:</p></h1>
            <form onSubmit={handleSubmit}>
                <div className="container text-center mb-2">
                    <div className="row w-75 mx-auto">
                        <div className="col">
                            <select name="type" className="w-100 rounded" onChange={handleChange}>
                                <option defaultValue={-1}>A termék gyártója</option>
                                {types.length === 0 ? <></> : types.map((elem, index) => {
                                    return (
                                        <option key={index} value={elem}>{elem}</option>
                                    )
                                })}
                            </select>
                        </div>
                        <div className="col">
                            <select name="item" className="w-100 rounded" onChange={handleChange}>
                                <option defaultValue={-1}>{items.length === 0 ? 'Először válasszon gyártot!' : 'A vizsga terméke'}</option>
                                {items.length === 0 ? null : items.map((elem, index) => {
                                    return (
                                        <option key={index} value={elem[1]}>{elem[0]} || {elem[1]}</option>
                                    )
                                })}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="form-group m-auto w-75">
                    <input type="text" name="examName" onChange={handleChange} value={examName || ''} required autoComplete="off" />
                    <label htmlFor="examName" className="label-name">
                        <span className="content-name">
                            A vizsga megnevezése:
                        </span>
                    </label>
                </div>
                <div className="form-group m-auto w-75">
                    <input type="text" name="comment" onChange={handleChange} value={comment || ''} autoComplete="off" />
                    <label htmlFor="comment" className="label-name">
                        <span className="content-name">
                            Megjegyzés (ha nincs, hagyja üresen):
                        </span>
                    </label>
                </div>
                <div className="container">
                    <input type="file" onChange={handleChange} name="examDoc" />
                </div>
                <div className="container text-center">
                    <button type="submit" className="btn btn-warning mt-3" value="Létrehozás" disabled={disable}>
                        Feltöltés!
                    </button>
                </div>
            </form>
            {result ? <h3 className="alert alert-danger mt-3 text-center" role="alert">{result}</h3> : <></>}
        </div>
    )

}