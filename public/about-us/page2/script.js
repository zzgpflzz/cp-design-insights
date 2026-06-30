document.addEventListener('DOMContentLoaded', function() {
    // IP Tabs
    const ipTabs = document.querySelectorAll('.ip-tab');
    ipTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            ipTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });

    // Project Items
    const projectItems = document.querySelectorAll('.project-item');
    projectItems.forEach(item => {
        item.addEventListener('click', () => {
            projectItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });

    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Store Navigation
    const storeNavItems = document.querySelectorAll('.store-nav-item');
    storeNavItems.forEach(item => {
        item.addEventListener('click', () => {
            storeNavItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });
});