const express = require('express')
const mongoose = require('mongoose')
const path = require("path")
const ejs = require('ejs')
const multer = require('multer')
const cookieParser = require("cookie-parser")

const upload = multer({ dest: 'uploads/' })

const cors = require('cors')

const app = express()

app.use(cors({
    origin: ['http://localhost:3000','http://localhost:3001','https://patient-website999.netlify.app'], 
    credentials: true // Allow credentials
}));

app.use(express.json())

app.set('view engine','ejs')

app.use(express.urlencoded({extended:true}))

app.use(express.static("./public"))

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.use(cookieParser())


require('dotenv').config()

const port = process.env.PORT || 8080;

function dbConnection(){
    try{
        mongoose.connect(process.env.connection_string)
    }catch(err){
        console.log(err)
    }
}

dbConnection()


const doctorRouter = require('./routes/doctor')

const patientRouter = require('./routes/patient')

app.use("/doc",doctorRouter)

app.use("/pat",patientRouter)

app.get("/",function(req,res){
    return res.send("welcome to landing page")
})

app.get("/demo",(req,res)=>{
    return res.render("index",{data:"hei"})
})


app.post("/test",upload.fields([{name:"profile1"},{name:"profile2"}]),(req,res)=>{
    console.log(req.body)
    console.log(req.files)
    return res.end("testing completed")
})

app.listen(port,()=>{
    console.log(`server is running on ${port}`)
})