// sudo npm install mongoose
// sudo npm install validator

const mongoose = require('mongoose');

const connectionURL = 'mongodb://127.0.0.1:27017/task-manager-api';

// We don't provide the database sperately we provide the data base name as part of the connectionURL string.
// Mongoose 6 always behaves as if useNewUrlParser ,useUnifiedTopology and useCreateIndex are true 

mongoose.connect(connectionURL);

// const me1 = new User({
//     name: '   Peter Aronov  ',
//     email: 'MYEMAIL@MEAD.IO   ',
//     password: '   asd2322323   '
// })

// const me2 = new User({
//     name: 'Andrew',
//     email: 'ANDREW@GMAIL.COM',
//     password: 'sd@#T42321',
//     age: 29
// })

// me1.save().then((me) => {
//     console.log(me)
// }).catch((error) => {
//     console.log('Error!', error)
// })

// me2.save().then((me) => {
//     console.log(me)
// }).catch((error) => {
//     console.log('Error!', error)
// })