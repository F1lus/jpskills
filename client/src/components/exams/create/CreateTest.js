import React, {useState} from 'react'
import API from '../../BackendAPI'
import { UploadIcon } from '@primer/octicons-react';

export default function CreateTest(props){

    const permission = props.permission

    const [item, setItem] = useState(null)
    const [formNum, setFormNum] = useState(null)
    const [examName, setExamName] = useState(null)
    const [comment, setComment] = useState(null)
    const [examDoc, setExamDoc] = useState(null)
    const [result, setResult] = useState(null)
    

    function handleChange(event){
        switch(event.target.name){
            case 'item':
                setItem(event.target.value)
                break
            case 'formNum':
                setFormNum(event.target.value)
                break
            case 'examName':
                setExamName(event.target.value)
                break
            case 'comment':
                setComment(event.target.value)
                break
            case 'examDoc':
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
        if(item == null || formNum == null || examName == null){
            setResult('Legalább egy kötelező mező üresen maradt!')
            return
        }

        const data = new FormData()
        data.append('item', item)
        data.append('formNum', formNum)
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
                        break
                    case 500:
                        setResult('A vizsga felvétele nem sikerült! Próbálja újra később!')
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
        <div className="container shadow rounded p-3 bg-light">
            <h1 className="text-center m-3"><p>Új vizsga feltöltése:</p></h1>
            <form onSubmit={handleSubmit}>
                <div className="form-group m-auto">
                    <input type="text" name="item" onChange={handleChange} value={item || ''} required autoComplete="off"/>
                    <label htmlFor="item" className="label-name">
                        <span className="content-name">
                            A vizsga terméke:
                        </span>
                    </label>
                </div>
                <div className="form-group m-auto">
                    <input type="text" name="formNum" onChange={handleChange} value={formNum || ''} required autoComplete="off"/>
                    <label htmlFor="formNum" className="label-name">
                        <span className="content-name">
                            A termék formlapszáma:
                        </span>
                    </label>
                </div>
                <div className="form-group m-auto">
                    <input type="text" name="examName" onChange={handleChange} value={examName || ''} required autoComplete="off"/>
                    <label htmlFor="examName" className="label-name">
                        <span className="content-name">
                            A vizsga megnevezése:
                        </span>
                    </label>
                </div>
                <div className="form-group m-auto">
                    <input type="text" name="comment" onChange={handleChange} value={comment || ''} autoComplete="off"/>
                    <label htmlFor="comment" className="label-name">
                        <span className="content-name">
                            Megjegyzés:
                        </span>
                    </label>
                </div>
                <div className="container mx-auto mb-2 mt-3 text-center">
                    <input type="file" onChange={handleChange} id="pdfFel" name="examDoc"/>
                    <label htmlFor="pdfFel" className="btn btn-outline-primary rounded">
                        <i>
                            <UploadIcon size={24} />
                            &nbsp;
                        </i>
                        Válassza ki a feltöltendő fájlt!
                    </label>
                </div>
                <div className="container text-center">
                    <button type="submit" className="btn btn-warning" value="Létrehozás">Feltöltés!</button>
                </div>
            </form>
            {result ? <h3 className="alert alert-secondary mt-3 text-center" role="alert">{result}</h3> : <></>}
        </div>
    )
    
}