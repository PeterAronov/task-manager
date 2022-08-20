const mongoose = require('mongoose');
const validator = require('validator')
const bcrypt = require('bcrypt')
const { Schema } = mongoose; // mongoose supports what is called middleware. With middleware, we can register some functions to run before or after given events occur.
const jwt = require('jsonwebtoken')

// Now, when we pass an object in the second argument in model behind the scenes, Mongoose converts it into Schema 
// In order to take advantage of the middleware functionality, all we have to do is create the schema first and pass that in.

const userSchema = new Schema({
    name: {
        type: String, // The type of the field is a string. Other types are: number, boolean, date, buffer, objectid, array and they will be rejected by the server.
        required: true,
        trim: true // Removes all the white spaces from the beginning and the end of the string.
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true, // Converts the string to lowercase.
        validate(value) { // validate is a custom validator that we can use to validate the email.
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) { // toLowerCase() and includes are part of string.prototype.
                throw new Error('Password cannot contain "password"')
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be a postive number')
            }
        }
    },
    tokens: [{  // tokens is an array of objects.  e.g  tokens: [{ token: 'asdasdasd', tokenType: 'access' }, { token: 'asdasdasd', tokenType: 'refresh' }]
        token: {  // this will have an _id too becuase it's considered to be a sub document.
            type: String,
            required: true
        }
    }]
})

// https://javascript.info/json
// When sending a response to the client the response is converted automatically to JSON using JSON.stringify()
// An object may provide method toJSON for to-JSON conversion. JSON.stringify automatically calls it if available.

userSchema.methods.toJSON = function() {
    const user = this
    const userObject = user.toObject() // toObject() is a method that mongoose provides us to convert a mongoose document to a plain javascript object.
    delete userObject.password
    delete userObject.tokens
    return userObject
}

// static methods called "model methods" because they are called on the model.
// statics are like static function inside a class. they are not bound to an instance of the class.

// https://mongoosejs.com/docs/guide.html#statics
// Do not declare statics using ES6 arrow functions (=>). Arrow functions explicitly prevent binding this, 
// so the below examples will work because we don't use of the value of this.

// You can also add static functions to your model. There are three equivalent ways to add a static : https://mongoosejs.com/docs/guide.html#statics
// Statics's purpose is to add static functions to your model, we do this via the schema object.

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })
    if (!user) {
        throw new Error('Unable to login, email not found')
    }

    const isMatch = await bcrypt.compare(password, user.password) // user.password is the hashed password which is stored in the database.
                                                                  // password is the plain text password.
    if (!isMatch) {
        throw new Error('Unable to login, incorrect password')
    }

    return user
}

// methods are called "instances methods" becuase they acessible on the instance of the model.
// methods are bound to the instance of the class and can't be used on the model itself!!
// Here we use a regular function instead of an arrow function because we want to use the value of this.

userSchema.methods.generateAuthToken = async function() {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, 'thisismynewcourse', { expiresIn: '7 days' }) // toekn is the authentication token.
    user.tokens.push({ token }) // short syntax for user.tokens.push({ token: token })
    await user.save()
    return token
}

// We don't use arrow functions because we want to use this here which refers to the user instance. 
// Please see example in CompleteJavaScriptCourse 

userSchema.pre('save', async function (next) {
    const user = this

    if (user.isModified('password')) {  // isModified is a mongoose method that checks if the password field has been modified. True in case of a new user or if the password has been modified.
        user.password = await bcrypt.hash(user.password, 8) // the password is saved in the hashed form.
    }

    next() // if next is not called, the code will not continue.
})

const User = mongoose.model('User', userSchema) // In the MongoDB under the database task-manager-api mongoose will create a collection called users(User inserted)


module.exports = User


// https://jwt.io/
// jwt is for authentication and not for authorization. 
// Base64 means 6 bits per character.
// sign receives the payload and the secret as arguments. the payload is the data that we want to protect. It's converted to a string.
// the payload will be coerced into a string using JSON.stringify.
// The secret is the secret that we want to use to sign the token it's usualy saved in a file called .env


// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiJhYmMxMjMiLCJpYXQiOjE2NjA2NzE2MDUsImV4cCI6MTY2MTI3NjQwNX0.7rnremGs1j9gR1J_GDDBvmdTZVHVRRMzdK8G3Ex5lBY
// The first part is the header. It contains some meta information about the alg, typ ...
// The second part is the payload. It contains the information that we want to protect.
// The third part is the signature. It contains the hash of the first two parts.
// { _id: 'abc123', iat: 1660671605, exp: 1661276405 } = decode eyJfaWQiOiJhYmMxMjMiLCJpYXQiOjE2NjA2NzE2MDUsImV4cCI6MTY2MTI3NjQwNX0

// const myFunction = async () => {
//     const token = jwt.sign({ _id: 'abc123' }, 'thisismynewcourse', { expiresIn: '7 days' }) // toekn is the authentication token.
//     console.log(token)

//     const data = jwt.verify(token, 'thisismynewcourse')
//     console.log(data)
// }

// myFunction()