import React, {useState, useEffect}  from 'react'

import DataTable, { createTheme } from 'react-data-table-component'

import { NavLink } from 'react-router-dom'

export default function ExamsTable(props) {

    const [data, setData] = useState([])

    useEffect(() => {
        setData(toLink())
        // eslint-disable-next-line
    },[props.exams])

    function toLink() {
        let data = []
        props.exams.forEach((value, index) => {
            data.push(
                {
                    id: index+1,
                    name: 
                        <NavLink to={props.permission === "admin" ? `/exams/modify/${value.itemcode}`:`/exams/${value.itemcode}`}>
                            <button disabled={props.permission !== 'admin' ? value.status === 'Inaktív' : false} className="btn btn-outline-blue m-2">
                                {value.name}
                            </button>
                        </NavLink>,
                    date: value.date,
                    itemcode: value.itemcode,
                    status: value.status
                }
            )
        });
        return data
    }

    const columns = [
        {
            name: "Vizsga",
            selector: row => row.name,
            sortable: true
        },
        {
            name: "Készült",
            selector: row => row.date,
            sortable: true
        },
        {
            name: "Cikkszám",
            selector: row => row.itemcode
        },
        {
            name: "Állapot",
            selector: row => row.status,
            sortable: true
        }
    ]

    createTheme("ownTheme", {
        background: {
            default: "#f8f9fa"
        }
    })

    const customText={ 
        rowsPerPageText: 'Sorok száma oldalanként:', 
        rangeSeparatorText: '/', 
        noRowsPerPage: false, 
        selectAllRowsItem: false, 
        selectAllRowsItemText: 'Összes' 
    }

    const conditionalRowStyles = [
        {
            when: row => row.status === "Aktív",
            style: () => ({
                backgroundColor: "#b1dfbb",
                color: "green"
            })

        },
        {
            when: row => row.status === "Inaktív",
            style: () => ({
                backgroundColor: "#f1b0b7",
                color: "red"
            })
        }
    ]

    return (
        <DataTable
            columns={columns}
            data={data}
            pagination={true}
            fixedHeader={true}
            noDataComponent={'Nincsenek megjeleníthető vizsgák.'}
            theme="ownTheme"
            paginationComponentOptions={customText}
            conditionalRowStyles={conditionalRowStyles}
        />
    )
}