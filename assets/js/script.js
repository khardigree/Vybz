// Wait for the DOM content to be fully loaded before executing the script
document.addEventListener('DOMContentLoaded', () => {
  // Get references to various dropdown elements and spans
  const energyDropdownEl = document.querySelector('.energy-dropdown');
  const energySpanEl = document.querySelector('.energy');
  const situationDropdownEl = document.querySelector('.situation-dropdown');
  const situationSpanEl = document.querySelector('.situation');
  const moodDropdownEl = document.querySelector('.mood-dropdown');
  const moodSpanEl = document.querySelector('.mood');
  const userTags = [];

  // Event listener for energy dropdown
  energyDropdownEl.addEventListener('click', function (event) {
    let energyValue = "";
    energyValue = event.target.textContent;
    energySpanEl.textContent = energyValue;
    userTags.push(energyValue);
  });

  // Event listener for situation dropdown
  situationDropdownEl.addEventListener('click', function (event) {
    let situationValue = "";
    situationValue = event.target.textContent;
    situationSpanEl.textContent = situationValue;
    userTags.push(situationValue);
  });

  // Event listener for mood dropdown
  moodDropdownEl.addEventListener('click', function (event) {
    let moodValue = "";
    moodValue = event.target.textContent;
    moodSpanEl.textContent = moodValue;
    userTags.push(moodValue);
  });

  // Event listener to handle dropdown functionality
  var dropdowns = document.querySelectorAll('.dropdown');
  dropdowns.forEach(function (dropdown) {
    dropdown.addEventListener('click', function (event) {
      event.stopPropagation();
      dropdown.classList.toggle('is-active');
    });
  });

  // Event listener to close dropdowns when clicking outside
  document.addEventListener('click', function (event) {
    const dropdowns = document.querySelectorAll('.dropdown');
    const isDropdownClick = Array.from(dropdowns).some(dropdown => dropdown.contains(event.target));

    if (!isDropdownClick) {
      dropdowns.forEach(dropdown => {
        dropdown.classList.remove('is-active');
      });
    }
  })

  // Get modal elements and modal triggers
  const modals = document.querySelectorAll('.modal');
  const modalTriggers = document.querySelectorAll('.pickBtn');

  // Loop through each modal trigger
  modalTriggers.forEach(($trigger) => {
    const modalId = $trigger.dataset.target;
    const $target = document.getElementById(modalId);

    // Event listener for opening modal
    $trigger.addEventListener('click', () => {
      if (userTags.length === 0) {
        alert('Please select at least one tag.');
        return; // Prevent modal from opening if no tags are selected
      }
      openModal($target);
      searchAndPlay(userTags);
      fetchAndDisplayImages(userTags.join(','));
    });

    // Event listeners for closing modal
    const modalCloseElements = document.querySelectorAll('.modal-background, .modal-close, .modal-card-head .delete, .modal-card-foot .button');
    modalCloseElements.forEach(($close) => {
      const $target = $close.closest('.modal');

      $close.addEventListener('click', () => {
        closeModal($target);
        window.location.reload();
      });
    });

    // Event listener for closing modal with escape key
    document.addEventListener('keydown', (event) => {
      if (event.key === "Escape") {
        closeAllModals();
      }
    });
  });

  // Function to open modal
  function openModal($el) {
    $el.classList.add('is-active');
  }

  // Function to close modal
  function closeModal($el) {
    $el.classList.remove('is-active');
    const audioPlayer = document.getElementById('audioPlayer');
    audioPlayer.pause();
  }

  // Function to close all modals
  function closeAllModals() {
    (document.querySelectorAll('.modal') || []).forEach(($modal) => {
      closeModal($modal);
    });
  }

  // Function to search and play audio based on tags
  async function searchAndPlay(tags) {
    if (!tags) {
      alert('Please enter tags to search.');
      return;
    }

    // Spotify API credentials
    const clientId = '3ec248ef62494e84a577442e5d44ac7d';
    const clientSecret = '73ab3cf629ae43d08cf35dc332b2b289';

    const authString = btoa(clientId + ':' + clientSecret);

    const tokenEndpoint = 'https://accounts.spotify.com/api/token';
    const searchEndpoint = 'https://api.spotify.com/v1/search';

    try {
      // Fetch access token
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

      // Perform search for tracks
      const randomOffset = Math.floor(Math.random() * 100); // Random offset for varied results
      const searchResponse = await fetch(`${searchEndpoint}?q=${tags}&type=track&limit=10&offset=${randomOffset}&market=US&include_external=audio`, {
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

      // Play audio tracks
      const audioPlayer = document.getElementById('audioPlayer');
      let index = 0;
      playNextTrack();

      // Play next track when current track ends
      function playNextTrack() {
        if (index >= tracks.length) {
          return;
        }

        audioPlayer.src = tracks[index].preview_url;
        audioPlayer.play()
          .catch(error => {
            console.error('Error playing track:', error);
            index++;
            playNextTrack();
          });
      }

      // Play next track when current track ends
      audioPlayer.onended = function () {
        index++;
        playNextTrack();
      };
    } catch (error) {
      console.error('Error searching tracks:', error);
    }
  }

  async function fetchAndDisplayImages(tags) {
    const imageUrls = await fetchImagesFromFlickr(tags);
    if (imageUrls.length > 0) {
      displayImagesInSlideshow(imageUrls);
    } else {
      console.error('No images found.');
    }
  }

  // Function to fetch images from Flickr
  async function fetchImagesFromFlickr(tags) {
    const apiKey = '55f58c8aca166311594c1e251ad1f6e1';
    const apiUrl = `https://www.flickr.com/services/rest/?method=flickr.photos.search&api_key=${apiKey}&tags=${tags}&safe_search=1&per_page=100&format=json&nojsoncallback=1`;

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data.stat === 'ok') {
        const imageUrls = data.photos.photo.map(photo => {
          return `https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}_b.jpg?timestamp=${new Date().getTime()}`;
        });
        return imageUrls;
      } else {
        console.error('Failed to fetch images from Flickr:', data.message);
        return [];
      }
    } catch (error) {
      console.error('Error fetching images from Flickr:', error);
      return [];
    }
  }

  // Function to display images in a slideshow
  function displayImagesInSlideshow(imageUrls) {
    const slideshowContainer = document.querySelector('.slideshow-container');
    slideshowContainer.innerHTML = '';

    imageUrls.forEach((url, index) => {
      const slideDiv = document.createElement('div');
      slideDiv.classList.add('mySlides', 'fade');
      if (index === 0) slideDiv.style.display = 'block';

      const img = document.createElement('img');
      img.src = url;
      img.classList.add('slideshow-image');

      slideDiv.appendChild(img);
      slideshowContainer.appendChild(slideDiv);
    });

    let currentSlideIndex = 0;
    setInterval(() => {
      showSlides(++currentSlideIndex);
    }, 3000);
  }

  // Function to show slides in the slideshow
  function showSlides(n) {
    const slides = document.querySelectorAll('.mySlides');
    if (n >= slides.length) {
      currentSlideIndex = 0;
      n = 0;
    }
    slides.forEach(slide => slide.style.display = "none");
    slides[n].style.display = "block";
  }
});
