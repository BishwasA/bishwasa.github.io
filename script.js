/* ---------- ADVANCED CONTENT SHIELD ---------- */
(function () {
  // 1. Block Keyboard Shortcuts (F12, Inspect, Source, Save, Copy, Paste, Print, etc.)
  document.onkeydown = function (e) {
    if (
      e.keyCode === 123 || // F12
      (e.ctrlKey && e.shiftKey && [73, 74, 67].includes(e.keyCode)) || // Ctrl+Shift+I/J/C
      (e.ctrlKey && [85, 83, 80, 65, 67, 86, 88].includes(e.keyCode)) // Ctrl+U/S/P/A/C/V/X
    ) {
      return false;
    }
  };

  // 2. Disable Right-Click
  document.addEventListener('contextmenu', e => e.preventDefault());

  // 3. Clear Console constantly to block "Console Hacking"
  setInterval(() => {
    console.clear();
    console.log("%cSTOP!", "color:red; font-size:40px; font-weight:bold;");
    console.log("%cThis system is protected. Unauthorized access is forbidden.", "font-size:15px;");
  }, 1000);

  // 4. Multi-Level Debugger Trap (Freezes browser if DevTools opens)
  function antiDebug(n) {
    if (n === 5) return;
    setInterval(() => {
      (function () { return false; }['constructor']('debugger')['call']());
    }, 50);
    antiDebug(++n);
  }
  antiDebug(0);
})();

/* ==========================================================
   CMS ENGINE — MAIN SCRIPT
   Admin-driven Portfolio System
   ========================================================== */

/* ---------- DATA LAYER ---------- */

// 1. Try to load from LocalStorage (for Easy Save)
const localData = localStorage.getItem('portfolio_data_persistence');
const pd = localData ? JSON.parse(localData) : (window.PORTFOLIO_DATA || {});

window.navbarData = pd.navbar || [];
window.aboutData = pd.about || {};
window.skillsData = pd.skills || [];
window.projectsData = pd.projects || [];
window.hireData = pd.hire || {};
window.experienceData = pd.experience || [];
window.footerData = pd.footer || {};
const socialDefaults = pd.socials || {};

/* ---------- HERO RENDER ---------- */
function renderHero() {
  const hero = pd.hero;
  if (!hero) return;

  const title = document.getElementById('hero-title');
  const desc = document.getElementById('hero-desc');
  const cv = document.getElementById('hero-cv');
  const blog = document.getElementById('hero-blog');
  const img = document.getElementById('hero-img');

  if (title) title.innerHTML = hero.title;
  if (desc) desc.textContent = hero.description;
  if (cv) { cv.href = hero.cvLink; }
  if (blog) { blog.href = hero.blogLink; }
  if (img) img.src = hero.image;
}
renderHero();

// Fix for socialDefaults not using localStorage (unless we want to keep that feature? Let's use data.js source)
Object.entries(socialDefaults).forEach(([k, v]) => {
  // If we want to allow localStorage override, keep logic? 
  // For now, let's enforce data.js as source of truth for simplicity.
  // But existing code uses localStorage.getItem below.
  // We will patch the Helper below to use socialDefaults directly or update the usages.
  localStorage.setItem(k, v);
});

/* ---------- DOM HELPERS ---------- */
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

/* ---------- NAVBAR ---------- */
function buildNavbar() {
  const ul = $("#nav-links"); if (!ul) return;
  ul.innerHTML = "";
  navbarData.forEach(item => {
    const li = document.createElement("li");
    li.innerHTML = `<a href="${item.link}" data-text="${item.text}" data-icon="${item.icon}">
      <span class="nav-text">${item.text}</span></a>`;
    ul.appendChild(li);
  });
  applyNavbarHover();
}
buildNavbar();

/* ---------- NAVBAR HOVER ---------- */
function applyNavbarHover() {
  const links = $$("nav.navbar a");
  links.forEach(link => {
    link.style.transition = "all 0.3s ease";
    link.onmouseenter = () => link.style.transform = "scale(1.1)";
    link.onmouseleave = () => link.style.transform = "";
  });
}

