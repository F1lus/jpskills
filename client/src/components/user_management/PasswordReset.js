import React from 'react'

export default function PasswordReset() {

    return (
        <div className="d-flex flex-column container text-center align-items-center justify-content-center vh-100 w-50">
            <div className="container shadow rounded bg-light p-3 mb-3 w-75">
                <h2>
                    <p>Jelszóváltoztatás!</p>
                </h2>

                <form>
                    <div className="form-group m-auto">
                        <input type="password" name="password" autoComplete="off" required />
                        <label htmlFor="password" className="label-name">
                            <span className="content-name">
                                Jelszó
                            </span>
                        </label>
                    </div>

                    <div className="form-group m-auto">
                        <input type="password" name="password" autoComplete="off" required />
                        <label htmlFor="password" className="label-name">
                            <span className="content-name">
                                Jelszó újra
                            </span>
                        </label>
                    </div>

                    <div className="text-center">
                        <button className="btn btn-warning mt-3">Megerősítés</button>
                    </div>
                </form>
            </div>
        </div>
    )
}