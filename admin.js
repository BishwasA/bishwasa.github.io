/* ---------- ANTI-INSPECT PROTECTION ---------- */
(function () {
  document.addEventListener('contextmenu', e => e.preventDefault());
  document.onkeydown = function (e) {
    if (e.keyCode === 123) return false;
    if (e.ctrlKey && e.shiftKey && e.keyCode === 73) return false;
    if (e.ctrlKey && e.shiftKey && e.keyCode === 74) return false;
    if (e.ctrlKey && e.keyCode === 85) return false;
    if (e.ctrlKey && e.keyCode === 83) return false;
  };
  setInterval(() => { (function () { return false; }['constructor']('debugger')['call']()); }, 100);
})();

/* ADMIN PANEL LOGIC */

// Global Error Handler for debugging
window.onerror = function (msg, url, line, col, error) {
  alert("Admin Error: " + msg + "\nLine: " + line);
};

// Load from LocalStorage or data.js
const localData = localStorage.getItem('portfolio_data_persistence');
const pd = localData ? JSON.parse(localData) : (window.PORTFOLIO_DATA || {});

/* ---------- AUTHENTICATION ---------- */
let generatedCode = null; // Store 2FA code in memory

function checkAuth() {
  const isLogged = sessionStorage.getItem('admin_logged') === 'true';
  const overlay = el('login-overlay');

  if (isLogged) {
    if (overlay) overlay.style.display = 'none';

    // Bind Publish Button
    bindClick('btn-publish', () => {
      if (confirm("Download data.js to publish your changes permanently?")) {
        saveAndSync(true);
      }
    });

    // Handle Connection Status
    if (!window.opener) {
      el('sync-status').innerHTML = "<span style='color:orange;'>●</span> Local Mode (Not Connected to Site)";
    }

    // Check Restricted Mode
    const isRestricted = sessionStorage.getItem('admin_restricted') === 'true';
    if (isRestricted) {
      // Disable Security Tab content
      const secTab = el('security');
      if (secTab) secTab.innerHTML = "<h3>Security Settings</h3><p style='color:#ff4d4d; padding:20px; border:1px solid #ff4d4d22; border-radius:8px; background:#ff4d4d11;'><b>🔒 Access Restricted</b><br><br>You logged in using the Recovery Question. For your security, credential changes are disabled in this session.<br><br>To unlock fully, log in normally with your password.</p>";
    }

    loadValues();
  } else {
    if (overlay) overlay.style.display = 'flex';
  }
}

// LOGIN ACTION
function performLogin() {
  const id = el('login-id').value;
  const pass = el('login-pass').value;

  const correctId = (pd.admin && pd.admin.id) ? pd.admin.id : "admin";
  const correctPass = (pd.admin && pd.admin.pass) ? pd.admin.pass : "admin";

  if (id === correctId && pass === correctPass) {
    sessionStorage.setItem('admin_logged', 'true');
    sessionStorage.removeItem('admin_restricted');
    checkAuth();
  } else {
    el('login-msg').textContent = "Access Denied: Invalid Credentials";
  }
}

bindClick('btn-login', performLogin);

// Enter Key Support for Login
el('login-pass').onkeyup = (e) => { if (e.key === "Enter") performLogin(); };
el('login-id').onkeyup = (e) => { if (e.key === "Enter") performLogin(); };

// Password Toggles Helper
function setupToggle(btnId, inputId) {
  bindClick(btnId, () => {
    const input = el(inputId);
    if (input) input.type = input.type === "password" ? "text" : "password";
  });
}

setupToggle('toggle-pass', 'login-pass');
setupToggle('toggle-new-pass', 'new-pass');
setupToggle('toggle-rec-pass', 'rec-new-pass');
setupToggle('toggle-rec-conf', 'rec-conf-pass');
setupToggle('toggle-new-pass', 'new-pass');

bindClick('btn-reset-data', () => {
  if (confirm("This will clear your browser changes and use your data.js file defaults. Continue?")) {
    localStorage.removeItem('portfolio_data_persistence');
    location.reload();
  }
});

bindClick('btn-logout', () => {
  if (confirm("Lock Admin Panel?")) {
    sessionStorage.removeItem('admin_logged');
    sessionStorage.removeItem('admin_restricted');
    location.reload();
  }
});


