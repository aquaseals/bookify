let allData = localStorage.getItem("allData")
allData = JSON.parse(allData)

console.log(`alldata home version -> ${allData}`)


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
src = profileInfo.url
} catch (err) {
    console.log(err)
}
document.getElementById('pfp').src = src

document.getElementById(`total-books`).innerHTML = bookInfo.numOfBooks
let totChapters = 0
for (let i=0; i<bookInfo.numOfBooks; i++) {
    totChapters += bookInfo.books[i].chapters
}
document.getElementById(`total-chapters`).innerHTML = totChapters
document.getElementById(`avg-chapters`).innerHTML = Math.round(Number(totChapters/bookInfo.numOfBooks))

let authors = authorInfo.split(",")
let authorSection = document.getElementsByClassName('author-list')[0]
for (i=1; i<4; i++) {
    let author = document.createElement('h3')
    author.class = "author-tag"
    let name = authors[i-1]
    if (i === 1) {
        name = name.slice(1)
    } 
    if (i === 2) {
        name = name.slice(0, -1)
    }
    if (i === 3) {
        name = name.slice(0, -1)
    }
    author.innerHTML = `${i}. ${name}`
    authorSection.appendChild(author)
}

let percents = fictionInfo.split(" ")
let f = percents[0].slice(1)
let nf = percents[1].slice(0, -1)
document.getElementById(`fiction-percent`).innerHTML = `${f}%`
document.getElementById(`nonfiction-percent`).innerHTML = `${nf}%`

let genres = genreInfo.split(",")
genres = genres.slice(0, 4)
genres[0] = genres[0].slice(1)
let genreSection = document.getElementsByClassName('genre-list')[0]
for (i=1; i<5; i++) {
    let genre = document.createElement('h3')
    genre.class = 'genre-tag'
    let g = genres[i-1]
    genre.innerHTML = `${i}. ${g}`
    genreSection.appendChild(genre)
}

let recs = recommended.split(",")
recs[0] = recs[0].slice(1)
recs[2] = recs[2].slice(0, -1)
let recSection = document.getElementById('recommendation-cards')
for (i=1; i<4; i++) {
    let rec = document.createElement('h3')
    let name = recs[i-1]
    rec.innerHTML = `${i}. ${name}`
    recSection.appendChild(rec)
}