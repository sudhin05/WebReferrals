
function initSliders() {
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

        // // Touch/mouse drag functionality
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
}


document.addEventListener('DOMContentLoaded', initSliders);