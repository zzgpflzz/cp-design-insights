// Carousel functionality
document.addEventListener('DOMContentLoaded', function() {
    const carouselTrack = document.querySelector('.carousel-track');
    const prevBtn = document.querySelector('.carousel-btn.prev');
    const nextBtn = document.querySelector('.carousel-btn.next');

    if (carouselTrack && prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            carouselTrack.scrollBy({
                left: -300,
                behavior: 'smooth'
            });
        });

        nextBtn.addEventListener('click', () => {
            carouselTrack.scrollBy({
                left: 300,
                behavior: 'smooth'
            });
        });
    }

    // Project items interaction
    const projectItems = document.querySelectorAll('.project-item');
    projectItems.forEach(item => {
        item.addEventListener('click', () => {
            projectItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });

    // IP tabs interaction
    const ipTabs = document.querySelectorAll('.ip-tab');
    ipTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            ipTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });

    // Layout Options Switching
    const layoutBtns = document.querySelectorAll('.layout-btn');
    const storeLayouts = document.querySelectorAll('.store-layout');

    layoutBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const layout = btn.getAttribute('data-layout');

            // Update active button
            layoutBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Update active layout
            storeLayouts.forEach(l => l.classList.remove('active'));
            document.querySelector(`.store-layout.${layout}`).classList.add('active');

            // Scroll to store section
            document.getElementById('store').scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        });
    });

    // Store Category Tabs (Option 1)
    const storeTabs = document.querySelectorAll('.store-tab');
    const tabContents = document.querySelectorAll('.tab-content');

    storeTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const category = tab.getAttribute('data-category');

            // Update active tab
            storeTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Update active content
            tabContents.forEach(c => c.classList.remove('active'));
            document.querySelector(`.tab-content[data-category="${category}"]`).classList.add('active');
        });
    });

    // Proposal Style Switching
    const proposalStyleBtns = document.querySelectorAll('.proposal-style-btn');
    const proposalStyles = document.querySelectorAll('.proposal-style');

    proposalStyleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const style = btn.getAttribute('data-style');

            // Update active button
            proposalStyleBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Update active style
            proposalStyles.forEach(s => s.classList.remove('active'));
            document.querySelector(`.proposal-style.${style}`).classList.add('active');
        });
    });

    // Smooth scroll for navigation
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
});