const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('Please enter your password.')
  process.exit(1)
}

if (process.argv.length === 4) {
  console.log('Please enter both a name and a number to add to the phonebook.')
  process.exit(1)
}

const password = process.argv[2]
const uri = `mongodb+srv://fsoTATadmin:${password}@cluster0.rth7lx5.mongodb.net/phonebook?retryWrites=true&w=majority`


mongoose.set('strictQuery', false)
mongoose.connect(uri)

//define schema
const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

//define document object model
const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 3) {
  Person
    .find({})
    .then(result => {
      console.log('Contents of phonebook:')
      result.forEach(person => console.log(person))
      mongoose.connection.close()
    })
}

if (process.argv.length >= 5) {
  const name = process.argv[3]
  const number = process.argv[4]

  //create the new person
  const newPerson = new Person({ name, number })

  //add the name to the phonebook
  newPerson
    .save()
    .then(response => {
      console.log(`Added ${response.name} with number ${response.number} to the phonebook.`)
      mongoose.connection.close()
    })
}