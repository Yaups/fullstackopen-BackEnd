const mongoose = require('mongoose')


const password = process.env.PASSWORD
const uri = process.env.MONGODB_URI


mongoose.set('strictQuery', false)
console.log('Connecting to MongoDB...')
mongoose
    .connect(uri)
    .then(result => console.log('Connected to MongoDB.'))
    .catch(error => {
        console.log('Error connecting:', error.message)
        process.exit(1)
    })

//define schema
const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})

//modify schema to remove __v and make id into a string
personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

//export document object model
module.exports = mongoose.model('Person', personSchema)