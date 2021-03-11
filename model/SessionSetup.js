const session = require('express-session')
const mysqlStore = require('express-mysql-session')(session)
const config = require('../config')

const sessionStore = new mysqlStore({
    host: config.database.host,
    user: config.database.user,
    password: config.database.password,
    database: config.database.db,
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

module.exports = sessionSetup