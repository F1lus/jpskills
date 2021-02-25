import React  from 'react'

import DataTable, { createTheme } from 'react-data-table-component'

import { NavLink } from 'react-router-dom'

export default function ExamsTable(props) {

    const data = toLink()

    function toLink() {
        let data = []
        props.exams.forEach((value, index) => {
            data.push(
                {
                    id: index+1,
                    name: 
                        <NavLink to={data.permission === "admin" ? `/exams/modify/${data[1]}`:`/exams/${data[1]}`}>
                            <button disabled={data.permission !== 'admin' ? data[3] === 0 : false} className="btn btn-outline-blue m-2">
                                {value.name}
                            </button>
                        </NavLink>,
                    date: value.date,
                    itemcode: value.itemcode,
                    status: value.status ? 'Aktív' : 'Inaktív'
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