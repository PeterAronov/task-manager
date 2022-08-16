const mongoose = require('mongoose');
const validator = require('validator')
const bcrypt = require('bcrypt')
const { Schema } = mongoose; // mongoose supports what is called middleware. With middleware, we can register some functions to run before or after given events occur.

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
        uniqe: true,
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
    }
})

// https://mongoosejs.com/docs/guide.html#statics
// Do not declare statics using ES6 arrow functions (=>). Arrow functions explicitly prevent binding this, 
// so the below examples will work because we don't use of the value of this.

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })
    if (!user) {
        throw new Error('Unable to login, email not found')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw new Error('Unable to login, incorrect password')
    }

    return user
}

// We don't use arrow functions because we want to use this here which refers to the user instance. 
// Please see example in CompleteJavaScriptCourse 

userSchema.pre('save', async function (next) {
    const user = this

    if (user.isModified('password')) {  // isModified is a mongoose method that checks if the password field has been modified. True in case of a new user or if the password has been modified.
        user.password = await bcrypt.hash(user.password, 8)
    }

    next() // if next is not called, the code will not continue.
})

const User = mongoose.model('User', userSchema) // In the MongoDB under the database task-manager-api mongoose will create a collection called users(User inserted)


module.exports = User