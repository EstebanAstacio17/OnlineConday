/**
 * CONDAY - CONDOMINIO AL DÍA
 * Scripts interactivos, Cotizador de Cuotas Dinámico con Rangos por Tipo de Inmueble & Form Handlers
 */

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initScrollEffects();
    initInteractiveCalculator();
    initContactForms();
    initPortfolioFilters();
});

/* ==========================================================================
   1. Navegación Activa y Scroll Effects
   ========================================================================== */
function initNavigation() {
    const currentURL = window.location.pathname.toLowerCase();
    const navLinks = document.querySelectorAll('.navbar-custom .nav-link');

    navLinks.forEach(link => {
        const href = link.getAttribute('href')?.toLowerCase() || '';
        if (currentURL.endsWith('/') || currentURL.endsWith('index.html')) {
            if (href.includes('index.html') || href === '#' || href === '/') {
                link.classList.add('active');
            }
        } else if (href.includes('nosotros') && currentURL.includes('nosotros')) {
            link.classList.add('active');
        } else if (href.includes('servicios') && currentURL.includes('servicios')) {
            link.classList.add('active');
        } else if (href.includes('portafolio') && currentURL.includes('portafolio')) {
            link.classList.add('active');
        } else if (href.includes('solicitudes') && currentURL.includes('solicitudes')) {
            link.classList.add('active');
        } else if (href.includes('contacto') && currentURL.includes('contacto')) {
            link.classList.add('active');
        }
    });
}

