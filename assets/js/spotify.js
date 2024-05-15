async function searchAndPlay() {
    const tagsInput = document.getElementById('tags');
    const tags = tagsInput.value.trim();

    if (!tags) {
        alert('Please enter tags to search.');
        return;
    }

    const clientId = '3ec248ef62494e84a577442e5d44ac7d'; // Replace with your client ID
    const clientSecret = '73ab3cf629ae43d08cf35dc332b2b289'; // Replace with your client secret

    const authString = btoa(clientId + ':' + clientSecret);

    const tokenEndpoint = 'https://accounts.spotify.com/api/token';
    const searchEndpoint = 'https://api.spotify.com/v1/search';

    try {
        const tokenResponse = await fetch(tokenEndpoint, {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + authString,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'grant_type=client_credentials'
        });
    
        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;
    
        const searchResponse = await fetch(`${searchEndpoint}?q=${tags}&type=track&limit=10&market=US&include_external=audio`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        });
    
        const searchData = await searchResponse.json();
        const tracks = searchData.tracks.items.filter(track => track.preview_url);
    
        if (tracks.length === 0) {
            alert('No tracks found for the entered tags or no tracks with previews available.');
            return;
        }
    
        // Play track previews in a loop
        const audioPlayer = document.getElementById('audioPlayer');
        let index = 0;
        playNextTrack();
    
        function playNextTrack() {
            if (index >= tracks.length) {
                // Reached the end of the tracks
                return;
            }
    
            audioPlayer.src = tracks[index].preview_url;
            audioPlayer.play()
                .catch(error => {
                    console.error('Error playing track:', error);
                    // Skip to the next track if an error occurs
                    index++;
                    playNextTrack();
                });
        }
    
        audioPlayer.onended = function() {
            index++;
            playNextTrack();
        };
    } catch (error) {
        console.error('Error searching tracks:', error);
    }
}   