/* ---------- NAVBAR MODE ---------- */
function setNavbarMode() {
  const navbarEl = $(".navbar"); if (!navbarEl) return;
  const home = $("#home"); if (!home) return;
  const homeBottom = home.offsetTop + home.offsetHeight;

  $$("nav.navbar a").forEach(link => {
    if (window.scrollY >= homeBottom - 200) {
      navbarEl.classList.add("vertical");
      link.innerHTML = `<i class="fas ${link.dataset.icon}"></i>`;
    } else {
      navbarEl.classList.remove("vertical");
      link.innerHTML = `<span class="nav-text">${link.dataset.text}</span>`;
    }
  });
}
setNavbarMode();
window.addEventListener("scroll", setNavbarMode);

/* ---------- SMOOTH SCROLL ---------- */
document.addEventListener("click", e => {
  const a = e.target.closest(".navbar a"); if (!a) return;
  const href = a.getAttribute("href");
  if (href.startsWith("#")) {
    e.preventDefault();
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  }
});

/* ---------- HIRE BOX ---------- */
function renderHireBox() {
  const box = $("#hire-box");
  const text = $("#hire-text");
  if (!box || !text) return;

  text.textContent = hireData.text;
  document.documentElement.style.setProperty("--green-dot-color", hireData.color);
  box.style.display = hireData.visible ? "flex" : "none";

  if (hireData.glow) {
    box.style.boxShadow = `0 0 20px ${hireData.color}`;
  } else {
    box.style.boxShadow = "none";
  }
}
renderHireBox();

/* ---------- ABOUT ---------- */
/* ---------- ABOUT ---------- */
function renderAbout() {
  const title = document.getElementById("about-title");
  const name = document.getElementById("about-name");
  const intro = document.getElementById("about-intro");
  const desc = document.getElementById("about-desc");

  if (title) title.textContent = aboutData.title || "About Me";
  if (name) name.textContent = aboutData.name;
  if (intro) intro.innerHTML = aboutData.intro;
  if (desc) desc.innerHTML = aboutData.description;
}
renderAbout();

/* ---------- GLOW ---------- */
function renderExperience() {
  const list = document.getElementById("experience-list");
  if (!list) return;
  list.innerHTML = "";

  window.experienceData.forEach(exp => {
    const item = document.createElement("div");
    item.className = "experience-item";
    item.style.marginBottom = "20px";
    item.style.paddingLeft = "15px";
    item.style.borderLeft = "2px solid var(--primary-color, #00f3ff)";

    item.innerHTML = `
      <h4 style="margin:0; font-size: 1.1em; color: var(--text-color, #fff);">${exp.role}</h4>
      <span style="font-size: 0.9em; opacity: 0.8; display:block; margin-bottom:5px;">${exp.company} | ${exp.duration}</span>
      <p style="margin:0; font-size: 0.95em; opacity: 0.9;">${exp.desc}</p>
    `;
    list.appendChild(item);
  });
}
renderExperience();

/* ---------- FOOTER ---------- */
function renderFooter() {
  const year = document.getElementById("footer-year");
  const text = document.getElementById("footer-text");
  if (year) year.textContent = window.footerData.year || "2025";
  if (text) text.textContent = window.footerData.text || "SHISHIRADHIKARI";
}
renderFooter();

function applyGlow(el) {
  el.style.transition = "box-shadow 0.3s, transform 0.3s";
  el.onmouseenter = () => {
    el.style.transform = "scale(1.05)";
    el.style.boxShadow = "0 0 24px rgba(77,195,255,0.6)";
  };
  el.onmouseleave = () => {
    el.style.transform = "";
    el.style.boxShadow = "";
  };
}

/* ---------- SKILLS ---------- */
function renderSkills() {
  const grid = $("#skill-grid"); if (!grid) return;
  grid.innerHTML = "";
  skillsData.forEach(s => {
    const card = document.createElement("div");
    card.className = "skill-card";
    card.innerHTML = `
      <div class="skill-icon"><i class="fa-solid ${s.icon}"></i></div>
      <div>
        <h4>${s.title}</h4>
        <p>${s.desc}</p>
      </div>`;
    grid.appendChild(card);
    applyGlow(card);
  });
}
renderSkills();