function initScrollEffects() {
    const navbar = document.querySelector('.navbar-custom');
    const btnTop = document.getElementById('btnTop');

    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrollY = window.scrollY;

                if (navbar) {
                    if (scrollY > 40) navbar.classList.add('scrolled');
                    else navbar.classList.remove('scrolled');
                }

                if (btnTop) {
                    if (scrollY > 300) btnTop.style.display = 'flex';
                    else btnTop.style.display = 'none';
                }

                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    if (btnTop) {
        btnTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

/* ==========================================================================
   2. Cotizador Inteligente Dinámico con Rangos por Tipo de Inmueble (Optimizado)
   ========================================================================== */
function initInteractiveCalculator() {
    const calcUnitsSlider = document.getElementById('calcUnits');
    const calcUnitsInput = document.getElementById('calcUnitsNumber');
    const calcUnitsVal = document.getElementById('calcUnitsVal');
    const calcRangeMin = document.getElementById('calcRangeMin');
    const calcRangeMax = document.getElementById('calcRangeMax');
    const calcPropertyTypes = document.querySelectorAll('input[name="propType"]');
    const calcServices = document.querySelectorAll('.calc-service-check');
    const resultEstTotal = document.getElementById('calcResultTotal');
    const resultPerUnit = document.getElementById('calcResultPerUnit');
    const btnSendWhatsAppQuote = document.getElementById('btnSendWhatsAppQuote');
    const macroBanner = document.getElementById('calcMacroBanner');
    const presetContainer = document.getElementById('calcPresetPills');

    if (!calcUnitsSlider || !resultPerUnit) return;

    // Configuración calibrada al mercado dominicano real
    const TYPE_CONFIG = {
        torre: {
            min: 6,
            max: 50,
            default: 20,
            step: 1,
            basePrice: 1650, // RD$ 1,650 base para torres (elevador + planta)
            name: "Torre Residencial con Elevador",
            minLabel: "6 aptos",
            maxLabel: "50 aptos",
            presets: [8, 12, 18, 24, 36, 48]
        },
        residencial: {
            min: 16,
            max: 10000,
            default: 48,
            step: 2,
            basePrice: 1150, // RD$ 1,150 base para residenciales cerrados
            name: "Residencial Cerrado / Complejo Habitacional",
            minLabel: "16 unidades",
            maxLabel: "10,000 unidades",
            presets: [24, 48, 96, 180, 400, 1000, 5000, 10000]
        },
        macro: {
            min: 10001,
            max: 50000,
            default: 12000,
            step: 500,
            basePrice: 900, // RD$ 900 mínimo estricto solicitado
            name: "Macro-Proyecto (+10,000 unidades / Ciudad Satélite)",
            minLabel: "10,001",
            maxLabel: "50,000+ unidades",
            presets: [10001, 15000, 20000, 30000, 50000]
        },
        villas: {
            min: 10,
            max: 800,
            default: 36,
            step: 2,
            basePrice: 1600, // RD$ 1,600 para complejos de villas
            name: "Comunidad de Villas / Townhouses",
            minLabel: "10 villas",
            maxLabel: "800 villas",
            presets: [16, 32, 64, 120, 250, 500]
        },
        comercial: {
            min: 4,
            max: 200,
            default: 24,
            step: 1,
            basePrice: 2200, // RD$ 2,200 para plazas comerciales
            name: "Plaza Comercial / Corporativa",
            minLabel: "4 locales",
            maxLabel: "200 locales",
            presets: [8, 16, 24, 48, 100, 200]
        }
    };

    let currentTypeKey = 'residencial';

    function renderPresets(presets) {
        if (!presetContainer) return;
        presetContainer.innerHTML = '';
        presets.forEach(p => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'btn btn-sm btn-outline-secondary py-1 px-2 me-1 mb-1 fw-semibold';
            btn.style.fontSize = '0.78rem';
            btn.textContent = p.toLocaleString('es-DO') + (p === 10001 ? '+' : '');
            btn.addEventListener('click', () => {
                calcUnitsSlider.value = p;
                if (calcUnitsInput) calcUnitsInput.value = p;
                calculateEstimate();
            });
            presetContainer.appendChild(btn);
        });
    }

    function updateTypeBounds() {
        calcPropertyTypes.forEach(radio => {
            if (radio.checked) {
                currentTypeKey = radio.value;
            }
        });

        const cfg = TYPE_CONFIG[currentTypeKey] || TYPE_CONFIG.residencial;

        calcUnitsSlider.min = cfg.min;
        calcUnitsSlider.max = cfg.max;
        calcUnitsSlider.step = cfg.step;

        let val = parseInt(calcUnitsSlider.value, 10);
        if (isNaN(val) || val < cfg.min || val > cfg.max) {
            val = cfg.default;
            calcUnitsSlider.value = val;
        }

        if (calcUnitsInput) {
            calcUnitsInput.min = cfg.min;
            calcUnitsInput.max = cfg.max;
            calcUnitsInput.value = val;
        }

        if (calcUnitsVal) calcUnitsVal.textContent = val.toLocaleString('es-DO');
        if (calcRangeMin) calcRangeMin.textContent = cfg.minLabel;
        if (calcRangeMax) calcRangeMax.textContent = cfg.maxLabel;

        if (macroBanner) {
            if (currentTypeKey === 'macro') {
                macroBanner.classList.remove('d-none');
            } else {
                macroBanner.classList.add('d-none');
            }
        }

        renderPresets(cfg.presets);
        calculateEstimate();
    }

    function calculateEstimate() {
        const cfg = TYPE_CONFIG[currentTypeKey] || TYPE_CONFIG.residencial;
        let units = parseInt(calcUnitsSlider.value, 10) || cfg.default;

        if (calcUnitsInput && parseInt(calcUnitsInput.value, 10) !== units) {
            calcUnitsInput.value = units;
        }
        if (calcUnitsVal) {
            calcUnitsVal.textContent = units.toLocaleString('es-DO');
        }

        let baseCost = cfg.basePrice;

        // Modificadores de servicios en el mercado dominicano
        let serviceMultiplier = 1.0;
        let selectedServicesList = [];
        calcServices.forEach(chk => {
            if (chk.checked) {
                serviceMultiplier += parseFloat(chk.dataset.add || 0.1);
                selectedServicesList.push(chk.dataset.serviceName || chk.value);
            }
        });

        // Curva de escala realista por volumen
        let scaleFactor = 1.0;
        if (currentTypeKey === 'macro') {
            // Para macro-proyectos: mínimo absoluto de RD$ 900 base
            scaleFactor = 1.0;
        } else {
            if (units > 8000) scaleFactor = 0.42;
            else if (units > 4000) scaleFactor = 0.50;
            else if (units > 1500) scaleFactor = 0.60;
            else if (units > 600) scaleFactor = 0.70;
            else if (units > 250) scaleFactor = 0.78;
            else if (units > 90) scaleFactor = 0.86;
            else if (units > 36) scaleFactor = 0.94;
            else if (units < 12) scaleFactor = 1.20;
        }

        let calculated = baseCost * serviceMultiplier * scaleFactor;
        
        if (currentTypeKey === 'macro') {
            // Garantizar piso mínimo de RD$ 900 base multiplicada por servicios adicionales
            calculated = Math.max(900 * serviceMultiplier, calculated);
        }

        const estPerUnit = Math.max(currentTypeKey === 'macro' ? 900 : 300, Math.round(calculated / 25) * 25);
        const estTotal = estPerUnit * units;

        // Actualizar UI
        resultPerUnit.textContent = `RD$ ${estPerUnit.toLocaleString('es-DO')}`;
        if (resultEstTotal) {
            resultEstTotal.textContent = `RD$ ${estTotal.toLocaleString('es-DO')}`;
        }

        // WhatsApp Link con advertencia
        if (btnSendWhatsAppQuote) {
            const message = encodeURIComponent(
                `¡Hola CONDAY! Utilicé su estimador de cuotas en línea y solicito una cotización formal personalizada:

` +
                `🏢 Inmueble: ${cfg.name}
` +
                `🔢 Unidades: ${units.toLocaleString('es-DO')}
` +
                `💵 Estimado de referencia: RD$ ${estPerUnit.toLocaleString('es-DO')} / unidad/mes (Total aprox: RD$ ${estTotal.toLocaleString('es-DO')}/mes)
` +
                `📋 Servicios de interés: ${selectedServicesList.join(', ')}

` +
                `Entiendo que este valor es una referencia orientativa y deseo agendar una inspección técnica o reunión para la propuesta definitiva.`
            );
            btnSendWhatsAppQuote.href = `https://wa.me/18094401853?text=${message}`;
        }
    }

    // Eventos
    calcPropertyTypes.forEach(r => r.addEventListener('change', updateTypeBounds));

    calcUnitsSlider.addEventListener('input', () => {
        if (calcUnitsInput) calcUnitsInput.value = calcUnitsSlider.value;
        calculateEstimate();
    });

    if (calcUnitsInput) {
        calcUnitsInput.addEventListener('input', () => {
            const cfg = TYPE_CONFIG[currentTypeKey] || TYPE_CONFIG.residencial;
            let val = parseInt(calcUnitsInput.value, 10);
            if (!isNaN(val)) {
                calcUnitsSlider.value = Math.min(cfg.max, Math.max(cfg.min, val));
                calculateEstimate();
            }
        });
        calcUnitsInput.addEventListener('blur', () => {
            const cfg = TYPE_CONFIG[currentTypeKey] || TYPE_CONFIG.residencial;
            let val = parseInt(calcUnitsInput.value, 10);
            if (isNaN(val) || val < cfg.min) val = cfg.min;
            if (val > cfg.max) val = cfg.max;
            calcUnitsInput.value = val;
            calcUnitsSlider.value = val;
            calculateEstimate();
        });
    }

    calcServices.forEach(s => s.addEventListener('change', calculateEstimate));

    // Inicializar
    updateTypeBounds();
}

/* ==========================================================================
   3. Manejo Seguro de Formularios y Feedback en Pantalla
   ========================================================================== */
function initContactForms() {
    const contactForm = document.getElementById('condayContactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitBtn = contactForm.querySelector('button[type="submit"]');

            const name = document.getElementById('nombre')?.value.trim() || '';
            const email = document.getElementById('email')?.value.trim() || '';
            const phone = document.getElementById('telefono')?.value.trim() || '';
            const condoName = document.getElementById('condominio')?.value.trim() || 'No especificado';
            const message = document.getElementById('mensaje')?.value.trim() || '';

            if (!name || !email || !phone) {
                alert('Por favor complete los campos obligatorios.');
                return;
            }

            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Enviando...';

            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '¡Mensaje Enviado con Éxito! ✓';
                submitBtn.classList.remove('btn-primary-custom', 'btn-teal-custom');
                submitBtn.classList.add('btn-success');

                const alertBox = document.getElementById('formSuccessAlert');
                if (alertBox) alertBox.classList.remove('d-none');

                const wpLink = `https://wa.me/18094401853?text=${encodeURIComponent(
                    `Hola CONDAY, acabo de enviar una solicitud desde su sitio web:
` +
                    `Nombre: ${name}
` +
                    `Condominio: ${condoName}
` +
                    `Teléfono: ${phone}
` +
                    `Mensaje: ${message}`
                )}`;

                const btnWpDirect = document.getElementById('btnFormWhatsApp');
                if (btnWpDirect) {
                    btnWpDirect.href = wpLink;
                    btnWpDirect.classList.remove('d-none');
                }

                contactForm.reset();
            }, 1000);
        });
    }

    const requestForm = document.getElementById('condayRequestForm');
    if (requestForm) {
        requestForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitBtn = requestForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Registrando solicitud...';

            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Solicitud Registrada ✓';
                submitBtn.classList.add('btn-success');

                const alertBox = document.getElementById('requestSuccessAlert');
                if (alertBox) alertBox.classList.remove('d-none');
                requestForm.reset();
            }, 900);
        });
    }
}

/* ==========================================================================
   4. Filtro de Proyectos en Portafolio
   ========================================================================== */
function initPortfolioFilters() {
    const filterBtns = document.querySelectorAll('.portfolio-filter-btn');
    const projectCards = document.querySelectorAll('.portfolio-item-col');

    if (!filterBtns.length || !projectCards.length) return;

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active', 'btn-teal-custom'));
            filterBtns.forEach(b => b.classList.add('btn-outline-custom'));
            btn.classList.add('active', 'btn-teal-custom');
            btn.classList.remove('btn-outline-custom');

            const filterValue = btn.getAttribute('data-filter');

            projectCards.forEach(card => {
                if (filterValue === 'all' || card.getAttribute('data-zone') === filterValue) {
                    card.style.display = 'block';
                    card.style.animation = 'fadeIn 0.35s ease';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}
