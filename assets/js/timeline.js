(function(){
  const timeline = document.getElementById('timeline');
  const progress = document.getElementById('timelineProgress');
  const entries = Array.from(timeline.querySelectorAll('.timeline-entry'));
  const icons = entries.map(e => e.querySelector('.timeline-icon'));

  // Helper to compute container bounds
  function getContainerRect(){
    return timeline.getBoundingClientRect();
  }

  // Set initial progress height based on the viewport center position.
  function updateProgress(){
    const rect = getContainerRect();
    const viewportCenter = window.scrollY + window.innerHeight * 0.5; // absolute Y
    const containerTopAbs = window.scrollY + rect.top; // absolute top of container
    const containerHeight = rect.height;

    // How far the viewport center is past the top of the container:
    const filled = viewportCenter - containerTopAbs;

    const clamped = Math.max(0, Math.min(containerHeight, filled));
    progress.style.height = clamped + 'px';
    // ensure top stays at container top (progress positioned top:0 relative to container)
  }

  // Use IntersectionObserver to toggle active state when entry center crosses viewport center
  const io = new IntersectionObserver((items) => {
    items.forEach(item => {
      const entryEl = item.target;
      if (item.isIntersecting) {
        // Only mark active if intersection ratio is reasonable
        entryEl.classList.add('active');
      } else {
        entryEl.classList.remove('active');
      }
    });
  }, {
    root: null,
    rootMargin: '-50% 0px -50% 0px', // element intersects when its center is near viewport center
    threshold: 0
  });

  entries.forEach(e => io.observe(e));

  // On scroll/resize -> update progress
  let ticking = false;
  function onScroll(){
    if (!ticking){
      window.requestAnimationFrame(() => {
        updateProgress();
        ticking = false;
      });
      ticking = true;
    }
  }

  // Recompute on resize (layout may change)
  function onResize(){
    updateProgress();
  }

  // Initial call
  updateProgress();

  // Attach listeners
  window.addEventListener('scroll', onScroll, {passive: true});
  window.addEventListener('resize', onResize);

  // Accessibility: ensure keyboard users can also trigger active states when focusing entries
  entries.forEach(e => {
    e.setAttribute('tabindex','0');
    e.addEventListener('focus', () => {
      entries.forEach(x => x.classList.remove('active'));
      e.classList.add('active');
      // adjust progress to this entry
      const rect = getContainerRect();
      const entryTop = e.getBoundingClientRect().top + window.scrollY - window.scrollY - rect.top; // entry top relative to container
      const centerOffset = e.getBoundingClientRect().height / 2;
      const progressTo = (e.offsetTop + centerOffset);
      progress.style.height = Math.max(0, Math.min(rect.height, progressTo)) + 'px';
    });
  });

  // Ensure progress updates after initial layout and images/fonts loaded:
  window.addEventListener('load', updateProgress);
})();
