// API Requirements
const apiKey = "key=BvZVUiBAAUkaPKFlsowt"
const secret = "secret=FGcSHfPOplxpojCdQmjjZOEgMUDEVRRG"

// form selectors & events
const form = document.querySelector("#search-form")
const formBody = document.querySelector("#search-body")
const input = document.querySelector("#artist-input")

const pageHeading = document.querySelector("#page-heading")
const information = document.querySelector("#information")
const dataDisplay = document.createElement("div")
const artistPicture = document.querySelector("#cover-img")

form.addEventListener("submit", function(event) {
    event.preventDefault()
    artist = input.value
    searchArtist(artist)
    input.value = "";
})

// initial Discogs Fetch - initial Artist Search
function searchArtist(artist) {
    const url = `https://api.discogs.com/database/search?q=${artist}&${apiKey}&${secret}&per_page=200`

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
        renderCoverImg(coverImg)
    })
}

function fetchArtistInfo(newUrl) {
    fetch(newUrl)
    .then(response => response.json())
    .then(renderArtist)
}

function renderCoverImg(coverImg) {
    const imgToRender = `<img src="${coverImg}">`
    artistPicture.innerHTML = imgToRender
}

function renderArtist(data) {
    console.log(data)

    const associatedUrls = data.urls
    const members = data.members
    const artistName = data.name
    // const url = data.members.resource_url // this is where the members apis are
    // console.log(url) 
    artistReleases = data.releases_url

    pageHeading.innerHTML =  `<h2 class="artist-name">${data.name}</h2>`

    dataDisplay.innerHTML =
    `<button data-url=${artistReleases} onclick="goToReleases(event)">Artist Releases</button>
    <button id="favourite-artist" data-name=${artistName}>Favourite</button>
    <p>Real Name: <em>${data.realname}</em></p>
    <h4>Members:</h4>
    <ul>${renderMembers(members, artistName)}</ul>
    <h4>About</h4>
    <p class="about">${data.profile}</p>
    <div class="links">
        <h4>Links</h4>
        
        <ul>
            <li><a href="${data.uri}" target="_blank">Dicogs Page</a></li>
            ${renderAssociatedUrls(associatedUrls)}
        </ul>
    </div>
    `
    console.log(artistName)
    information.append(dataDisplay)
    prevPage = information.innerHTML
}

function renderAssociatedUrls(associatedUrls) {
    if (associatedUrls) {
        return associatedUrls.map(url => `<li><a href="${url}" target="_blank">${url}</a></li>`).join("")
    } else return 'None to display'
    
}

function renderMembers(members, artistName) {
    if (members){
        return members.map(current => `<li><strong>${current.name}</strong></li>
        Active: ${current.active}`).join("")
    } else return `${artistName}`
    
}