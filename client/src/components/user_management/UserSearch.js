import React, {useState, useCallback, useEffect} from "react";
import { NavLink } from "react-router-dom";

export default function UserSearch({ socket, cardNum }) {

    const [data, setData] = useState([]);
    const [filtered, setFiltered] = useState([]);
    
    const handleUsers = useCallback((users) => {
        setData(users);
        setFiltered(users);
      }, []);

    useEffect(() => {
        socket
            .emit("get-user-list", cardNum)
            .on("user-list", handleUsers)

        return () => socket.off("user-list", handleUsers)
    }, [socket, cardNum, handleUsers])


    const search = useCallback(
        (event) => {
            if (event.target.value.length > 0) {
                const filteredBy = data.filter((item) => {
                    const search = event.target.value.toLowerCase().trim();
                    return (
                        item.worker_name.includes(search) ||
                        item.worker_name.toLowerCase().includes(search) ||
                        item.worker_cardcode.toString().includes(search)
                    );
                });
                setFiltered(filteredBy);
            } else {
                setFiltered(data);
            }
        },
        [data]
    );

    return (
        <form className="bg-light shadow rounded p-2">
            <div className="form-group m-auto ">
                <input
                    type="text"
                    name="search"
                    autoComplete="off"
                    onChange={search}
                    required
                />
                <label htmlFor="examName" className="label-name">
                    <span className="content-name">Vizsgázó keresése</span>
                </label>
            </div>
            <ul className="list-group w-75 mx-auto" id="users">
                {filtered.map((elem, index) => {
                    return (
                        <NavLink to={`/profile/${elem.worker_cardcode}`} key={index}>
                            <li className="list-group-item">{elem.worker_name}</li>
                        </NavLink>
                    );
                })}
            </ul>
        </form>
    );
}
