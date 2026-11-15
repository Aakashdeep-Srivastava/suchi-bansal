// ScrollExpandMedia Vanilla JS Component - Zero Lag & High Performance 60/120 FPS
export function initScrollExpandMedia() {
  const section = document.getElementById('about');
  if (!section) return;

  const bgImg = document.getElementById('sem-bg-img');
  const mediaContainer = document.getElementById('sem-media-container');
  const mediaImg = document.getElementById('sem-media-img');
  const mediaBlur = document.getElementById('sem-media-blur');
  const mediaOverlay = document.getElementById('sem-media-overlay');
  const titleFirst = document.getElementById('sem-title-first');
  const titleRest = document.getElementById('sem-title-rest');
  const dateTag = document.getElementById('sem-date');
  const scrollPrompt = document.getElementById('sem-scroll-prompt');
  const mediaContent = document.getElementById('sem-media-content');
  const headline = document.getElementById('sem-headline');
  const subcopy = document.getElementById('sem-subcopy');

  const ASPECT_RATIO = 1024 / 546; // ≈ 1.875457875

  let isMobile = window.innerWidth < 768;
  window.addEventListener('resize', () => {
    isMobile = window.innerWidth < 768;
    renderFrame();
  }, { passive: true });

  let rafScheduled = false;

  function applyFrame(progress) {
    // Initial closed shape: exact 300px x 400px as before
    const startW = isMobile ? 280 : 300;
    const startH = isMobile ? 360 : 400;

    // Fully expanded size matching the image aspect ratio (1024 / 546)
    const maxWByViewport = window.innerWidth * 0.94;
    const maxWByHeight = (window.innerHeight * 0.80) * ASPECT_RATIO;
    const endW = Math.min(maxWByViewport, maxWByHeight);
    const endH = endW / ASPECT_RATIO;

    const currentW = startW + progress * (endW - startW);
    const currentH = startH + progress * (endH - startH);
    const textTranslateX = (progress * (isMobile ? 180 : 150)).toFixed(1);

    // Hardware accelerated unblur: smoothly fades out the pre-blurred layer
    if (mediaBlur) {
      if (progress < 0.45) {
        mediaBlur.style.visibility = 'visible';
        mediaBlur.style.opacity = Math.max(0, 1 - progress * 2.3).toFixed(3);
      } else {
        mediaBlur.style.opacity = '0';
        mediaBlur.style.visibility = 'hidden';
      }
    }

    // Media container sizing: direct 1:1 hardware composited size update
    if (mediaContainer) {
      mediaContainer.style.width = `${currentW.toFixed(1)}px`;
      mediaContainer.style.height = `${currentH.toFixed(1)}px`;
      const borderOpacity = (0.1 + (1 - progress) * 0.25).toFixed(2);
      mediaContainer.style.borderColor = `rgba(255, 255, 255, ${borderOpacity})`;
    }

    // Background ambient image fade
    if (bgImg) {
      bgImg.style.opacity = Math.max(0, 1 - progress * 1.3).toFixed(3);
    }

    // Media overlay contrast
    if (mediaOverlay) {
      mediaOverlay.style.opacity = Math.max(0.3, 0.8 - progress * 0.4).toFixed(3);
    }

    // Title words translate outward and fade
    const titleOpacity = Math.max(0, 1 - progress * 1.6).toFixed(3);
    if (titleFirst) {
      titleFirst.style.transform = `translateX(-${textTranslateX}vw) translateZ(0)`;
      titleFirst.style.opacity = titleOpacity;
    }
    if (titleRest) {
      titleRest.style.transform = `translateX(${textTranslateX}vw) translateZ(0)`;
      titleRest.style.opacity = titleOpacity;
    }

    // Subtitles translate outward and fade quickly
    const subOpacity = Math.max(0, 1 - progress * 2.8).toFixed(3);
    if (dateTag) {
      dateTag.style.transform = `translateX(-${textTranslateX}vw)`;
      dateTag.style.opacity = subOpacity;
    }
    if (scrollPrompt) {
      scrollPrompt.style.transform = `translateX(${textTranslateX}vw)`;
      scrollPrompt.style.opacity = subOpacity;
    }

    // Scroll-driven headline: fades in as the card opens, then a band of white
    // light fills the letters from the middle outward to both ends (--fill 0→1).
    if (headline) {
      const hOpacity = Math.min(1, Math.max(0, (progress - 0.40) / 0.22));
      headline.style.opacity = hOpacity.toFixed(3);
      headline.style.transform = `translate(-50%, ${((1 - hOpacity) * 10).toFixed(1)}px) translateZ(0)`;
      const fill = Math.min(1, Math.max(0, (progress - 0.42) / 0.40));
      headline.style.setProperty('--fill', fill.toFixed(3));
    }

    // About summary parked just below the card's bottom edge (follows the card as
    // it grows), fading in near full expansion so it reads as a line under the image.
    if (subcopy) {
      const gap = isMobile ? 16 : 26;
      const belowY = (currentH / 2 + gap).toFixed(1);
      const subFade = Math.min(1, Math.max(0, (progress - 0.80) / 0.12));
      subcopy.style.opacity = subFade.toFixed(3);
      subcopy.style.transform = `translate(-50%, ${belowY}px) translateZ(0)`;
      // Same center-out light reveal as the headline, staggered just after it.
      const subFill = Math.min(1, Math.max(0, (progress - 0.82) / 0.18));
      subcopy.style.setProperty('--fill', subFill.toFixed(3));
    }

    // Content reveals smoothly as media finishes expanding
    if (mediaContent) {
      if (progress >= 0.85) {
        const contentFade = Math.min(1, (progress - 0.85) / 0.15);
        mediaContent.style.opacity = contentFade.toFixed(3);
        mediaContent.style.pointerEvents = contentFade > 0.5 ? 'auto' : 'none';
        mediaContent.style.transform = `translateY(${((1 - contentFade) * 12).toFixed(1)}px)`;
      } else {
        mediaContent.style.opacity = '0';
        mediaContent.style.pointerEvents = 'none';
        mediaContent.style.transform = 'translateY(15px)';
      }
    }
  }

  function renderFrame() {
    rafScheduled = false;
    const rect = section.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const totalDist = section.offsetHeight - windowHeight;

    if (totalDist <= 0) return;

    const scrolled = -rect.top;
    let target = 0;
    if (scrolled > 0) {
      const rawRatio = scrolled / totalDist;
      // Complete expansion smoothly near the end of track so next section transitions immediately
      target = Math.min(Math.max(rawRatio / 0.90, 0), 1);
    }

    applyFrame(target);
  }

  function onScroll() {
    if (!rafScheduled) {
      rafScheduled = true;
      requestAnimationFrame(renderFrame);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  renderFrame();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initScrollExpandMedia);
} else {
  initScrollExpandMedia();
}
