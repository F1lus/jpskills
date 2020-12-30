const setup = require('express').Router()
const session = require('express-session')
const mysqlStore = require ('express-mysql-session')(session)

const sessionStore = new mysqlStore({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'jpskills',
    expiration: 86400000,
    clearExpired: true,
    checkExpirationInterval: 900000
})

const sessionSetup = session({
    secret: 'jp5k1ll-$eCRet-#749',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
})

setup.use(sessionSetup)

module.exports = setup