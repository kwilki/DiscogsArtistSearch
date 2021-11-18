const apiKey = "key=BvZVUiBAAUkaPKFlsowt"
const secret = "secret=FGcSHfPOplxpojCdQmjjZOEgMUDEVRRG"

const form = document.querySelector("#search-form")
const input = document.querySelector("#artist-input")

form.addEventListener("submit", function(event) {
    event.preventDefault()
    const artist = input.value
    searchArtist(artist)
    input.value = "";
})

function searchArtist(artist) {
    const url = `https://api.discogs.com/database/search?q=${artist}&${apiKey}&${secret}&per_page=200`
    fetch(url)
    .then(response => response.json())
    .then(function(json) {
        console.log(json)
        const search = json
        console.log(search.results)
        console.log(search.results.find(x => x.type === "artist"))
        artist = search.results.find(x => x.type === "artist")
        const newUrl = artist.resource_url
        console.log(newUrl)
    })
}