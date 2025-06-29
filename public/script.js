window.env = {
    CLIENT_ID: '<%= process.env.CLIENT_ID %>',
    REDIRECT_URI: '<%= process.env.REDIRECT_URI %>',
    CLIENT_SECRET: '<%= process.env.CLIENT_SECRET %>'
};

let clientID = window.env.CLIENT_ID
let redirectURI = window.env.REDIRECT_URI
let clientSECRET = window.env.CLIENT_SECRET

//let isConnected = false
let storedState = ''
let client_id;
let access_token;
let refresh_token;
let code;
let authOptions;

function generateRandomString(length) {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

document.getElementById('connect').addEventListener('click', async function connectAcc(){
    console.log('lol')
    let state = generateRandomString(16)
    storedState = state
    const scopes = [
        'user-read-recently-played',
        'user-read-currently-playing',
        "user-read-playback-state",
        'user-library-read',
        'user-read-private'
    ].join(' ')
    if (access_token && refresh_token) {
        // get new access token
        refreshTokens()
    } else {
        fetch('https://accounts.spotify.com/authorize?' + // getting state and code  
            QueryString.stringify({
                    response_type: 'code',
                    client_id: clientID,
                    scope: scopes, 
                    redirect_uri: redirectURI,
                    state: state
                })).then (response => {
                    if(!response.ok) {
                        console.log('ERROR network response was no t ok')
                    }
                    state = response.state
                    code = response.code

                    console.log({ state, code })

                    if (state === null || state !== storedState) {
                        console.log(state, storedState);
                        console.log(`invalid state`)
                        //window.location.href = window.location.origin + '/state_mismatch'
                    } else {
                        authOptions = {
                        url: 'https://accounts.spotify.com/api/token', // getting auth token to get refresh and access token
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

                        access_token = getTokens(authOptions)[0]
                        refresh_token = getTokens(authOptions)[1]

                    }
                })
        
    }
    
})

async function getTokens(authOptions) {
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
        return [access_token, refresh_token]
    } else {
        console.error('Error:', await response.text());
    }
}

async function refreshTokens() {
    let url = "https://accounts.spotify.com/api/token"

    const payload = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refresh_token,
        client_id: clientID
      }),
    }

    const body = await fetch(url, payload);
    const response = await body.json();

    access_token = response.access_token
    if (response.refresh_token) {
        access_token = response.access_token
    }

}