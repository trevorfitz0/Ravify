import { Buffer } from "buffer"

const  { REACT_APP_CLIENT_KEY, REACT_APP_CLIENT_SECRET_KEY } = process.env

// const redirectUrl = 'https://www.ravify.me/callback/'
const redirectUrl = 'http://localhost:3000/callback/'
const topArtistsFetch = `https://api.spotify.com/v1/me/top/artists?limit=25&offset=0&time_range=long_term`

function getAccessToken() {
    return fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        body: 'grant_type=client_credentials&client_id=' + REACT_APP_CLIENT_KEY + '&client_secret=' + REACT_APP_CLIENT_SECRET_KEY,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
}

function getArtistInfo(accessToken, id) {
    return fetch('https://api.spotify.com/v1/artists/' + id , {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
}

function logUserIn() {

    var params = `?client_id=${REACT_APP_CLIENT_KEY}&response_type=code&redirect_uri=${ encodeURI(redirectUrl) }&show_dialog=true&&scope=user-read-private user-top-read`

    window.location.href = 'https://accounts.spotify.com/authorize' + params
}

async function handleRedirect() {
    const url = window.location.search
    const urlParams = new URLSearchParams(url)
    const code = urlParams.get('code')
    // window.history.pushState("", "", "https://www.ravify.me/#/")
    window.history.pushState("", "", "http://localhost:3000/#/")

    const params = new URLSearchParams();
    params.append("client_id", REACT_APP_CLIENT_KEY);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", redirectUrl);

        const userData = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: { 
                'Authorization': 'Basic ' + new Buffer.from(REACT_APP_CLIENT_KEY + ':' + REACT_APP_CLIENT_SECRET_KEY).toString('base64'),
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params
        })

        const { access_token } = await userData.json()


    const topArtists = await fetch(topArtistsFetch, {
        method: 'GET',
        headers: {
            'Authorization' : 'Bearer ' +  access_token
        }
    })
    
    const topArtistData = await topArtists.json()
    if(topArtistData.limit < 10) {
        return "no data"
    }
    
    return topArtistData
}

export { getAccessToken, getArtistInfo, logUserIn, handleRedirect }
