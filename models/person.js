const mongoose = require('mongoose')
const uri = process.env.MONGODB_URI


mongoose.set('strictQuery', false)
console.log('Connecting to MongoDB...')
mongoose
  .connect(uri)
  .then(() => console.log('Connected to MongoDB.'))
  .catch(error => {
    console.log('Error connecting:', error.message)
    process.exit(1)
  })

//define schema
const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: [3, 'Name must be at least 3 characters long.'],
    required: [true, 'Person must have a name.']
  },
  number: {
    type: String,
    minLength: 8,
    validate: {
      validator: (v => /^\d{2,3}-\d+$/.test(v)),
      message: props => `${props.value} is not a valid phone number!`
    },
    required: [true, 'Person must have a number.']
  }
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