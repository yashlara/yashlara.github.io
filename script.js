// ========================================
// Respect the visitor's motion preference
// ========================================
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
    '.logos-strip, .section-title, .about-content, .timeline-item, .contact-content, .currently-reading, .rotating-quote'
);

animatedElements.forEach(el => el.classList.add('fade-in'));

// Groups whose children should arrive in sequence rather than together
document.querySelectorAll('.work-rail, .metrics-grid, .value-list, .publications-list')
    .forEach(group => {
        group.classList.add('stagger');
        [...group.children].forEach((child, i) => {
            child.style.transitionDelay = Math.min(i * 70, 560) + 'ms';
        });
    });

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

document.querySelectorAll('.stagger').forEach(el => observer.observe(el));

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
                if (match && !prefersReducedMotion) {
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

    if (!prefersReducedMotion) setInterval(rotateQuote, 6000);
}

// ========================================
// Hero bokeh field
// Soft coral shapes drifting behind the hero type. Canvas 2D:
// radial gradients are inherently soft, so no blur filter or
// shader is required, which keeps this cheap on a laptop GPU.
// ========================================
(function () {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const hero = canvas.parentElement;

    // Sampled from the reference render, lightened enough that the
    // plum type clears WCAG AA against the field.
    // Meadow: forest ground, coral and gold blooms blurred through it
    const GROUND = ['#3d5136', '#26351f'];
    const BLOBS = ['#d97e5c', '#e0a24f', '#7d9150', '#c9683f', '#b5c07a'];

    const COUNT = 20;
    let w = 0, h = 0, dpr = 1, shapes = [], raf = null, running = false;

    // Pointer influence, smoothed. Target is where the cursor is;
    // current chases it so the field eases rather than snaps.
    const ptr = { tx: 0.5, ty: 0.5, x: 0.5, y: 0.5, active: false };
    const EASE = 0.045;      // how fast the field catches up
    const PUSH = 0.30;       // how far a shape is displaced, fraction of hero

    function seed() {
        shapes = [];
        for (let i = 0; i < COUNT; i++) {
            shapes.push({
                x: Math.random(),
                y: Math.random(),
                r: 0.09 + Math.random() * 0.17,   // radius, fraction of width
                stretch: 3.0 + Math.random() * 3.2, // elongation
                color: BLOBS[i % BLOBS.length],
                alpha: 0.30 + Math.random() * 0.30,
                vx: (Math.random() - 0.5) * 0.000055,
                vy: (Math.random() - 0.5) * 0.000034,
                dir: Math.random() < 0.5 ? -1 : 1   // half lead, half trail
            });
        }
    }

    function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        w = hero.clientWidth;
        h = hero.clientHeight;
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    // Grain tile — built once, then tiled over the field. The reference
    // image is heavily grained; without it the gradients look plastic.
    let grain = null;
    function buildGrain() {
        const S = 140;
        const g = document.createElement('canvas');
        g.width = g.height = S;
        const gx = g.getContext('2d');
        const img = gx.createImageData(S, S);
        for (let i = 0; i < img.data.length; i += 4) {
            const v = 128 + (Math.random() - 0.5) * 255;
            img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
            img.data[i + 3] = 26;
        }
        gx.putImageData(img, 0, 0);
        grain = ctx.createPattern(g, 'repeat');
    }

    function draw(t) {
        // Base wash
        const g = ctx.createLinearGradient(0, 0, w * 0.6, h);
        g.addColorStop(0, GROUND[0]);
        g.addColorStop(1, GROUND[1]);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);

        // Drifting bokeh, drawn as stretched radial gradients rotated
        // together so the field reads as diagonal streaks.
        const ANGLE = -0.62; // ~-35deg
        shapes.forEach(s => {
            let cx = ((s.x + s.vx * t) % 1.2 - 0.1) * w;
            let cy = ((s.y + s.vy * t) % 1.2 - 0.1) * h;

            // Parallax: nearer (larger) shapes react more, which reads
            // as depth rather than the whole field sliding together.
            const depth = s.r / 0.31;
            cx += (ptr.x - 0.5) * PUSH * w * depth * s.dir;
            cy += (ptr.y - 0.5) * PUSH * h * depth * s.dir * 0.6;

            const rad = s.r * w;

            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(ANGLE);
            ctx.scale(s.stretch, 1);
            const rg = ctx.createRadialGradient(0, 0, 0, 0, 0, rad);
            rg.addColorStop(0, s.color);
            rg.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.globalAlpha = s.alpha;
            ctx.fillStyle = rg;
            ctx.beginPath();
            ctx.arc(0, 0, rad, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
        // A soft light tracking the pointer. Screen blending lifts the
        // field where the cursor is, which reads far more clearly than
        // displacement alone.
        if (!prefersReducedMotion) {
            const lx = ptr.x * w, ly = ptr.y * h;
            const lr = Math.max(w, h) * 0.40;
            const lg = ctx.createRadialGradient(lx, ly, 0, lx, ly, lr);
            lg.addColorStop(0, 'rgba(233, 196, 122, 0.17)');
            lg.addColorStop(0.45, 'rgba(217, 126, 92, 0.09)');
            lg.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.globalCompositeOperation = 'screen';
            ctx.fillStyle = lg;
            ctx.fillRect(0, 0, w, h);
            ctx.globalCompositeOperation = 'source-over';
        }

        // Scrim: the blooms are bright enough that cream type would sit
        // on 1.45:1 in places. A soft dark pool where the type lives keeps
        // it readable without dulling the field at the edges.
        const sc = ctx.createRadialGradient(w * 0.5, h * 0.52, 0, w * 0.5, h * 0.52, Math.max(w, h) * 0.55);
        sc.addColorStop(0, 'rgba(20, 32, 18, 0.88)');
        sc.addColorStop(0.55, 'rgba(20, 32, 18, 0.72)');
        sc.addColorStop(1, 'rgba(20, 32, 18, 0.10)');
        ctx.fillStyle = sc;
        ctx.fillRect(0, 0, w, h);

        if (grain) {
            ctx.globalCompositeOperation = 'overlay';
            ctx.fillStyle = grain;
            ctx.fillRect(0, 0, w, h);
            ctx.globalCompositeOperation = 'source-over';
        }

        ctx.globalAlpha = 1;
    }

    function frame() {
        ptr.x += (ptr.tx - ptr.x) * EASE;
        ptr.y += (ptr.ty - ptr.y) * EASE;
        draw(performance.now());
        raf = requestAnimationFrame(frame);
    }

    function start() {
        if (running || prefersReducedMotion) return;
        running = true;
        frame();
    }

    function stop() {
        running = false;
        if (raf) cancelAnimationFrame(raf);
        raf = null;
    }

    function init() {
        resize();
        seed();
        buildGrain();
        // Exposed so the drift can be frozen when verifying pointer response
        if (window.__heroDebug !== undefined) window.__heroShapes = shapes;
        if (prefersReducedMotion) {
            draw(0);          // one still frame, no animation
        } else {
            start();
        }
    }

    init();

    // Pointer tracking — skipped entirely under reduced motion
    if (!prefersReducedMotion) {
        hero.addEventListener('pointermove', e => {
            const r = hero.getBoundingClientRect();
            ptr.tx = (e.clientX - r.left) / r.width;
            ptr.ty = (e.clientY - r.top) / r.height;
            ptr.active = true;
        }, { passive: true });

        // Drift back to centre when the pointer leaves
        hero.addEventListener('pointerleave', () => {
            ptr.tx = 0.5;
            ptr.ty = 0.5;
            ptr.active = false;
        }, { passive: true });
    }

    let rt;
    window.addEventListener('resize', () => {
        clearTimeout(rt);
        rt = setTimeout(() => { resize(); draw(performance.now()); }, 150);
    });

    // Don't burn frames when the hero is offscreen or the tab is hidden
    if ('IntersectionObserver' in window) {
        new IntersectionObserver(entries => {
            entries.forEach(e => e.isIntersecting ? start() : stop());
        }, { threshold: 0 }).observe(hero);
    }
    document.addEventListener('visibilitychange', () => {
        document.hidden ? stop() : start();
    });
})();

// ========================================
// Work rail — nudge buttons + edge state
// Native scroll-snap does the scrolling; this only drives the
// buttons and their disabled state.
// ========================================
(function () {
    const rail = document.getElementById('work-rail');
    const prev = document.getElementById('rail-prev');
    const next = document.getElementById('rail-next');
    if (!rail || !prev || !next) return;

    function step() {
        const card = rail.querySelector('.work-card');
        if (!card) return rail.clientWidth * 0.8;
        const gap = parseFloat(getComputedStyle(rail).columnGap) || 20;
        return card.getBoundingClientRect().width + gap;
    }

    function sync() {
        const max = rail.scrollWidth - rail.clientWidth;
        // scroll-snap settles on the first card's snap point, which sits
        // at the rail's inline padding rather than exactly 0.
        const pad = parseFloat(getComputedStyle(rail).paddingLeft) || 0;
        prev.disabled = rail.scrollLeft <= pad + 4;
        next.disabled = rail.scrollLeft >= max - 4;
    }

    prev.addEventListener('click', () => rail.scrollBy({ left: -step(), behavior: prefersReducedMotion ? 'auto' : 'smooth' }));
    next.addEventListener('click', () => rail.scrollBy({ left: step(), behavior: prefersReducedMotion ? 'auto' : 'smooth' }));
    rail.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    sync();
})();

// ========================================
// Values list — active item + drawn connector
// The line is generated from the live positions of the active
// name and its panel, so it stays correct through resize and
// reflow rather than being a fixed path.
// ========================================
(function () {
    const wrap = document.querySelector('.values');
    const list = document.getElementById('value-list');
    const svg = document.getElementById('value-link');
    const path = document.getElementById('value-path');
    if (!wrap || !list || !svg || !path) return;

    const items = [...list.querySelectorAll('.value-item')];
    const panels = [...wrap.querySelectorAll('.value-panel')];
    let active = 0;

    function drawLink() {
        if (window.innerWidth <= 860) return;
        const box = wrap.getBoundingClientRect();
        const name = items[active].querySelector('.value-name').getBoundingClientRect();
        const panel = panels[active].getBoundingClientRect();

        const x1 = name.right - box.left + 14;
        const y1 = name.top - box.top + name.height / 2;
        const x2 = panel.left - box.left - 14;
        const y2 = panel.top - box.top + 26;

        const dx = Math.max(40, (x2 - x1) * 0.5);
        // A loop in the middle, the way a hand-drawn connector wanders
        const loopR = Math.min(26, Math.abs(x2 - x1) * 0.16);
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2;

        const d = [
            `M ${x1.toFixed(1)} ${y1.toFixed(1)}`,
            `C ${(x1 + dx * 0.5).toFixed(1)} ${y1.toFixed(1)}, ${(mx - loopR).toFixed(1)} ${(my + loopR * 1.5).toFixed(1)}, ${mx.toFixed(1)} ${my.toFixed(1)}`,
            `C ${(mx + loopR).toFixed(1)} ${(my - loopR * 1.5).toFixed(1)}, ${(x2 - dx * 0.5).toFixed(1)} ${y2.toFixed(1)}, ${x2.toFixed(1)} ${y2.toFixed(1)}`
        ].join(' ');

        svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
        path.setAttribute('d', d);
        // Re-trigger the draw
        path.classList.remove('drawn');
        void path.getBoundingClientRect();
        path.classList.add('drawn');
    }

    function setActive(i) {
        if (i === active) return;
        active = i;
        items.forEach((el, n) => {
            el.classList.toggle('is-active', n === i);
            el.querySelector('.value-name').setAttribute('aria-expanded', String(n === i));
        });
        panels.forEach((el, n) => el.classList.toggle('is-active', n === i));
        drawLink();
    }

    items.forEach((el, i) => {
        const btn = el.querySelector('.value-name');
        btn.addEventListener('mouseenter', () => setActive(i));
        btn.addEventListener('focus', () => setActive(i));
        btn.addEventListener('click', () => setActive(i));
    });

    // Scroll advances through the values while the section is in view
    if ('IntersectionObserver' in window && !prefersReducedMotion) {
        new IntersectionObserver(entries => {
            entries.forEach(e => { if (e.isIntersecting) drawLink(); });
        }, { threshold: 0.35 }).observe(wrap);
    }

    let vt;
    window.addEventListener('resize', () => { clearTimeout(vt); vt = setTimeout(drawLink, 140); });
    window.addEventListener('load', drawLink);
    setTimeout(drawLink, 300);
})();
