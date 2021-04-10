import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import stateStore from './components/store/Store'

import { BrowserRouter as Router } from 'react-router-dom'
import App from './App'
import * as serviceWorker from './serviceWorker'
import { socket, SocketContext } from './components/GlobalSocket'

ReactDOM.render(
  <Router>
    <Provider store={stateStore}>
      <SocketContext.Provider value={socket}>
        <App />
      </SocketContext.Provider>
    </Provider>
  </Router>
  ,
  document.getElementById('root')
);

console.warn(`FIGYELEM! Ez a weboldal a Jász-Plasztik tulajdona, 
  a fejlesztői konzol használata ezáltal szigorúan tilos!
  
  Semmilyen esetben ne írjon be ide semmit, mivel azzal Ön
  biztonsági kockázatoknak teszi ki saját magát, és az adatait.
  `)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
