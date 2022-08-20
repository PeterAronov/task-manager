const express = require('express')
const router = express.Router()
const Task = require('../models/task')
const status = require('http-status')
const auth = require('../middleware/auth')

router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })

    try {
        const savedTask = await task.save()
        res.status(status.CREATED).send(savedTask)
    } catch (e) {
        res.status(status.INTERNAL_SERVER_ERROR).send(e)
    }
})

router.get('/tasks',async (req, res) => {

    try {
        const tasks = await Task.find({})
        res.send(tasks)
    } catch (e) {
        res.status(status.INTERNAL_SERVER_ERROR).send(e)
    }
})

router.get('/tasks/:id',async (req, res) => {
    const _id = req.params.id

    try {
        const task = await Task.findById(_id)

        if (!task) {
            return res.status(status.NOT_FOUND).send()
        }

        res.send(task)
    } catch (e) {   
        res.status(status.INTERNAL_SERVER_ERROR).send(e)
    }
})

router.patch('/tasks/:id',async (req, res) => {
    const updates = Object.keys(req.body)  // keys returns an array of the keys of the object.
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(status.BAD_REQUEST).send({ error: 'Invalid updates!' })
    }

    const { id: _id } = req.params

    try {
        const task = await Task.findByIdAndUpdate(_id, req.body, { new: true, runValidators: true })

        //      const task = await Task.findById(_id)
        //      updates.forEach((update) => task[update] = req.body[update])
        //      await task.save()

        if (!task) {
            return res.status(status.NOT_FOUND).send()
        }

        res.send(task)
    } catch (e) {
        res.status(status.INTERNAL_SERVER_ERROR).send(e)
    }
})

router.delete('/tasks/:id',async (req, res) => {
    const { id: _id } = req.params

    try {
        const task = await Task.findByIdAndDelete(_id)

        if (!task) {
            return res.status(status.NOT_FOUND).send()
        }

        res.send(task)
    } catch (e) {   
        res.status(status.INTERNAL_SERVER_ERROR).send(e)
    }
})

module.exports = router