import React, { Component } from 'react'

import DataTable from 'react-data-table-component'

const data = [
    {
        id: 1,
        name: "Istók István",
        points: 25,
        time: "0:4",
        result: "Átment"
    },
    {
        id: 2,
        name: "Filimon Márk",
        points: 0,
        time: "1:25",
        result: "Megbukott"
    }
]

const columns = [
    {
        name: "Vizsgázó neve",
        selector: "name",
        sortable: true
    },

    {
        name: "Pontszám",
        selector: "points",
        sortable: true
    },

    {
        name: "Idő",
        selector: "time",
        sortable: true
    },

    {
        name: "Eredmény",
        selector: "result",
        sortable: true
    }
]

export default class DetailTable extends Component{


    render() {
        return (
            <div className="container">
                <h1><p>Vizsgánkénti statisztika</p></h1>
                <DataTable 
                    columns={columns}
                    data={data}
                    pagination={true}
                    fixedHeader={true}
                />
            </div>
        )
    }
}