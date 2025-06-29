require('dotenv').config()
const express = require('express')
const { queryObjects } = require('v8')
const QueryString = require('qs')
const { stat } = require('fs')

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

app.get('/callback', async function(req, res) {
  var code = req.query.code || null;
  var state = req.query.state || null;

  if (state === null || state !== storedState) {
    console.log(state, storedState);
    res.redirect('/#' +
      QueryString.stringify({
        error: 'state_mismatch'
      }));
  } else{
    let authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirectURI,
        grant_type: 'authorization_code'
      },
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + (new Buffer.from(clientID + ':' + clientSECRET).toString('base64'))
      },
      json: true
    };
    console.log(authOptions)
    localStorage.setItem('authOption', JSON.stringify(authOptions))

    const response = await fetch(authOptions.url, {
        method: 'POST',
        headers: authOptions.headers,
        body: new URLSearchParams(authOptions.form)
    });

    if (response.ok) {
        const data = await response.json();
        const { access_token, refresh_token } = data;
        console.log('Access token:', access_token);
        console.log('Refresh token:', refresh_token)
    } else {
        console.error('Error:', await response.text());
    }
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

