/**
 * WorksWheel - 3D Vertical Drum & Ring Portfolio Index Component
 * Vanilla JavaScript Implementation of the WorksWheel React Component
 */

const CARD_H = 0.38; // front card height, of the stage
const CARD_MAX_W = 0.42; // ... but never wider than this much of the stage
const CARD_RATIO = 1.795; // card width / height — matches the 16:9 recognition slides so nothing is cropped
const STEP = 40; // degrees between cards on the drum
const DRUM = 2.22; // drum radius, in card heights - and everything below likewise
const LENS = 2.7; // perspective distance
const RING_R = 1.14; // ring radius
const BOW = 1.82;
const TITLE = 0.115; // ring label and front-card title
const INDEX = 0.038; // the index down the right-hand side
const CULL = 1.6;

const WHEEL_UNITS = 900;
const DRAG_UNITS = 420;
const SETTLE = 140;
const EASE = 0.12;

// Pure geometry helpers — exported so they can be unit-tested in isolation.
export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const rad = (deg) => (deg * Math.PI) / 180;
export const bowAt = (drumDeg, bow) => -bow * (1 - Math.cos(rad(drumDeg)));

export function place(ringDeg, drumDeg, ringR, drumR, bow, m) {
  return (
    `translateX(${m * bowAt(drumDeg, bow)}px)` +
    ` rotateZ(${(1 - m) * ringDeg}deg) translateY(${-(1 - m) * ringR}px)` +
    ` rotateX(${m * drumDeg}deg) translateZ(${m * drumR}px)`
  );
}

export const DEFAULT_WORKS = [
  {
    title: "ReachifyMe: Product Space GenAI Hackathon Winner",
    subtitle: "US Market Expansion Strategy",
    description: "A US market-expansion GTM for ReachifyMe – a multi-channel acquisition plan targeting 100+ paid users at $14/month with 65% gross margins. Growing through organic channels (Reddit, Twitter, incubators & accelerators) cut customer acquisition cost from $200 to $50.",
    image: "Landing Page Assest/reachifyme-gtm.png",
    src: "Landing Page Assest/reachifyme-gtm.png",
    deck: {
      label: "Go-To-Market Strategy",
      title: "ReachifyMe",
      pdf: "Landing Page Assest/ReachifyMe-Go-To-Market-Strategy.pdf",
      slides: Array.from({ length: 14 }, (_, i) =>
        `Landing Page Assest/reachifyme-deck/slide-${String(i + 1).padStart(2, "0")}.webp`
      )
    },
    stats: "100+ paid users · $14/mo · 65% gross margin · CAC $200 → $50",
    tools: ["GTM Strategy", "Pricing & Packaging", "Growth", "Positioning"],
    deliverables: ["Multi-Channel Acquisition Plan", "Organic Growth (Reddit, X, Accelerators)", "Unit Economics & Margins"]
  },
  {
    title: "EcoVoyage: Mind the Product E-Summit '25 Winner",
    subtitle: "Carbon Offset as a Service",
    description: "EcoVoyage – a scalable B2B and B2C Carbon Offset as a Service platform with subscription and corporate-partnership monetization, targeting ₹150+ Crore revenue within three years. Winner at Mind the Product's E-Summit '25 (Synergy of Genesis).",
    image: "Landing Page Assest/ecovoyage.png",
    src: "Landing Page Assest/ecovoyage.png",
    deck: {
      label: "Eco Ventures — Pitch Deck",
      title: "EcoVoyage",
      pdf: "Landing Page Assest/EcoVoyage-Eco-Ventures.pdf",
      slides: Array.from({ length: 13 }, (_, i) =>
        `Landing Page Assest/ecovoyage-deck/slide-${String(i + 1).padStart(2, "0")}.webp`
      )
    },
    stats: "₹150+ Crore 3-Year Target · B2B/B2C Monetization · Carbon Offset SaaS",
    tools: ["Product Vision", "Monetization", "Partnerships", "GTM"],
    deliverables: ["Carbon-Offset Platform Concept", "Subscription & Partnership Models", "Go-to-Market Strategy"]
  },
  {
    title: "EcoCreds: CESD Sustainability Hackathon 2025 Winner",
    subtitle: "Centre for Excellence in Sustainable Development",
    description: "EcoCreds – a platform that incentivizes sustainable actions like green travel, eco-friendly hotel stays, and low-impact events through a gamified rewards system. The strategy: incentivize 100K+ sustainable actions and run carbon-credit programs across 50+ businesses in transport, hospitality, and events, contributing to a 15–20% reduction in carbon footprint.",
    image: "Landing Page Assest/ecocreds.png",
    src: "Landing Page Assest/ecocreds.png",
    deck: {
      label: "Winner Certificate",
      title: "EcoCreds — CESD Sustainability Hackathon 2025",
      pdf: "Landing Page Assest/EcoCreds-Certificate-Suchi-Bansal.pdf",
      ratio: "756 / 553",
      liveUrl: "https://xecocreds.vercel.app/",
      liveLabel: "Live App",
      slides: ["Landing Page Assest/ecocreds-certificate/certificate-01.webp"]
    },
    stats: "100K+ Sustainable Actions · 50+ Businesses · 15–20% Footprint Cut",
    tools: ["Product Discovery", "Gamification", "Carbon Credits", "GTM"],
    deliverables: ["Rewards & Gamification Mechanics", "Carbon-Credit Program Design", "Business Partnership Model"]
  }
];

