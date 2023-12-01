const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const PORT = process.env.PORT || 3001

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

const generateRandomId = () => Math.floor(Math.random() * 2000000000)

let persons = [
    {
        id: 1,
        name: "Arto Hellas",
        number: "040-123456"
    },
    {
        id: 2,
        name: "Ada Lovelace",
        number: "39-44-5323523"
    },
    {
        id: 3,
        name: "Dan Abramov",
        number: "12-43-234345"
    },
    {
        id: 4,
        name: "Mary Poppendieck",
        number: "39-23-6423122"
    }
]

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/api/info', (request, response) => {
    response.send(`
    <p>Number of entries currently in phonebook: ${persons.length}</p>
    <p>Current date and time: ${new Date()}</p>
    `)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)

    if (person) response.json(person)
    else response.status(404).end()
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

    const namesToCompare = persons.map(person => person.name.toLowerCase())
    const lowercaseNewName = body.name.toLowerCase().trim()

    if (namesToCompare.includes(lowercaseNewName)) {
        return response.status(400).json({
            error: `${lowercaseNewName} already exists in the phonebook.`
        })
    }

    let id = generateRandomId()
    while (persons.map(person => person.id).includes(id)) {
        id = generateRandomId() //just in case ;)
    }

    const newPerson = {
        id: id,
        name: body.name.trim(),
        number: body.number.trim()
    }
    persons = persons.concat(newPerson)

    response.json(newPerson)
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})