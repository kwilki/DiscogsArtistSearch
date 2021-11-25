// API Requirements
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

// initial Discogs Fetch
function searchArtist(artist) {
    const url = `https://api.discogs.com/database/search?q=${artist}&${apiKey}&${secret}&per_page=200`
    const information = document.querySelector("#information")
    information.innerHTML = ""
    fetch(url)
    .then(response => response.json())
    .then(function(json) {
        const search = json
        console.log(search.results)
        console.log(search.results.find(x => x.type === "artist"))
        artist = search.results.find(x => x.type === "artist")
        const newUrl = artist.resource_url
        const coverImg = artist.cover_image // This is where the cover image comes from
        fetchArtistInfo(newUrl)
    })
}

function fetchArtistInfo(newUrl) {
    fetch(newUrl)
    .then(response => response.json())
    .then(renderArtist)
}

function renderArtist(data) {
    console.log(data)

    const toRender = document.querySelector("#information")
    const dataDisplay = document.createElement("div")
    const associatedUrls = data.urls

    dataDisplay.innerHTML = // this is where cover img needs to go
    `<h2>${data.name}</h2>
    <img src="">
    <p>Real Name: <em>${data.realname}</em></p>
    <h4>About</h4>
    <p>${data.profile}</p>
    <h4>Links</h4>
    <ul>${renderAssociatedUrls(associatedUrls).join("")}</ul>
    <button data-url=${data.releases_url} onclick="goToReleases(event)">Releases</button>`

    toRender.append(dataDisplay)
}

function renderAssociatedUrls(associatedUrls) {
    return associatedUrls.map(url => `<li><a href="${url}">${url}</a></li>`)
}

function goToReleases(event) {
    const button = event.target
    const url = button.dataset["url"]
    fetch(url)
    .then(releases => releases.json())
    .then(function(releasesJson) {
        console.log(releasesJson)
        renderReleases(releasesJson) // this is where the artist releases come from
    })
}

function renderReleases(releasesJson) {
    const toRender = document.querySelector("#information")
    const dataDisplay = document.createElement("div")
    const releases = releasesJson.releases.filter(release => (release.type === "master"))
    
    console.log(releases)
}