export function initWorksWheel(container, options = {}) {
  if (!container) return null;

  const items = options.items || DEFAULT_WORKS;
  const label = options.label || "Works '26";
  const action = options.action !== undefined ? options.action : "View";
  const onSelect = options.onSelect || null;

  const count = items.length;
  const last = Math.max(count - 1, 0);

  let turn = 0;
  let target = 0;
  let active = 0;
  let stage = { w: container.clientWidth || 800, h: container.clientHeight || 600 };
  let reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Build DOM Structure
  container.innerHTML = "";
  container.classList.add("relative", "w-full", "h-full", "overflow-hidden", "select-none");

  const section = document.createElement("section");
  section.setAttribute("aria-label", label);
  section.className = "relative w-full h-full min-h-[24rem] overflow-hidden select-none bg-transparent text-neutral-900";

  // Stage (perspective container)
  const stageEl = document.createElement("div");
  stageEl.tabIndex = 0;
  stageEl.role = "listbox";
  stageEl.setAttribute("aria-label", label);
  stageEl.className = "absolute inset-0 cursor-grab touch-pan-x outline-none focus-visible:outline-2 focus-visible:outline-neutral-900 focus-visible:-outline-offset-4 active:cursor-grabbing";

  // Wheel (preserve-3d anchor)
  const wheelEl = document.createElement("div");
  wheelEl.className = "absolute top-1/2 left-1/2 pointer-events-none";
  wheelEl.style.transformStyle = "preserve-3d";

  // Cards
  const cardRefs = [];
  items.forEach((item, i) => {
    const card = document.createElement("div");
    card.id = `works-wheel-${i}`;
    card.role = "option";
    card.setAttribute("aria-selected", i === 0 ? "true" : "false");
    card.className = "group absolute cursor-pointer pointer-events-auto [backface-visibility:hidden]";
    card.style.transformStyle = "preserve-3d";
    card.style.willChange = "transform, opacity";

    const face = document.createElement("div");
    face.className = "relative block w-full h-full overflow-hidden rounded-2xl bg-white border border-neutral-300/80 shadow-[0_20px_45px_-15px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-300 hover:shadow-[0_28px_50px_-10px_rgba(0,0,0,0.22)] hover:border-neutral-500";
    face.style.willChange = "transform";
    face.style.transformOrigin = "center center";

    const img = document.createElement("img");
    img.src = item.image;
    img.alt = item.title;
    img.draggable = false;
    img.className = "w-full h-full object-cover select-none pointer-events-none";
    // The Recognition wheel sits well below the fold — defer its thumbnails so
    // they don't compete with the hero on first load.
    img.loading = "lazy";
    img.decoding = "async";

    face.appendChild(img);

    // Subtle gradient overlay for card readability
    const gradientOverlay = document.createElement("div");
    gradientOverlay.className = "pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent";
    face.appendChild(gradientOverlay);

    // Bottom subtle info badge on card — full title, wraps so the overlapping label is fully visible
    const cardInfo = document.createElement("div");
    cardInfo.className = "pointer-events-none absolute left-3.5 bottom-3.5 right-3.5 flex items-center";
    const titleSpan = document.createElement("span");
    titleSpan.className = "text-[11px] md:text-xs font-mono tracking-wider text-white drop-shadow-sm font-semibold leading-snug";
    titleSpan.style.display = "-webkit-box";
    titleSpan.style.webkitBoxOrient = "vertical";
    titleSpan.style.webkitLineClamp = "2";
    titleSpan.style.overflow = "hidden";
    titleSpan.textContent = item.title;
    cardInfo.appendChild(titleSpan);
    face.appendChild(cardInfo);

    card.appendChild(face);

    // Click on card
    card.addEventListener("click", (e) => {
      if (dragDelta > 6) return; // Ignore drag clicks
      if (active === i) {
        if (onSelect) {
          onSelect(i, item);
        } else if (window.openProjectModal) {
          window.openProjectModal(item);
        } else if (item.href && item.href.startsWith("http")) {
          window.open(item.href, "_blank");
        }
      } else {
        to(i + 1);
      }
    });

    wheelEl.appendChild(card);
    cardRefs.push(card);
  });

  stageEl.appendChild(wheelEl);
  section.appendChild(stageEl);

  // Center ring label ("Works '26" or "Landing Pages")
  const labelEl = document.createElement("div");
  labelEl.className = "pointer-events-none absolute inset-0 grid place-items-center tracking-tight font-black uppercase text-center text-neutral-900 select-none z-10 transition-opacity duration-300";
  labelEl.textContent = label;
  section.appendChild(labelEl);

  // Front-card title
  const titleEl = document.createElement("div");
  titleEl.className = "pointer-events-none absolute top-1/2 left-[5%] md:left-[7%] -translate-y-1/2 tracking-tight font-black uppercase text-neutral-900 opacity-0 select-none z-10 max-w-[42%] leading-[1.05]";
  titleEl.textContent = items[0] ? items[0].title : "";
  section.appendChild(titleEl);

  // Side Index List
  const indexList = document.createElement("ol");
  indexList.className = "text-neutral-500 absolute top-[7%] right-[3%] text-right leading-[1.75] z-20 space-y-0.5 select-none font-mono";
  const indexButtons = [];

  items.forEach((item, i) => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = item.title;
    btn.className = "cursor-pointer transition-all duration-200 text-[11px] md:text-xs tracking-wider outline-none text-neutral-400 hover:text-neutral-900 block ml-auto";
    if (i === 0) {
      btn.className = "cursor-pointer transition-all duration-200 text-[11px] md:text-xs tracking-wider outline-none text-neutral-900 font-bold block ml-auto underline decoration-2 underline-offset-4";
    }
    btn.addEventListener("click", () => {
      to(i + 1);
    });
    li.appendChild(btn);
    indexList.appendChild(li);
    indexButtons.push(btn);
  });
  section.appendChild(indexList);

  // Bottom helper pill
  const hintPill = document.createElement("div");
  hintPill.className = "pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-neutral-200 shadow-sm backdrop-blur-md text-[10px] md:text-[11px] font-mono text-neutral-600 uppercase tracking-wider";
  hintPill.innerHTML = `
    <svg class="w-3 h-3 text-neutral-500 animate-bounce" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
      <path d="M19 14l-7 7m0 0l-7-7m7 7V3" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <span>SCROLL OR DRAG DRUM TO CYCLE</span>
  `;
  section.appendChild(hintPill);

  container.appendChild(section);

  // Geometry computation
  let currentMetrics = calculateMetrics();

  function calculateMetrics() {
    const w = stage.w || 800;
    const h = stage.h || 600;
    const cardW = Math.min(h * CARD_H * CARD_RATIO, w * CARD_MAX_W);
    const cardH = cardW / CARD_RATIO;
    const drumR = cardH * DRUM;
    const ringR = cardH * RING_R;
    const ringScale = count
      ? clamp((((2 * Math.PI * ringR) / count) * 0.82) / (cardW || 1), 0.16, 1)
      : 1;

    return {
      cardW,
      cardH,
      ringR,
      ringScale,
      drumR,
      bow: cardH * BOW,
      depth: cardH * LENS,
      title: Math.max(22, cardH * TITLE),
      index: Math.max(10, cardH * INDEX),
    };
  }

  function applyMetrics() {
    currentMetrics = calculateMetrics();
    stageEl.style.perspective = `${currentMetrics.depth}px`;

    cardRefs.forEach((card) => {
      card.style.width = `${currentMetrics.cardW}px`;
      card.style.height = `${currentMetrics.cardH}px`;
      card.style.marginLeft = `${-currentMetrics.cardW / 2}px`;
      card.style.marginTop = `${-currentMetrics.cardH / 2}px`;
    });

    labelEl.style.fontSize = `${currentMetrics.title}px`;
    titleEl.style.fontSize = `${currentMetrics.title * 0.9}px`;
  }

  applyMetrics();

  // ResizeObserver
  const ro = new ResizeObserver(() => {
    stage = { w: stageEl.clientWidth, h: stageEl.clientHeight };
    applyMetrics();
  });
  ro.observe(stageEl);

  // Target steering
  function to(next) {
    target = clamp(next, 0, last + 1);
  }

  // Wheel interaction
  let settlingTimer = null;
  const onWheel = (event) => {
    const delta = event.deltaY;
    const next = target + delta / WHEEL_UNITS;
    // Native listener: cancellable only while inside wheel range so page scrolls on at edges
    if (next > 0 && next < last + 1) {
      event.preventDefault();
    }
    to(next);
    clearTimeout(settlingTimer);
    settlingTimer = setTimeout(() => {
      to(Math.round(target));
    }, SETTLE);
  };
  stageEl.addEventListener("wheel", onWheel, { passive: false });

  // Pointer drag interaction
  let isPointerDown = false;
  let isCaptured = false;
  let dragStartY = 0;
  let dragDelta = 0;
  let activePointerId = null;

  stageEl.addEventListener("pointerdown", (event) => {
    isPointerDown = true;
    isCaptured = false;
    activePointerId = event.pointerId;
    dragStartY = event.clientY;
    dragDelta = 0;
    // NOTE: we deliberately do NOT capture the pointer here. Capturing on
    // pointerdown reassigns the subsequent `click` target to the stage and
    // swallows the card's own click handler — so a plain tap would never open
    // the card. Instead we capture lazily once a real drag begins (below).
  });

  stageEl.addEventListener("pointermove", (event) => {
    if (!isPointerDown) return;
    const diff = dragStartY - event.clientY;
    dragDelta += Math.abs(diff);
    // Once the gesture is clearly a drag, capture the pointer so tracking
    // continues even if it leaves the stage. A tap never reaches this point.
    if (!isCaptured && dragDelta > 6) {
      try {
        stageEl.setPointerCapture(event.pointerId);
        isCaptured = true;
      } catch (_) {}
    }
    to(target + diff / DRAG_UNITS);
    dragStartY = event.clientY;
  });

  const endDrag = (event) => {
    if (!isPointerDown) return;
    isPointerDown = false;
    if (isCaptured) {
      try {
        stageEl.releasePointerCapture(event.pointerId);
      } catch (_) {}
      isCaptured = false;
    }
    activePointerId = null;
    if (target > 1) {
      to(Math.round(target));
    }
  };

  stageEl.addEventListener("pointerup", endDrag);
  stageEl.addEventListener("pointercancel", endDrag);

  // Keyboard navigation
  stageEl.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      to(Math.round(target) + 1);
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      to(Math.round(target) - 1);
    }
  });

  // UI Active State Update
  function updateActiveUI(near) {
    stageEl.setAttribute("aria-activedescendant", `works-wheel-${near}`);
    cardRefs.forEach((card, idx) => {
      card.setAttribute("aria-selected", idx === near ? "true" : "false");
    });

    indexButtons.forEach((btn, idx) => {
      if (idx === near) {
        btn.className = "cursor-pointer transition-all duration-200 text-[11px] md:text-xs tracking-wider outline-none text-neutral-900 font-bold block ml-auto scale-105 underline decoration-2 underline-offset-4";
      } else {
        btn.className = "cursor-pointer transition-all duration-200 text-[11px] md:text-xs tracking-wider outline-none text-neutral-400 hover:text-neutral-900 block ml-auto";
      }
    });

    const counter = document.getElementById("works-wheel-counter");
    if (counter) {
      counter.textContent = `${String(near + 1).padStart(2, "0")} / ${String(count).padStart(2, "0")}`;
    }

    if (items[near]) {
      titleEl.textContent = items[near].title;
    }
  }

  // Animation Loop (Single rAF pass writing direct DOM transforms)
  //
  // Lifecycle: the loop only runs when it's worth running — i.e. the drum is
  // actually on screen, the tab is foregrounded, and nothing (like the pitch-
  // deck modal) has paused it. An always-on rAF loop needlessly pins the
  // compositor, which is what made a modal opened over the drum paint slowly.
  let frameId = 0;
  let isRunning = false;     // is the rAF loop currently scheduled?
  let inView = true;         // is the drum within the viewport?
  let externallyPaused = false; // paused by a modal / explicit caller

  const draw = () => {
    if (!isRunning) return;
    frameId = requestAnimationFrame(draw);

    const gap = target - turn;
    if (Math.abs(gap) < 0.0005) {
      turn = target;
    } else {
      turn += gap * (reduced ? 1 : EASE);
    }

    const t = turn;
    const m = clamp(t, 0, 1);
    const pos = Math.max(0, t - 1);

    const { ringR, ringScale, drumR, bow } = currentMetrics;

    if (wheelEl) {
      wheelEl.style.transform = `translateZ(${-m * drumR}px)`;
    }

    for (let i = 0; i < count; i++) {
      const d = i - pos;
      const drumDeg = d * STEP;
      const card = cardRefs[i];
      if (card) {
        card.style.transform = place(
          d * (360 / count),
          drumDeg,
          ringR,
          drumR,
          bow,
          m
        );
        card.style.opacity = m > 0.5 && Math.abs(d) > CULL ? "0" : "1";
        card.style.zIndex = String(Math.round(100 - Math.abs(d) * 2));
      }
      const face = card ? card.firstElementChild : null;
      if (face) {
        face.style.transform = `scale(${lerp(ringScale, 1, m)})`;
      }
    }

    if (labelEl) labelEl.style.opacity = String(1 - m);
    if (titleEl) titleEl.style.opacity = String(m);

    const near = clamp(Math.round(pos), 0, last);
    if (near !== active) {
      active = near;
      updateActiveUI(near);
    }
  };

  // Single source of truth for whether the loop should be running.
  function syncRunState() {
    const shouldRun = inView && !externallyPaused && !document.hidden;
    if (shouldRun && !isRunning) {
      isRunning = true;
      frameId = requestAnimationFrame(draw);
    } else if (!shouldRun && isRunning) {
      isRunning = false;
      cancelAnimationFrame(frameId);
    }
  }

  // Pause when the drum scrolls out of view — no point animating off-screen.
  const visObserver = new IntersectionObserver(
    (entries) => {
      inView = entries.some((e) => e.isIntersecting);
      syncRunState();
    },
    { threshold: 0 }
  );
  visObserver.observe(container);

  // Pause when the tab is backgrounded (saves CPU/battery).
  const onVisibilityChange = () => syncRunState();
  document.addEventListener("visibilitychange", onVisibilityChange);

  syncRunState(); // boot (starts only if currently on screen)

  return {
    to,
    next: () => to(Math.min(last + 1, Math.round(target) + 1)),
    prev: () => to(Math.max(0, Math.round(target) - 1)),
    getActive: () => active,
    // Let callers (e.g. a modal opened over the drum) release the compositor.
    pause: () => { externallyPaused = true; syncRunState(); },
    resume: () => { externallyPaused = false; syncRunState(); },
    destroy: () => {
      externallyPaused = true;
      isRunning = false;
      cancelAnimationFrame(frameId);
      ro.disconnect();
      visObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      stageEl.removeEventListener("wheel", onWheel);
      clearTimeout(settlingTimer);
    }
  };
}
