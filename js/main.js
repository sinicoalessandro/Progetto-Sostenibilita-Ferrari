// Ferrari Sustainability Portal - Main Script

const mobileMenu = document.getElementById('mobile-menu');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const reportDownloadButtons = document.querySelectorAll('.ferrari-btn[data-report]');

function toggleMobileMenu(show = null) {
    const isActive = show !== null ? show : !navMenu.classList.contains('active');
    
    mobileMenu.classList.toggle('active', isActive);
    navMenu.classList.toggle('active', isActive);
    document.body.style.overflow = isActive ? 'hidden' : 'auto';
}

function scrollToSection(targetId) {
    if (targetId === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        history.pushState('', document.title, window.location.pathname + window.location.search);
        return;
    }
    
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
        const headerHeight = document.querySelector('.header').offsetHeight;
        const targetPosition = targetElement.offsetTop - headerHeight - 20;
        
        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
        history.pushState(null, null, `#${targetId}`);
    } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        history.pushState('', document.title, window.location.pathname + window.location.search);
    }
}

function initMobileMenu() {
    mobileMenu.addEventListener('click', () => toggleMobileMenu());

    navLinks.forEach(link => {
        link.addEventListener('click', () => toggleMobileMenu(false));
    });

    document.addEventListener('click', (e) => {
        if (!mobileMenu.contains(e.target) && !navMenu.contains(e.target)) {
            toggleMobileMenu(false);
        }
    });
}

function initSmoothScrolling() {
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                scrollToSection(targetId);
            }
        });
    });
}

function initHeaderScrollEffect() {
    const header = document.querySelector('.header');

    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        header.style.boxShadow = scrollTop > 50 
            ? '0 8px 32px rgba(0, 0, 0, 0.15)' 
            : '0 4px 20px rgba(255, 40, 0, 0.1)';
    });
}

function getCurrentSection(scrollPosition, windowHeight, documentHeight, sections) {
    if (scrollPosition < 200) return 'home';
    if (scrollPosition + windowHeight >= documentHeight - 200) return 'obiettivi';
    
    const obiettiviSection = document.getElementById('obiettivi');
    if (obiettiviSection && scrollPosition + windowHeight * 0.5 >= obiettiviSection.offsetTop) {
        return 'obiettivi';
    }
    
    for (const section of sections) {
        if (section.getAttribute('id') === 'obiettivi') continue;
        
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        const headerOffset = 150;
        
        if (scrollPosition + headerOffset >= sectionTop && 
            scrollPosition + headerOffset < sectionTop + sectionHeight) {
            return section.getAttribute('id');
        }
    }
    
    // Trova la sezione più vicina (escludi obiettivi)
    let closestSection = null;
    let minDistance = Infinity;
    
    sections.forEach(section => {
        if (section.getAttribute('id') === 'obiettivi') return;
        
        const distance = Math.abs(scrollPosition + 150 - section.offsetTop);
        if (distance < minDistance) {
            minDistance = distance;
            closestSection = section;
        }
    });
    
    return closestSection ? closestSection.getAttribute('id') : '';
}

function initActiveNavigation() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    window.addEventListener('scroll', () => {
        const scrollPosition = window.scrollY;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        
        const current = getCurrentSection(scrollPosition, windowHeight, documentHeight, sections);
        
        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
        });
    });
}

function initHashNavigation() {
    window.scrollTo(0, 0);
    
    if (window.location.hash) {
        history.replaceState('', document.title, window.location.pathname + window.location.search);
    }
    
    ['beforeunload', 'DOMContentLoaded', 'load'].forEach(event => {
        window.addEventListener(event, () => {
            setTimeout(() => window.scrollTo(0, 0), 0);
        });
    });
}

function initLogoScrollToTop() {
    const logo = document.querySelector('.nav-logo');
    const logoImg = document.querySelector('.logo');
    
    if (!logo) return;
    
    logo.style.cursor = 'pointer';
    
    logo.addEventListener('click', (e) => {
        e.preventDefault();
        scrollToSection('home');
    });
    
    logo.addEventListener('mouseenter', () => {
        logoImg.style.transform = 'scale(1.05)';
        logoImg.style.transition = 'transform 0.3s ease';
    });
    
    logo.addEventListener('mouseleave', () => {
        logoImg.style.transform = 'scale(1)';
    });
}

function initReportDownloads() {
    reportDownloadButtons.forEach(button => {
        button.addEventListener('click', () => {
            const reportYear = button.getAttribute('data-report');
            downloadReport(reportYear, button);
        });
    });
}

function updateButtonState(button, content, bgColor = '', disabled = false, duration = 0) {
    button.innerHTML = content;
    button.style.backgroundColor = bgColor;
    button.disabled = disabled;
    
    if (duration > 0) {
        setTimeout(() => {
            button.innerHTML = button.originalContent;
            button.className = button.originalClasses;
            button.style.backgroundColor = '';
            button.disabled = false;
        }, duration);
    }
}

