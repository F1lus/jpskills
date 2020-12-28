const express = require('express')
//const http = require('http')
//const socketIo = require('socket.io')
const session = require('express-session')
const mysqlStore = require ('express-mysql-session')(session)
const Connection = require('./model/DbConnect')
const cors = require('cors')
const fileUpload = require('express-fileupload')
//const FileType = require('file-type')

const app = express()

const dbconnect = new Connection()

const PORT = process.env.PORT || 5000;

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

app.use(cors({
    origin: 'http://localhost:3000',
    methods: 'PUT, GET, POST, DELETE, OPTIONS',
    allowedHeaders: 'Content-Type',
    credentials: true
}))

app.use(fileUpload())

app.use(sessionSetup)

app.use(express.json())

app.get('/exams', (req, res) => {
    dbconnect.selectExams()
    .then(results => {
        let examNames = []
        let itemcodes = []
        results.forEach(result => {
            examNames.push(result.examName)
            itemcodes.push(result.itemCode)
        })
        res.json({names: examNames, codes: itemcodes})
    })
    .catch(err => {console.log(err)})
})

app.get('/exams/learn/:examCode', async (req, res) => {
    let doc = await dbconnect.selectExamDoc(req.params.examCode)
    if(doc){
        //let contentType = await FileType.fromBuffer(doc.exam_docs)
        //res.type(contentType.mime)
        res.send('a')
    }
})

app.post("/exams/upload" , async (req, res) => {
    if(req.session.perm !== 'admin'){
        return
    }
    if(!req.files){
        return
    }
    if(!req.files.examDoc){
        return
    }else if(req.files.examDoc.mimetype !== 'application/pdf'){
        res.send({result: 'invalid_file_type'})
    }else{
        let arrayOfData = []
        arrayOfData.push(
            req.body.item, req.body.formNum, req.body.examName, 
            req.body.comment, req.files.examDoc.data, req.session.user,
            req.session.user, '0', '0'
        )

        dbconnect.insertExam(arrayOfData)
        .then(response =>{
            res.send({result: response})
        })
        .catch(err => console.log(err))
        
    }
})

app.get('/exams/:examcode', async (req, res) =>{
    let code = req.params.examcode
    await dbconnect.selectWholeExam(code)
        .then(results => {
            res.json({examName: results[0], questions: results[1]})
        })
    
})

app.post('/login', async (req, res) => {
    if(req.body.cardNum && req.body.password){
        if(await dbconnect.userExists(req.body.cardNum, req.body.password)){
            req.session.cardNum = req.body.cardNum
            res.json({access: true})
        }else{
            res.json({access: false})
        }
    }
})

app.get('/login', async (req, res) =>{    
    if(req.session.cardNum){
        let userData = await dbconnect.findUser(req.session.cardNum)
        req.session.user = userData[0]
        if(userData[1] === 'Adminisztrátor' || userData[1] === 'admin'){
            req.session.perm = 'admin'
        }else{
            req.session.perm = userData[1]
        }
        res.status(200).json({user: req.session.user, permission: req.session.perm})
    }
})

app.listen(PORT, () => {
    console.log(`Online: http://localhost:${PORT}`)
})