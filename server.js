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

app.get('/login', function(req, res) {
    let state = generateRandomString(16)
    const scopes = [
        'user-read-recently-played',
        'user-read-currently-playing',
        "user-read-playback-state",
        'user-library-read',
        'user-read-private'
    ].join(' '); // <-- join as space-separated string

    res.redirect('https://accounts.spotify.com/authorize?' +
        QueryString.stringify({
            response_type: 'code',
            client_id: clientID,
            scope: scopes, // now a string
            redirect_uri: redirectURI,
            state: state
        })
    )
})

// Helper function to generate a random string
function generateRandomString(length) {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})