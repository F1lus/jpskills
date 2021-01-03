import React, {useState} from 'react'

export default function ListManager(props){

    const [list, setList] = useState(props.list)

    return (
        <ul>
            <li>{list[0]}</li>
            {
                list.map((el, index) => {
                    if(typeof el === []){
                        return <li><ListManager key={index} list={el} /></li>
                    }else{
                        return <li key={index}>{el}</li>
                    }
                })
            }
        </ul>
    )
}