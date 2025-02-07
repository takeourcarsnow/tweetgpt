class TweetGPT {
    constructor() {
        this.apiKey = null;
        this.isGenerating = false;
        this.selectedType = 'bullish';
        this.selectedPersonality = 'degen';
        this.cryptoOptions = [
            'BTC', 'ETH', 'SOL', 'DOGE', 'XRP', 'ADA', 'AVAX', 'DOT', 'LINK', 'SHIB',
            'MATIC', 'BNB', 'LTC', 'ATOM', 'UNI', 'TRX', 'XLM', 'ALGO', 'VET', 'MANA'
        ];
        this.selectedCrypto = this.getRandomElement(this.cryptoOptions);
        this.personalities = [
            { value: 'degen', label: '🎰 Degen', emoji: '🎰' },
            { value: 'influencer', label: '🎭 Influencer', emoji: '🎭' },
            { value: 'trader', label: '📈 Trader', emoji: '📈' },
            { value: 'researcher', label: '🔬 Researcher', emoji: '🔬' },
            { value: 'whale', label: '🐋 Whale', emoji: '🐋' },
            { value: 'newbie', label: '👶 Newbie', emoji: '👶' }
        ];
        this.cacheDOMElements();
        this.setupEventListeners();
        this.initialize();
        this.setupCarouselArrows();
        this.tweetLength = 2; // Default to medium
        this.history = JSON.parse(localStorage.getItem('tweetHistory')) || [];
        this.walletConnected = false; // Track wallet connection status
    }

    cacheDOMElements() {
        this.tweetElement = document.getElementById('generated-tweet');
        this.generateBtn = document.getElementById('generate-btn');
        this.likesElement = document.getElementById('likes');
        this.retweetsElement = document.getElementById('retweets');
        this.repliesElement = document.getElementById('replies');
        this.sentimentElement = document.getElementById('sentiment-value');
        this.sentimentText = document.getElementById('sentiment-text');
        this.displayName = document.querySelector('.display-name');
        this.username = document.querySelector('.username');
        this.profilePic = document.querySelector('.profile-pic');
        this.connectWalletBtn = document.getElementById('connect-wallet-btn');
    }

    async initialize() {
        await this.fetchApiKey();
        this.generateRandomProfile();
        this.generateBtn.disabled = false; // was: true
    }

    async fetchApiKey() {
        try {
            const response = await fetch('/api/config');
            if (!response.ok) {
                throw new Error('Failed to fetch API key');
            }
            const data = await response.json();
            this.apiKey = data.apiKey;
        } catch (error) {
            this.showToast('Failed to initialize API', 'error');
            console.error('API Key fetch error:', error);
        }
    }

    setupEventListeners() {
        // Event listeners will be set up in eventListeners.js
    }

    async generateTweet() {
        if (!this.walletConnected) { // Check for wallet connection
            this.showToast('Connect wallet to generate tweets!', 'warning');
            return;
        }
        if (this.isGenerating) return;

        try {
            this.isGenerating = true;
            this.setLoadingState(true);

            const prompt = this.generatePrompt(this.selectedType, this.selectedPersonality);
            const tweet = await this.fetchTweetFromAPI(prompt);

            this.tweetElement.textContent = tweet;
            this.updateStats();
            this.generateRandomProfile();
            this.addToHistory(tweet);
        } catch (error) {
            console.error('Tweet generation error:', error);
            this.tweetElement.textContent = "Failed to generate tweet. Please try again.";
            this.showToast('Generation failed', 'error');
        } finally {
            this.isGenerating = false;
            this.setLoadingState(false);
        }
    }

    async fetchTweetFromAPI(prompt) {
        const tokenOptions = {
            1: 50,  // Short
            2: 100, // Medium
            3: 150  // Long
        };
        const maxOutputTokens = tokenOptions[this.tweetLength] || tokenOptions[2];

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.9,
                    maxOutputTokens: maxOutputTokens,
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API request failed with status ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    }

    generatePrompt(type, personality) {
        const lengthOptions = {
            1: "Maximum 100 characters, concise and to the point.",
            2: "Maximum 280 characters, standard tweet length.",
            3: "Maximum 500 characters, detailed and expressive."
        };
        const lengthInstruction = lengthOptions[this.tweetLength] || lengthOptions[2];

        const cryptoContext = `Focus exclusively on ${this.selectedCrypto} (${this.getCryptoName(this.selectedCrypto)}). 
            Use specific details about ${this.selectedCrypto}'s technology, ecosystem, and community.`;

        const prompts = {
            bullish: `Generate a ${personality}-style crypto Twitter bullish tweet with:
                ${cryptoContext}
                - Highlight ${this.selectedCrypto}'s unique advantages
                - Mention recent developments or partnerships
                - Use ${this.selectedCrypto}-specific memes and references
                ${lengthInstruction}`,

            bearish: `Generate a ${personality}-style crypto Twitter bearish tweet about ${this.selectedCrypto} with:
                ${cryptoContext}
                - Analyze potential weaknesses or risks of ${this.selectedCrypto}
                - Discuss market trends affecting ${this.selectedCrypto}
                - Use ${this.selectedCrypto}-specific FUD references
                ${lengthInstruction}`,

            shill: `Generate a ${personality}-style crypto Twitter shill tweet about ${this.selectedCrypto} with:
                ${cryptoContext}
                - Explain why ${this.selectedCrypto} is the best investment
                - Use ${this.selectedCrypto}-specific technical advantages
                - Include hype and excitement about ${this.selectedCrypto}
                ${lengthInstruction}`,

            prediction: `Generate a ${personality}-style crypto Twitter price prediction for ${this.selectedCrypto} with:
                ${cryptoContext}
                - Make a bold price prediction for ${this.selectedCrypto}
                - Use ${this.selectedCrypto}-specific technical analysis
                - Include potential catalysts for ${this.selectedCrypto}
                ${lengthInstruction}`,

            alpha: `Generate a ${personality}-style crypto Twitter alpha tweet about ${this.selectedCrypto} with:
                ${cryptoContext}
                - Share unique insights about ${this.selectedCrypto}
                - Discuss potential opportunities in ${this.selectedCrypto}'s ecosystem
                - Include technical details about ${this.selectedCrypto}
                ${lengthInstruction}`,

            cope: `Generate a ${personality}-style crypto Twitter cope tweet about ${this.selectedCrypto} with:
                ${cryptoContext}
                - Discuss why ${this.selectedCrypto} is still a good investment
                - Address recent negative news about ${this.selectedCrypto}
                - Include hopeful messages about ${this.selectedCrypto}'s future
                ${lengthInstruction}`,

            news: `Generate a ${personality}-style crypto Twitter news tweet about ${this.selectedCrypto} with:
                ${cryptoContext}
                - Create breaking news about ${this.selectedCrypto}
                - Include potential impact on ${this.selectedCrypto}'s price
                - Use ${this.selectedCrypto}-specific news references
                ${lengthInstruction}`,

            flex: `Generate a ${personality}-style crypto Twitter flex tweet about ${this.selectedCrypto} with:
                ${cryptoContext}
                - Show off ${this.selectedCrypto} holdings
                - Discuss gains from ${this.selectedCrypto}
                - Include ${this.selectedCrypto}-specific flex references
                ${lengthInstruction}`
        };

        return prompts[type] || prompts.bullish;
    }

    generateRandomProfile() {
        const prefixes = ['Crypto', 'Web3', 'DeFi', 'NFT', 'Based', 'Anon', 'Degen'];
        const suffixes = ['Whale', 'Chad', 'Alpha', 'Trader', 'Guru', 'Wizard', 'Enjoyer'];

        const prefix = this.getRandomElement(prefixes);
        const suffix = this.getRandomElement(suffixes);
        const number = Math.floor(Math.random() * 9999);

        this.displayName.textContent = `${prefix} ${suffix}`;
        this.username.textContent = `@${prefix.toLowerCase()}${suffix.toLowerCase()}${number}`;

        // Update profile picture
        const seed = Math.random().toString(36).substring(7);
        this.profilePic.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
    }

    updateStats() {
        this.likesElement.textContent = this.getRandomNumber(100, 1000);
        this.retweetsElement.textContent = this.getRandomNumber(50, 500);
        this.repliesElement.textContent = this.getRandomNumber(10, 100);
    }

    copyTweet() {
        const tweet = this.tweetElement.textContent;
        navigator.clipboard.writeText(tweet)
            .then(() => this.showToast('Tweet copied! 📋'))
            .catch(() => this.showToast('Failed to copy tweet', 'error'));
    }

    shareTweet() {
        const tweet = this.tweetElement.textContent;
        const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`;
        window.open(tweetUrl, '_blank');
    }

    setLoadingState(isLoading) {
        if (isLoading) {
            this.generateBtn.disabled = true;
            this.generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
            this.tweetElement.classList.add('loading');
        } else {
            this.generateBtn.disabled = false;
            this.generateBtn.innerHTML = '<span>Generate Tweet</span><i class="fas fa-bolt"></i>';
            this.tweetElement.classList.remove('loading');
        }
    }

    getRandomElement(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    getRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    setupCarouselArrows() {
        const carousels = document.querySelectorAll('.carousel');
        carousels.forEach(carousel => {
            const wrapper = carousel.parentElement;
            const leftArrow = wrapper.querySelector('.carousel-arrow.left');
            const rightArrow = wrapper.querySelector('.carousel-arrow.right');

            // Update arrow visibility on scroll
            carousel.addEventListener('scroll', () => {
                this.updateCarouselArrows(carousel, leftArrow, rightArrow);
            });

            // Initial state
            this.updateCarouselArrows(carousel, leftArrow, rightArrow);

            // Add click handlers
            if (leftArrow) {
                leftArrow.addEventListener('click', () => {
                    this.scrollCarousel(carousel, -1);
                });
            }

            if (rightArrow) {
                rightArrow.addEventListener('click', () => {
                    this.scrollCarousel(carousel, 1);
                });
            }
        });
    }

    updateCarouselArrows(carousel, leftArrow, rightArrow) {
        if (leftArrow) {
            leftArrow.style.display = carousel.scrollLeft > 0 ? 'flex' : 'none';
        }
        if (rightArrow) {
            const isAtEnd = carousel.scrollLeft >= (carousel.scrollWidth - carousel.clientWidth - 1);
            rightArrow.style.display = !isAtEnd ? 'flex' : 'none';
        }
    }

    scrollCarousel(carousel, direction) {
        const scrollAmount = carousel.clientWidth * 0.8; // Scroll 80% of visible width
        const newScrollLeft = carousel.scrollLeft + (direction * scrollAmount);
        
        // Smooth scroll with boundary checks
        carousel.scrollTo({
            left: Math.max(0, Math.min(newScrollLeft, carousel.scrollWidth - carousel.clientWidth)),
            behavior: 'smooth'
        });
    }

    setupPersonalityCarousel() {
        const carousel = document.getElementById('personality-carousel');
        carousel.innerHTML = this.personalities.map(personality => `
            <button class="carousel-item" data-value="${personality.value}">
                ${personality.emoji} ${personality.label}
            </button>
        `).join('');
    }

    showToast(message, type = 'success') {
        // Assuming showToast is defined globally or via utils.js
        showToast(message, type);
    }

    addToHistory(tweet) {
        this.history.unshift({ tweet, timestamp: new Date().toLocaleString() });
        if (this.history.length > 10) this.history.pop();
        localStorage.setItem('tweetHistory', JSON.stringify(this.history));
        this.renderHistory();
    }

    renderHistory() {
        const historyList = document.getElementById('history-list');
        historyList.innerHTML = this.history.map((item, index) => `
            <div class="history-item" data-index="${index}">
                <span>${item.tweet}</span>
                <small>${item.timestamp}</small>
            </div>
        `).join('');
    }

    async connectWallet() {
        if (typeof window.solana === 'undefined') {
            this.showToast('Solana wallet not detected. Please install Phantom or similar.', 'error');
            return;
        }

        try {
            const resp = await window.solana.connect();
            console.log('Wallet account:', resp.publicKey.toString());
            this.walletConnected = true;
            this.generateBtn.disabled = false; // Enable generate button after wallet connection
            this.connectWalletBtn.textContent = 'Wallet Connected'; // Update button text
            this.connectWalletBtn.disabled = true; // Disable connect wallet button after connection
            this.showToast('Wallet connected! ✅');
        } catch (err) {
            // { code: 4001, message: 'User rejected the request.' }
            if (err.code !== 4001) {
                console.error('Wallet connection error:', err);
                this.showToast('Failed to connect wallet.', 'error');
            } else {
                this.showToast('Wallet connection rejected by user.', 'warning');
            }
            this.connectWalletBtn.textContent = 'Connect Wallet'; // Revert button text on error
            this.connectWalletBtn.disabled = false; // Keep connect wallet button enabled for re-connection
        }
    }

    getCryptoName(ticker) {
        const cryptoNames = {
            BTC: 'Bitcoin',
            ETH: 'Ethereum',
            SOL: 'Solana',
            DOGE: 'Dogecoin',
            XRP: 'XRP',
            ADA: 'Cardano',
            AVAX: 'Avalanche',
            DOT: 'Polkadot',
            LINK: 'Chainlink',
            SHIB: 'Shiba Inu',
            MATIC: 'Polygon',
            BNB: 'Binance Coin',
            LTC: 'Litecoin',
            ATOM: 'Cosmos',
            UNI: 'Uniswap',
            TRX: 'Tron',
            XLM: 'Stellar',
            ALGO: 'Algorand',
            VET: 'VeChain',
            MANA: 'Decentraland'
        };
        return cryptoNames[ticker] || ticker;
    }
} 