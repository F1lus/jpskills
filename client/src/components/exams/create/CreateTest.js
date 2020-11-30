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
                    default:
                        setResult(null)
                        return
                }
            })
            .catch(err => console.log(err))
    }

    return (
        <div className="container shadow rounded p-3 text-center">
            <h1><p>Új vizsga feltöltése:</p></h1>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <input type="text" name="item" onChange={handleChange} value={item || ''} className="form-control" placeholder="A vizsga terméke"/>
                </div>
                <div className="form-group">
                    <input type="text" name="formNum" onChange={handleChange} value={formNum || ''} className="form-control" placeholder="A termék formlapszáma"/>
                </div>
                <div className="form-group">
                    <input type="text" name="examName" onChange={handleChange} value={examName || ''} className="form-control" placeholder="A vizsga megnevezése"/>
                </div>
                <div className="form-group">
                    <input type="text" name="comment" onChange={handleChange} value={comment || ''} className="form-control" placeholder="Megjegyzés (nem kötelező)"/>
                </div>
                <div className="form-group">
                    <input type="file" onChange={handleChange} id="pdfFel" name="examDoc"/>
                    <label htmlFor="pdfFel" className="btn btn-outline-danger rounded">
                        <i>
                            <UploadIcon size={24} />
                            &nbsp;
                        </i>
                        Válassza ki a feltöltendő fájlt!
                    </label>
                </div>
                <button type="submit" className="btn btn-danger" value="Létrehozás">Feltöltés!</button>
            </form>
            <h3 className="alert alert-secondary" role="alert">{result}</h3>
        </div>
    )
    
}