let clientID = '2757b9bf2e4649e7903aaefbc856adca'
let redirectURI = window.location.origin + '/callback'
let clientSECRET = '1db54a4fd96a40fb818461ef3a3149e7'

//let isConnected = false
let storedState = ''
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
        //refreshTokens()
        console.log(`already have access, can go straight to the page`)
    } else {
        console.log(`asking for access now`)
        let params = new URLSearchParams({
                    response_type: 'code',
                    client_id: clientID,
                    scope: scopes, 
                    redirect_uri: redirectURI,
                    state: state
                }).toString()
        console.log(params)

        window.location.href = 'https://accounts.spotify.com/authorize?' + params
        let urlParams = new URLSearchParams(window.location.search)
        state = urlParams.get('state')
        code = urlParams.get('code')
        error = urlParams.get('error')
        
        if (error) {
            console.log(`auth failed`, error)
        } else {
            console.log({ state, code })
        }
            
        if (state === null || state !== storedState) {
            console.log(state, storedState);
            console.log(`invalid state`)
            window.location.href = window.location.origin + '/state_mismatch'
        } else {
            authOptions = {
            //url: 'https://accounts.spotify.com/api/token', // getting auth token to get refresh and access token
            headers: {
                'content-type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + (new Buffer.from(clientID + ':' + clientSECRET).toString('base64'))
            },
            body: new URLSearchParams({
                code: code,
                redirect_uri: redirectURI,
                grant_type: 'authorization_code'
            })
            };

            let tokens = await fetch('https://accounts.spotify.com/api/token', authOptions)
            let data = await tokens.json()

            access_token = getTokens(authOptions.body.toString())[0]
            refresh_token = getTokens(authOptions.body.toString())[1]

        }
    
        
    }
    
})

async function getTokens(authOptions) {
    const response = await fetch(authOptions.url, {
        method: 'POST',
        headers: authOptions.headers,
        body: new URLSearchParams(authOptions.form)
    });

    window.location.href = 'https://accounts.spotify.com/authorize?' + params
        let urlParams = new URLSearchParams(window.location.search)
        state = urlParams.get('state')
        code = urlParams.get('code')
        error = urlParams.get('error')

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