// Mobile Navigation Handler
(function() {
    'use strict';
    
    function initMobileNav() {
        console.log('Initializing mobile navigation...');
        
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');
        
        console.log('Elements found:', {
            navToggle: !!navToggle,
            navMenu: !!navMenu,
            navToggleElement: navToggle,
            navMenuElement: navMenu
        });
        
        if (!navToggle || !navMenu) {
            console.error('Mobile nav elements not found!');
            return;
        }
        
        // Toggle mobile menu
        navToggle.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Nav toggle clicked!');
            
            const isActive = navMenu.classList.contains('active');
            
            if (isActive) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                console.log('Menu closed');
            } else {
                navMenu.classList.add('active');
                navToggle.classList.add('active');
                console.log('Menu opened');
            }
        });
        
        // Close menu when clicking nav links
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                console.log('Menu closed via nav link');
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            }
        });
        
        console.log('Mobile navigation initialized successfully!');
    }
    
    // Initialize when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMobileNav);
    } else {
        initMobileNav();
    }
})();