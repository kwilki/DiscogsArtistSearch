Welcome to my Artist Search Javascript web app utilising Disgcogs API
Check out the documentation here:

    --> https://www.discogs.com/developers

This web app utilises json server to run a Fake REST API
Check that out here:

    --> https://github.com/typicode/json-server

Steps:

1. Clone the DiscogsArtistSearch Repository

    --> https://github.com/kwilki/DiscogsArtistSearch

2. The Json server needs to be installed in order to use account features of the app

--> run npm install while inside the cloned folder

3. Json-server must be running to use account features

--> After installing, run:
    json-server -w db.json

Features:
    1. Create account
    2. Log in/Log out of account
    3. Search for music artists
    4. View various Artist Information via Artist Info button
    5. When viewing artist Info, click Artist Releases to see a list of albums by the Artist
    6. When viewing Artist Releases, click View Album to see relevant information on that particular album
    7. Favourite Artists and view in favourites menu
    8. Favourite Albums and view them in favourites menu

    Favourites Functionality
        - Clicking the favourites heading will take you to favourite artists and albums
        - Clicking Artists under favourites dropdown or sidebar will take you to favourite artists
        - Clicking Albums under favourites dropdown or sidebar will take you to favourite albums

Site Functionality will work without database however favourites won't be saved for next time.
Any favourites added before login wont be saved.

This was my first JS app.
Thanks for checking it out. 
Much love

