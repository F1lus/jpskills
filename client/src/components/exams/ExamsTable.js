import React, { useState, useEffect, useCallback } from 'react'

import DataTable, { createTheme } from 'react-data-table-component'

import { NavLink } from 'react-router-dom'

export default function ExamsTable(props) {

    const [workData, setWorkData] = useState([])
    const [data, setData] = useState([])

    const toLink = useCallback(() => {
        let data = []
        props.exams.forEach((value, index) => {
            data.push(
                {
                    id: index + 1,
                    name:
                        <NavLink to={props.permission === "admin" ? `/exams/modify/${value.itemcode}` : `/exams/${value.itemcode}`}>
                            <button disabled={props.permission !== 'admin' ? value.status === 'Inaktív' : false} className="btn btn-outline-blue m-2">
                                {value.name}
                            </button>
                        </NavLink>,
                    workName: value.name,
                    date: value.date,
                    itemcode: value.itemcode,
                    status: value.status
                }
            )
        });
        return data
    }, [props.exams, props.permission])

    useEffect(() => {
        const links = toLink()
        setData(links)
        setWorkData(links)

    }, [props.exams, toLink])

    const search = useCallback((event) => {
        if (workData.length > 0) {
            const filterBySearch = workData.filter(exam => {
                const value = event.target.value.toLowerCase().trim()
                return exam.workName.toLowerCase().includes(value) || exam.itemcode.includes(value) || exam.date.includes(value)
            })
            setData(filterBySearch)
        }
    }, [workData])

    const columns = [
        {
            name: "Vizsga",
            selector: row => row.name,
            sortable: false
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

    const customText = {
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
        <div>

            <form className="mb-3 w-50">
                <div className="form-group m-auto">
                    <input type="text" name="search" onChange={search} autoComplete="off" required />
                    <label htmlFor="search" className="label-name">
                        <span className="content-name">
                            Keresés vizsganév, dátum, vagy cikkszám alapján
                        </span>
                    </label>
                </div>
            </form>

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
        </div>
    )
}
