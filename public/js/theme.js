let debounceTimeout;

function toggleTheme() {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
        document.body.classList.toggle('light-mode');
        const icon = document.querySelector('.theme-toggle i');
        icon.classList.toggle('fa-moon');
        icon.classList.toggle('fa-sun');

        localStorage.setItem('theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
    }, 100);
}

function loadSavedTheme() {
    document.addEventListener('DOMContentLoaded', () => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            document.body.classList.add('light-mode');
            document.querySelector('.theme-toggle i').classList.replace('fa-moon', 'fa-sun');
        }
    });
} 