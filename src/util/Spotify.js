const clientId = "8d623189010e40c1be120a5650266dce";
const redirectURI = "http://aosjammming.surge.sh";
let userAccessToken = "";
let expires_in = 0;

const Spotify = {
    getAccessToken() {
        if (userAccessToken) {
            return userAccessToken;
        } else if (window.location.href.match(/access_token=[^&]*/)) {
            userAccessToken = window.location.href.match(/access_token=[^&]*/)[0].split("=")[1];
            expires_in = window.location.href.match(/expires_in=[^&]*/)[0].split("=")[1];
            window.setTimeout(() => userAccessToken = '', expires_in * 1000);
            window.history.pushState('Access Token', null, '/');
        } else {
            window.location.assign(`https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectURI}`)
        }
    },

    search(term) {
        let userAccessToken = this.getAccessToken(); 
        return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`,{
            headers: {Authorization: `Bearer ${userAccessToken}`}
        })
        .then(response => response.json())
        .then(response => {
            if (!response.tracks) {
                return [];
            }
            return response.tracks.items.map(track => {
                
                return {
                    name: track.name,
                    artist: track.artists[0].name,
                    album: track.album.name,
                    id: track.id,
                    uri: track.uri
                }
            });
    });
    },

    savePlaylist(playlistName, trackURIs) {
        let userAccessToken = this.getAccessToken(); 
        let userId;
        let playlistId;
        if (playlistName && trackURIs) {
            let headers = {'Content-Type': 'application/json', Authorization: `Bearer ${userAccessToken}`};
            let data = {name: playlistName};

            return fetch("https://api.spotify.com/v1/me", {headers: {Authorization: `Bearer ${userAccessToken}`}})
            .then(response => response.json())
            .then(response => {
                userId = response.id;
                return fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {method: "POST", headers: headers, body: JSON.stringify(data)})
                .then(response => response.json())
                .then(response => {
                    playlistId = response.id;
                    return fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {method: "POST", headers: headers, body: JSON.stringify({uris: trackURIs})})
                }); 
            });
        } else {
            return;
        }
    }
};

export default Spotify;