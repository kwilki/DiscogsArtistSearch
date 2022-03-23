// API Requirements
const apiKey = "key=BvZVUiBAAUkaPKFlsowt"
const secret = "secret=FGcSHfPOplxpojCdQmjjZOEgMUDEVRRG"

// form selectors & events
const form = document.querySelector("#search-form")
const formBody = document.querySelector("#search-body")
const input = document.querySelector("#artist-input")

const toRender = document.querySelector("#information")
const dataDisplay = document.createElement("div")

const artistPicture = document.querySelector("#cover-img")

const likesSection = document.querySelector("#likes")
const commentsSection = document.querySelector("#comments")
const commentButton = document.querySelector("#comment-artist")

let artistLikes = []

let artistReleases
let artist
let prevPage

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

// Render on search
function renderArtist(data) {
    console.log(data)

    const associatedUrls = data.urls
    const members = data.members
    const artistName = data.name
    // const url = data.members.resource_url // this is where the members apis are
    // console.log(url) 
    artistReleases = data.releases_url

    dataDisplay.innerHTML =
    `<button data-url=${artistReleases} onclick="goToReleases(event)">Artist Releases</button>
    <h2 class="artist-name">${data.name}</h2>
    <div>
        <button id="like-artist" data-name=${artistName} onclick="likeArtist(event)">Like</button>
        <button id="comment-artist">Comment</button>
    </div>
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
    toRender.append(dataDisplay)
    prevPage = toRender.innerHTML
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

// Artist Info Button Function
function goToInfo(){
    dataDisplay.innerHTML = prevPage
}

// Fetch of artist releases
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

// Filters the releases to 'master' releases
function renderReleases(releasesJson) { 
    const releases = releasesJson.releases.filter(release => (release.type === "master")) // array of objects describing 'master' releases
    
    console.log(releases)
    const releaseObj = (releases.map(current => 
        `<p><strong>Title:</strong> ${current.title} </p>
        <p><strong>Year:</strong> ${current.year}</p>
        <button data-url=${current.resource_url} onclick="goToAlbum(event)">View Album</button>
        <button id="like-album">Like</button>
        <button id="comment-album">Comment</button>
        <hr>`)) // button not working

    const noOfReleases = releases.length.toString()
    dataDisplay.innerHTML = 
    `<button onclick="goToInfo()">Artist Info</button>
    <h2 class="artist-name">${releases[0].artist} Releases (${noOfReleases})</h2>
    ${releaseObj.join("")} `

    toRender.append(dataDisplay)
}

function goToAlbum(event) {
    const button = event.target
    const url = button.dataset["url"]
    fetch(url)
    .then(album => album.json())
    .then(function(albumJson) {
        console.log(albumJson)
        renderAlbum(albumJson)
    })
}

function renderAlbum(albumJson) {
    const albumObj = `
    <button onclick="goToInfo()">Artist Info</button>
    <button data-url=${artistReleases} onclick="goToReleases(event)">Artist Releases</button>
    <div class="album-title-info">
        <h2>${albumJson.title}</h2>
        <h3><em>By ${albumJson.artists[0].name}</em></h3>
        <p>${albumJson.year}</p>
    </div>
    <p><strong>Genre:</strong> ${albumJson.genres[0]}</p>
    <p><strong>Styles:</strong> ${renderStyles(albumJson).join(", ")}</p>
    <div class="tracklist">
        <h3>Tracklist</h3>
        <p>${renderTracklist(albumJson).join("")}</p>
    </div>
    <div class="album-videos">
        <h3>Videos</h3>
        <ul>${renderVideos(albumJson)}</ul>
    </div>
    `
    dataDisplay.innerHTML = albumObj
    toRender.append(dataDisplay)
}

function renderStyles(albumJson) {
    return albumJson.styles.map(style => `${style}`)
}

function renderTracklist(albumJson) {
    console.log(albumJson.tracklist.map(current => `${current.title}`))
    return albumJson.tracklist.map(current => 
        `<p>${current.position} - <em>${current.title}</em>
        <button id="like-song">Like</button>
        <button id="comment-song">Comment</button></p>
        <hr>`
    )
}

function renderVideos(albumJson) {
    if (albumJson.videos) {
        return albumJson.videos.map(current => 
            `<li><a href="${current.uri}" target="_blank">${current.title}</a></li>`).join("")
    } else return `No videos to display`
}

class ArtistLike {
    constructor(name, likes){
        this.name = name;
        this.likes = likes;
    }
}

function likeArtist(event) { // like function broken - only stores first name of artist in value of name
    const button = event.target
    const currentArtistName = button.dataset["name"]
    console.log(currentArtistName)
    checkIfLikes()
    
    if (artistLikes.find(x => x.name === `${currentArtistName}`)) { // broken - name isn't removed on like second click
        const currentObj = artistLikes.findIndex(x => x.name === `${currentArtistName}`) //returns 1 if true or -1
        // artistLikes[currentObj].likes = 0
        const updatedArray = artistLikes.splice(artistLikes[currentObj], 1)
        artistLikes.length = 0
        console.log(`updated Array:`, updatedArray)
        artistLikes = updatedArray
        likesSection.remove()
        const newLike = document.createElement("div")
        newLike.innerHTML = artistLikes.map(current => 
            `<p class="artist-like ${current.name}"><strong>${current.name}</strong></p>`
        )
        likesSection.append(newLike)
    } else {
        const artist = new ArtistLike(currentArtistName, 1)
        artistLikes.push(artist)
    }
    renderArtistLikes(currentArtistName)
}

function checkIfLikes() {
    if (artistLikes.length > 0) {
        console.log("like's section already rendered")
    } else {
        likesSection.innerHTML = `<h3>Likes</h3>`
    }
}

function renderArtistLikes(currentArtistName) {
    const newLike = document.createElement("div")
    newLike.innerHTML = artistLikes.map(current => 
        `<p class="artist-like ${currentArtistName}"><strong>${current.name}</strong></p>`
    )
    likesSection.append(newLike)
}

function removeArtistLike() {

}