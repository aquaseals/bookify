let allData = localStorage.getItem("allData")
allData = JSON.parse(allData)

console.log(`alldata home version -> ${allData}`)


let profileInfo = allData[0]
let bookInfo = allData[1]
let authorInfo = allData[2]
let genreInfo = allData[3]
let fictionInfo = allData[4]
let recommended = allData[5]

console.log(profileInfo, bookInfo, authorInfo, genreInfo, fictionInfo, recommended)

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
    let author = document.createElement('h4')
    author.innerHTML = `${i}. ${authors[i-1]}`
    authorSection.appendChild(author)
}

