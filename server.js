require('dotenv').config()
const express = require('express')
const { queryObjects } = require('v8')
const QueryString = require('qs')
const { stat } = require('fs')
const https = require('https')
const querystring = require('querystring')

var LocalStorage = require('node-localstorage').LocalStorage,
localStorage = new LocalStorage('./scratch');

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(express.static('public'))

let clientID = process.env.CLIENT_ID
let redirectURI = process.env.REDIRECT_URI
let clientSECRET = process.env.CLIENT_SECRET

let storedState = null; 

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})

app.get('/login', function(req, res) {
    console.log('Login route accessed'); 
    let state = generateRandomString(16)
    console.log(`OG -> ${state}`)
    storedState = state; 
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
            scope: scopes, 
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

app.get('/callback', function(req, res) {
    const code = req.query.code || null;
    const state = req.query.state || null;

    if (state === null || state !== storedState) {
        console.log(state, storedState);
        res.redirect('/#' +
          QueryString.stringify({
            error: 'state_mismatch'
          }));
      } else{
        const postData = querystring.stringify({
            code: code,
            redirect_uri: redirectURI,
            grant_type: 'authorization_code'
        });

        const authHeader = Buffer.from(clientID + ':' + clientSECRET).toString('base64');

        const options = {
            hostname: 'accounts.spotify.com',
            path: '/api/token',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + authHeader,
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const request = https.request(options, (response) => {
            let body = '';
            response.on('data', (chunk) => { body += chunk; });
            response.on('end', () => {
                try {
                    const data = JSON.parse(body);
                    // You can now send the access token to the client, or store it in a session
                    res.send(data); // or redirect with token in query, or set a cookie, etc.
                } catch (e) {
                    res.redirect('/#' + QueryString.stringify({ error: 'invalid_token' }));
                }
            });
        });

        request.on('error', (e) => {
            res.redirect('/#' + QueryString.stringify({ error: 'invalid_token' }));
        });

        request.write(postData);
        request.end();
      }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://127.0.0.1:${PORT}`)
})

// Data Functions
async function getProfile(accessToken) {
    let authOption = JSON.parse(localStorage.getItem('authOption'))
    accessToken = authOption.accessToken
    
    const response = await fetch('https://api.spotify.com/v1/me', {
    headers: {
      Authorization: 'Bearer ' + accessToken
    }
  });

    const data = await response.json();
    return data
}

