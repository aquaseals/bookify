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

        let bookData = await getBooks()
        let allData = []
        allData.push(await getProfile())
        allData.push(bookData)
        allData.push(await topAuthors(bookData.numOfBooks, bookData.books))
        allData.push(await topGenres(bookData.numOfBooks, bookData.books))
        allData.push(await fictionVsNonfiction(bookData.numOfBooks, bookData.books))
        allData.push(await recommend(bookData.books))
        console.log(`alldata callback version -> ${allData}`)
        localStorage.setItem("allData", JSON.stringify(allData))
        window.location.href = window.location.origin + "/bookify/home"

    }
}

window.onload = onLoad

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
        'Authorization': 'Bearer ' + access_token
    },
}
const body = await fetch(url, payload)
const response = await body.json()

let name = response.display_name
let pfp = response.images[0] // NOT CHECKING URL HERE
return {name, pfp}
}

// saved books in library 
async function getBooks() {
const url = "https://api.spotify.com/v1/me/audiobooks?limit=50"
const payload = {
    method: 'GET',
    headers: {
        'Authorization': 'Bearer ' + access_token,
    },
}
const body = await fetch(url, payload)
const response = await body.json()

let numOfBooks = response.total
let books = response.items.map(item => ({
        name: item.name,                                           // Book name
        authors: item.authors.map(author => author.name).join(', '), // Author names
        cover: item.images[0]?.url,                               // Book cover
        chapters: item.total_chapters                             // Number of chapters
    }))
return {numOfBooks, books}
}

// top authors
async function topAuthors(numOfBooks, books) {
    let booksString = JSON.stringify(books, null, 2)
    let authors = await askAI(`Analyze these ${numOfBooks} books and identify the 3 most frequently appearing authors. Count author appearances and return ONLY the top 3 in this exact format: "Author1/Author2/Author3". No explanations, no quotes, no additional text:\n${booksString}`)
    return authors
}

// fiction vs non fiction stats
async function fictionVsNonfiction(numOfBooks, books) {
    let booksString = JSON.stringify(books, null, 2)    
    let percents = await askAI(`Return ONLY a JavaScript string with fiction and non-fiction percentages from these ${numOfBooks} books. Format: 'fiction_percentage nonfiction_percentage' where numbers are integers that sum to 100. No explanation, no additional text, just the array:\n${booksString}`)
    return percents
}

// top 5 genres
async function topGenres(numOfBooks, books) {
    let booksString = JSON.stringify(books, null, 2)
    let genres = await askAI(`based on these ${numOfBooks} books. Format: Genre 1/Genre 2/Genre 3/Genre 4/Genre 5, what would you say are the top 5 genres? Return ONLY a JavaScript string with your opinion. No explanation, no additional text, just the string:\n${booksString}`)
    return genres
}

// 3 book recs
async function recommend(books) {
    let booksString = JSON.stringify(books, null, 2)
    let recs = await askAI(`Based on these books, recommend 3 similar books that readers of these titles would enjoy. Return ONLY book titles in this exact format: "Book Title 1/Book Title 2/Book Title 3". No explanations:\n${booksString}`)
    return recs
}

/*
TODO
- create refreshTokens function to get access and refresh token -> done -> js figured out i dont even need this T-T but im keeping it even though im pretty sure it doesnt work..? too much effort js to delete </3
- create API calls for each type of data need -> done
- go to main page and supply all found data

*/

async function askAI(message) {
    const url = "https://ai.hackclub.com/chat/completions"
    const payload = {
        "method" : "POST",
        headers : {
            "Content-Type": "application/json"
        },
        body : JSON.stringify({
            "messages" : [{"role": "user", "content": message}],
            temperature : 0
        })
    }

    let body = await fetch(url, payload)
    let response = await body.json()
    return response.choices[0].message.content
}