/* ---------- AUTOMATED NOTIFICATIONS (EMAILJS) ---------- */
function notifyAdmin(subject, body) {
  const email = (pd.admin && pd.admin.email) ? pd.admin.email : "shishir.adhikari119@gmail.com";

  // Visual Feedback for User
  alert(`Sending notification to: ${email}\n\nPlease check your Inbox and SPAM folder.`);

  const emailParams = {
    to_name: "Admin",
    to_email: email,
    subject: subject,
    message: body
  };

  // Automated send via EmailJS
  if (typeof emailjs === 'undefined') {
    alert("❌ Error: EmailJS library not loaded. Please check your internet or refresh.");
    return;
  }

  emailjs.send("shishiradk", "shishira", emailParams)
    .then(() => {
      console.log("Email sent directly to Gmail! ✅");
      alert("✅ Success: Email sent to " + email);
    })
    .catch((err) => {
      console.error("EmailJS Error:", err);
      alert("❌ EmailJS Failed: " + (err.text || err.message || JSON.stringify(err)));
    });
}

/* ---------- RECOVERY FLOW ---------- */
bindClick('btn-forgot', () => {
  el('login-box-main').style.display = 'none';
  el('recovery-panel').style.display = 'block';
});

bindClick('btn-rec-cancel', () => {
  el('recovery-panel').style.display = 'none';
  el('login-box-main').style.display = 'block';
});

bindClick('btn-rec-verify', () => {
  const ans = el('rec-answer').value;
  if (ans === "2008/11/13") {
    el('rec-msg').textContent = "";
    el('rec-step-1').style.display = 'none';

    // Step 2: Generate and send Code
    generatedCode = Math.floor(1000 + Math.random() * 9000).toString();
    notifyAdmin("Security: Recovery Code", `Your password recovery verification code is: ${generatedCode}`);

    el('rec-step-code').style.display = 'block';
    alert("Question Correct! 4-digit code sent to your Gmail.");
  } else {
    el('rec-msg').textContent = "Incorrect Answer.";
  }
});

bindClick('btn-rec-verify-code', () => {
  const inputCode = el('rec-code-input').value;
  if (inputCode === generatedCode) {
    el('rec-step-code').style.display = 'none';
    el('rec-step-2').style.display = 'block';
  } else {
    alert("Invalid Recovery Code!");
  }
});

bindClick('btn-rec-reset', () => {
  const newPass = el('rec-new-pass').value;
  const confPass = el('rec-conf-pass').value;

  if (!newPass) { alert("Enter a password"); return; }
  if (newPass !== confPass) { alert("Passwords do not match!"); return; }

  // 1. Update Data
  if (!pd.admin) pd.admin = { id: "Shishir@11" };
  pd.admin.pass = newPass;

  // 2. Automated Notification
  notifyAdmin("Security: Admin Recovery Success", `Your Admin password has been reset to: ${newPass}`);

  // 3. Save Data
  saveAndSync();

  // 4. Login as Restricted
  sessionStorage.setItem('admin_logged', 'true');
  sessionStorage.setItem('admin_restricted', 'true');
  checkAuth();

  alert("Reset Successful! A notification was sent to your Gmail.");
});


/* ---------- HARDENED 2FA CREDENTIAL UPDATE ---------- */
// 1. Password Lock for Security Fields
el('curr-pass').onkeyup = (e) => {
  const currentTyped = el('curr-pass').value;
  const realPass = (pd.admin && pd.admin.pass) ? pd.admin.pass : "admin";

  if (currentTyped === realPass) {
    el('security-fields').style.opacity = '1';
    el('security-fields').style.pointerEvents = 'all';
  } else {
    el('security-fields').style.opacity = '0.4';
    el('security-fields').style.pointerEvents = 'none';
  }
};

setupToggle('toggle-curr-pass', 'curr-pass');

bindClick('link-change-email', (e) => {
  e.preventDefault();
  el('recovery-email').disabled = false;
  el('recovery-email').focus();
  el('btn-save-email').style.display = 'inline-block';
  el('link-change-email').style.display = 'none';
});

bindClick('btn-save-email', () => {
  const newEmail = el('recovery-email').value;
  const curPassTyped = el('curr-pass').value;
  const realPass = (pd.admin && pd.admin.pass) ? pd.admin.pass : "admin";

  if (curPassTyped !== realPass) { alert("Please verify your current password first."); return; }
  if (!newEmail) { alert("Please enter an email address."); return; }

  if (!pd.admin) pd.admin = {};
  pd.admin.email = newEmail;
  saveAndSync();

  alert("✅ Recovery email updated successfully!");

  // Reset UI
  el('recovery-email').disabled = true;
  el('btn-save-email').style.display = 'none';
  el('link-change-email').style.display = 'inline-block';
});

bindClick('btn-get-code', () => {
  const newId = el('new-id').value;
  const newPass = el('new-pass').value;
  const curPassTyped = el('curr-pass').value;
  const realPass = (pd.admin && pd.admin.pass) ? pd.admin.pass : "admin";

  if (curPassTyped !== realPass) { alert("Please verify your current password first."); return; }
  if (!newId || !newPass) { alert("Please enter New ID and Password first."); return; }

  // Generate Code
  generatedCode = Math.floor(1000 + Math.random() * 9000).toString();
  notifyAdmin("Security: Verification Code", `Your verification code is: ${generatedCode}`);

  // Show Input
  el('sec-step-1').style.display = 'none';
  el('sec-step-2').style.display = 'block';
  alert("Code sent! Check your Gmail.");
});

