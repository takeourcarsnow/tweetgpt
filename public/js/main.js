// main.js

// Import utility functions - not needed with script tags in HTML
// import { showToast, getRandomElement, getRandomNumber, scrollCarousel } from './utils.js';
// import { toggleTheme, loadSavedTheme } from './theme.js';
// import { setupEventListeners } from './eventListeners.js';
// import { CryptoTweetGenerator } from './CryptoTweetGenerator.js';


// Initialize the generator
const tweetGenerator = new TweetGPT();

// Setup event listeners
setupEventListeners(tweetGenerator);

// Randomize selections
tweetGenerator.selectedType = tweetGenerator.getRandomElement(['bullish', 'bearish', 'shill', 'prediction', 'alpha', 'cope', 'news', 'flex']);
tweetGenerator.selectedPersonality = tweetGenerator.getRandomElement(tweetGenerator.personalities).value;
tweetGenerator.selectedCrypto = tweetGenerator.getRandomElement(['BTC', 'ETH', 'SOL', 'DOGE', 'XRP', 'ADA', 'AVAX', 'DOT', 'LINK', 'SHIB']);

// Clear all active selections first
document.querySelectorAll('.carousel-item.active, .crypto-chip.active').forEach(el => {
    el.classList.remove('active');
});

// Initialize default selections after randomization
const setActiveAndScroll = (selector) => {
    const element = document.querySelector(selector);
    if (element) {
        element.classList.add('active');
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'center'
        });
    }
};

// Set active and scroll to selections
setActiveAndScroll(`[data-value="${tweetGenerator.selectedType}"]`);
setActiveAndScroll(`[data-value="${tweetGenerator.selectedPersonality}"]`);
setActiveAndScroll(`[data-ticker="${tweetGenerator.selectedCrypto}"]`);

// Load saved theme preference
loadSavedTheme(); 