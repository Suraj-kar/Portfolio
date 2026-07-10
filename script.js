/**
 * Suraj Karki Portfolio — Main Script
 * Three.js 3D background, GSAP animations, Lenis smooth scroll
 */

(function () {
  'use strict';

  /* ==========================================================================
     STATE & CONFIG
     ========================================================================== */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let lenis = null;
  let bgScene = null;
  let heroScene = null;
  let mouseX = 0;
  let mouseY = 0;

  /* ==========================================================================
     DOM READY
     ========================================================================== */
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    initLoader();
    initTheme();
    initLucide();
    initNavigation();
    initGSAP();
    initLenis();
    initThreeJS();
    initHero3D();
    initCounters();
    initHeroTyping();
    initPortfolioFilter();
    initTestimonials();
    initFAQ();
    initContactForm();
    initBackToTop();
    initParallax();
    initMouseParallax();
  }

  /* ==========================================================================
     LOADER
     ========================================================================== */
  function initLoader() {
    const loader = document.getElementById('loader');
    const loaderBar = document.getElementById('loaderBar');
    if (!loader) return;

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        loaderBar.style.width = '100%';

        setTimeout(() => {
          loader.classList.add('hidden');
          document.body.style.overflow = '';
          playEntranceAnimations();
        }, 400);
      }
      loaderBar.style.width = progress + '%';
    }, 150);

    document.body.style.overflow = 'hidden';
  }

  /* ==========================================================================
     THEME TOGGLE (Dark / Light)
     ========================================================================== */
  function initTheme() {
    const toggle = document.getElementById('themeToggle');
    const html = document.documentElement;
    const saved = localStorage.getItem('theme');

    if (saved) {
      html.setAttribute('data-theme', saved);
    }

    toggle?.addEventListener('click', () => {
      const current = html.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      updateThreeJSTheme(next);
    });
  }

  /* ==========================================================================
     LUCIDE ICONS
     ========================================================================== */
  function initLucide() {
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }

  /* ==========================================================================
     NAVIGATION
     ========================================================================== */
  function initNavigation() {
    const toggle = document.getElementById('navToggle');
    const menu = document.getElementById('navMenu');
    const header = document.getElementById('header');
    const links = document.querySelectorAll('.nav__link');
    let lastScroll = 0;

    toggle?.addEventListener('click', () => {
      const isOpen = menu.classList.toggle('open');
      toggle.classList.toggle('active');
      toggle.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    links.forEach((link) => {
      link.addEventListener('click', () => {
        menu.classList.remove('open');
        toggle.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    // Hide/show header on scroll
    window.addEventListener('scroll', () => {
      const current = window.scrollY;
      if (current > lastScroll && current > 200) {
        header.classList.add('hidden');
      } else {
        header.classList.remove('hidden');
      }
      lastScroll = current;
    }, { passive: true });

    // Active link highlighting
    const sections = document.querySelectorAll('section[id]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            links.forEach((l) => l.classList.remove('active'));
            const active = document.querySelector(`.nav__link[href="#${entry.target.id}"]`);
            active?.classList.add('active');
          }
        });
      },
      { rootMargin: '-40% 0px -40% 0px' }
    );
    sections.forEach((s) => observer.observe(s));
  }

  /* ==========================================================================
     LENIS SMOOTH SCROLL
     ========================================================================== */
  function initLenis() {
    if (prefersReducedMotion || typeof Lenis === 'undefined') return;

    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // Anchor link smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target && lenis) {
          e.preventDefault();
          lenis.scrollTo(target, { offset: -80 });
        }
      });
    });
  }

  /* ==========================================================================
     GSAP SCROLL ANIMATIONS
     ========================================================================== */
  function initGSAP() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      document.querySelectorAll('[data-animate]').forEach((el) => el.classList.add('animated'));
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    if (prefersReducedMotion) {
      document.querySelectorAll('[data-animate]').forEach((el) => {
        el.classList.add('animated');
      });
      return;
    }

    document.querySelectorAll('[data-animate]').forEach((el) => {
      el.classList.add('will-animate');

      const delay = parseFloat(el.dataset.delay) || 0;
      const direction = el.dataset.animate;

      let fromVars = { opacity: 0, y: 40 };
      let toVars = { opacity: 1, y: 0 };
      if (direction === 'fade-right') {
        fromVars = { opacity: 0, x: -60 };
        toVars = { opacity: 1, x: 0 };
      }
      if (direction === 'fade-left') {
        fromVars = { opacity: 0, x: 60 };
        toVars = { opacity: 1, x: 0 };
      }

      gsap.fromTo(el, fromVars, {
        ...toVars,
        duration: 0.8,
        delay,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        onComplete: () => {
          el.classList.remove('will-animate');
          el.classList.add('animated');
        },
      });
    });

    gsap.utils.toArray('.service-card').forEach((card, i) => {
      gsap.fromTo(card,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          delay: i * 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.services__grid',
            start: 'top 80%',
          },
        }
      );
    });
  }

  function playEntranceAnimations() {
    if (prefersReducedMotion || typeof gsap === 'undefined') return;

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.from('.hero__title', { opacity: 0, y: 40, duration: 0.8 })
      .from('.hero__typing', { opacity: 0, y: 20, duration: 0.5 }, '-=0.4')
      .from('.hero__desc', { opacity: 0, y: 30, duration: 0.6 }, '-=0.3')
      .from('.hero__actions', { opacity: 0, y: 20, duration: 0.5 }, '-=0.3')
      .from('.hero__stats', { opacity: 0, y: 20, duration: 0.5 }, '-=0.2')
      .from('.hero__scroll', { opacity: 0, duration: 0.5 }, '-=0.1');
  }

  function initHeroTyping() {
    const el = document.getElementById('heroTyping');
    if (!el || prefersReducedMotion) return;

    const phrases = ['A Software Developer', 'A Python Developer', 'A Problem Solver'];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function tick() {
      const current = phrases[phraseIndex];

      if (!isDeleting) {
        el.textContent = current.slice(0, charIndex + 1);
        charIndex += 1;

        if (charIndex === current.length) {
          isDeleting = true;
          setTimeout(tick, 1800);
          return;
        }
      } else {
        el.textContent = current.slice(0, charIndex - 1);
        charIndex -= 1;

        if (charIndex === 0) {
          isDeleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
        }
      }

      setTimeout(tick, isDeleting ? 40 : 90);
    }

    setTimeout(tick, 1200);
  }

  /* ==========================================================================
     THREE.JS — INTERACTIVE 3D BACKGROUND
     ========================================================================== */
  function initThreeJS() {
    if (typeof THREE === 'undefined' || prefersReducedMotion) return;

    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;

    // Floating particles
    const particleCount = 800;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 60;

      const color = new THREE.Color();
      color.setHSL(0.65 + Math.random() * 0.15, 0.8, 0.6);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Floating 3D objects
    const objects = [];
    const geometries = [
      new THREE.IcosahedronGeometry(1, 0),
      new THREE.OctahedronGeometry(0.8, 0),
      new THREE.TorusGeometry(0.6, 0.2, 8, 16),
      new THREE.TetrahedronGeometry(0.7, 0),
    ];

    for (let i = 0; i < 12; i++) {
      const geo = geometries[i % geometries.length];
      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(0.6 + Math.random() * 0.2, 0.7, 0.5),
        metalness: 0.3,
        roughness: 0.4,
        transparent: true,
        opacity: 0.15,
        wireframe: Math.random() > 0.5,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 30 - 10
      );
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      mesh.userData.speed = 0.2 + Math.random() * 0.5;
      mesh.userData.rotSpeed = (Math.random() - 0.5) * 0.02;
      scene.add(mesh);
      objects.push(mesh);
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x6366f1, 0.3);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0x8b5cf6, 1, 100);
    pointLight.position.set(10, 10, 20);
    scene.add(pointLight);

    bgScene = { scene, camera, renderer, particles, objects, pointLight };

    // Mouse parallax for background
    document.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    function animate() {
      requestAnimationFrame(animate);

      particles.rotation.y += 0.0003;
      particles.rotation.x += 0.0001;

      objects.forEach((obj) => {
        obj.rotation.x += obj.userData.rotSpeed;
        obj.rotation.y += obj.userData.rotSpeed * 0.7;
        obj.position.y += Math.sin(Date.now() * 0.001 * obj.userData.speed) * 0.005;
      });

      camera.position.x += (mouseX * 3 - camera.position.x) * 0.02;
      camera.position.y += (-mouseY * 2 - camera.position.y) * 0.02;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  function updateThreeJSTheme(theme) {
    if (!bgScene) return;
    const opacity = theme === 'dark' ? 0.6 : 0.3;
    bgScene.particles.material.opacity = opacity;
    bgScene.objects.forEach((obj) => {
      obj.material.opacity = theme === 'dark' ? 0.15 : 0.08;
    });
  }

  /* ==========================================================================
     THREE.JS — HERO 3D "SK" LOGO (holographic crystal)
     ========================================================================== */
  function createSKTexture(variant) {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    if (variant === 'glass') {
      ctx.clearRect(0, 0, size, size);
      const glow = ctx.createRadialGradient(size * 0.5, size * 0.5, 40, size * 0.5, size * 0.5, size * 0.48);
      glow.addColorStop(0, 'rgba(129,140,248,0.35)');
      glow.addColorStop(0.55, 'rgba(139,92,246,0.12)');
      glow.addColorStop(1, 'rgba(6,182,212,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, size, size);
    } else {
      const grad = ctx.createLinearGradient(0, 0, size, size);
      grad.addColorStop(0, '#6366f1');
      grad.addColorStop(0.45, '#8b5cf6');
      grad.addColorStop(1, '#06b6d4');
      ctx.fillStyle = grad;

      const r = 110;
      ctx.beginPath();
      ctx.moveTo(r, 0);
      ctx.arcTo(size, 0, size, size, r);
      ctx.arcTo(size, size, 0, size, r);
      ctx.arcTo(0, size, 0, 0, r);
      ctx.arcTo(0, 0, size, 0, r);
      ctx.closePath();
      ctx.fill();

      const sheen = ctx.createLinearGradient(0, 0, size, size);
      sheen.addColorStop(0, 'rgba(255,255,255,0.35)');
      sheen.addColorStop(0.35, 'rgba(255,255,255,0)');
      sheen.addColorStop(0.7, 'rgba(255,255,255,0)');
      sheen.addColorStop(1, 'rgba(255,255,255,0.12)');
      ctx.fillStyle = sheen;
      ctx.fill();
    }

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 210px Inter, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = variant === 'glass' ? 'rgba(34,211,238,0.55)' : 'rgba(0,0,0,0.28)';
    ctx.shadowBlur = variant === 'glass' ? 28 : 16;
    ctx.fillText('SK', size / 2, size / 2 + 10);

    // Thin accent underline
    ctx.shadowBlur = 0;
    const lineGrad = ctx.createLinearGradient(size * 0.28, 0, size * 0.72, 0);
    lineGrad.addColorStop(0, 'rgba(34,211,238,0)');
    lineGrad.addColorStop(0.5, 'rgba(34,211,238,0.9)');
    lineGrad.addColorStop(1, 'rgba(34,211,238,0)');
    ctx.strokeStyle = lineGrad;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(size * 0.3, size * 0.72);
    ctx.lineTo(size * 0.7, size * 0.72);
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 8;
    return texture;
  }

  function createSKLogo() {
    const group = new THREE.Group();
    const solidTex = createSKTexture('solid');
    const glassTex = createSKTexture('glass');

    // Core crystal badge
    const core = new THREE.Mesh(
      new THREE.BoxGeometry(2.15, 2.15, 0.55),
      [
        new THREE.MeshPhysicalMaterial({ color: 0x4f46e5, metalness: 0.85, roughness: 0.15, clearcoat: 1 }),
        new THREE.MeshPhysicalMaterial({ color: 0x7c3aed, metalness: 0.85, roughness: 0.15, clearcoat: 1 }),
        new THREE.MeshPhysicalMaterial({ color: 0x6366f1, metalness: 0.85, roughness: 0.15, clearcoat: 1 }),
        new THREE.MeshPhysicalMaterial({ color: 0x06b6d4, metalness: 0.85, roughness: 0.15, clearcoat: 1 }),
        new THREE.MeshPhysicalMaterial({
          map: solidTex,
          metalness: 0.4,
          roughness: 0.18,
          clearcoat: 1,
          clearcoatRoughness: 0.1,
          emissive: 0x312e81,
          emissiveIntensity: 0.25,
        }),
        new THREE.MeshPhysicalMaterial({ color: 0x1e1b4b, metalness: 0.7, roughness: 0.3 }),
      ]
    );
    group.add(core);

    // Ghost hologram layer in front
    const hologram = new THREE.Mesh(
      new THREE.PlaneGeometry(2.35, 2.35),
      new THREE.MeshBasicMaterial({
        map: glassTex,
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    hologram.position.z = 0.42;
    group.add(hologram);

    // Dual orbital rings
    const ringMatA = new THREE.MeshStandardMaterial({
      color: 0x22d3ee,
      metalness: 1,
      roughness: 0.1,
      emissive: 0x0891b2,
      emissiveIntensity: 0.7,
    });
    const ringMatB = new THREE.MeshStandardMaterial({
      color: 0xa78bfa,
      metalness: 1,
      roughness: 0.12,
      emissive: 0x7c3aed,
      emissiveIntensity: 0.55,
    });

    const ringA = new THREE.Mesh(new THREE.TorusGeometry(2.05, 0.028, 16, 100), ringMatA);
    ringA.rotation.x = Math.PI / 2.4;
    group.add(ringA);

    const ringB = new THREE.Mesh(new THREE.TorusGeometry(2.35, 0.02, 16, 100), ringMatB);
    ringB.rotation.x = Math.PI / 1.7;
    ringB.rotation.y = 0.4;
    group.add(ringB);

    // Crystal shards
    const shards = [];
    const shardGeo = new THREE.OctahedronGeometry(0.14, 0);
    for (let i = 0; i < 6; i++) {
      const shard = new THREE.Mesh(
        shardGeo,
        new THREE.MeshPhysicalMaterial({
          color: i % 2 ? 0x22d3ee : 0x8b5cf6,
          metalness: 0.9,
          roughness: 0.1,
          transparent: true,
          opacity: 0.85,
          emissive: i % 2 ? 0x0891b2 : 0x6d28d9,
          emissiveIntensity: 0.4,
        })
      );
      shard.userData.angle = (i / 6) * Math.PI * 2;
      shard.userData.radius = 2.7 + (i % 3) * 0.15;
      shard.userData.speed = 0.008 + i * 0.0015;
      shard.userData.bob = i * 0.7;
      group.add(shard);
      shards.push(shard);
    }

    // Energy particles
    const particleCount = 48;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 1.6 + Math.random() * 1.8;
      positions[i * 3] = Math.cos(a) * r;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2.4;
      positions[i * 3 + 2] = Math.sin(a) * r;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particles = new THREE.Points(
      pGeo,
      new THREE.PointsMaterial({
        color: 0xa5b4fc,
        size: 0.045,
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    group.add(particles);

    group.userData = { core, hologram, ringA, ringB, shards, particles };
    return group;
  }

  function initHero3D() {
    if (typeof THREE === 'undefined' || prefersReducedMotion) return;

    const container = document.getElementById('hero-3d');
    if (!container || window.innerWidth < 768) return;

    const width = container.clientWidth;
    const height = container.clientHeight;
    if (width < 10 || height < 10) return;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0.15, 6.4);

    const logo = createSKLogo();
    scene.add(logo);

    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const key = new THREE.DirectionalLight(0xffffff, 1.15);
    key.position.set(4, 5, 7);
    scene.add(key);
    const cyan = new THREE.PointLight(0x22d3ee, 1.2, 28);
    cyan.position.set(-3.5, 2.5, 4);
    scene.add(cyan);
    const violet = new THREE.PointLight(0xa78bfa, 1, 26);
    violet.position.set(3.5, -2, 3);
    scene.add(violet);

    heroScene = { scene, camera, renderer, logo, cyan, violet };

    let heroMouseX = 0;
    let heroMouseY = 0;
    container.style.pointerEvents = 'auto';
    container.addEventListener('mousemove', (e) => {
      const rect = container.getBoundingClientRect();
      heroMouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      heroMouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    });

    function animateHero() {
      requestAnimationFrame(animateHero);
      const t = Date.now() * 0.001;
      const { core, hologram, ringA, ringB, shards, particles } = logo.userData;

      // Floating + mouse parallax
      logo.position.y = Math.sin(t * 0.9) * 0.12;
      logo.rotation.y = Math.sin(t * 0.45) * 0.28 + heroMouseX * 0.35;
      logo.rotation.x = Math.sin(t * 0.35) * 0.1 + heroMouseY * 0.22;
      logo.rotation.z = Math.sin(t * 0.25) * 0.04;

      // Subtle core pulse
      const pulse = 1 + Math.sin(t * 2.2) * 0.015;
      core.scale.set(pulse, pulse, pulse);
      hologram.material.opacity = 0.4 + Math.sin(t * 2) * 0.15;

      // Counter-rotating rings
      ringA.rotation.z += 0.012;
      ringB.rotation.z -= 0.008;

      shards.forEach((shard) => {
        shard.userData.angle += shard.userData.speed;
        shard.position.x = Math.cos(shard.userData.angle) * shard.userData.radius;
        shard.position.z = Math.sin(shard.userData.angle) * shard.userData.radius;
        shard.position.y = Math.sin(t * 1.4 + shard.userData.bob) * 0.55;
        shard.rotation.x += 0.02;
        shard.rotation.y += 0.025;
      });

      particles.rotation.y += 0.0025;
      particles.rotation.x = Math.sin(t * 0.3) * 0.08;

      // Orbiting lights for shimmer
      cyan.position.x = Math.cos(t * 0.7) * 3.5;
      cyan.position.z = Math.sin(t * 0.7) * 3.5;
      violet.position.x = Math.cos(t * 0.55 + 2) * 3.2;
      violet.position.z = Math.sin(t * 0.55 + 2) * 3.2;

      renderer.render(scene, camera);
    }
    animateHero();

    const resizeObserver = new ResizeObserver(() => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w < 10 || h < 10) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    resizeObserver.observe(container);
  }

  /* ==========================================================================
     ANIMATED COUNTERS
     ========================================================================== */
  function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.dataset.count, 10);
            animateCounter(el, target);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((c) => observer.observe(c));
  }

  function animateCounter(el, target) {
    const suffix = el.hasAttribute('data-suffix') ? el.dataset.suffix : '+';

    if (prefersReducedMotion) {
      el.textContent = target + suffix;
      return;
    }

    let current = 0;
    const increment = target / 60;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = Math.floor(current) + suffix;
    }, 25);
  }

  /* ==========================================================================
     PORTFOLIO FILTER
     ========================================================================== */
  function initPortfolioFilter() {
    const filters = document.querySelectorAll('.portfolio__filter');
    const cards = document.querySelectorAll('.portfolio-card');

    function applyFilter(category, animate = false) {
      cards.forEach((card) => {
        const categories = card.dataset.category || '';
        const match = category === 'all' || categories.split(' ').includes(category);
        if (match) {
          card.classList.remove('hidden');
          if (animate && typeof gsap !== 'undefined') {
            gsap.fromTo(card, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4 });
          }
        } else {
          card.classList.add('hidden');
        }
      });
    }

    filters.forEach((filter) => {
      filter.addEventListener('click', () => {
        filters.forEach((f) => {
          f.classList.remove('active');
          f.setAttribute('aria-selected', 'false');
        });
        filter.classList.add('active');
        filter.setAttribute('aria-selected', 'true');
        applyFilter(filter.dataset.filter, true);
      });
    });

    // Default: show personal projects on load
    applyFilter('personal');
  }

  /* ==========================================================================
     TESTIMONIALS SLIDER
     ========================================================================== */
  function initTestimonials() {
    const track = document.getElementById('testimonialsTrack');
    const prev = document.getElementById('testimonialPrev');
    const next = document.getElementById('testimonialNext');
    const dotsContainer = document.getElementById('testimonialDots');
    if (!track) return;

    const cards = track.querySelectorAll('.testimonial-card');
    let current = 0;
    let visibleCount = getVisibleCount();

    // Create dots
    cards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.classList.add('testimonials__dot');
      dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goTo(i));
      dotsContainer?.appendChild(dot);
    });

    function getVisibleCount() {
      if (window.innerWidth >= 1024) return 3;
      if (window.innerWidth >= 768) return 2;
      return 1;
    }

    function goTo(index) {
      visibleCount = getVisibleCount();
      const max = Math.max(0, cards.length - visibleCount);
      current = Math.max(0, Math.min(index, max));

      const cardWidth = cards[0].offsetWidth;
      const gap = parseInt(getComputedStyle(track).gap) || 32;
      const offset = current * (cardWidth + gap);

      track.style.transform = `translateX(-${offset}px)`;

      dotsContainer?.querySelectorAll('.testimonials__dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === current);
      });
    }

    prev?.addEventListener('click', () => goTo(current - 1));
    next?.addEventListener('click', () => goTo(current + 1));

    window.addEventListener('resize', () => goTo(current));

    // Auto-advance
    if (!prefersReducedMotion) {
      setInterval(() => {
        const max = Math.max(0, cards.length - getVisibleCount());
        goTo(current >= max ? 0 : current + 1);
      }, 6000);
    }
  }

  /* ==========================================================================
     FAQ ACCORDION
     ========================================================================== */
  function initFAQ() {
    const items = document.querySelectorAll('.faq__item');

    items.forEach((item) => {
      item.addEventListener('toggle', () => {
        if (item.open) {
          items.forEach((other) => {
            if (other !== item && other.open) other.open = false;
          });
        }
      });
    });
  }

  /* ==========================================================================
     CONTACT FORM — opens Google Form to receive messages
     ========================================================================== */
  const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/17ACxKhiITKT_GhI3PGlVthS7U3Vcicidu-BhMH_KK4A/viewform';

  function initContactForm() {
    const form = document.getElementById('contactForm');
    const status = document.getElementById('formStatus');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      status.textContent = '';
      status.className = 'form-status';
      status.innerHTML = '';

      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const subject = form.subject.value.trim();
      const message = form.message.value.trim();

      if (!name || !email || !subject || !message) {
        status.textContent = 'Please fill in all fields.';
        status.classList.add('error');
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        status.textContent = 'Please enter a valid email address.';
        status.classList.add('error');
        return;
      }

      status.classList.add('error');
      status.innerHTML =
        'Could not send from this page. Please ' +
        `<a href="${GOOGLE_FORM_URL}" target="_blank" rel="noopener noreferrer" class="form-status__link">submit here</a>` +
        ' to contact me.';
    });
  }

  /* ==========================================================================
     BACK TO TOP
     ========================================================================== */
  function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;

    window.addEventListener('scroll', () => {
      btn.classList.toggle('visible', window.scrollY > 500);
    }, { passive: true });

    btn.addEventListener('click', () => {
      if (lenis) {
        lenis.scrollTo(0);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  /* ==========================================================================
     PARALLAX ELEMENTS
     ========================================================================== */
  function initParallax() {
    if (prefersReducedMotion) return;

    const elements = document.querySelectorAll('[data-parallax]');
    if (!elements.length) return;

    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      elements.forEach((el) => {
        const speed = parseFloat(el.dataset.parallax) || 0.05;
        const rect = el.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const offset = (center - window.innerHeight / 2) * speed;
        el.style.transform = `translateY(${offset}px)`;
      });
    }, { passive: true });
  }

  /* ==========================================================================
     MOUSE PARALLAX (Hero content)
     ========================================================================== */
  function initMouseParallax() {
    if (prefersReducedMotion || window.innerWidth < 768) return;

    const heroVisual = document.querySelector('.hero__visual');
    if (!heroVisual) return;

    document.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 16;
      const y = (e.clientY / window.innerHeight - 0.5) * 16;
      heroVisual.style.transform = `translate(${x}px, ${y}px)`;
    });
  }

})();
