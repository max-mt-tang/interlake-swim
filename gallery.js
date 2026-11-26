(() => {
  const photos = [
  {
    "src": "assets/team/swim-01.jpg",
    "link": "https://photos.google.com/share/AF1QipNCtQ8Mhm5YkMqt7qgQUqDF2yvSPjTg3Pf0FvlBGYZody0rIDV1FyzFJIBO7Gk45w/photo/AF1QipN_FUJh729jw8L_uil34yeMKuTKCS94kmT5WYC7?key=ckdrdmxlUEtNVmo1dDNLZEw3VVhKOHU0eDh1R2hn",
    "alt": "Swimmers gathering beside balloons and a photo display"
  },
  {
    "src": "assets/team/swim-02.jpg",
    "link": "https://photos.google.com/share/AF1QipNCtQ8Mhm5YkMqt7qgQUqDF2yvSPjTg3Pf0FvlBGYZody0rIDV1FyzFJIBO7Gk45w/photo/AF1QipNJdlI5hsPis5-Lhjbqwi7c-uvpet0YYUUuSdpq?key=ckdrdmxlUEtNVmo1dDNLZEw3VVhKOHU0eDh1R2hn",
    "alt": "Swimmers and coaches beside the pool"
  },
  {
    "src": "assets/team/swim-03.jpg",
    "link": "https://photos.google.com/share/AF1QipNCtQ8Mhm5YkMqt7qgQUqDF2yvSPjTg3Pf0FvlBGYZody0rIDV1FyzFJIBO7Gk45w/photo/AF1QipOJjg8clLQJyrYl_FLFVy8mKisEOx3zedbtA6t7?key=ckdrdmxlUEtNVmo1dDNLZEw3VVhKOHU0eDh1R2hn",
    "alt": "Swimmers preparing near the starting blocks"
  },
  {
    "src": "assets/team/swim-04.jpg",
    "link": "https://photos.google.com/share/AF1QipNCtQ8Mhm5YkMqt7qgQUqDF2yvSPjTg3Pf0FvlBGYZody0rIDV1FyzFJIBO7Gk45w/photo/AF1QipOJEm_wo5cVoOQSdstWLscI8jSaKHSFa0Jis2cr?key=ckdrdmxlUEtNVmo1dDNLZEw3VVhKOHU0eDh1R2hn",
    "alt": "Swimmers diving from the starting blocks"
  },
  {
    "src": "assets/team/swim-05.jpg",
    "link": "https://photos.google.com/share/AF1QipNCtQ8Mhm5YkMqt7qgQUqDF2yvSPjTg3Pf0FvlBGYZody0rIDV1FyzFJIBO7Gk45w/photo/AF1QipN84sjO_1WiPKIDnnuuadWw6dUL69HfcJdr_Tr9?key=ckdrdmxlUEtNVmo1dDNLZEw3VVhKOHU0eDh1R2hn",
    "alt": "Swimmers and coaches watching from the pool deck"
  },
  {
    "src": "assets/team/swim-06.jpg",
    "link": "https://photos.google.com/share/AF1QipNCtQ8Mhm5YkMqt7qgQUqDF2yvSPjTg3Pf0FvlBGYZody0rIDV1FyzFJIBO7Gk45w/photo/AF1QipMJclb6qXHPC_prqWFH4q9rTCdMw2H3jUcHq6LV?key=ckdrdmxlUEtNVmo1dDNLZEw3VVhKOHU0eDh1R2hn",
    "alt": "Coach holding a clipboard beside the pool"
  },
  {
    "src": "assets/team/swim-07.jpg",
    "link": "https://photos.google.com/share/AF1QipNCtQ8Mhm5YkMqt7qgQUqDF2yvSPjTg3Pf0FvlBGYZody0rIDV1FyzFJIBO7Gk45w/photo/AF1QipO-UZqxeXzByGblIDzuiT3QgXHkW7yfZrbFu6z-?key=ckdrdmxlUEtNVmo1dDNLZEw3VVhKOHU0eDh1R2hn",
    "alt": "Two teammates smiling for a photo"
  },
  {
    "src": "assets/team/swim-08.jpg",
    "link": "https://photos.google.com/share/AF1QipNCtQ8Mhm5YkMqt7qgQUqDF2yvSPjTg3Pf0FvlBGYZody0rIDV1FyzFJIBO7Gk45w/photo/AF1QipMlUNTw7w8PukaDEOqPEdYM248KGU6MsloLrK8v?key=ckdrdmxlUEtNVmo1dDNLZEw3VVhKOHU0eDh1R2hn",
    "alt": "Two teammates posing together"
  },
  {
    "src": "assets/team/swim-09.jpg",
    "link": "https://photos.google.com/share/AF1QipNCtQ8Mhm5YkMqt7qgQUqDF2yvSPjTg3Pf0FvlBGYZody0rIDV1FyzFJIBO7Gk45w/photo/AF1QipNGS5dfr9_zELM5oeUrjTksVtffQW9VDVVXwQOl?key=ckdrdmxlUEtNVmo1dDNLZEw3VVhKOHU0eDh1R2hn",
    "alt": "Four teammates standing together on the pool deck"
  },
  {
    "src": "assets/team/swim-10.jpg",
    "link": "https://photos.google.com/share/AF1QipNCtQ8Mhm5YkMqt7qgQUqDF2yvSPjTg3Pf0FvlBGYZody0rIDV1FyzFJIBO7Gk45w/photo/AF1QipMA9ajf9Dp7-Ry1eLWiJF9CoWeONFzdXwjpsSbz?key=ckdrdmxlUEtNVmo1dDNLZEw3VVhKOHU0eDh1R2hn",
    "alt": "A swimmer with supporters at a team celebration"
  },
  {
    "src": "assets/team/swim-11.jpg",
    "link": "https://photos.google.com/share/AF1QipNCtQ8Mhm5YkMqt7qgQUqDF2yvSPjTg3Pf0FvlBGYZody0rIDV1FyzFJIBO7Gk45w/photo/AF1QipNul0UArUp-QiZIdeGvzAlsEl3jsLW_Vxs1PExT?key=ckdrdmxlUEtNVmo1dDNLZEw3VVhKOHU0eDh1R2hn",
    "alt": "Swimmers and supporters holding flowers at a team celebration"
  },
  {
    "src": "assets/team/swim-12.jpg",
    "link": "https://photos.google.com/share/AF1QipNCtQ8Mhm5YkMqt7qgQUqDF2yvSPjTg3Pf0FvlBGYZody0rIDV1FyzFJIBO7Gk45w/photo/AF1QipON7XoVzSRilS8T4TFUZJPWBduvsVxkZVf7JqO4?key=ckdrdmxlUEtNVmo1dDNLZEw3VVhKOHU0eDh1R2hn",
    "alt": "Two teammates at a team celebration"
  },
  {
    "src": "assets/team/swim-13.jpg",
    "link": "https://photos.google.com/share/AF1QipNCtQ8Mhm5YkMqt7qgQUqDF2yvSPjTg3Pf0FvlBGYZody0rIDV1FyzFJIBO7Gk45w/photo/AF1QipOK9taF7fcT6u-VuIF1H-30aOzVDkgFYiqYpWVH?key=ckdrdmxlUEtNVmo1dDNLZEw3VVhKOHU0eDh1R2hn",
    "alt": "Swimmers and supporters posing beside a photo display"
  },
  {
    "src": "assets/team/swim-14.jpg",
    "link": "https://photos.google.com/share/AF1QipNCtQ8Mhm5YkMqt7qgQUqDF2yvSPjTg3Pf0FvlBGYZody0rIDV1FyzFJIBO7Gk45w/photo/AF1QipOJHRn6yJadqHfArb59fXQgzs2JE2nNpU00VhuK?key=ckdrdmxlUEtNVmo1dDNLZEw3VVhKOHU0eDh1R2hn",
    "alt": "Three teammates posing together"
  },
  {
    "src": "assets/team/KQ1A0390.JPG",
    "link": "assets/team/KQ1A0390.JPG",
    "alt": "Interlake Swim & Dive team photo"
  },
  ...[
    ["KQ1A0461", "KingCo swim championships"],
    ["KQ1A0067", "KingCo swim championships"],
    ["KQ1A0077", "KingCo swim championships"],
    ["KQ1A0267", "KingCo swim championships"],
    ["KQ1A9951", "KingCo swim championships"],
    ["KQ1A9961", "KingCo swim championships"],
    ["KQ1A0123", "KingCo swim championships"],
    ["KQ1A0132", "KingCo swim championships"],
    ["KQ1A6969", "State swim championships"],
    ["KQ1A6907", "State swim championships"],
    ["KQ1A7145", "State swim championships"],
    ["KQ1A7160", "State swim championships"],
    ["KQ1A7178", "State swim championships"],
    ["KQ1A7185", "State swim championships"],
    ["KQ1A7243", "State swim championships"],
    ["KQ1A7298", "State swim championships"],
    ["KQ1A7310", "State swim championships"],
    ["KQ1A7308", "State swim championships"],
    ["KQ1A7314", "State swim championships"],
    ["KQ1A7316", "State swim championships"],
    ["KQ1A7323", "State swim championships"],
    ["KQ1A7327", "State swim championships"],
    ["KQ1A7350", "State swim championships"],
    ["KQ1A7359", "State swim championships"]
  ].map(([name, alt]) => ({
    src: `assets/team/${name}.jpg`,
    link: `assets/team/${name}.jpg`,
    alt
  })),
  ..."KQ1A0628 KQ1A0727 KQ1A0756 KQ1A0782 KQ1A0795 KQ1A0822 KQ1A0829 KQ1A0852 KQ1A0894 KQ1A0901 KQ1A0931 KQ1A0935 KQ1A0937 KQ1A0946 KQ1A0947 KQ1A0948 KQ1A0952 KQ1A0962 KQ1A0970 KQ1A0982 KQ1A0997 KQ1A1000 KQ1A1011 KQ1A1012 KQ1A1013 KQ1A1055 KQ1A1067 KQ1A1068 KQ1A1071 KQ1A1078 KQ1A1085 KQ1A1106 KQ1A1109 KQ1A1121 KQ1A1173-EDIT".split(" ").map(name => ({
    src: `assets/team/${name}.jpg`,
    link: `assets/team/${name}.jpg`,
    alt: "Interlake swim meet photo"
  }))
];
  const root = document.getElementById('photos');
  const front = document.getElementById('photo-front');
  const back = document.getElementById('photo-back');
  const link = document.getElementById('photo-link');
  const toggle = document.getElementById('photo-toggle');
  const status = document.getElementById('photo-status');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let index = 0, paused = reduced.matches, timer, busy = false, visible = false;
  function schedule() {
    clearTimeout(timer);
    toggle.textContent = '';
    toggle.classList.toggle('is-paused', paused);
    toggle.setAttribute('aria-label', paused ? 'Play slideshow' : 'Pause slideshow');
    toggle.title = paused ? 'Play slideshow' : 'Pause slideshow';
    status.setAttribute('aria-live', paused ? 'polite' : 'off');
    if (!paused && visible && !document.hidden) timer = setTimeout(() => show(index + 1), 6000);
  }
  async function show(next) {
    if (busy) return;
    busy = true;
    next = (next + photos.length) % photos.length;
    const photo = photos[next];
    back.src = photo.src;
    try { await back.decode(); } catch { busy = false; schedule(); return; }
    back.style.opacity = '1';
    setTimeout(() => {
      front.src = photo.src;
      front.alt = photo.alt;
      back.style.opacity = '0';
      index = next;
      link.href = photo.link;
      link.setAttribute('aria-label', photo.link.startsWith('assets/') ? 'Open current photo' : 'Open current photo in Google Photos');
      document.getElementById('photo-count').textContent = String(index + 1).padStart(2, '0') + ' / ' + String(photos.length).padStart(2, '0');
      status.textContent = photo.alt;
      busy = false;
      schedule();
    }, reduced.matches ? 0 : 650);
  }
  function manual(delta) { paused = true; schedule(); show(index + delta); }
  document.getElementById('photo-prev').addEventListener('click', () => manual(-1));
  document.getElementById('photo-next').addEventListener('click', () => manual(1));
  toggle.addEventListener('click', () => { paused = !paused; schedule(); });
  root.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault(); manual(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });
  root.addEventListener('focusin', () => { paused = true; schedule(); });
  document.addEventListener('visibilitychange', schedule);
  reduced.addEventListener('change', () => { paused = reduced.matches; schedule(); });
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; schedule(); }, { threshold: 0.2 }).observe(root);
  schedule();
})();
