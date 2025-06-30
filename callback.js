// find access and refresh tokens
// pass onto main page to do api calls for data
const onLoad = async () => {
    const clientID = '2757b9bf2e4649e7903aaefbc856adca'
    const redirectURI = window.location.origin + '/bookify/callback'
    const clientSECRET = '1db54a4fd96a40fb818461ef3a3149e7'
    const storedState = localStorage.getItem('state') ?? ''
    let urlParams = new URLSearchParams(window.location.search)
    let state = urlParams.get('state')
    let code = urlParams.get('code')
    let error = urlParams.get('error')

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
        let authOptions = {
        //url: 'https://accounts.spotify.com/api/token', 
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

        //access_token = getTokens(authOptions.body.toString())[0]
        //refresh_token = getTokens(authOptions.body.toString())[1]

    }
}

window.onload = onLoad

// function getTokens(authOptions) {

// }

/*
TODO
- create getTokens function to get access and refresh token
- create API calls for each type of data need
- 

*/