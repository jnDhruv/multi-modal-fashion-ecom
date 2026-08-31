document.addEventListener('DOMContentLoaded', function() {
  // Scroll reveal animation
  const scrollElements = document.querySelectorAll('.scroll-reveal');
  
  const elementInView = (el, dividend = 1) => {
    const elementTop = el.getBoundingClientRect().top;
    return (
      elementTop <=
      (window.innerHeight || document.documentElement.clientHeight) / dividend
    );
  };
  
  const displayScrollElement = (element) => {
    element.classList.add('active');
  };
  
  const hideScrollElement = (element) => {
    element.classList.remove('active');
  };
  
  const handleScrollAnimation = () => {
    scrollElements.forEach((el) => {
      if (elementInView(el, 1.25)) {
        displayScrollElement(el);
      } else {
        hideScrollElement(el);
      }
    });
  };
  
  // Listen for scroll and resize events
  window.addEventListener('scroll', () => { 
    handleScrollAnimation(); 
  });
  
  // Initial check in case elements are already in view
  handleScrollAnimation();
  
  // Smooth scrolling for anchor links (if any)
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: 'smooth'
        });
      }
    });
  });
  
  // Button click sound (optional, commented out to avoid irritation)
  /*
  document.querySelectorAll('button, .btn-primary, .social-link').forEach(btn => {
    btn.addEventListener('mousedown', () => {
      // Uncomment if you want a subtle click sound
      // const clickSound = new Audio('click.mp3');
      // clickSound.volume = 0.1;
      // clickSound.play().catch(e => console.log('Audio play failed:', e));
    });
  });
  */
});

