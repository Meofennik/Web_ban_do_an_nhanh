if (typeof VanillaTilt !== 'undefined') {
  VanillaTilt.init(document.querySelectorAll('.hero-3d-card'), {
    max: 15,
    speed: 400,
    glare: false,
    'max-glare': 0.2
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const video = document.getElementById('bg-video');

  if (!video) return;

  let targetTime = 0;
  let currentTime = 0;
  let isSeeking = false;

  const updateVideoTime = () => {
    const diff = targetTime - currentTime;

    if (Math.abs(diff) < 0.03) {
      currentTime = targetTime;
      video.currentTime = currentTime;
      isSeeking = false;
      return;
    }

    currentTime += diff * 0.25;
    video.currentTime = currentTime;
    requestAnimationFrame(updateVideoTime);
  };

  video.addEventListener('loadedmetadata', () => {
    window.addEventListener('scroll', () => {
      const scrollableDistance = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.max(0, Math.min(1, window.scrollY / scrollableDistance));
      targetTime = video.duration * progress;

      if (!isSeeking) {
        isSeeking = true;
        requestAnimationFrame(updateVideoTime);
      }
    });
  });
});