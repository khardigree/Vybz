const energyDropdownEl = document.querySelector('.energy-dropdown');
const energySpanEl = document.querySelector('.energy');

const situationDropdownEl = document.querySelector('.situation-dropdown');
const situationSpanEl = document.querySelector('.situation');

const moodDropdownEl = document.querySelector('.mood-dropdown');
const moodSpanEl = document.querySelector('.mood');

const userTags = [];

energyDropdownEl.addEventListener('click', function (event) {
  let energyValue = "";
  energyValue = event.target.textContent;
  energySpanEl.textContent = energyValue;
  userTags.push(energyValue);
  console.log('energy: ', energyValue);
})

situationDropdownEl.addEventListener('click', function (event) {
  let situationValue = "";
  situationValue = event.target.textContent;
  situationSpanEl.textContent = situationValue;
  userTags.push(situationValue);
  console.log('situation: ', situationValue);
})

moodDropdownEl.addEventListener('click', function (event) {
  let moodValue = "";
  moodValue = event.target.textContent;
  moodSpanEl.textContent = moodValue;
  userTags.push(moodValue);
  console.log('mood: ', moodValue);
})


// Function to update the selected values
document.addEventListener('DOMContentLoaded', function () {
  // Get all dropdowns
  var dropdowns = document.querySelectorAll('.dropdown');
  // Initialize each dropdown
  dropdowns.forEach(function (dropdown) {
    dropdown.addEventListener('click', function (event) {
      event.stopPropagation(); // Prevent click event from bubbling up
      dropdown.classList.toggle('is-active'); // Toggle is-active class
    });
  });
});

document.addEventListener('DOMContentLoaded', () => {
  // Functions to open and close a modal
  function openModal($el) {
    $el.classList.add('is-active');
  }

  function closeModal($el) {
    $el.classList.remove('is-active');
    // Pause the audio player
    const audioPlayer = document.getElementById('audioPlayer');
    audioPlayer.pause();
  }

  function closeAllModals() {
    (document.querySelectorAll('.modal') || []).forEach(($modal) => {
      closeModal($modal);
    });
  }

  // Add a click event on buttons to open a specific modal
  (document.querySelectorAll('.js-modal-trigger') || []).forEach(($trigger) => {
    const modal = $trigger.dataset.target;
    const $target = document.getElementById(modal);

    $trigger.addEventListener('click', () => {
      console.log('User tags: ', userTags);
      openModal($target);
      searchAndPlay(userTags);
    });

    // Add a click event on various child elements to close the parent modal
    (document.querySelectorAll('.modal-background, .modal-close, .modal-card-head .delete, .modal-card-foot .button') || []).forEach(($close) => {
      const $target = $close.closest('.modal');

      $close.addEventListener('click', () => {
        closeModal($target);
      });
    });

    // Add a keyboard event to close all modals
    document.addEventListener('keydown', (event) => {
      if (event.key === "Escape") {
        closeAllModals();
      }
    });
  });

  async function searchAndPlay(tags) {
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

      audioPlayer.onended = function () {
        index++;
        playNextTrack();
      };
    } catch (error) {
      console.error('Error searching tracks:', error);
    }
  }
});