/* ---------- PROJECTS ---------- */
function renderProjects() {
  const grid = $("#projects-grid"); if (!grid) return;
  grid.innerHTML = "";
  projectsData.forEach((p, i) => {
    const card = document.createElement("article");
    card.className = "project-card" + (i >= 6 ? " extra" : "");
    card.innerHTML = `
      ${p.featured ? '<div class="badge">Featured</div>' : ""}
      <div class="project-title">${p.title}</div>
      <div class="project-desc">${p.desc}</div>
      <div class="project-tags">${(p.tags || []).map(t => `<span class="tag">${t}</span>`).join("")}</div>
      <div class="project-ctas">
        <a href="${p.code}" target="_blank" class="btn-code">Code</a>
        <a href="${p.demo}" target="_blank" class="btn-demo">Live</a>
      </div>`;
    grid.appendChild(card);
    applyGlow(card);
  });
}
renderProjects();

/* ---------- SEE MORE ---------- */
const seeMoreBtn = $("#see-more-btn");
if (seeMoreBtn) {
  seeMoreBtn.onclick = () => {
    const grid = $("#projects-grid");
    grid.classList.toggle("expanded");
    seeMoreBtn.textContent =
      grid.classList.contains("expanded") ? "See Less" : "See More";
  };
}

/* ---------- SOCIAL ICONS ---------- */
$$(".social-link").forEach(link => {
  const key = link.dataset.key;
  const val = localStorage.getItem(key);
  if (val) {
    link.href = val;
    link.target = "_blank";
  }
});

//* ---------- SOCIAL ICONS (Top and Contact Section) ---------- */
function renderConnectSocials() {
  const contactBox = document.querySelector(".connect-socials"); // bottom
  const topBox = document.querySelector(".social-icons");         // top floating

  const socials = ["linkedin", "github", "kaggle", "twitter", "instagram"];

  // ---------- BOTTOM CONTACT SOCIALS ----------
  if (contactBox) {
    contactBox.innerHTML = "";
    socials.forEach(k => {
      const v = localStorage.getItem(k) || "#";
      const a = document.createElement("a");
      a.href = v;
      a.target = "_blank";
      a.classList.add("contact-social-box"); // box styling

      if (k === "linkedin") a.innerHTML = `<i class="fab fa-linkedin"></i>`;
      else if (k === "github") a.innerHTML = `<i class="fab fa-github"></i>`;
      else if (k === "kaggle") a.innerHTML = `<span class="social-icon">K</span>`;
      else if (k === "twitter") a.innerHTML = `<span class="social-icon">X</span>`;
      else if (k === "instagram") a.innerHTML = `<i class="fab fa-instagram"></i>`;

      contactBox.appendChild(a);
      applyGlow(a); // hover glow works now
    });
  }

  // Always update status text
  const statusText = $("#status-text");
  if (statusText) statusText.textContent = "Available for freelance work — Open to hire";

  // ---------- TOP FLOATING SOCIALS ----------
  if (topBox) {
    topBox.innerHTML = "";
    socials.forEach(k => {
      const v = localStorage.getItem(k) || "#";
      const a = document.createElement("a");
      a.href = v;
      a.target = "_blank";
      a.classList.add("contact-social-box"); // ADD this line for boxes

      if (k === "linkedin") a.innerHTML = `<i class="fab fa-linkedin"></i>`;
      else if (k === "github") a.innerHTML = `<i class="fab fa-github"></i>`;
      else if (k === "kaggle") a.innerHTML = `<span class="social-icon">K</span>`;
      else if (k === "twitter") a.innerHTML = `<span class="social-icon">X</span>`;
      else if (k === "instagram") a.innerHTML = `<i class="fab fa-instagram"></i>`;

      topBox.appendChild(a);
      applyGlow(a); // add glow on hover like contact
    });
  }
}



