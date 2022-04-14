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

let searchedArtists =[]
let favourites = []

// search submit event listener
form.addEventListener("submit", function(event) {
    event.preventDefault()
    artistName = input.value
    searchArtist(artistName)
    input.value = "";
})

// initial Discogs Fetch - initial Artist Search
function searchArtist(artistName) {
    const url = `https://api.discogs.com/database/search?q=${artistName}&${apiKey}&${secret}&per_page=200`

    information.innerHTML = ""
    // if artist has been searched before:
    if(searchedArtists.find(x => x.name === artistName)){
        console.log(searchedArtists)
        let obj = searchedArtists.find(x => x.name === artistName)
        pageHeading.innerHTML =  `<h2 class="artist-name">${obj.name}</h2>`

        dataDisplay.innerHTML =
            `<button data-url=${obj.releases_url} onclick="goToReleases(event)">Artist Releases</button>
            <button id="favourite-artist" data-name=${obj.name}>Favourite</button>
            <p>Real Name: <em>${obj.realname}</em></p>
            <h4>Members:</h4>
            <ul>${renderMembers(obj.members, obj.name)}</ul>
            <h4>About</h4>
            <p class="about">${obj.profile}</p>
            <div class="links">
            <h4>Links</h4>
        
            <ul>
                <li><a href="${obj.uri}" target="_blank">Dicogs Page</a></li>
                ${renderAssociatedUrls(obj.urls)}
            </ul>
            </div>
            `
        console.log(obj.name)
        renderCoverImg(obj.coverImage)
        information.append(dataDisplay)
        prevPage = information.innerHTML

    // else new search    
    } else {
        fetch(url)
        .then(response => response.json())
        .then(function(json) {
            const search = json
            console.log(search.results)
            console.log(search.results.find(x => x.type === "artist"))
            artist = search.results.find(x => x.type === "artist")
            const searchedArtistUrl = artist.resource_url
            const coverImg = artist.cover_image // This is where the cover image comes from
            fetchArtistInfo(searchedArtistUrl, coverImg)
            renderCoverImg(coverImg)
        })
    }
}

function fetchArtistInfo(newUrl, coverImg) {
    fetch(newUrl)
    .then(response => response.json())
    .then(function(json){
        let data = json
        renderArtist(data, coverImg)
    })
}

function renderCoverImg(coverImg) {
    const imgToRender = `<img src="${coverImg}">`
    artistPicture.innerHTML = imgToRender
}



function renderArtist(data, coverImg) {
    console.log(data)

    let artist1 = {
        name: data.name,
        realname: data.realname,
        members: data.members,
        profile: data.profile,
        releases_url: data.releases_url,
        uri: data.uri,
        urls: data.urls,
        coverImage: coverImg
    }

    searchedArtists.push(artist1)
    
    console.log(searchedArtists)
    
    pageHeading.innerHTML =  `<h2 class="artist-name">${artist1.name}</h2>`
    console.log(artist1.name)

    dataDisplay.innerHTML =
    `<button data-url=${artist1.releases_url} onclick="goToReleases(event)">Artist Releases</button>
    <button id="favourite-artist" data-name=${artist1.name}>Favourite</button>
    <p>Real Name: <em>${artist1.realname}</em></p>
    <h4>Members:</h4>
    <ul>${renderMembers(artist1.members, artist1.name)}</ul>
    <h4>About</h4>
    <p class="about">${artist1.profile}</p>
    <div class="links">
        <h4>Links</h4>
        
        <ul>
            <li><a href="${artist1.uri}" target="_blank">Dicogs Page</a></li>
            ${renderAssociatedUrls(artist1.urls)}
        </ul>
    </div>`

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
    let currentArtistHtml = document.getElementsByClassName("artist-name")
    let currentArtistName = currentArtistHtml[0].innerText
    let obj = find(x => x.name === currentArtistName)

    // check if releases are stored in searchedArtists array
    if(obj.releases) {
        let albums = obj.releases
        const releaseObj = (albums.map(current => 
            `<p><strong>Title:</strong> ${current.title} </p>
            <p><strong>Year:</strong> ${current.year}</p>
            <button data-url=${current.resource_url} onclick="goToAlbum(event)">View Album</button>
            <button id="favourite-album">Favourite</button>
            <hr>`)) // button not working
    
        const noOfReleases = releases.length.toString()
        dataDisplay.innerHTML = 
        `<button onclick="goToInfo()">Artist Info</button>
        <h3>Releases (${noOfReleases})</h3>
        
        ${releaseObj.join("")} `
    
        information.append(dataDisplay)
    
    // else - fetch the information
    } else {
        const button = event.target
        const url = button.dataset["url"]
        fetch(url)
        .then(releases => releases.json())
        .then(function(releasesJson) {
        console.log(releasesJson)
        console.log(artist)
        renderReleases(releasesJson) // this is where the artist releases come from
        })
    }
    
}


function renderReleases(releasesJson) { 
    // Filters the releases to 'master' releases
    const releases = releasesJson.releases.filter(release => (release.type === "master")) // array of objects describing 'master' releases
    console.log(releases)
    //adds releases to searchedArtists array
    let currentArtistHtml = document.getElementsByClassName("artist-name")
    let currentArtistName = currentArtistHtml[0].innerText
    let obj = searchedArtists.find(x => x.name === currentArtistName)
    obj.releases = releases

    const releaseObj = (releases.map(current => 
        `<p><strong>Title:</strong> ${current.title} </p>
        <p><strong>Year:</strong> ${current.year}</p>
        <button data-url=${current.resource_url} onclick="goToAlbum(event)">View Album</button>
        <button id="favourite-album">Favourite</button>
        <hr>`)) // button not working

    const noOfReleases = releases.length.toString()
    dataDisplay.innerHTML = 
    `<button onclick="goToInfo()">Artist Info</button>
    <h3>Releases (${noOfReleases})</h3>
    
    ${releaseObj.join("")} `

    information.append(dataDisplay)
}

// Artist Info Button Function
function goToInfo(){
    dataDisplay.innerHTML = prevPage
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
    let currentArtistHtml = document.getElementsByClassName("artist-name")
    let currentArtistName = currentArtistHtml[0].innerText
    let obj = searchedArtists.find(x => x.name === currentArtistName)
    console.log(obj)

    const albumObj = `
    <button onclick="goToInfo()">Artist Info</button>
    <button data-url=${obj.releases_url} onclick="goToReleases(event)">Artist Releases</button>
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