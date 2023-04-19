import { Buffer } from "buffer"

// const  { CLIENT_KEY, CLIENT_SECRET_KEY } = process.env
const CLIENT_KEY="fb4afd85ed844f4e8ff547fabca80098"
const CLIENT_SECRET_KEY="0deb4056e7df4c5692f9b1228fc3065f"
const redirectUrl = 'http://localhost:3000/callback'
const topArtists = `https://api.spotify.com/v1/me/top/artists`

function getAccessToken() {
    return fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    body: 'grant_type=client_credentials&client_id=' + CLIENT_KEY + '&client_secret=' + CLIENT_SECRET_KEY,
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

    var params = `?client_id=${CLIENT_KEY}&response_type=code&redirect_uri=${ encodeURI(redirectUrl)}&show_dialog=true&&scope=user-read-private user-top-read playlist-read-private playlist-read-collaborative`

    window.location.href = 'https://accounts.spotify.com/authorize' + params
}

async function handleRedirect() {
    const url = window.location.search
    const urlParams = new URLSearchParams(url)
    const code = urlParams.get('code')
    window.history.pushState("", "", "http://localhost:3000/")

    const params = new URLSearchParams();
    params.append("client_id", CLIENT_KEY);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", redirectUrl);

        const userData = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: { 
                'Authorization': 'Basic ' + new Buffer.from(CLIENT_KEY + ':' + CLIENT_SECRET_KEY).toString('base64'),
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params
        })
        
        const { access_token } = await userData.json()



    const result = await fetch('https://api.spotify.com/v1/me/top/artists?limit=25&offset=0', {
        method: 'GET',
        headers: {
            'Authorization' : 'Bearer ' +  access_token
        }
    })
    
    const data = await result.json()
    return data
}

export { getAccessToken, getArtistInfo, logUserIn, handleRedirect }