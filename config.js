module.exports = {
    database: {
        host: 'localhost',
        user: 'root',
        password: '',
        db: 'jpskills'
    },

    mail: {
        host: 'smtp.gmail.com',
        address: '"" <>',
        auth: {
            user: '',
            password: ''
        }
    },

    client: 'http://localhost:3000',
    server_host: 'localhost',
    server_port: process.env.PORT || 5000
}