// API Requirements
const apiKey = "key=BvZVUiBAAUkaPKFlsowt"
const secret = "secret=FGcSHfPOplxpojCdQmjjZOEgMUDEVRRG"

// form selectors & events
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
let userId

let loggedIn = false

let homeIntro = `<div class="welcome-content">
                    <p class="home-paragraph">Search for music artists to learn about them and their albums.
                    <br>
                    <br>
                    Favourite, and create account for personal viewing and later reference.</p>
                    <p class="home-disclaimer">Disclaimer: All content made possible with the use of Discogs API for use in learning and portfolio</p>
                </div>`

// search submit event listener
form.addEventListener("submit", function(event) {
    event.preventDefault()
    let artistName = input.value
    loadingScreen()
    search(artistName)
    input.value = "";
})

// initial Discogs Fetch - initial Artist Search
function search(artistName) {
    const url = `https://api.discogs.com/database/search?q=${artistName}&${apiKey}&${secret}&per_page=200`
    
    fetch(url)
    .then(response => response.json())
    .then(function(json) {
        const search = json
        console.log(search.results)
        console.log(search.results.filter(x => x.type === "artist"))
        artistSearchResults = search.results.filter(x => x.type === "artist")
        removePrvDisplayed()
        displaySearchResults(artistSearchResults)
    })
}

function removePrvDisplayed() {
    console.log("removing display")
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
                <div class="img-container">
                    <img src="${coverImg}">
                </div>
                <span class="a-search">${artistName}</span>
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
    window.scrollTo(0, 0)
    console.log("clicked!")
    information.innerHTML = ""
    console.log("emptied information")
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
    let infoDisplay = document.createElement("div")
    infoDisplay.setAttribute("class", "artist-info-div")
    if(obj.members === undefined) {
        infoDisplay.innerHTML =
        `<button data-url="${obj.releases_url}" data-name="${obj.name}" onclick="goToReleases(event)">Artist Releases</button>
        <button id="favourite-artist" data-name="${obj.name}" onclick="favouriteArtist()">Favourite</button>
        <h4>Real Name:</h4> 
        <p>${obj.realname}</p>
        <br>
        <h4>About</h4>
        <p class="about">${obj.profile}</p>
        <br>
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
        information.append(infoDisplay)
        colourFavArtist()
        prevPage = information.innerHTML
    } else {
        infoDisplay.innerHTML =
        `<button data-url="${obj.releases_url}" data-name="${obj.name}" onclick="goToReleases(event)">Artist Releases</button>
        <button id="favourite-artist" data-name="${obj.name}" onclick="favouriteArtist()">Favourite</button>
        <h4>Real Name:</h4> 
        <p>${obj.realname}</p>
        <br>
        <h4>Members:</h4>
        <ul>${renderMembers(obj.members, obj.name)}</ul>
        <br>
        <h4>About</h4>
        <p class="about">${obj.profile}</p>
        <br>
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
        information.append(infoDisplay)
        colourFavArtist()
        prevPage = information.innerHTML
    }
}

function fetchArtistInfo(newUrl, coverImg) {
    fetch(newUrl)
    .then(response => response.json())
    .then(function(json){
        let data = json
        console.log(data)
        renderArtist(data, coverImg, newUrl)
    })
}

function renderCoverImg(cover_image) {
    const imgToRender = `<img id="cover-photo" src="${cover_image}">`
    artistPicture.innerHTML = imgToRender
}


