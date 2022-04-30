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

// search submit event listener
form.addEventListener("submit", function(event) {
    event.preventDefault()
    let artistName = input.value
    initialSearch(artistName)
    input.value = "";
})

// initial Discogs Fetch - initial Artist Search
function initialSearch(artistName) {
    const url = `https://api.discogs.com/database/search?q=${artistName}&${apiKey}&${secret}&per_page=200`
        
        fetch(url)
        .then(response => response.json())
        .then(function(json) {
            const search = json
            console.log(search.results)
            console.log(search.results.filter(x => x.type === "artist"))
            artistSearchResults = search.results.filter(x => x.type === "artist")
            displaySearchResults(artistSearchResults)
        })
        .then(function() {
            let selected = document.querySelectorAll("#search-results") //UP TO HERE
            selected.addEventListener("click", searchArtist)
        })
}



// Renders search results
function displaySearchResults(artistSearchResults) {
    let welcome = document.querySelector(".welcome-content")
    welcome.remove()
    let searchResults = []
    artistSearchResults.map(current => {
            let coverImg = current.cover_image
            let artistName = current.title
            let artistResource = current.resource_url
            
            searchResults.push(
                `<div 
                    id="search-results" 
                    data-artistResource="${artistResource}" 
                    data-artistName="${artistName}" 
                    data-coverImg="${coverImg}">

                    <img src="${coverImg}">
                    <a>${current.title}</a>
                    <hr>
                </div>
            `)
            dataDisplay.innerHTML = searchResults.join(" ")
            information.append(dataDisplay)
            // console.log(dataDisplay)
    })
}

function searchArtist(data, artistName ,coverImg) {
    console.log("clicked!")
    information.innerHTML = ""

    // if artist has been searched before:
    if(searchedArtists.find(x => x.name === artistName)){
        console.log(searchedArtists)
        let obj = searchedArtists.find(x => x.name === artistName)
        pageHeading.innerHTML =  `<h2 class="artist-name">${obj.name}</h2>`
        console.log("if outside")

        if(obj.members === undefined) {
            dataDisplay.innerHTML =
            `<button data-url=${obj.releases_url} onclick="goToReleases(event)">Artist Releases</button>
            <button id="favourite-artist" data-name=${obj.name}>Favourite</button>
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
        console.log(obj.name)
        renderCoverImg(obj.coverImg)
        information.append(dataDisplay)
        prevPage = information.innerHTML
        const favArtist = document.querySelector("#favourite-artist")
        favArtist.addEventListener("click", favouriteArtist)

        } else {
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
            </div>`
        console.log("2nd")
        console.log(obj.name)
        renderCoverImg(obj.coverImg)
        information.append(dataDisplay)
        prevPage = information.innerHTML
        const favArtist = document.querySelector("#favourite-artist")
        favArtist.addEventListener("click", favouriteArtist)
        }
        
    } else {
        fetch(data)
        .then(response => response.json())
        .then(function(json) {
            const search = json
            const searchedArtistUrl = search.resource_url
            const coverImg = search.cover_image // This is where the cover image comes from
            fetchArtistInfo(searchedArtistUrl, coverImg)
            renderCoverImg(coverImg)
            // var search = document.querySelector("#search-results")
            // search.addEventListener("click",fetchArtistInfo(artistInfo, coverImg))
            // renderCoverImg(coverImg)
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

function renderCoverImg(coverImage) {
    const imgToRender = `<img id="cover-photo" src="${coverImage}">`
    artistPicture.innerHTML = imgToRender
}

// renders the artist initial search
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

    // if no memebers
    if(!artist1.members) {
        dataDisplay.innerHTML =
            `<button data-url=${artist1.releases_url} onclick="goToReleases(event)">Artist Releases</button>
            <button id="favourite-artist" data-name=${artist1.name}>Favourite</button>
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
    prevPage = information.innerHTML
    const favArtist = document.querySelector("#favourite-artist")
    favArtist.addEventListener("click", favouriteArtist)
    
    console.log("no members")
    // if there is members
    } else {
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
    const favArtist = document.querySelector("#favourite-artist")
    favArtist.addEventListener("click", favouriteArtist)
    console.log("members")
    }
    
}