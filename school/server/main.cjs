const PORT = 3000
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()

mongoose.connect(`${process.env.uri}`)
.then(()=>console.log('MongoDB Connected'))
.catch(err=>console.log(err))

.then(()=>console.log('MongoDB Connected'))
.catch((err)=>console.log(err));

app.use(cors())
app.use(express.json())

app.use('/super',require('./Routers/SuperAdminRouter.cjs'))
app.use('/grade',require('./Routers/GradeAdminRouter.cjs'))
app.use('/staff',require('./Routers/StaffRouter.cjs'))
app.use('/student',require('./Routers/StudentRouter.cjs'))

app.listen(PORT,()=>{
    console.log('Server Running @Port: 3000');
})