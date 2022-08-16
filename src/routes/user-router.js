const express = require('express')
const router = express.Router()
const User = require('../models/user')
const status = require('http-status')

router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
        const savedUser = await user.save()
        res.status(status.CREATED).send(savedUser)
    } catch (error) {
        res.status(status.BAD_REQUEST).send(error)
    }
})

router.post('/users/login', async (req, res) => {
    const { email, password } = req.body

    try {
        const user = await User.findByCredentials(email, password)
        res.status(status.OK).send(user)
    } catch (error) {
        res.status(status.BAD_REQUEST).send(error.message)
    }
})

router.get('/users', async (req, res) => {
    try {
        const users = await User.find({})
        res.status(status.OK).send(users)
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).send(error)
    }
})

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

router.patch('/users/:id', async (req, res) => {
    const updates = Object.keys(req.body)  // keys returns an array of the keys of the object.
    const allowedUpdates = ['name', 'email', 'age', 'password']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    const { id: _id } = req.params

    if (!isValidOperation) {
        return res.status(status.BAD_REQUEST).send({ error: 'Invalid updates!' })
    }

    try {
        const user = await User.findById(_id)
        updates.forEach((update) => user[update] = req.body[update])
        await user.save()

        if (!user) {
            return res.status(status.NOT_FOUND).send()
        }

        console.log(user)  // new:true returns the updated document, runValidators:true runs the validators on the updated document
        res.status(status.OK).send(user)
    } catch (e) {
        res.status(status.INTERNAL_SERVER_ERROR).send(e)
    }
})

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

module.exports = router
