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

morgan.token('request-body', (req, res) => JSON.stringify(req.body))
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

app.get('/api/persons', (request, response) => {
    Person
        .find({})
        .then(persons => response.json(persons))
})

app.get('/api/info', (request, response) => {
    response.send(`
    <p>Number of entries currently in phonebook: ${4}</p>
    <p>Current date and time: ${new Date()}</p>
    `)
})

app.get('/api/persons/:id', (request, response) => {
    Person
        .findById(request.params.id)
        .then(person => {
            if (person) response.json(person)
            else response.status(404).end()
        })
        .catch(error => {
            console.log(error)
            response.status(500).end()
        })
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)

    response.status(204).end()
})

app.post('/api/persons/', (request, response) => {

    const body = request.body

    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'Please enter both a name and a number.'
        })
    }

    const name = body.name
    const number = body.number

    /*
    const namesToCompare = persons.map(person => person.name.toLowerCase())
    const lowercaseNewName = body.name.toLowerCase().trim()

    if (namesToCompare.includes(lowercaseNewName)) {
        return response.status(400).json({
            error: `${lowercaseNewName} already exists in the phonebook.`
        })
    }
    */

    const newPerson = new Person({ name, number })
    newPerson
        .save()
        .then(addedPerson => response.json(addedPerson))
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})