// renders the artist initial search
function renderArtist(data, coverImg, newUrl) {

    let artist1 = {
        name: data.name,
        title: data.title,
        realname: data.realname,
        members: data.members,
        profile: data.profile,
        releases_url: data.releases_url,
        uri: data.uri,
        urls: data.urls,
        cover_image: coverImg,
        resource_url: newUrl
    }

    searchedArtists.push(artist1)
    
    pageHeading.innerHTML =  `<h2 class="artist-name">${artist1.name}</h2>`

    let infoDisplay = document.createElement("div")
    infoDisplay.setAttribute("class", "artist-info-div")

    // if no memebers
    if(!artist1.members) {
        
        infoDisplay.innerHTML =
            `<button data-url="${artist1.releases_url}" data-name="${artist1.name}" onclick="goToReleases(event)">Artist Releases</button>
            <button id="favourite-artist" data-name="${artist1.name}" onclick="favouriteArtist()">Favourite</button>
            <h4>Real Name:</h4>
            <p>${artist1.realname}</p>
            <br>
            <h4>About</h4>
            <p class="about">${artist1.profile}</p>
            <br>
            <div class="links">
                <h4>Links</h4>
        
                <ul>
                    <li><a href="${artist1.uri}" target="_blank">Dicogs Page</a></li>
                    ${renderAssociatedUrls(artist1.urls)}
                </ul>
            </div>`
    
    information.append(infoDisplay)
    colourFavArtist()
    prevPage = information.innerHTML
    
    console.log("no members")
    // if there is members
    } else {
        infoDisplay.innerHTML =
            `<button data-url="${artist1.releases_url}" data-name="${artist1.name}" onclick="goToReleases(event)">Artist Releases</button>
            <button id="favourite-artist" data-name="${artist1.name}" onclick="favouriteArtist()">Favourite</button>
            <h4>Real Name:</h4>
            <p>${artist1.realname}</p>
            <br>
            <h4>Members:</h4>
            <ul>${renderMembers(artist1.members, artist1.name)}</ul>
            <br>
            <h4>About</h4>
            <p class="about">${artist1.profile}</p>
            <br>
            <div class="links">
                <h4>Links</h4>
        
                <ul>
                    <li><a href="${artist1.uri}" target="_blank">Dicogs Page</a></li>
                    ${renderAssociatedUrls(artist1.urls)}
                </ul>
            </div>`

    information.append(infoDisplay)
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

function renderMembers(members) {
        return members.map(current => `<div class="members-div">
                                        <li class="members"><strong>${current.name}</strong></li>
                                        <p><strong>Active:</strong> ${current.active}</p>
                                    </div>`).join("")
} 

function listReleases(obj, artistName, coverImg) {
    let albums = obj.releases
    releasesToRender(albums, artistName, coverImg)
}

// Fetch of artist releases
function goToReleases(event) {
    if(loggedIn === true) {
        fetch(`http://localhost:3000/favouriteArtists?userLoginId=${userId}`)
        .then(response => response.json())
        .then(function(json) {
            console.log(event)
            let button = event.target
            let artistName = button.getAttribute("data-name")
            console.log(artistName)
            let obj = searchedArtists.find(x => x.name === artistName)
            let favObj = json.find(x => x.name === artistName)
            if(favObj) {
                let coverImg = favObj.cover_image
                loadingScreen()
                console.log(obj)
                console.log(favObj)
                if(obj.releases) {
                    window.scrollTo(0, 0)
                    listReleases(obj, artistName, coverImg)
                // else - fetch the information
                console.log("obj")
                } else {
                    const button = event.target
                    const url = button.dataset["url"]
                    loadingScreen()
                    fetch(url)
                    .then(releases => releases.json())
                    .then(function(releasesJson) {
                    console.log(releasesJson)
                    console.log("else")
                    window.scrollTo(0, 0)
                    renderReleases(releasesJson, artistName, coverImg) // this is where the artist releases come from
                    })
                }
            } else {
                let coverImg = obj.cover_image
                loadingScreen()
                console.log(obj)
                console.log(favObj)
                if(obj.releases) {
                    window.scrollTo(0, 0)
                    listReleases(obj, artistName, coverImg)
                // else - fetch the information
                console.log("obj")
                } else {
                    const button = event.target
                    const url = button.dataset["url"]
                    loadingScreen()
                    fetch(url)
                    .then(releases => releases.json())
                    .then(function(releasesJson) {
                    console.log(releasesJson)
                    console.log("else")
                    window.scrollTo(0, 0)
                    renderReleases(releasesJson, artistName, coverImg) // this is where the artist releases come from
                    })
                }
            }
        })
    } else {
        console.log(event)
        let button = event.target
        let artistName = button.getAttribute("data-name")
        console.log(artistName)
        let obj = searchedArtists.find(x => x.name === artistName)
        let favObj = favourites.artists.find(x => x.name === artistName)
        let coverImg = obj.cover_image
        loadingScreen()
        console.log(obj)
        console.log(favObj)
        // check if releases are stored in favourites or searchedArtists array
        // if(typeof favObj.releases !== undefined) {
        //     listReleases(favObj)
        //     console.log("FavObj")
        // } else 
        if(obj.releases) {
            window.scrollTo(0, 0)
            listReleases(obj, artistName, coverImg)
        // else - fetch the information
        console.log("obj")
        } else {
            const button = event.target
            const url = button.dataset["url"]
            loadingScreen()
            fetch(url)
            .then(releases => releases.json())
            .then(function(releasesJson) {
            console.log(releasesJson)
            console.log("else")
            window.scrollTo(0, 0)
            renderReleases(releasesJson, artistName, coverImg) // this is where the artist releases come from
            })
        }
    }
}

function releasesToRender(releases, artistName, coverImg) {
    window.scrollTo(0, 0)
    console.log("releases to render")
    renderCoverImg(coverImg)
    const releaseObj = (releases.map(current => {
        return `<div class="releases-list" id="${current.title}">
                    <p><strong>Title:</strong> ${current.title} </p>
                    <p><strong>Year:</strong> ${current.year}</p>
                    <button data-url="${current.resource_url}" data-artistname="${current.artist}" onclick="goToAlbum(event)">View Album</button>
                    <button id="${current.title} Album" data-artistName="${current.artist}" data-url="${current.resource_url}" 
                    data-title="${current.title}" onclick="favouriteAlbum(event)">Favourite</button>
                </div>`
    }))
    const noOfReleases = releases.length.toString()
    dataDisplay.innerHTML = 
    `<button data-url="" onclick="goToInfo()">Artist Info</button>
    <h2>Number of Releases: ${noOfReleases}</h2>
    <div id="list-of-albums">${releaseObj.join("")}</div>`
    
    information.innerHTML = ""
    pageHeading.innerHTML = `<h2>${artistName}</h2>`
    information.append(dataDisplay)
    let listOfAlbums = document.getElementById("list-of-albums").childNodes
    listOfAlbums.forEach(element => {
        albumTitle = element.id
        colourFavAlbum(albumTitle)
    })
}

function renderReleases(releasesJson, artistName, coverImg) { 
    // Filters the releases to 'master' releases
    const releases = releasesJson.releases.filter(release => (release.type === "master")) // array of objects describing 'master' releases
    console.log(releases)
    //adds releases to searchedArtists array
    let currentArtistHtml = document.getElementsByClassName("artist-name")
    let obj = searchedArtists.find(x => x.name === artistName)
    obj.releases = releases
    releasesToRender(releases, artistName, coverImg)
}

// Artist Info Button Function
function goToInfo(){
    window.scrollTo(0, 0)
    dataDisplay.innerHTML = prevPage
    colourFavArtist()
}

function goToAlbum(event) {
    const button = event.target
    const url = button.dataset["url"]
    let artistName = button.dataset["artistname"]
    let coverImg = document.getElementById("cover-photo").getAttribute("src")
    // console.log(currentArtistName)
    loadingScreen()
    fetch(url)
    .then(album => album.json())
    .then(function(albumJson) {
        window.scrollTo(0, 0)
        console.log(coverImg)
        renderCoverImg(coverImg)
        renderAlbum(albumJson, url, artistName)
    })
}

function renderAlbum(albumJson, url, artistName) {
    // let currentArtistHtml = document.getElementsByClassName("artist-name")
    // let currentArtistName = currentArtistHtml[0].innerText
    let obj = searchedArtists.find(x => x.name === artistName)
    console.log(albumJson)
    console.log(obj)

    const albumObj = `
    <button onclick="goToInfo()">Artist Info</button>
    <button data-url="${url}" data-name="${artistName}"onclick="goToReleases(event)">Artist Releases</button>
    <div class="album-title-info">
        <h2>${albumJson.title}</h2>
        <h3><em>By ${albumJson.artists[0].name}</em></h3>
        <p>${albumJson.year}</p>
        <button id="${albumJson.title} Album" data-url="${url}" 
        data-title="${albumJson.title}" data-artistName="${artistName}" onclick="favouriteAlbum(event)">Favourite</button>
    </div>
    <div class="album-genre">
        <p><strong>Genre:</strong> ${albumJson.genres[0]}</p>
        <p><strong>Styles:</strong> ${renderStyles(albumJson).join(", ")}</p>
    </div>
    <div class="tracklist">
        <h3>Tracklist:</h3>
        <p>${renderTracklist(albumJson).join("")}</p>
    </div>
    <div class="album-videos">
        <h3>Videos:</h3>
        <ul>${renderVideos(albumJson)}</ul>
    </div>
    `
    dataDisplay.innerHTML = albumObj
    information.append(dataDisplay)
    pageHeading.innerHTML = `<h2>${artistName}</h2>`
    console.log(albumJson.title)
    colourFavAlbum(albumJson.title)
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
        `<div class="track-info">
            <p>${current.position} - ${current.title}</p>
        </div>`
        
    )
}

function renderVideos(albumJson) {
    if (albumJson.videos) {
        return albumJson.videos.map(current => 
            `<li><a href="${current.uri}" target="_blank">${current.title}</a></li>`).join("")
    } else return `No videos to display`
}

//FAVOURITES FUNCTIONS
function favouriteArtist() {
    if(loggedIn === true) {
        fetch(`http://localhost:3000/favouriteArtists?userLoginId=${userId}`)
        .then(response => response.json())
        .then(function(json) {
            console.log(json)
            let button = document.getElementById("favourite-artist")
            let artistName = button.getAttribute("data-name")
            let obj = searchedArtists.find(x => x.name === artistName)
            obj.userLoginId = userId
            console.log(obj) // is undefined
            if(json === undefined) {
                pushArtistToDb(obj)
                // json.artists.push(obj)
                console.log(favourites)
                console.log("added Favourite")
                colourFavArtist()
            } else if((json.find(x => x.name === artistName)) === undefined) {
                pushArtistToDb(obj)
                // json.artists.push(obj)
                console.log(favourites)
                console.log("added Favourite")
                colourFavArtist(json)
            } else {
                let currentArtistObj = json.find(x => x.name === artistName)
                console.log(currentArtistObj)
                let id = currentArtistObj.id
                deleteArtistFromDb(id)
                console.log(favourites)
                console.log("removed Favourite")
                colourFavArtist()
            }
        })
    } else {
        let button = document.getElementById("favourite-artist")
        let artistName = button.getAttribute("data-name")
        let obj = searchedArtists.find(x => x.name === artistName)
        console.log(favourites)
        console.log(favourites.artists) // empty arrays in object
        let favArtistCheck = favourites.artists.find(x => x.name === artistName)
        console.log(favArtistCheck)
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
}

function pushArtistToDb(obj) {
    console.log(obj)
    let configObj = {
        method:"POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify(obj)
    }

    return fetch("http://localhost:3000/favouriteArtists", configObj)
    .then(response => {return response.json()})
    // .then(console.log(response))
}

function deleteArtistFromDb(id) {
    
    let deleteArtistConfig = {
        method:"DELETE",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
    }

    fetch(`http://localhost:3000/favouriteArtists/${id}`, deleteArtistConfig)
}

function colourFavArtist(){
    if(loggedIn === true) {
        let button = document.getElementById("favourite-artist")
        let artistName = button.getAttribute("data-name")
        fetch(`http://localhost:3000/favouriteArtists?userLoginId=${userId}`)
        .then(response => response.json())
        .then(function(json) {
            console.log(json)
            if(json === undefined){
                console.log("button black")
                button.style.backgroundColor = "#F4F5F6"
                button.style.color = "black"
            } else if((json.find(x => x.name === artistName)) === undefined) {
                console.log("button black")
                button.style.backgroundColor = "#F4F5F6"
                button.style.color = "black"
            } else {
                    console.log("button yellow")
                    button.style.backgroundColor = "#EDAE49"
                    button.style.color = "white"
            }
        })
    } else {
        let button = document.getElementById("favourite-artist")
        let artistName = button.getAttribute("data-name")
        let favArtistCheck = favourites.artists.find(x => x.name === artistName)
        if(favArtistCheck === undefined) {
            console.log("button black")
            button.style.backgroundColor = "#F4F5F6"
            button.style.color = "black"
            } else {
                console.log("button yellow")
                button.style.backgroundColor = "#EDAE49"
                button.style.color = "white"
        }
    }
    
}

function removeFavArtist(artistName) {
        let index = favourites.artists.map(x => x.name).indexOf(artistName)
        favourites.artists.splice(index, 1)
}

function favouriteAlbum(event) {
    if(loggedIn === true) {
        fetch("http://localhost:3000/favouriteAlbums")
        .then(response => response.json())
        .then(function(json) {
            console.log(json)
            let buttonElement = event.target
            let albumTitle = buttonElement.getAttribute("data-title")
            let name = buttonElement.getAttribute("data-artistName")
            if(json === undefined) {
                const button = event.target
                const url = button.dataset["url"]
                fetch(url)
                .then(album => album.json())
                .then(function(albumJson) {
                    updateFavouriteAlbums(albumJson, name, coverImg)
                    console.log(favourites)
                    colourFavAlbum(albumTitle)
                })
            } else if((json.find(x => x.title === albumTitle)) === undefined) {
                const button = event.target
                const url = button.dataset["url"]
                fetch(url)
                .then(album => album.json())
                .then(function(albumJson) {
                    updateFavouriteAlbums(albumJson, name, coverImg)
                    console.log(favourites)
                    colourFavAlbum(albumTitle)
                })
            } else {
                let currentArtistObj = json.find(x => x.title === albumTitle)
                console.log(currentArtistObj)
                let id = currentArtistObj.id
                deleteAlbumFromDb(id)
                console.log(favourites)
                colourFavAlbum(albumTitle)
            }
        })
    } else {
        let buttonElement = event.target
        let albumTitle = buttonElement.getAttribute("data-title")
        let name = buttonElement.getAttribute("data-artistName")
        console.log(coverImg)
        console.log(favourites.albums)
        let favAlbumCheck = favourites.albums.find(x => x.title === albumTitle)
        if(favAlbumCheck === undefined) {
            const button = event.target
            const url = button.dataset["url"]
            fetch(url)
            .then(album => album.json())
            .then(function(albumJson) {
                updateFavouriteAlbums(albumJson, name, coverImg)
                console.log(favourites)
                colourFavAlbum(albumTitle)
            })
        } else {
            removeFavAlbum(albumTitle)
            console.log(favourites)
            colourFavAlbum(albumTitle)
        }
    }
}

function updateFavouriteAlbums(albumJson, name, coverImg) {
    let obj = {
        artist: name,
        title: albumJson.title,
        genres: albumJson.genres,
        styles: albumJson.styles,
        images: albumJson.images,
        notes: albumJson.notes,
        resource_url: albumJson.resource_url,
        tracklist: albumJson.tracklist,
        uri: albumJson.uri,
        videos: albumJson.videos,
        year: albumJson.year,
        cover_image: coverImg,
        userLoginId: userId
    }

    if(loggedIn === true) {
        pushAlbumToDb(obj)
    } else {
        console.log(albumJson)
        favourites.albums.push(obj)
    }
}

function pushAlbumToDb(obj) {
    console.log(obj)
    let configObj = {
        method:"POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify(obj)
    }

    return fetch("http://localhost:3000/favouriteAlbums", configObj)
    .then(response => {return response.json()})
}

function deleteAlbumFromDb(id) {
    let deleteAlbumConfig = {
        method:"DELETE",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
    }

    return fetch(`http://localhost:3000/favouriteAlbums/${id}`, deleteAlbumConfig)
}

function colourFavAlbum(albumTitle){
    if(loggedIn === true) {
        let favouriteAlbButton = document.getElementById(albumTitle + " Album")
        fetch(`http://localhost:3000/favouriteAlbums?userLoginId=${userId}`)
        .then(response => response.json())
        .then(function(json) {
            if(json === undefined) {
                favouriteAlbButton.style.backgroundColor = "#EDAE49"
                favouriteAlbButton.style.color = "white"
            } else if(json.find(x => x.title === albumTitle)) {
                favouriteAlbButton.style.backgroundColor = "#EDAE49"
                favouriteAlbButton.style.color = "white"
            } else {
                favouriteAlbButton.style.backgroundColor = "#F4F5F6"
                favouriteAlbButton.style.color = "black"
            }
        })
        .catch(error => {
            console.log("An error happened", error)
        })
    } else {
        let favouriteAlbButton = document.getElementById(albumTitle + " Album")
        let favAlbumCheck = favourites.albums.find(x => x.title === albumTitle)
        // console.log(favAlbumCheck)
        if(favAlbumCheck === undefined) {
            // console.log("button black")
            favouriteAlbButton.style.backgroundColor = "#F4F5F6"
            favouriteAlbButton.style.color = "black"
        } else {
            // console.log("button blue")
            favouriteAlbButton.style.backgroundColor = "#EDAE49"
            favouriteAlbButton.style.color = "white"
        }
    }
    
}

function removeFavAlbum(albumTitle) {
    let index = favourites.albums.map(x => x.title).indexOf(albumTitle)
    favourites.albums.splice(index, 1)
}

function fetchAlbums() {
    fetch(`http://localhost:3000/favouriteAlbums?userLoginId=${userId}`)
        .then(response => response.json())
        .then(function(json) {
            let favAlbums = json
            return favAlbums
        })
}

function fetchArtists() {
    fetch(`http://localhost:3000/favouriteAlbums`)
    .then(response => response.json())
    .then(function(json) {
        let favArtists = json
        return favArtists
    })
}

function renderFavourites() {
    if(loggedIn === true) {
        fetch(`http://localhost:3000/favouriteArtists?userLoginId=${userId}`)
        .then(response => response.json())
        .then(function(json) {
            let favArtists = json
            console.log(json)
            fetch(`http://localhost:3000/favouriteAlbums?userLoginId=${userId}`)
            .then(response => response.json())
            .then(function(json) {
                let favAlbums = json
                console.log(favArtists)
                console.log(favAlbums)
                if((favArtists.length > 0) && (favAlbums.length > 0)){
                    removePrvDisplayed()
                    renderFavArtistList()
                    renderFavAlbumsList()
                    console.log("if albums + Artists")
                } else if(favArtists.length > 0){
                    removePrvDisplayed()
                    renderFavArtistList()
                    console.log("if artists")
                } else if(favAlbums.length >0) {
                    removePrvDisplayed()
                    renderFavAlbumsList()
                    console.log("if albums")
                } else {
                    console.log("no albums or artists")
                    removePrvDisplayed()
                    dataDisplay.innerHTML = `<p><strong>Looks like you dont have any favourites yet.</strong></p>
                                            <br>
                                            <p>Hit that favourite button on an Artist or Album to save some.</p>`
                    information.append(dataDisplay)
                }
            })
        })
        console.log("clicked")
    } else {
        console.log("clicked")
        if((favourites.artists.length > 0) && (favourites.albums.length > 0)){
            removePrvDisplayed()
            renderFavArtistList()
            renderFavAlbumsList()
            console.log("if albums + Artists")
        } else if(favourites.artists.length > 0){
            removePrvDisplayed()
            renderFavArtistList()
            console.log("if artists")
        } else if(favourites.albums.length >0) {
            removePrvDisplayed()
            renderFavAlbumsList()
            console.log("if albums")
        } else {
            console.log("no albums or artists")
            removePrvDisplayed()
            dataDisplay.innerHTML = `<p><strong>Looks like you dont have any favourites yet.</strong></p>
                                    <br>
                                    <p>Hit that favourite button on an Artist or Album to save some.</p>`
            information.append(dataDisplay)
        }
    }
}

function favAndReRender(event) {
    favouriteAlbum(event)
    renderFavAlbumsList()
}

function renderFavArtistList() {
    if(loggedIn === true) {
        fetch(`http://localhost:3000/favouriteArtists?userLoginId=${userId}`)
        .then(response => response.json())
        .then(function(json) {
            console.log("render Artists")
            console.log(json)
            if(json.length > 0) {
                let searchContainer = document.createElement("div")
                searchContainer.className = "search-container"
                let searchResults = []
                let array = []
                searchResults = json.map(current => {
                    checkImgLink(current)
                    let artistName = current.name
                    let artistResource = current.resource_url
                    array.push(artistName)
                    return searchToDisplay(artistName, artistResource, coverImg, current)
                })
                let artistHeading = document.createElement("h2")
                artistHeading.innerHTML = `Favourite Artists`
                pageHeading.append(artistHeading)
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
            } else {
                removePrvDisplayed()
                dataDisplay.innerHTML = `<p><strong>Looks like you dont have any favourite Artists yet.</strong></p>
                                        <br>
                                        <p>Hit that favourite button on an Artist to save some.</p>`
                information.append(dataDisplay)
            }
        })
    } else {
        console.log("render Artists")
        if(favourites.artists.length > 0) {
            let searchContainer = document.createElement("div")
            searchContainer.className = "search-container"
            let searchResults = []
            let array = []
            searchResults = favourites.artists.map(current => {
                checkImgLink(current)
                let artistName = current.name
                let artistResource = current.resource_url
                array.push(artistName)
                return searchToDisplay(artistName, artistResource, coverImg, current)
            })
            let artistHeading = document.createElement("h2")
            artistHeading.innerHTML = `Favourite Artists`
            pageHeading.append(artistHeading)
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
        } else {
            removePrvDisplayed()
            dataDisplay.innerHTML = `<p><strong>Looks like you dont have any favourite Artists yet.</strong></p>
                                    <br>
                                    <p>Hit that favourite button on an Artist to save some.</p>`
            information.append(dataDisplay)
        }
    }
}

function renderFavAlbumsList() {
    if(loggedIn === true) {
        fetch(`http://localhost:3000/favouriteAlbums?userLoginId=${userId}`)
        .then(response => response.json())
        .then(function(json) {
            console.log("render Albums")
            if(json.length > 0) {
                let searchContainer = document.createElement("div")
                searchContainer.className = "search-container"
                // let searchResults = []
                console.log(json)
                return favouriteAlbumsToRender(json)
            } else {
                removePrvDisplayed()
                dataDisplay.innerHTML = `<p><strong>Looks like you dont have any favourite Albums yet.</strong></p>
                                        <br>
                                        <p>Hit that favourite button on an Album to save some.</p>`
                information.append(dataDisplay)
            }
        })
    } else {
        console.log("render Albums")
        if(favourites.albums.length > 0) {
            let searchContainer = document.createElement("div")
            searchContainer.className = "search-container"
            let searchResults = []
            console.log(favourites.albums)
            searchResults = favourites.albums
            return favouriteAlbumsToRender(searchResults)
        } else {
            removePrvDisplayed()
            dataDisplay.innerHTML = `<p><strong>Looks like you dont have any favourite Albums yet.</strong></p>
                                    <br>
                                    <p>Hit that favourite button on an Album to save some.</p>`
            information.append(dataDisplay)
        }
    }
}

function favouriteAlbumsToRender(releases) {
    console.log("favourite albums to render")
    console.log(releases)
    //change here maybe for releasesToRender instead
    let releaseObj = (releases.map(current => {
        console.log(current)
        return `<div class="releases-list" id="${current.title}">
                    <p><strong>Artist:</strong> ${current.artist}</p>
                    <p><strong>Title:</strong> ${current.title} </p>
                    <p><strong>Year:</strong> ${current.year}</p>
                    <button data-url="${current.resource_url}" data-title="${current.title}" onclick="renderFavouriteAlbum(event)">View Album</button>
                    <button id="${current.title} Album" data-artistName="${current.artist}" data-url="${current.resource_url}" 
                    data-title="${current.title}" onclick="favAndReRender(event)">Favourite</button>
                </div>`
    }))
    console.log(releaseObj)
    dataDisplay.innerHTML = 
    `<h2>Favourite Albums</h2>
    <div id="list-of-albums">${releaseObj.join("")}</div>`
    
    information.append(dataDisplay)
    dataDisplay
    let listOfAlbums = document.getElementById("list-of-albums").childNodes
    listOfAlbums.forEach(element => {
        albumTitle = element.id
        colourFavAlbum(albumTitle)
    })
}

function renderFavouriteAlbum(event) {
    let button = event.target
    let albumTitle = button.getAttribute("data-title")
    if(loggedIn === true) {
        fetch(`http://localhost:3000/favouriteAlbums?userLoginId=${userId}`)
        .then(response => response.json())
        .then(function(json) {
            let albumObject = json.find(x => x.title === albumTitle)
            console.log(albumObject)
            let url = button.getAttribute("data-url")
            information.innerHTML = ""
            const albumObj = `
            <div class="album-title-info">
                <h2>${albumObject.title}</h2>
                <h3><em>By ${albumObject.artist}</em></h3>
                <p>${albumObject.year}</p>
                <button id="${albumObject.title} Album" data-url="${url}" 
                data-title="${albumObject.title}" data-artistName="${albumObject.artist}" onclick="favouriteAlbum(event)">Favourite</button>
            </div>
            <div class="album-genre">
                <p><strong>Genre:</strong> ${albumObject.genres[0]}</p>
                <p><strong>Styles:</strong> ${renderStyles(albumObject).join(", ")}</p>
            </div>
            <div class="tracklist">
                <h3>Tracklist:</h3>
                <p>${renderTracklist(albumObject).join("")}</p>
            </div>
            <div class="album-videos">
                <h3>Videos:</h3>
                <ul>${renderVideos(albumObject)}</ul>
            </div>
            `
            dataDisplay.innerHTML = albumObj
            information.append(dataDisplay)
            colourFavAlbum(albumTitle)
        })
        
    } else {
        let albumObject = favourites.albums.find(x => x.title === albumTitle)
        console.log(albumObject)
        let url = button.getAttribute("data-url")
        information.innerHTML = ""
        const albumObj = `
        <div class="album-title-info">
            <h2>${albumObject.title}</h2>
            <h3><em>By ${albumObject.artist}</em></h3>
            <p>${albumObject.year}</p>
            <button id="${albumObject.title} Album" data-url="${url}" 
            data-title="${albumObject.title}" data-artistName="${albumObject.artist}" onclick="favouriteAlbum(event)">Favourite</button>
        </div>
        <div class="album-genre">
            <p><strong>Genre:</strong> ${albumObject.genres[0]}</p>
            <p><strong>Styles:</strong> ${renderStyles(albumObject).join(", ")}</p>
        </div>
        <div class="tracklist">
            <h3>Tracklist:</h3>
            <p>${renderTracklist(albumObject).join("")}</p>
        </div>
        <div class="album-videos">
            <h3>Videos:</h3>
            <ul>${renderVideos(albumObject)}</ul>
        </div>
        `
        dataDisplay.innerHTML = albumObj
        information.append(dataDisplay)
        colourFavAlbum(albumTitle)
    }
}

function goToInfoFromFavs() {
    fetchArtistInfo()

    colourFavArtist()
}

// DESKTOP MENU FUNCTIONS
let desktopHome = document.getElementById("desktop-home-nav")
desktopHome.addEventListener("click", function() {
    goHome()
})

let desktopFavMenu = document.getElementById("desktop-favourites-nav")
desktopFavMenu.addEventListener("click", function(){
    console.log("clicked")
    renderFavourites()
})

let desktopArtistFavMenu = document.getElementById("desktop-artist-fav-menu")
desktopArtistFavMenu.addEventListener("click", function(){
    console.log("artist Fav Menu")
    removePrvDisplayed()
    renderFavArtistList()
})

let desktopAlbumFavMenu = document.getElementById("desktop-album-fav-menu")
desktopAlbumFavMenu.addEventListener("click", function() {
    console.log("Album Fav Menu")
    removePrvDisplayed()
    renderFavAlbumsList()
})

// HAMBURGER MENU FUNCTIONS
let favMenu = document.getElementById("ham-favourites-nav")
favMenu.addEventListener("click", function(){
    console.log("clicked")
    toggleHamburger()
    renderFavourites()
})

function renderSelectedFavourite() {
    let selectedFavourite = favourites.artists.find(x => x.name === artistName)
    console.log(selectedFavourite)
    displaySearchResults(selectedFavourite)
}

let hamArtistFavMenu = document.getElementById("ham-artist-fav-menu")
hamArtistFavMenu.addEventListener("click", function(){
    console.log("artist Fav Menu")
    removePrvDisplayed()
    toggleHamburger()
    renderFavArtistList()
})

let hamAlbumFavMenu = document.getElementById("ham-album-fav-menu")
hamAlbumFavMenu.addEventListener("click", function() {
    console.log("Album Fav Menu")
    removePrvDisplayed()
    toggleHamburger()
    renderFavAlbumsList()
})

//HOME FUNCTION
let homeButton = document.getElementById("ham-home-nav")
homeButton.addEventListener("click", function() {
    goHome()
    toggleHamburger()
})

function goHome() {
    removePrvDisplayed()
    information.innerHTML = homeIntro
}

function toggleHamburger() {
    const menu_btn = document.querySelector(".hamburger")
    const mobile_menu = document.querySelector(".mobile-nav")
    menu_btn.classList.toggle("is-active")
    mobile_menu.classList.toggle("is-active")
}

let websiteHeading = document.getElementById("website-heading")
websiteHeading.addEventListener("click", function() {
    goHome()
})

//CREATE USER FUNCTIONS

let desktopCreateAccountButton = document.getElementById("desktop-create-account-button")
desktopCreateAccountButton.addEventListener("click", function() {
    displayCreateAccountForm()
})

let mobileCreateAccountButton = document.getElementById("ham-create-account-button")
mobileCreateAccountButton.addEventListener("click", function() {
    displayCreateAccountForm()
    toggleHamburger()
})

let createAccForm = document.createElement("form")
createAccForm.innerHTML = 
    `<div class="acc-intro"><h2>Create Account</h2>
    <p>Creating an account will let you save favourites for later</p></div>
    <br>
    <div class="create-acc-form">
    <input class="user-input" id="user-input" type="text" placeholder="Enter email" required>
    <input class="user-password" id="user-password" type="password" placeholder="Enter password" required>
    <input class="user-pass-submit" id="user-pass-submit" type="submit" value="Submit"></div>`


function displayCreateAccountForm() {
    removePrvDisplayed()
    information.append(createAccForm)
    let passSubmitBtn = document.getElementById("user-pass-submit")
    passSubmitBtn.addEventListener("click", function(event) {
        event.preventDefault()
        createNewUser()
    })
}

function createNewUser() {
    let email = document.getElementById("user-input").value
    let password = document.getElementById("user-password").value
    let userCredentials = {
        email,
        password
    }

    let configObj = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify(userCredentials)
    }

    return fetch("http://localhost:3000/users", configObj)
    .then(function(response) {
        return response.json()
    })
    .then(function(object) {
        console.log(object)
        createdAccPage()
    })
    .catch(function(error) {
        document.body.innerHTML = error.message
    })
}

function createdAccPage() {
    removePrvDisplayed()
    dataDisplay.innerHTML = `
        <h2>Success!</h2>
        <p>Nice! Now you can log in and save your own favourites</p>`
    
    information.append(dataDisplay)
}

//LOGIN FUNCTIONS
let desktopLoginButton = document.getElementById("desktop-btn-login")
desktopLoginButton.addEventListener("click", logInListener)

let mobileLoginButton = document.getElementById("ham-btn-login")
mobileLoginButton.addEventListener("click", logInListener)
mobileLoginButton.addEventListener("click", toggleHamburger)

function logInListener() {
    console.log("clicked")
    displayLoginForm()

    let loginBtn = document.getElementById("user-login-submit")
    loginBtn.addEventListener("click", function(event) {
        event.preventDefault()
        checkIfUser()
        goHome()
    })
}

function addFavArtistsToDb() {
    if(favourites.artists) {
        let artistsToAdd = favourites.artists.map(element => {
            element.userLoginId = userId
        })
        let configObj = {
            method:"POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(artistsToAdd)
        }
        fetch(`http://localhost:3000/favouriteArtists`, configObj)
    } else {
        console.log(`No artists to add`)
    }
}

function addFavAlbumsToDb() {
    if(favourites.albums){
        favourites.albums.forEach(element => {
            element.userLoginId = userId
        })
        let newAlbumObj = favourites.albums.assign({}, favourites.albums)
        console.log(newAlbumObj)
        console.log(favourites.albums)
        let configObj = {
            method:"POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(favourites.albums)
        }
        fetch(`http://localhost:3000/favouriteAlbums`, configObj)
    } else {
        console.log(`No albums to add`)
    }
}

function displayLoginForm() {
    loginForm = document.createElement("form")
    removePrvDisplayed()
    loginForm.innerHTML = 
    `<div class="acc-intro"><h2>Log In</h2>
    <p>Log in to view your favourites</p></div>
    <br>
    <div class="login-form">
    <input class="user-input" id="login-user-input" type="text" placeholder="Enter email" required>
    <input class="user-password" id="login-user-password" type="password" placeholder="Enter password" required>
    <input class="user-login-submit" id="user-login-submit" type="submit" value="Submit"></div>`

    information.append(loginForm)
}

function checkIfUser() {
    let email = document.getElementById("login-user-input").value
    let password = document.getElementById("login-user-password").value

    fetch("http://localhost:3000/users")
    .then(response => response.json())
    .then(function(json) {
        console.log(json)
        let findUser = json.find(x => x.email === email)
        let findPass = json.find(x => x.password === password)

        if((findUser && findPass) && (findUser.id === findPass.id)) {
            console.log("Found!")
            removePrvDisplayed()
            dataDisplay.innerHTML = 
                `<h2>You successfully Logged in!</h2> 
                <p>Your favourites will now be saved under the menu.</p>`

            loggedIn = true
            userId = findUser.id

            addFavArtistsToDb()
            addFavAlbumsToDb()

            let desktopLoginBtn = document.getElementById("desktop-btn-login")
            desktopLoginBtn.removeEventListener("click", logInListener)
            desktopLoginBtn.innerText = "Log Out"
            desktopLoginBtn.id= "desktop-btn-logout"
            // desktopLoginButton.onclick = "logout()"

            let hamLoginBtn = document.getElementById("ham-btn-login")
            hamLoginBtn.removeEventListener("click", logInListener)
            hamLoginBtn.innerText = "Log Out"
            hamLoginBtn.id= "ham-btn-logout"
            // hamLoginButton.onclick = "logout()"

            desktopLoginBtn.addEventListener("click", logOutListener)
            hamLoginBtn.addEventListener("click", logOutListener)

            information.append(dataDisplay)

        } else {
            console.log("User not found")
            removePrvDisplayed()
            dataDisplay.innerHTML = 
                `<h2>User not found</h2> 
                <p class="user-not-found">Try logging in again or set up an account using the link below or the create account page</p>
                <a id="create-acc">Create Account</a>`
            information.append(dataDisplay)
            let createAccLink = document.getElementById("create-acc")
            createAccLink.addEventListener("click", displayCreateAccountForm)
        }
    })
}

function logOutListener() {
    logOut()
}

function logOut() {
    loggedIn = false
    removePrvDisplayed()

    let desktopLogOutBtn = document.getElementById("desktop-btn-logout")
    desktopLogOutBtn.removeEventListener("click", logOutListener)
    desktopLogOutBtn.innerText = "Log In"
    desktopLogOutBtn.id = "desktop-btn-login"

    let mobileLogOutBtn = document.getElementById("ham-btn-logout")
    mobileLogOutBtn.removeEventListener("click", logOutListener)
    mobileLogOutBtn.innerText = "Log In"
    mobileLogOutBtn.id = "ham-btn-login"

    dataDisplay.innerHTML = 
    `<h2>You successfully logged out</h2>` 
    information.append(dataDisplay)

    let desktopLoginButton = document.getElementById("desktop-btn-login")
    desktopLoginButton.addEventListener("click", logInListener)

    let mobileLoginButton = document.getElementById("ham-btn-login")
    mobileLoginButton.addEventListener("click", logInListener)
}

// LOADING SCREEN
function loadingScreen() {
    removePrvDisplayed()
    dataDisplay.innerHTML = 
    `
    <section class="loading-section">
            <div class="loading-div">
                <div class="loading"></div>
                <div class="loading one"></div>
                <div class="loading two"></div>
                <div class="loading three"></div>
                <div class="loading four"></div>
                <div class="loading five"></div>
                <div class="loading six"></div>
                <div class="loading seven"><p>DISCOGS</p></div>
                <div class="loading eight"></div>
            </div>
        </section>
        <div class="loading-text-container">
            <h2 class="line loading-text">Loading...</h2>
        </div>
    `

    information.append(dataDisplay)
}