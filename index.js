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
// const backButton = document.querySelector("#back-button")
const toRender = document.querySelector("#information")
const dataDisplay = document.createElement("div")
let removeContents
let prevPage



form.addEventListener("submit", function(event) {
    event.preventDefault()
    const artist = input.value
    searchArtist(artist)
    input.value = "";
})

// backButton.addEventListener("click", goBack(prevPage))


// initial Discogs Fetch
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
        renderBackButton(toRender)
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

function renderBackButton(toRender) {
    const backButton = document.querySelector("#back-button")
    backButton?.remove()
    const button = document.createElement("button")
    button.innerText = "Back"
    button.setAttribute("id", "back-button")
    button.setAttribute("onclick", "goBack(prevPage)")
    formBody.append(button)
    prevPage = toRender.innerHTML
}

function renderArtist(data) {
    console.log(data)

    const associatedUrls = data.urls
    const members = data.members
    const artistName = data.name

    dataDisplay.innerHTML = // this is where cover img needs to go
    `<h2 class="artist-name">${data.name}</h2>
        <button onclick="">Info</button>
        <button data-url=${data.releases_url} onclick="goToReleases(event)">Releases</button>
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
        <ul>${renderAssociatedUrls(associatedUrls)}</ul>
    </div>
    `

    toRender.append(dataDisplay)
}

function renderAssociatedUrls(associatedUrls) {
    if (associatedUrls) {
        return associatedUrls.map(url => `<li><a href="${url}">${url}</a></li>`).join("")
    } else return 'None to display'
    
}

function renderMembers(members, artistName) {
    if (members){
        return members.map(current => `<li><strong>${current.name}</strong></li>
        Active: ${current.active}`).join("")
    } else return `${artistName}`
    
}

function goToReleases(event) {
    const button = event.target
    const url = button.dataset["url"]
    fetch(url)
    .then(releases => releases.json())
    .then(function(releasesJson) {
        console.log(releasesJson)
        renderBackButton(toRender)
        renderReleases(releasesJson) // this is where the artist releases come from
    })
}

function renderReleases(releasesJson) { // filters the releases to 'master' releases
    removeContents = toRender.removeChild(toRender.firstChild)

    // backButton.addEventListener("click", goBack(prevPage))

    // removeAllChildNodes(toRender)

    toRender.append(dataDisplay) // trying to make artist info disappear
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
    `<h2 class="artist-name">${releases[0].artist} Releases (${noOfReleases})</h2>
    <button>Info</button>
    <button>Releases</button>
    ${releaseObj.join("")} `
        console.log(releases.length.toString())
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
    <div class="album-title-info">
        <h2>${albumJson.title}</h2>
        <h3><em>By ${albumJson.artists[0].name}</em></h3>
        <p>${albumJson.year}</p>
    </div>
    <p><strong>Genre:</strong> ${albumJson.genres[0]}</p>
    <p><strong>Styles:</strong> ${renderStyles(albumJson).join(", ")}</p>
    <div class="tracklist">
        <h3>Tracklist</h3>
        <ul>${renderTracklist(albumJson).join("")}</ul>
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
        `<li>${current.position} - <em>${current.title}</em>
        <button id="like-song">Like</button>
        <button id="comment-song">Comment</button></li>
        <hr>`
    )
}

function renderVideos(albumJson) {
    if (albumJson.videos) {
        return albumJson.videos.map(current => 
            `<li><a href="${current.uri}">${current.title}</a></li>`).join("")
    } else return `No videos to display`
    
    
}

function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

function goBack(prevPage) { // broken - returns [ovject HTMLDivElement]
    // alert("clicked")
    dataDisplay.innerHTML = prevPage
    toRender.append(dataDisplay)
}