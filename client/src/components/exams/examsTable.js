import React from 'react'

import DataTable, { createTheme } from 'react-data-table-component'

export default function ExamsTable(props) {

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
            data={props.exams}
            pagination={true}
            fixedHeader={true}
            noDataComponent={'Nincsenek megjeleníthető vizsgák.'}
            theme="ownTheme"
            paginationComponentOptions={customText}
            conditionalRowStyles={conditionalRowStyles}
        />
    )
}