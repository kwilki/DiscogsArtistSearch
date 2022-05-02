// API Requirements
const apiKey = "key=BvZVUiBAAUkaPKFlsowt"
const secret = "secret=FGcSHfPOplxpojCdQmjjZOEgMUDEVRRG"

// form selectors & events
const websiteHeading = document.querySelector("#website-heading")
const main = document.querySelector("#main")
const form = document.querySelector("#search-form")
const formBody = document.querySelector("#search-body")
const input = document.querySelector("#artist-input")

const pageHeading = document.querySelector("#page-heading")
const information = document.querySelector("#information")
const dataDisplay = document.createElement("div")
const artistPicture = document.querySelector("#cover-img")


const favAlbum = document.querySelector("#favourite-album")

let searchedArtists =[]
let favourites = {
    artists: [],
    albums: []
}

let homeIntro

// search submit event listener
form.addEventListener("submit", function(event) {
    event.preventDefault()
    let artistName = input.value
    search(artistName)
    input.value = "";
})

// initial Discogs Fetch - initial Artist Search
function search(artistName) {
    const url = `https://api.discogs.com/database/search?q=${artistName}&${apiKey}&${secret}&per_page=200`
        
    if(homeIntro === undefined) {
        fetch(url)
        .then(response => response.json())
        .then(function(json) {
            const search = json
            console.log(search.results)
            console.log(search.results.filter(x => x.type === "artist"))
            artistSearchResults = search.results.filter(x => x.type === "artist")
            let welcome = document.querySelector(".welcome-content")
            console.log(welcome)
            welcome.remove()
            homeIntro = welcome
            displaySearchResults(artistSearchResults)
        })
    } else {
        fetch(url)
        .then(response => response.json())
        .then(function(json) {
            const search = json
            console.log(search.results)
            console.log(search.results.filter(x => x.type === "artist"))
            artistSearchResults = search.results.filter(x => x.type === "artist")
            displaySearchResults(artistSearchResults)
        })
    }
}

function removePrvDisplayed() {
    pageHeading.innerHTML = ""
    artistPicture.innerHTML = ""
    information.innerHTML = ""
}

// checks if image link is provided and if not uses default
function checkImgLink(current) {
    return coverImg = current.cover_image.endsWith('spacer.gif') ? './Images/noPic.png' : current.cover_image
}

function searchToDisplay(artistName, artistResource, coverImg, current) {
    return `<div 
                id="${artistName}"
                class="search-result" 
                data-artistResource="${artistResource}" 
                data-artistName="${artistName}" 
                data-coverImg="${coverImg}">
                <img src="${coverImg}">
                <a>${artistName}</a>
                <hr>
            </div>`
}

function searchListListener(array, artistSearchResults) {
    let searchContainer = document.createElement("div")
        searchContainer.className = "search-container"
        let searchResults = []
        
        searchResults = artistSearchResults.map(current => {
            checkImgLink(current)
            let artistName = current.title
            let artistResource = current.resource_url
            array.push(artistName)
            return searchToDisplay(artistName, artistResource, coverImg, current)
        })
        searchContainer.innerHTML = searchResults.join(" ")
        information.append(searchContainer)
        array.forEach(element => {
            let searchList = document.getElementById(`${element}`)
            let data = searchList.getAttribute("data-artistResource")
            let artistName = searchList.getAttribute("data-artistName")
            let coverImg = searchList.getAttribute("data-coverImg")

            searchList.addEventListener("click", function() {
                searchArtist(data, artistName, coverImg)
            })
        })
}

function displaySearchResults(artistSearchResults) {
        let array = []
        removePrvDisplayed()
        searchListListener(array, artistSearchResults)
}

