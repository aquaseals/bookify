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
        try {
            
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

        if (!tokens.ok) {
                throw new Error(`Token exchange failed with status ${tokens.status}`);
        }

        access_token = data.access_token
        refresh_token = data.refresh_token

        localStorage.setItem("access_token", access_token)
        localStorage.setItem("refresh_token", refresh_token)

        } catch {
            console.log('already logged in')
            let storedAccess = localStorage.getItem('access_token') ?? ''
            let storedRefresh = localStorage.getItem('refresh_token') ?? ''
            access_token = storedAccess
            refresh_token = storedRefresh
        }

        let bookData = await getBooks()
        let allData = []
        allData.push(await getProfile())
        allData.push(bookData)
        allData.push(await topAuthors(bookData.numOfBooks, bookData.books))
        allData.push(await topGenres(bookData.numOfBooks, bookData.books))
        allData.push(await fictionVsNonfiction(bookData.numOfBooks, bookData.books))
        allData.push(await recommend(bookData.books))
        console.log(`alldata callback version -> ${allData}`)

        document.getElementById('loader').style.visibility = "hidden"
        document.getElementById('page').style.visibility = "visible"
        document.getElementById('head').style.visibility = "visible"
        document.title = "bookify"

        let profileInfo = allData[0]
        let bookInfo = allData[1]
        let authorInfo = allData[2]
        let genreInfo = allData[3]
        let fictionInfo = allData[4]
        let recommended = allData[5]

        let src = ''

        console.log(profileInfo, bookInfo, authorInfo, genreInfo, fictionInfo, recommended)

        document.getElementById('username').innerHTML = profileInfo.name
        try {
        src = profileInfo.pfp.url
        document.getElementById('pfp').src = src
        } catch (err) {
            console.log(err)
        }

        document.getElementById(`total-books`).innerHTML = bookInfo.numOfBooks
        let totChapters = 0
        for (let i=0; i<bookInfo.numOfBooks; i++) {
            totChapters += bookInfo.books[i].chapters
        }
        document.getElementById(`total-chapters`).innerHTML = totChapters
        document.getElementById(`avg-chapters`).innerHTML = Math.round(Number(totChapters/bookInfo.numOfBooks))

        let authors = authorInfo.split("/")
        let authorSection = document.getElementsByClassName('author-list')[0]
        for (i=1; i<4; i++) {
            let author = document.createElement('h3')
            author.class = "author-tag"
            let name = authors[i-1]
            author.innerHTML = `${i}. ${name}`
            authorSection.appendChild(author)
        }

        let percents = fictionInfo.split(" ")
        document.getElementById(`fiction-percent`).innerHTML = `${percents[0]}%`
        document.getElementById(`nonfiction-percent`).innerHTML = `${percents[1]}%`

        let genres = genreInfo.split("/")
        genres[0].slice(1)
        let genreSection = document.getElementsByClassName('genre-list')[0]
        for (i=1; i<5; i++) {
            let genre = document.createElement('h3')
            genre.class = 'genre-tag'
            let g = genres[i-1]
            genre.innerHTML = `${i}. ${g}`
            genreSection.appendChild(genre)
        }

        let recs = recommended.split("/")
        let recSection = document.getElementById('recommendation-cards')
        for (i=1; i<4; i++) {
            let rec = document.createElement('h3')
            let name = recs[i-1]
            rec.innerHTML = `${i}. ${name}`
            recSection.appendChild(rec)
        }

        // localStorage.setItem("allData", JSON.stringify(allData))
        // window.location.href = window.location.origin + "/bookify/home"

    }
}

window.onload = onLoad

async function refreshTokens() {
const url = "https://accounts.spotify.com/api/token"
const payload = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(clientID + ':' + clientSECRET)
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
    let authors = await askAI(`You must count author appearances in these ${numOfBooks} books and return ONLY the top 3 most frequent authors.

CRITICAL: Your response must be EXACTLY in this format: Author1/Author2/Author3

Do not explain your process.
Do not show counting.
Do not add any other text.
Do not use quotes.
Just return the three author names separated by forward slashes.

Books:
${booksString}`)
    return authors
}

// fiction vs non fiction stats
async function fictionVsNonfiction(numOfBooks, books) {
    let booksString = JSON.stringify(books, null, 2)    
    let percents = await askAI(`Count fiction vs non-fiction books from these ${numOfBooks} books. Return ONLY two numbers separated by one space that sum to 100.

CRITICAL: Your response must be EXACTLY: fiction_number nonfiction_number

Example: 65 35

Do not explain.
Do not show work.
Just return the two numbers.

Books:
${booksString}`)
    return percents
}

// top 5 genres
async function topGenres(numOfBooks, books) {
    let booksString = JSON.stringify(books, null, 2)
    let genres = await askAI(`Identify the 5 most common genres from these ${numOfBooks} books.

CRITICAL: Your response must be EXACTLY in this format: Genre1/Genre2/Genre3/Genre4/Genre5

Do not explain your reasoning.
Do not show your work.
Do not add any other text.
Just return the five genres separated by forward slashes.

Books:
${booksString}`)
    return genres
}

// 3 book recs
async function recommend(books) {
    let booksString = JSON.stringify(books, null, 2)
    let recs = await askAI(`Recommend 3 books similar to these titles.

CRITICAL: Your response must be EXACTLY in this format: Book Title 1/Book Title 2/Book Title 3

Do not explain your choices.
Do not add any other text.
Just return the three book titles separated by forward slashes.

Books:
${booksString}`)
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
        body: JSON.stringify({
            messages: [{"role": "user", "content": message}],
            temperature: 0
        })
    }

    let body = await fetch(url, payload)
    let response = await body.json()
    return response.choices[0].message.content
}