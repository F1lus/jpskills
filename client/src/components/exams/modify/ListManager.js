import React, {useEffect, useState} from 'react'
import AddAnswer from './AddAnswer'

import Modifier from './Modifier'

export default function ListManager(props){

    const [list, setList] = useState([])
    const [display, setDisplay] = useState(false)
    const [questionId,] = useState(props.questionId)
    var updated = false

    function modifyDisplay(event){
        event.preventDefault()
        setDisplay(state => !state)
    }

    useEffect(() =>{
        setList(props.list)
    }, [props.list, updated])

    return (
        <ul>
            {
                list.length === 0 ? <li>Nincs megjeleníthető tartalom</li> :
                list.map((el) => {
                    return el.map((inner, index) => {
                        if(index === 3){
                            return (
                            <div key={index}>
                                <div>A kérdéshez tartozó válaszok:</div>
                                <ListManager socket={props.socket} questionId={el[0]} list={inner} isAnswer={true}/>
                            </div>)
                        }else if(index === 0){
                            return (<li key={index}>Azonosító: {inner} <button>Törlés</button></li>)
                        }else if(index === 2){
                            if(typeof inner === 'boolean'){
                                return (
                                <li key={index}>Jelenlegi érték: {inner ? 'Helyes' : 'Helytelen'}
                                    <Modifier socket={props.socket} index={el[0]} value={inner} isAnswer={true}/>
                                </li>)
                            }else{
                                return <li key={index}>Pontszám: <Modifier socket={props.socket} index={el[0]} value={inner}/></li>
                            }
                        }else{
                            if(props.isAnswer){
                                return <li key={index}>Válasz: <Modifier socket={props.socket} index={el[0]} value={inner} isAnswer={true}/></li>
                            }else{
                                return <li key={index}>Kérdés: <Modifier socket={props.socket} index={el[0]} value={inner} /></li>
                            }
                        }
                    })
                })    
            }
            <AddAnswer socket={props.socket} questionId={questionId} display={display} updated={updated}/>
            {
                props.isAnswer ? <li><button onClick={modifyDisplay}>{
                    !display ? 'Válasz hozzáadása' : 'Mégse'
                }</button></li> : null
            }       
        </ul>
    )
}