function searchArtist(data, artistName ,coverImg) {
    console.log("clicked!")
    information.innerHTML = ""
    // if artist has been searched before:
    if(favourites.artists.find(x => x.name === artistName)){
        let obj = favourites.artists.find(x => x.name === artistName)
        console.log("FAV SECTION")
        console.log(obj)
        pageHeading.innerHTML =  `<h2 class="artist-name">${obj.name}</h2>`
        checkInfoPgDisplay(obj)
    } else if(searchedArtists.find(x => x.name === artistName)){
        let obj = searchedArtists.find(x => x.name === artistName)
        console.log(searchedArtists)
        pageHeading.innerHTML =  `<h2 class="artist-name">${obj.name}</h2>`
        checkInfoPgDisplay(obj)
    } else {
        fetch(data)
        .then(response => response.json())
        .then(function(json) {
            const search = json
            const searchedArtistUrl = search.resource_url
            fetchArtistInfo(searchedArtistUrl, coverImg)
            renderCoverImg(coverImg)
        })
    }
}

function checkInfoPgDisplay(obj) {
    if(obj.members === undefined) {
        dataDisplay.innerHTML =
        `<button data-url="${obj.releases_url}" data-name="${obj.name}" onclick="goToReleases(event)">Artist Releases</button>
        <button id="favourite-artist" data-name="${obj.name}" onclick="favouriteArtist()">Favourite</button>
        <p>Real Name: <em>${obj.realname}</em></p>
        <h4>About</h4>
        <p class="about">${obj.profile}</p>
        <div class="links">
        <h4>Links</h4>
    
        <ul>
            <li><a href="${obj.uri}" target="_blank">Dicogs Page</a></li>
            ${renderAssociatedUrls(obj.urls)}
        </ul>
        </div>`
        console.log("1st")
        console.log(obj)
        renderCoverImg(obj.cover_image)
        information.append(dataDisplay)
        colourFavArtist()
        prevPage = information.innerHTML
    } else {
        dataDisplay.innerHTML =
        `<button data-url="${obj.releases_url}" data-name="${obj.name}" onclick="goToReleases(event)">Artist Releases</button>
        <button id="favourite-artist" data-name="${obj.name}" onclick="favouriteArtist()">Favourite</button>
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
        </div>`
        console.log("2nd")
        console.log(obj.name)
        renderCoverImg(obj.cover_image)
        information.append(dataDisplay)
        colourFavArtist()
        prevPage = information.innerHTML
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

function renderCoverImg(cover_image) {
    const imgToRender = `<img id="cover-photo" src="${cover_image}">`
    artistPicture.innerHTML = imgToRender
}


// renders the artist initial search
function renderArtist(data, coverImg) {

    let artist1 = {
        name: data.name,
        title: data.title,
        realname: data.realname,
        members: data.members,
        profile: data.profile,
        releases_url: data.releases_url,
        uri: data.uri,
        urls: data.urls,
        cover_image: coverImg
    }

    searchedArtists.push(artist1)
    
    pageHeading.innerHTML =  `<h2 class="artist-name">${artist1.name}</h2>`

    // if no memebers
    if(!artist1.members) {
        dataDisplay.innerHTML =
            `<button data-url="${artist1.releases_url}" data-name="${artist1.name}" onclick="goToReleases(event)">Artist Releases</button>
            <button id="favourite-artist" data-name="${artist1.name}" onclick="favouriteArtist()">Favourite</button>
            <p>Real Name: <em>${artist1.realname}</em></p>
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
    colourFavArtist()
    prevPage = information.innerHTML
    
    console.log("no members")
    // if there is members
    } else {
        dataDisplay.innerHTML =
            `<button data-url="${artist1.releases_url}" data-name="${artist1.name}" onclick="goToReleases(event)">Artist Releases</button>
            <button id="favourite-artist" data-name="${artist1.name}" onclick="favouriteArtist()">Favourite</button>
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
    colourFavArtist()
    prevPage = information.innerHTML
    console.log("members")
    }
    
}

function renderAssociatedUrls(associatedUrls) {
    if (associatedUrls) {
        return associatedUrls.map(url => `<li><a href="${url}" target="_blank">${url}</a></li>`).join("")
    } else return 'None to display'
    
}

function renderMembers(members, artistName) {
        return members.map(current => `<li><strong>${current.name}</strong></li>
        Active: ${current.active}`).join("")
} 

function listReleases(obj) {
    let albums = obj.releases
    const releaseObj = (albums.map(current => 
        `<p><strong>Title:</strong> ${current.title} </p>
        <p><strong>Year:</strong> ${current.year}</p>
        <button data-url="${current.resource_url}" onclick="goToAlbum(event)">View Album</button>
        <button id="${current.title} data-url="${current.resource_url}" onclick="favouriteAlbum(event)">Favourite</button>
        <hr>`)) // button not working

    const noOfReleases = albums.length.toString()
    dataDisplay.innerHTML = 
    `<button onclick="goToInfo()">Artist Info</button>
    <h3>Releases (${noOfReleases})</h3>
    
    ${releaseObj.join("")} `

    information.append(dataDisplay)
}

// Fetch of artist releases
function goToReleases(event) {
    console.log(event)
    let button = event.target
    let artistName = button.getAttribute("data-name")
    let obj = searchedArtists.find(x => x.name === artistName)
    let favObj = favourites.artists.find(x => x.name === artistName)
    console.log(obj)
    console.log(favObj)
    // check if releases are stored in favourites or searchedArtists array
    // if(typeof favObj.releases !== undefined) {
    //     listReleases(favObj)
    //     console.log("FavObj")
    // } else 
    if(obj.releases) {
        listReleases(obj)
    // else - fetch the information
    console.log("obj")
    } else {
        const button = event.target
        const url = button.dataset["url"]
        fetch(url)
        .then(releases => releases.json())
        .then(function(releasesJson) {
        console.log(releasesJson)
        console.log("else")
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
        `<div id="${current.title}">
        <p><strong>Title:</strong> ${current.title} </p>
        <p><strong>Year:</strong> ${current.year}</p>
        <button data-url="${current.resource_url}" onclick="goToAlbum(event)">View Album</button>
        <button id="${current.title} Album" data-url="${current.resource_url}" data-title="${current.title}" onclick="favouriteAlbum(event)">Favourite</button>
        <hr>
        </div>`
    ))
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
    <button data-url="${obj.releases_url}" onclick="goToReleases(event)">Artist Releases</button>
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
    if (albumJson.styles){
        return albumJson.styles.map(style => `${style}`)
    } else if (albumJson.genres) {
        return albumJson.genres.map(genre => `${genre}`)
    } else {
        return `None to display`
    }
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


// FAOURITES FUNCTIONS
function favouriteArtist() {
    let button = document.getElementById("favourite-artist")
    let artistName = button.getAttribute("data-name")
    let obj = searchedArtists.find(x => x.name === artistName)
    let favArtistCheck = favourites.artists.find(x => x.name === artistName)
    console.log(obj)
    if(favArtistCheck === undefined) {
            favourites.artists.push(obj)
            console.log(favourites)
            console.log("added Favourite")
            colourFavArtist()
        } else {
            removeFavArtist(artistName)
            console.log(favourites)
            console.log("removed Favourite")
            colourFavArtist(button, artistName, favArtistCheck)
    }
}

function colourFavArtist(){
    let button = document.getElementById("favourite-artist")
    let artistName = button.getAttribute("data-name")
    let favArtistCheck = favourites.artists.find(x => x.name === artistName)
    if(favArtistCheck === undefined) {
        console.log("button black")
        button.style.backgroundColor = ""
        button.style.color = "black"
        } else {
            console.log("button blue")
            button.style.backgroundColor = "blue"
            button.style.color = "white"
    }
}

function removeFavArtist(artistName) {
    let index = favourites.artists.map(x => x.name).indexOf(artistName)
    favourites.artists.splice(index, 1)
}

function favouriteAlbum(event) {
    let buttonElement = event.target
    let albumTitle = buttonElement.getAttribute("data-title")
    let favouriteAlbButton = document.getElementById(albumTitle + " Album")
    let favAlbumCheck = favourites.albums.find(x => x.title === albumTitle)
    if(favAlbumCheck === undefined) {
        const button = event.target
        const url = button.dataset["url"]
        fetch(url)
        .then(album => album.json())
        .then(function(albumJson) {
            updateFavouriteAlbums(albumJson)
            console.log(favourites)
            colourFavAlbum(albumTitle)
        })
    } else {
        removeFavAlbum(albumTitle)
        console.log(favourites)
        colourFavAlbum(albumTitle)
    }
}

function updateFavouriteAlbums(albumJson) {
    let obj = {
        artists: albumJson.artists,
        title: albumJson.title,
        genres: albumJson.genres,
        styles: albumJson.styles,
        images: albumJson.images,
        notes: albumJson.notes,
        resourceUrl: albumJson.resource_url,
        tracklist: albumJson.tracklist,
        uri: albumJson.uri,
        videos: albumJson.videos,
        year: albumJson.year
    }
    favourites.albums.push(obj)
}

function colourFavAlbum(albumTitle){
    let favouriteAlbButton = document.getElementById(albumTitle + " Album")
    let favAlbumCheck = favourites.albums.find(x => x.title === albumTitle)
    console.log(favAlbumCheck)
    if(favAlbumCheck === undefined) {
        console.log("button black")
        favouriteAlbButton.style.backgroundColor = ""
        favouriteAlbButton.style.color = "black"
        } else {
            console.log("button blue")
            // console.log(favouriteAlbButton)
            favouriteAlbButton.style.backgroundColor = "blue"
            favouriteAlbButton.style.color = "white"
    }
}

function removeFavAlbum(albumTitle) {
    let index = favourites.albums.map(x => x.title).indexOf(albumTitle)
    favourites.albums.splice(index, 1)
}

// MENU FUNCTIONS
let favMenu = document.getElementById("ham-favourites-nav")
favMenu.addEventListener("click", function(){
    console.log("clicked")
    renderFavourites()
})

function renderFavourites() {
    let selectedFavourite = favourites.artists
    console.log("clicked")
    toggleHamburger()
    removePrvDisplayed()
    renderFavArtistList()
}

function renderFavArtistList() {
    let searchContainer = document.createElement("div")
    searchContainer.className = "search-container"
    let searchResults = []
    array = []
    searchResults = favourites.artists.map(current => {
        checkImgLink(current)
        let artistName = current.name
        let artistResource = current.resource_url
        array.push(artistName)
        return searchToDisplay(artistName, artistResource, coverImg, current)
    })
    searchContainer.innerHTML = searchResults.join(" ")
    information.append(searchContainer)
    array.forEach(element => {
        let searchList = document.getElementById(`${element}`)
        let data = searchList.getAttribute("data-artistResource")
        let artistName = searchList.getAttribute("data-artistName")
        let coverImg = searchList.getAttribute("data-coverImg")

        searchList.addEventListener("click", function() {
            searchArtist(data, artistName, coverImg)
        })
    })
}

function renderSelectedFavourite() {
    let selectedFavourite = favourites.artists.find(x => x.name === artistName)
    console.log(selectedFavourite)
    displaySearchResults(selectedFavourite)
}


//HOME FUNCTION
let homeButton = document.getElementById("ham-home-nav")
homeButton.addEventListener("click", function() {
    goHome()
})

function goHome() {
    removePrvDisplayed()
    toggleHamburger()
    information.innerHTML = `<div class="welcome-content">
                                <p class="home-paragraph">Search for music artists to learn about them and their albums.
                                <br>
                                Favourite, comment on and create playlists for personal viewing and later reference.</p>
                                <p class="home-disclaimer">Disclaimer: All content made possible with the use of Discogs API for use in learning and portfolio</p>
                            </div>`
}

function toggleHamburger() {
    const menu_btn = document.querySelector(".hamburger")
    const mobile_menu = document.querySelector(".mobile-nav")
    menu_btn.classList.toggle("is-active")
    mobile_menu.classList.toggle("is-active")
}