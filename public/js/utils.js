function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;

    switch (type) {
        case 'error':
            toast.style.background = 'var(--error)';
            break;
        case 'warning':
            toast.style.background = 'var(--warning)';
            break;
        default:
            toast.style.background = 'var(--success)';
    }

    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function scrollCarousel(carouselId, direction) {
    const carousel = document.getElementById(carouselId);
    const scrollAmount = 200;

    // Calculate new scroll position
    const newScrollLeft = carousel.scrollLeft + (direction * scrollAmount);

    // Prevent scrolling beyond bounds
    if (newScrollLeft < 0 || newScrollLeft > carousel.scrollWidth - carousel.clientWidth) {
        return;
    }

    carousel.scrollBy({
        left: direction * scrollAmount,
        behavior: 'smooth'
    });
}

async function saveTweetAsImage() {
    const tweetCard = document.querySelector('.tweet-card');
    try {
        const canvas = await html2canvas(tweetCard);
        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = image;
        link.download = 'tweet.png';
        link.click();
        showToast('Tweet saved as image! 🖼️');
    } catch (error) {
        console.error('Error saving image:', error);
        showToast('Failed to save image', 'error');
    }
} 