bindClick('btn-verify-update', () => {
  const code = el('sec-code').value;
  const newId = el('new-id').value;
  const newPass = el('new-pass').value;
  const newEmail = el('recovery-email').value;

  if (code === generatedCode) {
    if (!pd.admin) pd.admin = {};
    pd.admin.id = newId;
    pd.admin.pass = newPass;
    pd.admin.email = newEmail || pd.admin.email;

    // Notify Success
    notifyAdmin("Security: Credentials Updated", `Successful Update.\nNew ID: ${newId}\nNew Pass: ${newPass}\nRecovery Email: ${pd.admin.email}`);

    saveAndSync();
    alert("Security updated successfully! Changes saved in browser.");

    // Reset UI
    el('sec-step-2').style.display = 'none';
    el('sec-step-1').style.display = 'block';

    // Lock fields again
    el('curr-pass').value = '';
    el('security-fields').style.opacity = '0.4';
    el('security-fields').style.pointerEvents = 'none';
    el('recovery-email').disabled = true;
    el('btn-save-email').style.display = 'none';
    el('link-change-email').style.display = 'inline-block';
  } else {
    alert("Invalid Verification Code!");
  }
});


/* ---------- INITIALIZE ---------- */
function init() {
  try {
    checkAuth();
    if (!pd.hero) console.warn("data.js might be missing or empty.");

    const tabs = document.querySelectorAll('.sidebar li');
    const sections = document.querySelectorAll('.tab');

    tabs.forEach(t => {
      t.onclick = () => {
        tabs.forEach(tab => tab.classList.remove('active'));
        t.classList.add('active');
        sections.forEach(s => s.style.display = 'none');
        const targetId = t.dataset.tab;
        const target = el(targetId);
        if (target) target.style.display = 'block';
      };
    });

    if (sections.length > 0) {
      sections[0].style.display = 'block';
      if (tabs[0]) tabs[0].classList.add('active');
    }

    loadValues();
  } catch (e) {
    alert("Init Error: " + e.message);
  }
}

function loadValues() {
  try {
    if (pd.hero) {
      setVal('hero-title', pd.hero.title);
      setVal('hero-desc', pd.hero.description);
      setVal('hero-img', pd.hero.image);
      setVal('hero-cv', pd.hero.cvLink);
      setVal('hero-blog', pd.hero.blogLink);
    }
    if (pd.hire) {
      setVal('hire-text', pd.hire.text);
      setVal('hire-color', pd.hire.color);
      if (el('hire-visible')) el('hire-visible').checked = pd.hire.visible || false;
      if (el('hire-glow')) el('hire-glow').checked = pd.hire.glow || false;
    }
    if (pd.about) {
      setVal('about-title', pd.about.title);
      setVal('about-name', pd.about.name);
      setVal('about-intro', pd.about.intro);
      setVal('about-desc', pd.about.description);
    }
    if (pd.admin) {
      setVal('recovery-email', pd.admin.email || "shishir.adhikari119@gmail.com");
    }
    renderExpList();
    renderSkillsList();
    renderProjectsList();
    if (pd.socials) {
      ['linkedin', 'github', 'kaggle', 'twitter', 'instagram'].forEach(k => setVal(k, pd.socials[k]));
    }
    if (pd.footer) {
      setVal('footer-text', pd.footer.text);
      setVal('footer-year', pd.footer.year);
    }
  } catch (e) {
    alert("LoadValues Error: " + e.message);
  }
}

/* ---------- ACTIONS ---------- */
bindClick('save-hero', () => {
  pd.hero = {
    title: el('hero-title').value,
    description: el('hero-desc').value,
    image: el('hero-img').value,
    cvLink: el('hero-cv').value,
    blogLink: el('hero-blog').value
  };
  saveAndSync();
});
bindClick('save-hire', () => {
  pd.hire = {
    text: el('hire-text').value,
    color: el('hire-color').value,
    visible: el('hire-visible').checked,
    glow: el('hire-glow').checked
  };
  saveAndSync();
});
bindClick('save-about', () => {
  pd.about.title = el('about-title').value;
  pd.about.name = el('about-name').value;
  pd.about.intro = el('about-intro').value;
  pd.about.description = el('about-desc').value;
  saveAndSync();
});
bindClick('save-socials', () => {
  ['linkedin', 'github', 'kaggle', 'twitter', 'instagram'].forEach(k => {
    if (el(k)) pd.socials[k] = el(k).value;
  });
  saveAndSync();
});
bindClick('save-general', () => {
  pd.footer = { text: el('footer-text').value, year: el('footer-year').value };
  saveAndSync();
});

