/**
 * Service-Net — main.js
 * Seguridad · Validación · Tracking GA4
 */

'use strict';

// ============================================================
// 1. UTILIDADES DE SEGURIDAD
// ============================================================

/**
 * Escapa caracteres especiales HTML para prevenir XSS.
 * @param {string} str
 * @returns {string}
 */
function escapeHTML(str) {
    if (typeof str !== 'string') return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Sanitiza una cadena: elimina caracteres de control y recorta espacios.
 * @param {string} str
 * @param {number} maxLength
 * @returns {string}
 */
function sanitize(str, maxLength = 500) {
    if (typeof str !== 'string') return '';
    return escapeHTML(str.replace(/[\x00-\x1F\x7F]/g, '').trim()).slice(0, maxLength);
}

/**
 * Valida formato de email con regex robusta.
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
    const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
    return re.test(email) && email.length <= 254;
}

/**
 * Service-Net — main.js
 * Seguridad · Validación · Tracking GA4
 */

'use strict';

// ============================================================
// 1. UTILIDADES DE SEGURIDAD
// ============================================================

/**
 * Escapa caracteres especiales HTML para prevenir XSS.
 * @param {string} str
 * @returns {string}
 */
function escapeHTML(str) {
    if (typeof str !== 'string') return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Sanitiza una cadena para envío a API: elimina caracteres de control y recorta espacios.
 * NO escapa HTML aquí — eso es solo para inserción en el DOM.
 * @param {string} str
 * @param {number} maxLength
 * @returns {string}
 */
function sanitize(str, maxLength = 500) {
    if (typeof str !== 'string') return '';
    return str.replace(/[\x00-\x1F\x7F]/g, '').trim().slice(0, maxLength);
}

/**
 * Valida formato de email con regex robusta.
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
    const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
    return re.test(email) && email.length <= 254;
}

/**
 * Valida formato de teléfono argentino y general.
 * @param {string} phone
 * @returns {boolean}
 */
function isValidPhone(phone) {
    return /^[\d\s\-\+\(\)]{6,25}$/.test(phone);
}

// ============================================================
// 2. GA4 WRAPPER — envía eventos solo si gtag está disponible
// ============================================================

/**
 * Envía un evento a GA4 de forma segura.
 * @param {string} eventName
 * @param {Object} params
 */
function trackEvent(eventName, params = {}) {
    if (typeof window.gtag === 'function') {
        window.gtag('event', eventName, params);
    }
    // Debug en desarrollo (quitar en producción si se prefiere):
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.debug('[GA4]', eventName, params);
    }
}

// ============================================================
// 3. INICIALIZACIÓN PRINCIPAL
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

    // -- 3.1 Año dinámico en footer --
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // -- 3.2 Tracking de profundidad de scroll --
    let scrollMilestones = { 25: false, 50: false, 75: false, 90: false };
    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                const scrollable = document.documentElement.scrollHeight - window.innerHeight;
                if (scrollable <= 0) { ticking = false; return; }
                const pct = Math.round((window.scrollY / scrollable) * 100);

                Object.keys(scrollMilestones).forEach(milestone => {
                    if (pct >= parseInt(milestone) && !scrollMilestones[milestone]) {
                        scrollMilestones[milestone] = true;
                        trackEvent('scroll_depth', { percent: parseInt(milestone) });
                    }
                });
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    // -- 3.3 Tracking clicks en WhatsApp --
    document.querySelectorAll('#wa-btn, #wa-footer-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            trackEvent('click_whatsapp', { location: btn.id });
        });
    });

    // -- 3.4 Navbar activa en scroll --
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 50);
        }, { passive: true });
    }

    // -- 3.5 Cerrar menú móvil al hacer click en un link --
    const menuToggle = document.getElementById('menu-toggle');
    if (menuToggle) {
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.checked = false;
            });
        });
    }

    // -- 3.6 Carrusel de clientes --
    initCarousel();

    // -- 3.7 Formulario --
    initForm();

    // -- 3.8 Tracking de tiempo en página (engagement) --
    let engagementLogged = false;
    setTimeout(() => {
        if (!engagementLogged) {
            engagementLogged = true;
            trackEvent('user_engagement', { time_on_page: 30 });
        }
    }, 30000);
});

// ============================================================
// 4. CARRUSEL DE CLIENTES
// ============================================================

function initCarousel() {
    const track = document.getElementById('clientes');
    const btnPrev = document.querySelector('.carousel-clientes .prev');
    const btnNext = document.querySelector('.carousel-clientes .next');

    if (!track || !btnPrev || !btnNext) return;

    const items = track.children;
    const total = items.length;
    if (total === 0) return;

    let index = 0;
    let autoplayInterval = null;
    const itemWidth = items[0].offsetWidth || 250;

    function goTo(i) {
        index = ((i % total) + total) % total; // wrap circular
        track.style.transform = `translateX(-${index * itemWidth}px)`;
        // Actualiza viewport accesible
        const viewport = track.closest('[aria-live]');
        if (viewport && items[index]) {
            // No necesitamos cambiar texto, el cambio visual es suficiente
        }
    }

    btnNext.addEventListener('click', () => {
        goTo(index + 1);
        resetAutoplay();
    });

    btnPrev.addEventListener('click', () => {
        goTo(index - 1);
        resetAutoplay();
    });

    // Soporte teclado
    [btnPrev, btnNext].forEach(btn => {
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                btn.click();
            }
        });
    });

    // Autoplay
    function startAutoplay() {
        autoplayInterval = setInterval(() => goTo(index + 1), 4000);
    }

    function resetAutoplay() {
        clearInterval(autoplayInterval);
        startAutoplay();
    }

    // Pausa en hover/focus
    const carouselEl = track.closest('.carousel-clientes');
    if (carouselEl) {
        carouselEl.addEventListener('mouseenter', () => clearInterval(autoplayInterval));
        carouselEl.addEventListener('focusin', () => clearInterval(autoplayInterval));
        carouselEl.addEventListener('mouseleave', startAutoplay);
        carouselEl.addEventListener('focusout', startAutoplay);
    }

    startAutoplay();
}

