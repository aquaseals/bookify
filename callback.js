const onLoad = async () => {
    const storedState = localStorage.getItem('state') ?? ''
    let urlParams = new URLSearchParams(window.location.search)
    state = urlParams.get('state')
    code = urlParams.get('code')
    error = urlParams.get('error')
    
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
        authOptions = {
        //url: 'https://accounts.spotify.com/api/token', 
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