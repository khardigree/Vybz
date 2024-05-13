const energyDropdownEl = document.querySelector('.energy-dropdown');
const energySpanEl = document.querySelector('.energy');

const situationDropdownEl = document.querySelector('.situation-dropdown');
const situationSpanEl = document.querySelector('.situation');

const moodDropdownEl = document.querySelector('.mood-dropdown');
const moodSpanEl = document.querySelector('.mood');

let energyValue = ""
let situationValue = ""
let moodValue = ""

energyDropdownEl.addEventListener('click', function (event) {
  energyValue = event.target.textContent
  energySpanEl.textContent = energyValue
})

situationDropdownEl.addEventListener('click', function (event) {
  situationValue = event.target.textContent
  situationSpanEl.textContent = situationValue
})

moodDropdownEl.addEventListener('click', function (event) {
  moodValue = event.target.textContent
  moodSpanEl.textContent = moodValue
})

console.log(energyValue, situationValue, moodValue)


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
        openModal($target);
      });
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
      if(event.key === "Escape") {
        closeAllModals();
      }
    });
  });