function downloadReport(year, buttonElement) {
    buttonElement.originalContent = buttonElement.innerHTML;
    buttonElement.originalClasses = buttonElement.className;
    
    updateButtonState(buttonElement, '<i class="fas fa-spinner fa-spin"></i> Scaricando...', '', true);
    
    setTimeout(() => {
        const reportFiles = {
            '2024': 'reports/Ferrari_Sustainability_Report_2024.pdf',
            '2023': 'reports/Ferrari_Sustainability_Report_2023.pdf',
            '2022': 'reports/Ferrari_Sustainability_Report_2022.pdf',
            '2021': 'reports/Ferrari_Sustainability_Report_2021.pdf',
            '2020': 'reports/Ferrari_Sustainability_Report_2020.pdf'
        };
        
        const fileName = reportFiles[year];
        
        if (fileName) {
            const link = document.createElement('a');
            link.href = fileName;
            link.download = `Ferrari_Sustainability_Report_${year}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            updateButtonState(
                buttonElement, 
                '<i class="fas fa-check-circle"></i> Scaricato!', 
                '#10b981', 
                false, 
                2000
            );
        } else {
            updateButtonState(
                buttonElement, 
                '<i class="fas fa-exclamation-triangle"></i> Errore', 
                '#ef4444', 
                false, 
                2000
            );
        }
    }, 800);
}

function createScrollTopButton() {
    const button = document.createElement('button');
    button.innerHTML = '<i class="fas fa-chevron-up"></i>';
    button.className = 'scroll-to-top';
    button.setAttribute('aria-label', 'Torna in cima');
    
    button.style.cssText = `
        position: fixed; bottom: 30px; right: 30px; width: 50px; height: 50px;
        background-color: var(--ferrari-red); color: white; border: none;
        border-radius: 50%; cursor: pointer; font-size: 1.2rem; z-index: 1000;
        transition: all 0.3s ease; opacity: 0; visibility: hidden;
        transform: translateY(20px); box-shadow: 0 4px 20px rgba(255, 40, 0, 0.3);
    `;
    
    return button;
}

function initScrollToTop() {
    const scrollTopButton = createScrollTopButton();
    document.body.appendChild(scrollTopButton);
    
    window.addEventListener('scroll', () => {
        const isVisible = window.scrollY > 300;
        scrollTopButton.style.opacity = isVisible ? '1' : '0';
        scrollTopButton.style.visibility = isVisible ? 'visible' : 'hidden';
        scrollTopButton.style.transform = isVisible ? 'translateY(0)' : 'translateY(20px)';
    });
    
    scrollTopButton.addEventListener('click', () => scrollToSection('home'));
    
    scrollTopButton.addEventListener('mouseenter', () => {
        scrollTopButton.style.backgroundColor = 'var(--ferrari-dark-red)';
        scrollTopButton.style.transform = 'translateY(-2px)';
    });
    
    scrollTopButton.addEventListener('mouseleave', () => {
        scrollTopButton.style.backgroundColor = 'var(--ferrari-red)';
        scrollTopButton.style.transform = 'translateY(0)';
    });
}

function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                
                if (entry.target.classList.contains('circular-progress') && 
                    !entry.target.hasAttribute('data-animated')) {
                    animateCircularProgress(entry.target);
                    entry.target.setAttribute('data-animated', 'true');
                }
            }
        });
    }, observerOptions);
    
    const elementsToAnimate = document.querySelectorAll(
        '.sustainability-card, .report-card, .intro-image-left, .intro-image-right, .circular-progress'
    );
    
    elementsToAnimate.forEach(element => {
        const isImageOrProgress = element.classList.contains('intro-image-left') || 
                                 element.classList.contains('intro-image-right') || 
                                 element.classList.contains('circular-progress');
        
        if (!isImageOrProgress) {
            Object.assign(element.style, {
                opacity: '0',
                transform: 'translateY(30px)',
                transition: 'opacity 0.6s ease, transform 0.6s ease'
            });
        }
        observer.observe(element);
    });
    
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        Object.assign(heroContent.style, {
            opacity: '0',
            transform: 'translateY(30px)',
            transition: 'opacity 0.6s ease, transform 0.6s ease'
        });
        
        setTimeout(() => heroContent.classList.add('animate-in'), 300);
    }
}

function animateCircularProgress(element) {
    const percentage = parseInt(element.getAttribute('data-percentage'));
    const degrees = (percentage / 100) * 360;
    let currentDegrees = 0;
    const increment = degrees / 60;
    
    const animate = () => {
        if (currentDegrees < degrees) {
            currentDegrees += increment;
            element.style.setProperty('--progress-deg', currentDegrees + 'deg');
            requestAnimationFrame(animate);
        } else {
            element.style.setProperty('--progress-deg', degrees + 'deg');
        }
    };
    
    setTimeout(animate, 200);
}

function addAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .animate-in { opacity: 1 !important; transform: translateY(0) !important; }
        .nav-link.active::after { width: 100%; }
    `;
    document.head.appendChild(style);
}

function initLazyLoading() {
    const images = document.querySelectorAll('img:not(.logo):not(.hero-img):not(.intro-photo)');
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                Object.assign(img.style, {
                    opacity: '0',
                    transition: 'opacity 0.3s ease'
                });
                
                img.onload = () => img.style.opacity = '1';
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

function initializeApp() {
    try {
        addAnimationStyles();
        initHashNavigation();
        initMobileMenu();
        initSmoothScrolling();
        initLogoScrollToTop();
        initHeaderScrollEffect();
        initActiveNavigation();
        initReportDownloads();
        initScrollToTop();
        initScrollAnimations();
        initLazyLoading();
        
        console.log('Ferrari Sustainability Portal inizializzato!');
    } catch (error) {
        console.error('Errore inizializzazione:', error);
    }
}

function init() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeApp);
    } else {
        initializeApp();
    }
}

init();
