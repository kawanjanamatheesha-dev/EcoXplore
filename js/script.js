document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------
    // 1. Mobile Menu Toggle
    // -------------------------------------------------------------
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            hamburger.classList.toggle('active');
            // Accessibility: Update ARIA attributes
            const expanded = hamburger.getAttribute('aria-expanded') === 'true' || false;
            hamburger.setAttribute('aria-expanded', !expanded);
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                hamburger.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // -------------------------------------------------------------
    // 2. Dark/Light Theme Switcher
    // -------------------------------------------------------------
    const themeToggleBtn = document.getElementById('theme-toggle');
    const body = document.body;

    if (themeToggleBtn) {
        // Check saved theme or default to system preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            body.classList.toggle('dark-theme', savedTheme === 'dark');
            updateThemeIcon(savedTheme === 'dark');
        } else {
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            body.classList.toggle('dark-theme', systemPrefersDark);
            updateThemeIcon(systemPrefersDark);
        }

        themeToggleBtn.addEventListener('click', () => {
            const isDark = body.classList.toggle('dark-theme');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            updateThemeIcon(isDark);
        });
    }

    function updateThemeIcon(isDark) {
        if (!themeToggleBtn) return;
        themeToggleBtn.innerHTML = isDark ? '☀️' : '🌙';
        themeToggleBtn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    }

    // -------------------------------------------------------------
    // 3. Tours Category Filter (Tours Page)
    // -------------------------------------------------------------
    const filterButtons = document.querySelectorAll('.filter-btn');
    const tourCards = document.querySelectorAll('.tour-card');

    if (filterButtons.length > 0 && tourCards.length > 0) {
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from other buttons
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filter = btn.getAttribute('data-filter');

                tourCards.forEach(card => {
                    if (filter === 'all' || card.getAttribute('data-category') === filter) {
                        card.style.display = 'flex';
                        // Add fade-in effect
                        card.style.animation = 'fadeInUp 0.5s ease forwards';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }

    // -------------------------------------------------------------
    // 4. Gallery Lightbox Slider (Gallery Page)
    // -------------------------------------------------------------
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');

    let currentGalleryIndex = 0;
    const galleryData = [];

    // Collect gallery images data
    galleryItems.forEach((item, index) => {
        const img = item.querySelector('img');
        const h3 = item.querySelector('h3');
        const p = item.querySelector('p');
        
        galleryData.push({
            src: img.getAttribute('src'),
            title: h3 ? h3.textContent : '',
            desc: p ? p.textContent : ''
        });

        item.addEventListener('click', () => {
            currentGalleryIndex = index;
            openLightbox();
        });
    });

    function openLightbox() {
        if (!lightbox || !lightboxImg || !lightboxCaption) return;
        updateLightboxContent();
        lightbox.classList.add('active');
        lightbox.focus(); // Focus lightbox for keyboard navigation
        document.body.style.overflow = 'hidden'; // Stop scroll
    }

    function closeLightbox() {
        if (!lightbox) return;
        lightbox.classList.remove('active');
        document.body.style.overflow = ''; // Restore scroll
    }

    function updateLightboxContent() {
        const data = galleryData[currentGalleryIndex];
        if (lightboxImg && lightboxCaption) {
            lightboxImg.setAttribute('src', data.src);
            lightboxImg.setAttribute('alt', data.title);
            lightboxCaption.innerHTML = `<strong>${data.title}</strong> - ${data.desc}`;
        }
    }

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxPrev) lightboxPrev.addEventListener('click', () => {
        currentGalleryIndex = (currentGalleryIndex - 1 + galleryData.length) % galleryData.length;
        updateLightboxContent();
    });
    if (lightboxNext) lightboxNext.addEventListener('click', () => {
        currentGalleryIndex = (currentGalleryIndex + 1) % galleryData.length;
        updateLightboxContent();
    });

    // Close lightbox on click outside the image
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });

        // Keyboard Navigation for Lightbox
        window.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('active')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight' && lightboxNext) lightboxNext.click();
            if (e.key === 'ArrowLeft' && lightboxPrev) lightboxPrev.click();
        });
    }

    // -------------------------------------------------------------
    // 5. Booking Form Validation & Prefill (Booking Page)
    // -------------------------------------------------------------
    const bookingForm = document.getElementById('booking-form');
    const successBanner = document.getElementById('success-banner');

    // Auto-select package based on URL search params (e.g. booking.html?package=hiking)
    const urlParams = new URLSearchParams(window.location.search);
    const tourPackageParam = urlParams.get('package');
    const packageSelect = document.getElementById('tour-package');

    if (packageSelect && tourPackageParam) {
        // Match option values
        for (let option of packageSelect.options) {
            if (option.value === tourPackageParam.toLowerCase()) {
                option.selected = true;
                break;
            }
        }
    }

    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            let isValid = true;

            // Reset error classes and messages
            const inputs = bookingForm.querySelectorAll('.form-control');
            inputs.forEach(input => {
                input.classList.remove('error');
            });

            // Validate Name
            const nameInput = document.getElementById('name');
            if (nameInput.value.trim() === '') {
                showError(nameInput, 'Please enter your full name');
                isValid = false;
            }

            // Validate Email
            const emailInput = document.getElementById('email');
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (emailInput.value.trim() === '') {
                showError(emailInput, 'Please enter your email address');
                isValid = false;
            } else if (!emailRegex.test(emailInput.value.trim())) {
                showError(emailInput, 'Please enter a valid email address');
                isValid = false;
            }

            // Validate Phone
            const phoneInput = document.getElementById('phone');
            const phoneRegex = /^\+?[0-9\s\-()]{7,15}$/;
            if (phoneInput.value.trim() === '') {
                showError(phoneInput, 'Please enter your phone number');
                isValid = false;
            } else if (!phoneRegex.test(phoneInput.value.trim())) {
                showError(phoneInput, 'Please enter a valid phone number (minimum 7 digits)');
                isValid = false;
            }

            // Validate Package Selection
            if (packageSelect && packageSelect.value === '') {
                showError(packageSelect, 'Please select a tour package');
                isValid = false;
            }

            // Validate Date (Check-in/Start Date)
            const dateInput = document.getElementById('date');
            if (dateInput && dateInput.value === '') {
                showError(dateInput, 'Please select your preferred start date');
                isValid = false;
            } else if (dateInput) {
                const selectedDate = new Date(dateInput.value);
                const today = new Date();
                today.setHours(0,0,0,0);
                if (selectedDate < today) {
                    showError(dateInput, 'Start date cannot be in the past');
                    isValid = false;
                }
            }

            // Show success banner if form is valid
            if (isValid) {
                if (successBanner) {
                    successBanner.textContent = `Thank you, ${nameInput.value.trim()}! Your booking inquiry for the ${packageSelect.options[packageSelect.selectedIndex].text} package has been submitted successfully.`;
                    successBanner.style.display = 'block';
                    successBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                bookingForm.reset();
            }
        });

        function showError(inputElement, message) {
            inputElement.classList.add('error');
            const parent = inputElement.parentElement;
            const errMsg = parent.querySelector('.error-message');
            if (errMsg) {
                errMsg.textContent = message;
            }
            // Accessibility: Announce error message via screen readers
            inputElement.setAttribute('aria-invalid', 'true');
        }

        // Clear error class on typing
        const inputs = bookingForm.querySelectorAll('.form-control');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                input.classList.remove('error');
                input.removeAttribute('aria-invalid');
            });
        });
    }
});
