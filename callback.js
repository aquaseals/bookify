// find access and refresh tokens
// pass onto main page to do api calls for data
const clientID = '2757b9bf2e4649e7903aaefbc856adca'
const redirectURI = window.location.origin + '/bookify/callback'
const clientSECRET = '1db54a4fd96a40fb818461ef3a3149e7'
let access_token;
let refresh_token;

const onLoad = async () => {
    const storedState = localStorage.getItem('state') ?? ''
    let urlParams = new URLSearchParams(window.location.search)
    let state = urlParams.get('state')
    let code = urlParams.get('code')
    let error = urlParams.get('error')

    async function refreshTokens() {
    const url = "https://accounts.spotify.com/api/token"
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
    const body = await fetch(url, payload)
    const response = await body.json()

    access_token = response.access_token
    if (response.refresh_token) {
        refresh_token = response.refresh_token
    }
    return {access_token, refresh_token}
    }

    // user info
    async function getProfile() {
    const url = "https://api.spotify.com/v1/me"
    const payload = {
        method: 'GET',
        headers: {
            'Authorization': 'Basic ' + btoa(clientID + ':' + clientSECRET)
        },
    }
    const body = await fetch(url, payload)
    const response = await body.json()

    let name = response.display_name
    let pfp = response.images.url
    return {name, pfp}
    }

    if (error) {
        console.log(`auth failed`, error)
    } else {
        console.log({ state, code, error})
    }
        
    if (state === null || state !== storedState) {
        console.log(state, storedState);
        console.log(`invalid state`)
        window.location.href = window.location.origin + '/bookify/state_mismatch'
    } else {
        console.log(clientID, clientSECRET)
        let authOptions = {
        method: "POST",
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(clientID + ':' + clientSECRET)
        },
        body: new URLSearchParams({
            code: code,
            redirect_uri: redirectURI,
            grant_type: 'authorization_code'
        })
        };

        let tokens = await fetch('https://accounts.spotify.com/api/token', authOptions) // getting auth token to get refresh and access token
        let data = await tokens.json()
        console.log(data)

        access_token = data.access_token
        refresh_token = data.refresh_token

    }
}

window.onload = onLoad



// finished books and currently listening books

// hrs reading per day, per month, per year

// top book genres

/*
TODO
- create refreshTokens function to get access and refresh token -> done -> js figured out i dont even need this T-T but im keeping it even though im pretty sure it doesnt work..? too much effort js to delete </3
- create API calls for each type of data need
- go to main page and supply all found data

*/