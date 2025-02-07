function setupEventListeners(tweetGenerator) {
    // Generate, Copy, Share Buttons
    document.getElementById('generate-btn').addEventListener('click', () => tweetGenerator.generateTweet());
    document.getElementById('copy-btn').addEventListener('click', () => tweetGenerator.copyTweet());
    document.getElementById('share-btn').addEventListener('click', () => tweetGenerator.shareTweet());

    // Connect Wallet Button
    document.getElementById('connect-wallet-btn').addEventListener('click', () => tweetGenerator.connectWallet());

    // Theme Toggle
    document.querySelector('.theme-toggle').addEventListener('click', () => toggleTheme());

    // Stats interaction using Event Delegation
    document.querySelector('.tweet-stats').addEventListener('click', (e) => {
        if (e.target.closest('.stat-item')) {
            tweetGenerator.updateStats(e);
        }
    });

    // Carousel selections using Event Delegation
    document.querySelectorAll('.carousel').forEach(carousel => {
        carousel.addEventListener('click', (e) => {
            if (e.target.classList.contains('carousel-item')) {
                // Remove active class from all items in this carousel
                carousel.querySelectorAll('.carousel-item').forEach(item => {
                    item.classList.remove('active');
                });
                // Add active class to clicked item
                e.target.classList.add('active');

                if (carousel.id === 'tweet-type-carousel') {
                    tweetGenerator.selectedType = e.target.dataset.value;
                } else if (carousel.id === 'personality-carousel') {
                    tweetGenerator.selectedPersonality = e.target.dataset.value;
                }
            }
        });
    });

    // Crypto selection using Event Delegation
    document.querySelector('.crypto-grid').addEventListener('click', (e) => {
        if (e.target.classList.contains('crypto-chip')) {
            // Remove active class from all crypto chips
            document.querySelectorAll('.crypto-chip').forEach(chip => {
                chip.classList.remove('active');
            });
            // Add active class to clicked chip
            e.target.classList.add('active');
            const selectedTicker = e.target.dataset.ticker;
            tweetGenerator.selectedCrypto = selectedTicker;
            tweetGenerator.showToast(`${tweetGenerator.getCryptoName(selectedTicker)} selected!`);
        }
    });

    // Custom crypto input
    document.getElementById('add-crypto').addEventListener('click', () => {
        const customTicker = document.getElementById('custom-crypto').value.trim().toUpperCase();
        if (customTicker) {
            // Check if the crypto already exists
            const existingChip = document.querySelector(`[data-ticker="${customTicker}"]`);
            if (existingChip) {
                existingChip.click(); // Simulate click on existing chip
            } else {
                // Add new crypto option
                tweetGenerator.selectedCrypto = customTicker;
                const cryptoGrid = document.querySelector('.top-cryptos');
                const newChip = document.createElement('button');
                newChip.className = 'crypto-chip active';
                newChip.dataset.ticker = customTicker;
                newChip.textContent = customTicker;
                cryptoGrid.appendChild(newChip);
                tweetGenerator.showToast(`Custom crypto ${customTicker} added!`);
            }
            document.getElementById('custom-crypto').value = '';
        }
    });

    // Add this for the tweet length slider
    document.getElementById('tweet-length').addEventListener('input', (e) => {
        tweetGenerator.tweetLength = parseInt(e.target.value);
    });

    // Add this for the save image button
    document.getElementById('save-image-btn').addEventListener('click', saveTweetAsImage);

    // Add this for history item clicks
    document.getElementById('history-list').addEventListener('click', (e) => {
        const historyItem = e.target.closest('.history-item');
        if (historyItem) {
            const index = historyItem.dataset.index;
            const tweet = tweetGenerator.history[index].tweet;
            document.getElementById('generated-tweet').textContent = tweet;
            showToast('Tweet loaded from history! ⏳');
        }
    });
} 