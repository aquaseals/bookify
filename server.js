require('dotenv').config()
const express = require('express')
const axios = require('axios')
const { queryObjects } = require('v8')
const QueryString = require('qs')

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(express.static('public'))

let clientID = process.env.CLIENT_ID
let redirectURI = process.env.REDIRECT_URI

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})

app.get('/login', (req, res) => {
    let state = generateRandomString(16)
    const scopes = [
        'user-read-recently-played',
        'user-read-currently-playing',
        "user-read-playback-state",
        'user-library-read',
        'user-read-private'
    ]

    res.redirect('https://accounts.spotify.com/authorize?' +
        QueryString.stringify({
            response_type: 'code',
            client_id: clientID,
            scope: scopes,
            redirect_uri: redirectURI,
            state: state
        })
    )
})