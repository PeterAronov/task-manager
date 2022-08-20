const express = require('express')
const router = express.Router()
const User = require('../models/user')
const status = require('http-status')
const auth = require('../middleware/auth')

// No need for auth middleware for this route because we are creating a new user.
// generateAuthToken is used only for creating a new user or logging in.

router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        const token = await user.generateAuthToken()
        res.status(status.CREATED).send({ user, token })  // token is sent back to the client (e.g Postman) and then it's saved (e.g in Postman in environment variables)
    } catch (error) {
        res.status(status.BAD_REQUEST).send(error.message)
    }
})

// Every single login considered to be a new session, for each session a new token is generated.

router.post('/users/login', async (req, res) => {
    const { email, password } = req.body

    try {
        const user = await User.findByCredentials(email, password)
        const token = await user.generateAuthToken()
        res.status(status.OK).send({ user, token })  // token is sent back to the client (e.g Postman) and then it's saved (e.g in Postman in environment variables)
    } catch (error) {
        res.status(status.BAD_REQUEST).send(error.message)
    }
})

// Notice: when logging out, authToken is still saved in Postman in environment variables.
// When sending GET users/me request there will be and error because the token is not valid anymore, it's removed but still saved in Postman.

router.post('/users/logout', auth, async (req, res) => {
    try { // filter all tokens except the one that is being logged out
        req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token)   // every object in tokens array has 2 fields: token and _id because is sub document in the tokens array.
        await req.user.save()

        res.status(status.OK).send({ user: req.user, token: req.token })  // req.user is a pointer to the user that is logged in.
    } catch (error) {
        res.status(INTERNAL_SERVER_ERROR).send(error)
    }
})

// e.g logout from all sessions. (e.g Netflix log out from all users)
// check this in Postman by login several times and then logout from all sessions.
// the environment variable authToken in Postman will be the last user's token that is logged in.
// and then the last person who logged in will have the authorization to logout from all sessions.

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        const user = await req.user.save()  // we don't need to decalre new user constant because req.user is a pointer to the user that is logged in.
        res.status(status.OK).send(user)
    } catch (error) {
        res.status(INTERNAL_SERVER_ERROR).send(error)
    }
})

// This is going to allow someone to get their own profile and there's no need to provide the ID for your own user.
// As the authentication token has that information embedded.
// auth is a middleware function that is going to be used to protect the route.
// it uses jwt it reads the token from the header sent via the client(e.g postman) and verifies it.

router.get('/users/me', auth, async (req, res) => {
    res.send(req.user) // req.user is set by the auth middleware. If error occurs we won't get this far and will be checkout by the auth middleware.
})

router.get('/users', auth, async (req, res) => {    // auth is a middleware function that is defined in src/middleware/auth.js 
    try {                                           // if next() is not called, the call back function will not be called.
        const users = await User.find({})
        res.status(status.OK).send(users)
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).send(error)
    }
})

// 1 - First login or create an account
// 2 - After this step authToken is saved in Postman in environment variables.
// 3 - Then we can use the authToken and send it back to the server to get the user's profile.
// 4- Change password and try to login with the old password see what happens

router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'age', 'password']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(status.BAD_REQUEST).send({ error: 'Invalid updates!' })
    }

    try {

        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()

        res.status(status.OK).send(req.user)
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).send(error)
    }
})

router.delete('/users/me', auth, async (req, res) => {
    const { id: _id } = req.params

    try {
        await req.user.remove()
        res.status(status.OK).send(req.user)
    } catch (e) {
        res.status(status.INTERNAL_SERVER_ERROR).send(e)
    }
})

module.exports = router

//  This code is deprecated because we are using the auth middleware to protect the route and using the route /users/me.

/*
router.get('/users/:id', async (req, res) => {
    const { id: _id } = req.params

    try {
        const user = await User.findById(_id)

        if (!user) {
            return res.status(status.NOT_FOUND).send()
        }

        res.status(status.OK).send(user)
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).send(error)
    }
})
*/

/*

router.patch('/users/:id', async (req, res) => {
    const updates = Object.keys(req.body)  // keys returns an array of the keys of the object.
    const allowedUpdates = ['name', 'email', 'age', 'password']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    const { id: _id } = req.params

    if (!isValidOperation) {
        return res.status(status.BAD_REQUEST).send({ error: 'Invalid updates!' })
    }

    try {
        // const user = await User.findByIdAndUpdate(_id, req.body, { new: true, runValidators: true })

        const user = await User.findById(_id)

        if (!user) {
            return res.status(status.NOT_FOUND).send()
        }

        updates.forEach((update) => user[update] = req.body[update])
        await user.save()

        res.status(status.OK).send(user)
    } catch (e) {
        res.status(status.INTERNAL_SERVER_ERROR).send(e)
    }
})

*/

/* 

router.delete('/users/:id', async (req, res) => {
    const { id: _id } = req.params

    try {
        const user = await User.findByIdAndDelete(_id)

        if (!user) {
            return res.status(status.NOT_FOUND).send()
        }

        res.status(status.OK).send(user)
    } catch (e) {
        res.status(status.INTERNAL_SERVER_ERROR).send(e)
    }
})

*/

