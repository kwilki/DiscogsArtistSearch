// API Requirements
const apiKey = "key=BvZVUiBAAUkaPKFlsowt"
const secret = "secret=FGcSHfPOplxpojCdQmjjZOEgMUDEVRRG"

// form selectors & events
const form = document.querySelector("#search-form")
const formBody = document.querySelector("#search-body")
const input = document.querySelector("#artist-input")
const artistPicture = document.querySelector("#cover-img")
const likesSection = document.querySelector("#likes")
const commentsSection = document.querySelector("#comments")
const likeButton = document.querySelector("#like-artist")
const commentButton = document.querySelector("#comment-artist")
const toRender = document.querySelector("#information")
const dataDisplay = document.createElement("div")
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

// Initial Search Render
function renderArtist(data) {
    console.log(data)

    const associatedUrls = data.urls
    const members = data.members
    const artistName = data.name
    // const url = data.members.resource_url // this is where the members apis are
    // console.log(url) 
    artistReleases = data.releases_url

    dataDisplay.innerHTML = // this is where cover img needs to go
    `<button data-url=${artistReleases} onclick="goToReleases(event)">Artist Releases</button>
    <h2 class="artist-name">${data.name}</h2>
    <div>
        <button id="like-artist">Like</button>
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

function renderReleases(releasesJson) { // filters the releases to 'master' releases
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