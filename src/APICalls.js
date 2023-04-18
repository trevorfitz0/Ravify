import { Buffer } from "buffer"

const clientID = 'fb4afd85ed844f4e8ff547fabca80098'
const clientSecret = '0deb4056e7df4c5692f9b1228fc3065f'
const redirectUrl = 'http://localhost:3000/callback'
const topArtists = `https://api.spotify.com/v1/me/top/artists`

function getAccessToken() {
    return fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    body: 'grant_type=client_credentials&client_id=' + clientID + '&client_secret=' + clientSecret,
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
    var params = `?client_id=${clientID}&response_type=code&redirect_uri=${ encodeURI(redirectUrl)}&show_dialog=true&&scope=user-read-private user-top-read playlist-read-private playlist-read-collaborative`

    window.location.href = 'https://accounts.spotify.com/authorize' + params
}

function handleRedirect() {
    const url = window.location.search
    const urlParams = new URLSearchParams(url)
    const code = urlParams.get('code')
    console.log(code)
    window.history.pushState("", "", redirectUrl)
    getAuthCode(code)
}

async function getAuthCode(accessCode) {

    const params = new URLSearchParams();
    params.append("client_id", clientID);
    params.append("grant_type", "authorization_code");
    params.append("code", accessCode);
    params.append("redirect_uri", redirectUrl);

        const userData = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: { 
                'Authorization': 'Basic ' + new Buffer.from(clientID + ':' + clientSecret).toString('base64'),
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params
        })
        
        const { access_token } = await userData.json()
        getTopArtists(access_token)
}

async function getTopArtists(token) {

    console.log("User")
    console.log(token)

    const result = await fetch('https://api.spotify.com/v1/me/top/artists?limit=25&offset=0', {
        method: 'GET',
        headers: {
            'Authorization' : 'Bearer ' +  token
        }
    })
    
    const data = await result.json()
    console.log(data)
}

export { getAccessToken, getArtistInfo, logUserIn, handleRedirect, getAuthCode }