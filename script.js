// ========================================
// Navigation scroll effect
// ========================================
const nav = document.getElementById('nav');

window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 10);
});

// ========================================
// Mobile menu toggle
// ========================================
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');

navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen);

    // Animate hamburger to X
    const spans = navToggle.querySelectorAll('span');
    if (isOpen) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
        spans[0].style.transform = '';
        spans[1].style.opacity = '';
        spans[2].style.transform = '';
    }
});

// Close mobile menu on link click
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        const spans = navToggle.querySelectorAll('span');
        spans[0].style.transform = '';
        spans[1].style.opacity = '';
        spans[2].style.transform = '';
    });
});

// ========================================
// Active nav link on scroll
// ========================================
const sections = document.querySelectorAll('section[id]');

function updateActiveLink() {
    const scrollY = window.scrollY + 100;

    sections.forEach(section => {
        const top = section.offsetTop - 100;
        const bottom = top + section.offsetHeight;
        const id = section.getAttribute('id');
        const link = document.querySelector(`.nav-links a[href="#${id}"]`);

        if (link) {
            link.classList.toggle('active', scrollY >= top && scrollY < bottom);
        }
    });
}

window.addEventListener('scroll', updateActiveLink);
updateActiveLink();

// ========================================
// Scroll-triggered fade-in animations
// ========================================
const animatedElements = document.querySelectorAll(
    '.metric-item, .logos-strip, .section-title, .about-content, .timeline-item, .publication-card, .project-card, .blog-card, .contact-content, .currently-reading, .rotating-quote'
);

animatedElements.forEach(el => el.classList.add('fade-in'));

const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
);

animatedElements.forEach(el => observer.observe(el));

// ========================================
// Count-up animation for metrics
// ========================================
const metricNumbers = document.querySelectorAll('.metric-number');

const countObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const text = el.textContent;
                const match = text.match(/(\d+)/);
                if (match) {
                    const target = parseInt(match[1]);
                    const suffix = text.replace(match[1], '');
                    let current = 0;
                    const duration = 1200;
                    const start = performance.now();

                    function step(now) {
                        const progress = Math.min((now - start) / duration, 1);
                        const eased = 1 - Math.pow(1 - progress, 3);
                        current = Math.round(eased * target);
                        el.textContent = current + suffix;
                        if (progress < 1) requestAnimationFrame(step);
                    }
                    requestAnimationFrame(step);
                }
                countObserver.unobserve(el);
            }
        });
    },
    { threshold: 0.5 }
);

metricNumbers.forEach(el => countObserver.observe(el));

// ========================================
// Dark mode toggle
// ========================================
const darkModeToggle = document.getElementById('dark-mode-toggle');

// Check for saved preference or system preference
function initDarkMode() {
    const saved = localStorage.getItem('darkmode');
    if (saved === 'true') {
        document.body.classList.add('darkmode');
    } else if (saved === null && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.body.classList.add('darkmode');
    }
}

initDarkMode();

darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('darkmode');
    localStorage.setItem('darkmode', document.body.classList.contains('darkmode'));
});

// ========================================
// Rotating quotes
// ========================================
const quotes = [
    { text: '"The best way to predict the future is to invent it."', author: '— Alan Kay' },
    { text: '"Any sufficiently advanced technology is indistinguishable from magic."', author: '— Arthur C. Clarke' },
    { text: '"The only way to do great work is to love what you do."', author: '— Steve Jobs' },
    { text: '"In the middle of difficulty lies opportunity."', author: '— Albert Einstein' },
    { text: '"Simplicity is the ultimate sophistication."', author: '— Leonardo da Vinci' },
    { text: '"The measure of intelligence is the ability to change."', author: '— Albert Einstein' },
    { text: '"First, solve the problem. Then, write the code."', author: '— John Johnson' },
];

const quoteEl = document.getElementById('rotating-quote');
const authorEl = document.getElementById('quote-author');

if (quoteEl && authorEl) {
    let currentQuote = 0;

    function rotateQuote() {
        quoteEl.style.opacity = '0';
        authorEl.style.opacity = '0';

        setTimeout(() => {
            currentQuote = (currentQuote + 1) % quotes.length;
            quoteEl.textContent = quotes[currentQuote].text;
            authorEl.textContent = quotes[currentQuote].author;
            quoteEl.style.opacity = '1';
            authorEl.style.opacity = '1';
        }, 400);
    }

    setInterval(rotateQuote, 6000);
}
