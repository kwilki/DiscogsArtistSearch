const apiKey = "key=BvZVUiBAAUkaPKFlsowt"
const secret = "secret=FGcSHfPOplxpojCdQmjjZOEgMUDEVRRG"

const form = document.querySelector("#search-form")
const input = document.querySelector("#artist-input")


form.addEventListener("submit", function(event) {
    event.preventDefault()
    const artist = input.value
    searchArtist(artist)
    input.value = "";
})

function searchArtist(artist) {
    const url = `https://api.discogs.com/database/search?q=${artist}&${apiKey}&${secret}&per_page=200`
    const information = document.querySelector("#information")
    information.innerHTML = ""
    fetch(url)
    .then(response => response.json())
    .then(function(json) {
        console.log(json)
        const search = json
        console.log(search.results)
        console.log(search.results.find(x => x.type === "artist"))
        artist = search.results.find(x => x.type === "artist")
        const newUrl = artist.resource_url
        console.log(newUrl)
        fetchArtistInfo(newUrl)
    })
}

function renderArtist(data) {
    console.log(data)
    const toRender = document.querySelector("#information")
    const dataDisplay = document.createElement("div")
    dataDisplay.innerHTML = 
    `<h2>${data.name}</h2>
    <p>Real Name: <em>${data.realname}</em></p>
    <h4>About</h4>
    <p>${data.profile}</p>
    <button onclick="goToReleases(${data.releases_url})">Releases</button>`
    toRender.append(dataDisplay)
    console.log(data.releases_url)
}

function fetchArtistInfo(newUrl) {
    fetch(newUrl)
    .then(response => response.json())
    .then(renderArtist)
}

function goToReleases(releases) {
    alert("Clicked!")
    fetch(releases)
    .then(releases => releases.json())
    .then(function(json){
        console.log(json)
    })
}

function renderReleases() {
    const toRender = document.querySelector("#information")
    const dataDisplay = document.createElement("div")
}


