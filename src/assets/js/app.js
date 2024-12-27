document.addEventListener('DOMContentLoaded', () => {
    // Load header and footer
    loadComponent('header-placeholder', '../components/header.html');
    loadComponent('footer-placeholder', '../components/footer.html');

    // Initialize animations
    initScrollAnimation();
    initCounters();
});

// Load components
async function loadComponent(elementId, componentPath) {
    try {
        const response = await fetch(componentPath);
        const html = await response.text();
        document.getElementById(elementId).innerHTML = html;
    } catch (error) {
        console.error('Error loading component:', error);
    }
}

// Scroll animation
function initScrollAnimation() {
    const elements = document.querySelectorAll('.animate-on-scroll');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    elements.forEach(element => observer.observe(element));
}

// Counter animation
function initCounters() {
    const counters = document.querySelectorAll('.counter');
    
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000; // 2 seconds
        const step = target / (duration / 16); // 60 FPS

        function updateCounter() {
            const current = parseInt(counter.innerText);
            if (current < target) {
                counter.innerText = Math.ceil(Math.min(current + step, target));
                setTimeout(updateCounter, 16);
            }
        }

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                updateCounter();
                observer.unobserve(counter);
            }
        });

        observer.observe(counter);
    });
}

// Mobile menu toggle
document.addEventListener('click', (e) => {
    if (e.target.closest('.mobile-menu-btn')) {
        document.querySelector('.nav-links').classList.toggle('active');
        document.querySelector('.auth-buttons').classList.toggle('active');
    }
});