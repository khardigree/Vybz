const arrayTags = ['hype', 'intense', 'social'];

// Function to fetch images from Flickr API
async function fetchImagesFromFlickr(tags) {
    const apiKey = '55f58c8aca166311594c1e251ad1f6e1'; // Replace 'YOUR_API_KEY' with your actual Flickr API key
    const apiUrl = `https://www.flickr.com/services/rest/?method=flickr.photos.search&api_key=${apiKey}&tags=-people,music,landscape,photography,${tags}&safe_search=1&per_page=100&format=json&nojsoncallback=1`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        // Check if the response is successful
        if (data.stat === 'ok') {
            // Extract image URLs from the response
            const imageUrls = data.photos.photo.map(photo => {
                return `https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}_b.jpg`;
            });
            console.log('Fetched images from Flickr:', imageUrls);
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


let currentSlideIndex = 0;
let slideshowInterval;

// Function to display images in modal
function displayImagesInModal(imageUrls) {
    const modalBody = document.querySelector('.modal-body');
    modalBody.innerHTML = ''; // Clear previous images

    // Create image elements and append them to modal body
    imageUrls.forEach((url, index) => {
        const img = document.createElement('img');
        img.src = url;
        img.classList.add('image');
        if (index !== 0) {
            img.style.display = 'none'; // Hide images except the first one
        }
        modalBody.appendChild(img);
    });

    // Show modal
    const modal = document.getElementById('imageModal');
    modal.classList.add('is-active');

    // Start slideshow
    startSlideshow();
}

// Function to start slideshow
function startSlideshow() {
    slideshowInterval = setInterval(nextSlide, 3000); // Change slide every 3 seconds
}

// Function to stop slideshow
function stopSlideshow() {
    clearInterval(slideshowInterval);
}

// Function to display next slide
function nextSlide() {
    const images = document.querySelectorAll('.image');
    const totalImages = images.length;

    // Hide current slide
    images[currentSlideIndex].style.display = 'none';

    // Move to next slide
    currentSlideIndex = (currentSlideIndex + 1) % totalImages;

    // Show next slide
    images[currentSlideIndex].style.display = 'block';
}

// Function to close modal
function closeModal() {
    const modal = document.getElementById('imageModal');
    modal.classList.remove('is-active');
}

// Event listener to fetch and display images when button is clicked
document.getElementById('getFlickrImages').addEventListener('click', async () => {
    const tags = arrayTags; // Tags to search for images
    const imageUrls = await fetchImagesFromFlickr(tags);
    displayImagesInModal(imageUrls);
});
