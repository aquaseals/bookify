let allData = localStorage.getItem("allData")

let profileInfo = allData[0]
let bookInfo = allData[1]
let authorInfo = allData[2]
let genreInfo = allData[3]
let fictionInfo = allData[4]
let recommended = allData[5]

console.log(profileInfo, bookInfo, authorInfo, genreInfo, fictionInfo, recommended)