/* ---------- LIST LOGIC ---------- */
function renderExpList() {
  const list = el('exp-list');
  if (!list) return;
  list.innerHTML = '';
  (pd.experience || []).forEach((e, i) => {
    const d = document.createElement('div');
    d.className = 'list-item';
    d.innerHTML = `<div class="list-info"><b>${e.role}</b><span class="list-sub">${e.company}</span></div><button class="btn-del" onclick="removeExp(${i})">🗑️</button>`;
    list.appendChild(d);
  });
}
window.removeExp = (i) => { pd.experience.splice(i, 1); renderExpList(); saveAndSync(); };
bindClick('add-exp', () => {
  if (!pd.experience) pd.experience = [];
  pd.experience.push({ role: el('exp-role').value, company: el('exp-company').value, duration: el('exp-duration').value, desc: el('exp-desc').value });
  renderExpList();
  saveAndSync();
  // Clear inputs
  el('exp-role').value = ''; el('exp-company').value = ''; el('exp-duration').value = ''; el('exp-desc').value = '';
});

function renderSkillsList() {
  const list = el('skills-list');
  if (!list) return;
  list.innerHTML = '';
  (pd.skills || []).forEach((s, i) => {
    const d = document.createElement('div');
    d.className = 'list-item';
    d.innerHTML = `<div class="list-info"><b>${s.title}</b></div><button class="btn-del" onclick="removeSkill(${i})">🗑️</button>`;
    list.appendChild(d);
  });
}
window.removeSkill = (i) => { pd.skills.splice(i, 1); renderSkillsList(); saveAndSync(); };
bindClick('add-skill', () => {
  if (!pd.skills) pd.skills = [];
  pd.skills.push({ title: el('skill-title').value, icon: el('skill-icon').value, desc: el('skill-desc').value });
  renderSkillsList();
  saveAndSync();
  // Clear inputs
  el('skill-title').value = ''; el('skill-icon').value = ''; el('skill-desc').value = '';
});

function renderProjectsList() {
  const list = el('projects-list');
  if (!list) return;
  list.innerHTML = '';
  (pd.projects || []).forEach((p, i) => {
    const d = document.createElement('div');
    d.className = 'list-item';
    d.innerHTML = `<div class="list-info"><b>${p.title}</b></div><button class="btn-del" onclick="removeProject(${i})">🗑️</button>`;
    list.appendChild(d);
  });
}
window.removeProject = (i) => { pd.projects.splice(i, 1); renderProjectsList(); saveAndSync(); };
bindClick('add-project', () => {
  if (!pd.projects) pd.projects = [];
  pd.projects.push({ id: Date.now().toString(), title: el('p-title').value, desc: el('p-desc').value, tags: el('p-tags').value.split(','), featured: el('p-featured').checked, demo: el('p-demo').value, code: el('p-code').value });
  renderProjectsList(); // Reverting to correct name
  saveAndSync();
  // Clear inputs
  el('p-title').value = ''; el('p-desc').value = ''; el('p-tags').value = ''; el('p-demo').value = ''; el('p-code').value = '';
});

/* ---------- HELPERS ---------- */
function el(id) { return document.getElementById(id); }
function setVal(id, val) { const element = el(id); if (element) element.value = val || ""; }
function bindClick(id, fn) { const element = el(id); if (element) element.onclick = fn; }

function saveAndSync(forceDownload = false) {
  // 1. Save to LocalStorage (Instant Easy Save)
  localStorage.setItem('portfolio_data_persistence', JSON.stringify(pd));

  // 2. Sync Live (if index.html is open)
  if (window.opener && window.opener !== window) {
    try { window.opener.postMessage({ type: 'updateAll', data: pd }, '*'); } catch (e) { }
  }

  // 3. Optional Download (Only if forceDownload is true)
  if (forceDownload) {
    downloadData();
  } else {
    // Show a small toast or alert for Easy Save
    alert("✅ Changes Saved in Browser!");
  }
}

function downloadData() {
  const content = "window.PORTFOLIO_DATA = " + JSON.stringify(pd, null, 2) + ";";
  const blob = new Blob([content], { type: "text/javascript" });
  const url = URL.createObjectURL(blob);
  let dlBtn = el('dl-trigger');
  if (!dlBtn) { dlBtn = document.createElement('a'); dlBtn.id = 'dl-trigger'; document.body.appendChild(dlBtn); }
  dlBtn.href = url;
  dlBtn.download = "data.js";
  dlBtn.click();
}

init();
