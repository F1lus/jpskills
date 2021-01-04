import React, {useEffect, useState} from 'react'

export default function ListManager(props){

    const [list, setList] = useState([])

    useEffect(() =>{
        setList(props.list)
    }, [props.list])

    return (
        <ul>
            {
                list.length === 0 ? <li>Nincs megjeleníthető tartalom</li> :
                list.map((el, index) => {
                    if(Array.isArray(el)){
                        if(index === 3){
                            return (
                            <div key={index}>
                                <div>A kérdéshez tartozó válaszok:</div>
                                <ListManager list={el} />
                            </div>)
                        }else{
                            return <ListManager key={index} list={el} />
                        }
                    }else{
                        if(index === 0){
                            return <li key={index}>Azonosító: {el}</li>
                        }else if(index === 2){
                            if(typeof el == 'boolean'){
                                return <li key={index}>Érték: {el ? "Helyes" : "Helytelen"}</li>
                            }else{
                                return <li key={index}>Pontszám: {el}</li>
                            }
                        }else{
                            return <li key={index}>Szöveg: {el}</li>
                        }
                    }
                })
            }
        </ul>
    )
}