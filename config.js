module.exports = {
    database: {
        host: 'localhost',
        user: 'root',
        password: '',
        db: 'jpskills'
    },

    mail: {
        host: 'smtp.gmail.com',
        address: '"JP Skills" <jpskills.test@gmail.com>',
        auth: {
            user: 'jpskills.test@gmail.com',
            password: 'skillTeszt1'
        }
    },

    client: 'http://localhost:3000',
    server_host: 'localhost',
    server_port: process.env.PORT || 5000
}