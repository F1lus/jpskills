import React, { useState, useEffect, useCallback } from 'react'
import { Redirect } from 'react-router-dom'

import API from '../../BackendAPI'

import Input from '../examination/Input'

export default function CreateTest(props) {

    const permission = props.permission
    const socket = props.socket

    const [item, setItem] = useState(null)
    const [examName, setExamName] = useState('')
    const [comment, setComment] = useState('')
    const [examDoc, setExamDoc] = useState(null)
    const [result, setResult] = useState(null)

    const [items, setItems] = useState([])
    const [filteredItems, setFilteredItems] = useState([])
    const [types, setTypes] = useState([])
    const [groups, setGroups] = useState([])
    const [group, setGroup] = useState([])

    const [allGroups, setAllGroups] = useState(false)

    const [uploaded, setUploaded] = useState(false)
    const [disable, setDisable] = useState(false)

    const handleTypes = useCallback(types => {
        if (types) {
            setTypes(types)
        } else {
            setTypes([])
        }
    }, [])

    const handleProducts = useCallback(products => {
        if (products) {
            setItems(products)
            setFilteredItems(products)
        } else {
            setItems([])
            setFilteredItems([])
        }
    }, [])

    const handleGroups = useCallback(groups => {
        if (groups) {
            setGroups(groups)
        } else {
            setGroups([])
        }
    }, [])

    useEffect(() => {
        socket
            .on('types-emitter', handleTypes)
            .on('products-emitter', handleProducts)
            .on('groups-emitter', handleGroups)

        return () => {
            socket
                .off('types-emitter', handleTypes)
                .off('products-emitter', handleProducts)
                .off('groups-emitter', handleGroups)
        }
    })

    const handleChange = useCallback(event => {
        switch (event.target.name) {
            case 'group':
                const grp = []
                for (const option of event.target.options) {
                    if (option.value !== 'A vizsga célcsoportja') {
                        if (option.selected) {
                            if (!grp.includes(option.value)) {
                                grp.push(option.value)
                            }
                        } else {
                            if (grp.includes(option.value)) {
                                grp.splice(grp.indexOf(option.value))
                            }
                        }
                    }
                }
                setGroup(grp)
                break
            case 'type':
                if (event.target.value === 'A termék gyártója') {
                    setItems([])
                } else {
                    socket.emit('get-products', event.target.value)
                }
                break
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
    }, [comment.length, examName.length, socket])

    const handleSubmit = useCallback(event => {
        event.preventDefault()
        setDisable(true)

        if (permission !== 'admin') {
            setResult('Parancs megtagadva! Nincs megfelelő jogosultsága!')
            return
        }

        if (examDoc == null) {
            setResult('A fájl feltöltése kötelező!')
            setDisable(false)
            return
        }
        if (item == null || examName == null) {
            setResult('Legalább egy kötelező mező üresen maradt!')
            setDisable(false)
            return
        }

        const data = new FormData()

        data.append('item', item)
        data.append('examName', examName)
        data.append('comment', comment)
        data.append('examDoc', examDoc)
        data.append('targetGroup', group)
        data.append('allGroups', allGroups)

        setResult(null)
        API.post('/exams/upload', data, { headers: { 'Content-Type': `multipart/form-data; boundary=${data._boundary}` } })
            .then(res => {
                setDisable(false)
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
            })
    }, [comment, examDoc, examName, item, permission, group, allGroups])

    const searchItem = useCallback(event => {
        if (items.length > 0 && types) {
            const filteredBy = items.filter(item => {
                const search = event.target.value.toLowerCase().trim()
                return item[1].includes(search) || item[0].toLowerCase().includes(search)
            })
            setFilteredItems(filteredBy)
        }
    }, [items, types])

    return (
        <div className="container shadow rounded p-3 bg-light mt-3">
            {uploaded ? <Redirect from='/exams' to={`/exams/modify/${item}`} /> : null}
            <h1 className="text-center m-3"><p>Új vizsga feltöltése:</p></h1>
            <form onSubmit={handleSubmit}>
                <div className="container text-center mb-2">
                    <div className="row w-75 mx-auto">
                        <div className="col">
                            <select name="type" className="w-100 rounded" onChange={handleChange}>
                                <option defaultValue={-1}>Vevő</option>
                                {types.length === 0 ? <></> : types.map((elem, index) => {
                                    return (
                                        <option key={index} value={elem}>{elem}</option>
                                    )
                                })}
                            </select>
                        </div>

                        <div className="col">
                            <select name="item" className="w-100 rounded" onChange={handleChange}>
                                <option defaultValue={-1}>{items.length === 0 ? 'Először válasszon vevőt!' : 'A vizsga terméke'}</option>
                                {filteredItems.length === 0 ? <></>
                                    : filteredItems.map((elem, index) => {
                                        return (
                                            <option key={index} value={elem[1]}>{elem[1]} || {elem[0]}</option>
                                        )
                                    })}
                            </select>
                        </div>

                        {items.length > 0 ?
                            <div className="col">
                                <div className="form-group m-auto w-75">
                                    <input type="text" name="search" onChange={searchItem} autoComplete="off" />
                                    <label htmlFor="examName" className="label-name">
                                        <span className="content-name">
                                            Termék keresése
                                        </span>
                                    </label>
                                </div>
                            </div> : null}
                    </div>
                    <h4 className='text-danger w-50 mx-auto mt-3'>A célcsoport később nem módosítható!</h4>
                    <div className="row text-center">
                        {allGroups ? <p className="col">Minden csoport ki lett választva</p> :
                            group.length > 0 ?
                                group.map((elem, index) => {
                                    return (
                                        <p className="col" key={index}>{
                                            groups[groups.findIndex(grp => grp.id === Number.parseInt(elem))].groupName
                                        }</p>
                                    )
                                }) : <p className="col">Nincs kiválasztott csoport</p>
                        }
                    </div>
                    
                    <Input inputText={allGroups ? "Mind kiválasztásának törlése" : "Mind kiválasztása"} onChange={() => setAllGroups(!allGroups)}/>
                    {allGroups ? null :
                        <select name="group" className="w-75 rounded" onChange={handleChange} multiple size="6">
                            {groups.length === 0 ? <></> : groups.map((elem, index) => {
                                return (
                                    <option key={index} value={elem.id}>{elem.groupName}</option>
                                )
                            })}
                        </select>
                    }
                </div>
                <div className="text-center">
                    Több csoport kijelölesehez: <kbd>ctrl + bal egérgomb</kbd> / <kbd>shift + bal egérgomb</kbd> / <kbd>bal egérgomb nyomva tartva</kbd>
                </div>

                <div className="form-group m-auto w-75">
                    <input type="text" name="examName" onChange={handleChange} value={examName || ''} required autoComplete="off" />
                    <label htmlFor="examName" className="label-name">
                        <span className="content-name">
                            A vizsga rövid megnevezése:
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
                    <input type="file" onChange={handleChange} name="examDoc" required />
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