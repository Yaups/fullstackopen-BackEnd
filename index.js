require('dotenv').config()
const Person = require('./models/person')
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const PORT = process.env.PORT

app.use(cors())
app.use(express.static('dist'))
app.use(express.json())

morgan.token('request-body', req => JSON.stringify(req.body))
app.use(morgan((tokens, req, res) => [
  tokens.method(req, res),
  tokens.url(req, res),
  tokens.status(req, res),
  tokens.res(req, res, 'content-length'), '-',
  tokens['response-time'](req, res), 'ms',
  tokens['request-body'](req, res)
].join(' ')
))

//const generateRandomId = () => Math.floor(Math.random() * 2000000000)

app.get('/api/info', (request, response, next) => {
  Person
    .countDocuments({})
    .then(count => {
      response.send(`
            <p>Number of entries currently in phonebook: ${count}</p>
            <p>Current date and time: ${new Date()}</p>
            `)
    })
    .catch(error => next(error))
})

app.get('/api/persons', (request, response, next) => {
  Person
    .find({})
    .then(persons => response.json(persons))
    .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  Person
    .findById(request.params.id)
    .then(person => {
      if (person) response.json(person)
      else response.status(404).end()
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number
  }

  Person
    .findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson => {
      console.log(updatedPerson)
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person
    .findByIdAndDelete(request.params.id)
    .then(() => response.status(204).end())
    .catch(error => next(error))
})

app.post('/api/persons/', (request, response, next) => {

  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'Please enter both a name and a number.'
    })
  }

  const name = body.name
  const number = body.number

  const lowercaseNewName = body.name.toLowerCase().trim()
  Person
    .find({})
    .then(persons => {
      const isAlreadyInDatabase = persons
        .map(person => person.name.toLowerCase())
        .includes(lowercaseNewName)
      if (isAlreadyInDatabase) {
        return response.status(400).json({
          error: `${lowercaseNewName} already exists in the phonebook.`
        })
      }
      else {
        const newPerson = new Person({ name, number })
        newPerson
          .save()
          .then(addedPerson => response.json(addedPerson))
          .catch(error => next(error))
      }
    })
    .catch(error => next(error))
})

//UNKNOWN ENDPOINT MIDDLEWARE
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'Unknown endpoint' })
}
app.use(unknownEndpoint)

//ERROR HANDLING MIDDLEWARE
const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'Malformatted id' })
  }
  else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}
app.use(errorHandler)


app.listen(PORT, () => { console.log(`Server running on port ${PORT}`) })