// ============================================================
// 5. FORMULARIO — Validación, Honeypot, Envío
// ============================================================

function initForm() {
    const form = document.getElementById('leadForm');
    if (!form) return;

    const submitBtn = document.getElementById('submitBtn');
    const successMsg = document.getElementById('form-success');

    // Rate limiting simple por sesión (evita spam de formulario)
    let submitCount = parseInt(sessionStorage.getItem('sn_submits') || '0', 10);
    const MAX_SUBMITS = 3;

    // Validación en tiempo real (blur)
    const fields = [
        { id: 'name', errorId: 'name-error', validate: v => v.length >= 2 && v.length <= 80, msg: 'Ingresá tu nombre (mínimo 2 caracteres).' },
        { id: 'email', errorId: 'email-error', validate: isValidEmail, msg: 'Ingresá un email válido.' },
        { id: 'phone', errorId: 'phone-error', validate: isValidPhone, msg: 'Ingresá un teléfono válido (solo números, espacios y guiones).' },
        { id: 'message', errorId: 'message-error', validate: v => v.length >= 10 && v.length <= 1000, msg: 'El mensaje debe tener entre 10 y 1000 caracteres.' }
    ];

    fields.forEach(({ id, errorId, validate, msg }) => {
        const input = document.getElementById(id);
        const errorEl = document.getElementById(errorId);
        if (!input || !errorEl) return;

        input.addEventListener('blur', () => {
            const val = input.value.trim();
            if (!validate(val) && val !== '') {
                showError(input, errorEl, msg);
            } else {
                clearError(input, errorEl);
            }
        });

        input.addEventListener('input', () => {
            if (input.getAttribute('aria-invalid') === 'true') {
                const val = input.value.trim();
                if (validate(val)) clearError(input, errorEl);
            }
        });
    });

    // Submit
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Honeypot check — si tiene valor, es un bot
        const honeypot = document.getElementById('honeypot');
        if (honeypot && honeypot.value.trim() !== '') {
            // Silenciosamente rechazamos sin feedback al bot
            form.reset();
            return;
        }

        // Rate limit
        if (submitCount >= MAX_SUBMITS) {
            showGlobalError(form, 'Has enviado demasiadas solicitudes. Por favor contactanos directamente por WhatsApp.');
            return;
        }

        // Validar todos los campos
        let valid = true;
        fields.forEach(({ id, errorId, validate, msg }) => {
            const input = document.getElementById(id);
            const errorEl = document.getElementById(errorId);
            if (!input || !errorEl) return;
            const val = input.value.trim();
            if (!validate(val)) {
                showError(input, errorEl, msg);
                valid = false;
            }
        });

        if (!valid) return;

        // Sanitizar datos antes de procesar
        const data = {
            name: sanitize(document.getElementById('name').value, 80),
            email: sanitize(document.getElementById('email').value, 120),
            phone: sanitize(document.getElementById('phone').value, 25),
            service: sanitize(document.getElementById('service').value, 30),
            message: sanitize(document.getElementById('message').value, 1000)
        };

        // Deshabilitar botón durante envío
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Enviando...';
        }

        // Incrementar contador de envíos
        submitCount++;
        sessionStorage.setItem('sn_submits', submitCount.toString());

        // Tracking GA4
        trackEvent('form_submission', {
            service_selected: data.service,
            has_phone: data.phone !== ''
        });

        fetch(form.action, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                name: data.name,
                email: data.email,
                phone: data.phone,
                service: data.service,
                message: data.message,
                _subject: `Nuevo contacto Service-Net — ${data.service || 'sin servicio'}`,
                _replyto: data.email
            })
        })
        .then(res => {
            if (res.ok) {
                form.classList.add('hidden');
                if (successMsg) successMsg.classList.remove('hidden');
                trackEvent('form_submission_success', { service_selected: data.service });
            } else {
                return res.json().then(err => {
                    console.error('Formspree error:', err);
                    throw new Error(err?.error || `Error ${res.status}`);
                });
            }
        })
        .catch((err) => {
            console.error('Fetch error:', err);
            showGlobalError(form, 'Hubo un error al enviar. Por favor contactanos por WhatsApp.');
            trackEvent('form_submission_error');
        })
        .finally(() => {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Enviar Solicitud';
            }
        });
    });
}

function showError(input, errorEl, msg) {
    input.setAttribute('aria-invalid', 'true');
    errorEl.textContent = msg;
    errorEl.classList.add('visible');
}

function clearError(input, errorEl) {
    input.removeAttribute('aria-invalid');
    errorEl.textContent = '';
    errorEl.classList.remove('visible');
}

function showGlobalError(form, msg) {
    let globalErr = form.querySelector('.global-error');
    if (!globalErr) {
        globalErr = document.createElement('p');
        globalErr.className = 'global-error field-error visible';
        globalErr.style.gridColumn = 'span 2';
        form.appendChild(globalErr);
    }
    globalErr.textContent = msg;
    globalErr.classList.add('visible');
}