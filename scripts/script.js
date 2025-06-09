document.addEventListener('DOMContentLoaded', () => {
  
    document.querySelectorAll('.Horizontal-slider').forEach(slider => {
        const prevBtn = slider.querySelector('.prev');
        const nextBtn = slider.querySelector('.next');
        const track = slider.querySelector('.slider-track');

        prevBtn.addEventListener('click', () => {
            track.scrollBy({ left: -200, behavior: 'smooth' });
        });

        nextBtn.addEventListener('click', () => {
            track.scrollBy({ left: 200, behavior: 'smooth' });
        });

      
        // let isDown = false;
        // let startX;
        // let scrollLeft;

        // track.addEventListener('mousedown', (e) => {
        //     isDown = true;
        //     startX = e.pageX - track.offsetLeft;
        //     scrollLeft = track.scrollLeft;
        // });

        // track.addEventListener('mouseleave', () => {
        //     isDown = false;
        // });

        // track.addEventListener('mouseup', () => {
        //     isDown = false;
        // });

        // track.addEventListener('mousemove', (e) => {
        //     if(!isDown) return;
        //     e.preventDefault();
        //     const x = e.pageX - track.offsetLeft;
        //     const walk = (x - startX) * 2;
        //     track.scrollLeft = scrollLeft - walk;
        // });
    });

    document.querySelectorAll('.company-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON') {
                return;
            }
            
            const companyId = card.getAttribute('data-company');
            window.location.href = `company-pages/${companyId}.html`;
        });
   
        card.style.cursor = 'pointer';
    });
});

// FAQ Accordion Functionality
document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
        const item = question.parentNode;
        const isActive = item.classList.contains('active');
        
    
        document.querySelectorAll('.faq-item').forEach(el => {
            el.classList.remove('active');
        });
        
    
        if (!isActive) {
            item.classList.add('active');
        }
    });
});