/* ---------- DATE/TIME ---------- */
function updateDateTime() {
  const now = new Date();
  $("#eng-time").textContent = now.toLocaleTimeString();
  $("#eng-date").textContent = now.toDateString();
}
setInterval(updateDateTime, 1000);
updateDateTime();

/* ---------- CONTACT FORM (DIRECT TO GMAIL via EmailJS) ---------- */
const form = $("#contact-form");
if (form) {
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const status = $("#toast");

    const pd = window.PORTFOLIO_DATA || {};
    const name = $("#cf-name").value;
    const email = $("#cf-email").value;
    const msg = $("#cf-msg").value;

    const params = {
      from_name: name,
      reply_to: email,
      message: `New Message from Portfolio!\n\nName: ${name}\nEmail: ${email}\n\nMessage: ${msg}`,
      to_email: (pd.admin && pd.admin.email) ? pd.admin.email : "shishir.adhikari119@gmail.com"
    };

    status.textContent = "Sending...";
    status.style.display = "block";

    // 1. Send to Owner
    emailjs.send("shishiradk", "shishira", params)
      .then(() => {
        // 2. Send Confirmation to Sender
        const senderParams = {
          from_name: "Shishir Adhikari",
          to_name: params.from_name,
          to_email: params.reply_to,
          message: `Hello ${params.from_name},\n\nThank you for reaching out! I have received your message and will get back to you soon.\n\nYour message: "${params.message}"`
        };
        return emailjs.send("shishiradk", "shishira", senderParams);
      })
      .then(() => {
        status.textContent = "Message sent! Both you and Shishir received a copy. ✅";
        form.reset();
      })
      .catch((err) => {
        status.textContent = "Error: Check your EmailJS configuration.";
        console.error("EmailJS Error:", err);
      });

    setTimeout(() => status.style.display = "none", 5000);
  });
}

/* ---------- CONTACT PAGE UI RULE ---------- */
function contactUIRule() {
  const socials = $(".social-icons");
  if (location.hash === "#contact") {
    socials.style.opacity = "0";
    socials.style.pointerEvents = "none";
  } else {
    socials.style.opacity = "1";
    socials.style.pointerEvents = "auto";
  }
}
window.addEventListener("hashchange", contactUIRule);

/* ---------- ADMIN LIVE UPDATES ---------- */
/* ---------- ADMIN LIVE UPDATES ---------- */
window.addEventListener("message", (e) => {
  const m = e.data;
  if (!m?.type) return;

  if (m.type === "updateAll") {
    const newData = m.data;
    // Update global object properties
    if (window.PORTFOLIO_DATA) {
      Object.assign(window.PORTFOLIO_DATA, newData);
    }

    // Update aliases
    window.navbarData = newData.navbar || [];
    window.aboutData = newData.about || {};
    window.skillsData = newData.skills || [];
    window.projectsData = newData.projects || [];
    window.hireData = newData.hire || {};
    window.experienceData = newData.experience || [];
    window.footerData = newData.footer || {};

    // Re-render all sections
    buildNavbar();
    renderHero(); // Ensure renderHero is available globally or defined before
    renderAbout();
    renderExperience();
    renderSkills();
    renderProjects();
    renderHireBox();
    renderFooter();
    renderConnectSocials();
  }
});

/* ---------- TOP SOCIALS FADE/HIDE ---------- */
function toggleSocialIcons() {
  const contact = document.querySelector("#contact");
  const socials = document.querySelector(".social-icons");
  if (!contact || !socials) return;

  const rect = contact.getBoundingClientRect();
  const inView = rect.top < window.innerHeight && rect.bottom > 0;

  socials.style.opacity = inView ? "0" : "1";
  socials.style.pointerEvents = inView ? "none" : "auto";
  socials.style.transition = "all .3s ease";
}

/* ---------- RUN ON LOAD ---------- */
window.addEventListener("load", () => {
  renderConnectSocials();
  toggleSocialIcons();
});
window.addEventListener("scroll", toggleSocialIcons);
