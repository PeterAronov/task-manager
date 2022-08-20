const jwt = require('jsonwebtoken')
const User = require('../models/user')

// auth is a middleware function that we can use to protect routes, it's called before the route handler is executed.

const auth = async (req, res, next) => {
    try {
        // the client (e.g Postman) sends GET command with [ Header = Authorization ] and [ value = Bearer <token> ]
        const token = req.header('Authorization').replace('Bearer ', '') // Replacing the begining of the value Bearier daksjdjnsvjsnbdjsd with the token
        const decoded = jwt.verify(token, 'thisismynewcourse')
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })
        // "tokens": [
        //     {
        //         "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MmZjOTFmYTliMDFmZTRhN2U5ZjU4NzQiLCJpYXQiOjE2NjA3MTk2MTAsImV4cCI6MTY2MTMyNDQxMH0.PNc7Tw6ogzFOVB_-pQr06zWZPg4G8S241gNT0HDU-Hw",
        //         "_id": "62fc91fa9b01fe4a7e9f5876"
        //     }
        // ],

        // search criteria: _id: decoded._id, 'tokens.token': token
        // we want to check if this token is still a part of the user's tokens array. when the users logs out, the token is removed from the tokens array.
        // 'tokens.token' is a string property name of the tokens array.
        // See : https://kb.objectrocket.com/mongo-db/use-mongoose-to-find-in-an-array-of-objects-1206

        if (!user) {
            throw new Error("User not found")
        }

        // The other thing we're going to do is give that root handler access to the user that we fetched from the database
        // We can actually add a property onto request to store this and the root handlers will be able to access it later on.
        req.user = user 
        req.token = token
        next()
    } catch (e) {
        res.status(401).send({ error: 'Please authenticate.' })
    }
}

module.exports = auth