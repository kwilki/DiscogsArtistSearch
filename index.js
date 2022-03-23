// API Requirements
const apiKey = "key=BvZVUiBAAUkaPKFlsowt"
const secret = "secret=FGcSHfPOplxpojCdQmjjZOEgMUDEVRRG"

// form selectors & events
const form = document.querySelector("#search-form")
const formBody = document.querySelector("#search-body")
const input = document.querySelector("#artist-input")

const pageHeading = document.querySelector("#page-heading")
const main = document.querySelector("#information")
const dataDisplay = document.createElement("div")

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