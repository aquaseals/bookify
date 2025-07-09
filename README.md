# bookify
a website that lets you see your audiobook stats on spotify and gives you personalized book recommendations, but aesthetic! uses spotify's web api and hackclub's ai service to formulate answers.

<div align="center">
  <a href="https://shipwrecked.hackclub.com/?t=ghrm" target="_blank">
    <img src="https://hc-cdn.hel1.your-objectstorage.com/s/v3/739361f1d440b17fc9e2f74e49fc185d86cbec14_badge.png" 
         alt="This project is part of Shipwrecked, the world's first hackathon on an island!" 
         style="width: 35%;">
  </a>
</div>

## Demo
[try it!](aquaseals.github.io/bookify/) - Note: doesn't work unless you are an approved user (Spotify Web API limitations)

## Features/Stats
1. total audiobooks and chapters in your library
2. top 3 authors
3. top 5 genres
4. fiction vs non-fiction percentages
5. personalized book recommendations

## How to host/run this website?
1. fork this repo
2. go to settings, pages and host the website with github pages
3. open up [spotify for developers dashboard](https://developer.spotify.com/dashboard)
4. create a new app, select Web API
5. replace redirect uris with the github pages link to the website + "/callback"
6. go through callback.js, script.js, and home.js and replace any github page links, clientID, clientSECRET and redirectURI with your own
7. open website through github pages, and you're done!

## Found a bug?
great!! dm me on the hack club slack @haya and llet me know how you got there
