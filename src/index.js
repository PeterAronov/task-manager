const express = require('express')
require('./db/mongoose')
const User = require('./models/user')
const Task = require('./models/task')
const status = require('http-status');
const userRouter = require('./routes/user-router')
const taskRouter = require('./routes/task-router')

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

///////////////// tasks /////////////

app.listen(port, () => {
    console.log('Server is up on port ' + port)
})