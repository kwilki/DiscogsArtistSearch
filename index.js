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
    class artist {
        constructor(name, realname, members, about, releases, links){
            this.name = name;
            this.realname = realname;
            this.members = members;
            this.about = about;
            this.releases = releases;
            this.links = links;
    
        }
    }

    let artistOne = new artist(data.name, data.realname, data.members, data.profile, data.releases_url, data.urls)

    pageHeading.innerHTML =  `<h2 class="artist-name">${artistOne.name}</h2>`

    dataDisplay.innerHTML =
    `<button data-url=${artistOne.releases} data-artist=${artistOne} onclick="goToReleases(event)">Artist Releases</button>
    <button id="favourite-artist" data-name=${artistOne.name}>Favourite</button>
    <p>Real Name: <em>${artistOne.realname}</em></p>
    <h4>Members:</h4>
    <ul>${renderMembers(artistOne.members, artistOne.name)}</ul>
    <h4>About</h4>
    <p class="about">${data.profile}</p>
    <div class="links">
        <h4>Links</h4>
        
        <ul>
            <li><a href="${data.uri}" target="_blank">Dicogs Page</a></li>
            ${renderAssociatedUrls(artistOne.links)}
        </ul>
    </div>
    `
    console.log(artistOne.name)
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

// Fetch of artist releases
function goToReleases(event) {
    const button = event.target
    const url = button.dataset["url"]
    const artist = button.dataset["artist"]
    fetch(url)
    .then(releases => releases.json())
    .then(function(releasesJson) {
        console.log(releasesJson)
        console.log(artist)
        renderReleases(releasesJson, name) // this is where the artist releases come from
    })
}

// Filters the releases to 'master' releases
function renderReleases(releasesJson, name) { 
    const releases = releasesJson.releases.filter(release => (release.type === "master")) // array of objects describing 'master' releases
    
    console.log(releases)
    console.log(name)
    const releaseObj = (releases.map(current => 
        `<p><strong>Title:</strong> ${current.title} </p>
        <p><strong>Year:</strong> ${current.year}</p>
        <button data-url=${current.resource_url} onclick="goToAlbum(event)">View Album</button>
        <button id="favourite-album">Favourite</button>
        <hr>`)) // button not working

    const noOfReleases = releases.length.toString()
    pageHeading.innerHTML = `<h2 class="artist-name">${releases[0].artist} - Releases (${noOfReleases})</h2>`
    dataDisplay.innerHTML = 
    `<button onclick="goToInfo()">Artist Info</button>
    
    ${releaseObj.join("")} `

    information.append(dataDisplay)
}

// Artist Info Button Function
function goToInfo(){
    dataDisplay.innerHTML = prevPage
}