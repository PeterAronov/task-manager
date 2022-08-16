require('../src/db/mongoose')
const User = require('../src/models/user')

User.findByIdAndUpdate('62f39fb6eac32db034a04dce', { age: 1 }).then((user) => {
    console.log(user)
    return User.countDocuments({ age: 1 })
}).then((result) => {
    console.log(result)
}).catch((e) => {
    console.log(e)
})

const findByIdAndUpdate = async (id, update) => {
    try {
        const user = await User.findByIdAndUpdate(id, update)
        console.log("The user is:\n" + user)
        const count = await User.countDocuments({ age: 1 })
        console.log("total users with age [1] : " + count)
    } catch (e) {
        throw e
    }
}

findByIdAndUpdate('62f39fb6eac32db034a04dce', { age: 1 })