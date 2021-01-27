import React, {useEffect, useState} from 'react'
import {useParams} from 'react-router-dom'

import AddAnswer from './AddAnswer'

import Modifier from './Modifier'

export default function ListManager(props){

    const examCode = useParams().examName
    const socket = props.socket

    const [list, setList] = useState([])
    const [display, setDisplay] = useState(false)
    const [questionId,] = useState(props.questionId)
    var updated = false

    function modifyDisplay(event){
        event.preventDefault()
        setDisplay(state => !state)
    }

    function remove(e, id){
        e.preventDefault()
        if(props.isAnswer){
            socket.emit('remove-answer', id, examCode)
        }else{
            socket.emit('remove-question', id, examCode)
        }
    }

    useEffect(() =>{
        setList(props.list)
    }, [props.list, updated])

    return (
        <ul>
            {
                list.length === 0 ? <li className="alert alert-danger my-2">Nincs megjeleníthető tartalom!</li> :
                list.map((el,kerdesIndex) => {
                    return el.map((inner, index) => { //inner - belső tömb eleme
                        if(index === 3){
                            /*
                            Ilyenkor a lista újra meghívásra kerül, mivel akkor már a válaszokat
                            jeleníti meg
                            */
                            return (
                            <div key={index} className="jumbotron mb-2">
                                <h3><p>A kérdéshez tartozó válaszok:</p></h3>
                                <ListManager socket={socket} questionId={el[0]} list={inner} isAnswer={true}/>
                            </div>)
                        }else if(index === 0){
                            return (<li key={index}><button className="btn btn-warning" onClick={e =>{
                                remove(e, inner)
                            }}>Törlés</button></li>)
                        }else if(index === 2){
                            /*
                            Itt jelennek meg a kérdések és a válaszok értékei
                            Ha boolean típusú az aktuális elem, akkor válasz, ha nem akkor kérdés
                            */
                            if(typeof inner === 'boolean'){
                                return (
                                <li key={index}>Jelenlegi érték: {inner ? 'Helyes' : 'Helytelen'}
                                    <Modifier socket={socket} index={el[0]} value={inner} isAnswer={true}/>
                                </li>)
                            }else{
                                return <li key={index}><Modifier socket={socket} index={el[0]} value={inner}/></li>
                            }
                        }else{
                            //Itt jelennek meg a kérdések és a válaszok (a konkrét szöveg)
                            if(props.isAnswer){
                                return <li key={index}><Modifier socket={socket} index={el[0]} value={inner} isAnswer={true}/></li>
                            }else{
                                return <li key={index}><Modifier socket={socket} index={el[0]} value={inner} /></li>
                            }
                        }
                    })
                })    
            }
            <AddAnswer socket={props.socket} questionId={questionId} display={display} updated={updated}/>
            {props.isAnswer ? 
                <li>
                    <button onClick={modifyDisplay} className="btn btn-warning">
                        {!display ? 'Válasz hozzáadása' : 'Mégse'}
                    </button>
                </li> : null}       
        </ul>
    )
}