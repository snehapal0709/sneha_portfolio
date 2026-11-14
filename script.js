const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const art = document.querySelector('.hero-art');
if (window.matchMedia('(hover: hover)').matches) {
  document.querySelector('.hero').addEventListener('pointermove', (event) => {
    if (reducedMotion.matches) return;
    const bounds = art.getBoundingClientRect();
    const x = (event.clientX - bounds.left - bounds.width / 2) / 65;
    const y = (event.clientY - bounds.top - bounds.height / 2) / 65;
    art.style.transform = `translate(${Math.max(-9, Math.min(9, x))}px, ${Math.max(-7, Math.min(7, y))}px)`;
  });
  document.querySelector('.hero').addEventListener('pointerleave', () => { art.style.transform = ''; });
}
document.querySelector('#year').textContent = new Date().getFullYear();
const navigation = document.querySelectorAll('.header nav a');
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) navigation.forEach(link => link.classList.toggle('active', link.hash === `#${entry.target.id}`));
  });
}, { rootMargin: '-15% 0px -55% 0px' });
document.querySelectorAll('main section[id]').forEach(section => observer.observe(section));

const progress = document.querySelector('.reading-progress');
let progressQueued = false;
function updateProgress() {
  const distance = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = `${distance > 0 ? Math.min(100, Math.max(0, window.scrollY / distance * 100)) : 0}%`;
  progressQueued = false;
}
window.addEventListener('scroll', () => {
  if (!progressQueued) { progressQueued = true; requestAnimationFrame(updateProgress); }
}, { passive: true });
window.addEventListener('resize', updateProgress);
updateProgress();
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  const aura = document.querySelector('.cursor-aura');
  let auraFrame = 0;
  document.addEventListener('pointermove', event => {
    if (reducedMotion.matches) { aura.style.opacity = '0'; return; }
    cancelAnimationFrame(auraFrame);
    auraFrame = requestAnimationFrame(() => {
      aura.style.transform = `translate(${event.clientX - 150}px, ${event.clientY - 150}px)`;
      aura.style.opacity = '1';
    });
  });
  document.documentElement.addEventListener('pointerleave', () => { aura.style.opacity = '0'; });
  document.querySelectorAll('.interest-grid article').forEach(card => {
    card.addEventListener('pointermove', event => {
      if (reducedMotion.matches) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--glow-x', `${event.clientX - rect.left}px`);
      card.style.setProperty('--glow-y', `${event.clientY - rect.top}px`);
    });
  });
}

// Animate profile totals once, without delaying the readable HTML values.
const totalsObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    totalsObserver.unobserve(entry.target);
    if (reducedMotion.matches) return;
    const target = Number(entry.target.dataset.count);
    let started;
    function tick(now) {
      if (!started) started = now;
      const t = Math.min((now - started) / 1000, 1);
      entry.target.textContent = Math.round(target * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}, { threshold: 0.6 });
document.querySelectorAll('[data-count]').forEach(total => totalsObserver.observe(total));

const cursorMedia = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
const cursorDot = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');
let cursorX = 0, cursorY = 0, ringX = 0, ringY = 0, cursorFrame = 0;
function drawCursor() {
  ringX += (cursorX - ringX) * 0.2;
  ringY += (cursorY - ringY) * 0.2;
  cursorRing.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
  cursorFrame = 0;
  if (Math.abs(cursorX - ringX) + Math.abs(cursorY - ringY) > 0.1 && cursorMedia.matches) cursorFrame = requestAnimationFrame(drawCursor);
}
document.addEventListener('pointermove', event => {
  if (!cursorMedia.matches || event.pointerType === 'touch') return;
  cursorX = event.clientX; cursorY = event.clientY;
  if (!document.body.classList.contains('cursor-active')) { ringX = cursorX; ringY = cursorY; }
  document.body.classList.add('cursor-ready', 'cursor-active');
  cursorDot.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`;
  document.body.classList.toggle('cursor-hover', Boolean(event.target.closest('a, button')));
  if (!cursorFrame) cursorFrame = requestAnimationFrame(drawCursor);
});
function hideCustomCursor() {
  document.body.classList.remove('cursor-ready', 'cursor-active', 'cursor-hover');
  cancelAnimationFrame(cursorFrame); cursorFrame = 0;
}
document.documentElement.addEventListener('pointerleave', hideCustomCursor);
window.addEventListener('blur', hideCustomCursor);
cursorMedia.addEventListener('change', hideCustomCursor);
document.addEventListener('keydown', event => { if (event.key === 'Tab') hideCustomCursor(); });

// Portfolio commands are browser-local; no shell or remote execution.
function portfolioCommand(raw) {
  let command = raw.trim().toLowerCase().replace(/^\//, '').replace(/\s+/g, ' ');
  if (command.startsWith('open ')) command = command.slice(5).replace(/^\//, '');
  const responses = {
    help: ['AVAILABLE COMMANDS', 'about - A little about Sneha\nprojects - Explore five projects\nskills - Languages and technologies\nexperience - The Exotel chapter\neducation - My learning journey\nachievements - Leadership and milestones\ninterests - Life beyond the screen\ncontact - Say hello\ngithub / linkedin / spotify - Find my links\nopen <section> - Show its summary here\nresume - Resume availability\nclear - Clear the screen\n\nTip: Tab completes commands; up/down recalls history.'],
    about: ['SNEHA PAL', 'Software Developer & AI Enthusiast\nBased in Gurgaon\nB.Tech Mathematics and Computing, RGIPT (2022-2026)\n\nTurning ideas into full-stack products and AI-powered tools.\nCurious about how things work, obsessed with shipping things that do.'],
    skills: ['MY TECH ORBIT', 'Python / JavaScript / TypeScript / C++ / Java / SQL\nReact / Node.js / FastAPI\nMachine Learning / Deep Learning / TensorFlow\nMongoDB / Git / GitHub / Docker / Linux'],
    experience: ['THE WORK CHAPTER', 'Exotel\nProduct Support Engineer I | August 2026 - Present\nProduct Support Engineer Intern | May - August 2026\n\nInternship: product monitoring dashboards, backend/API debugging,\nlog analysis, RCA, API validation and incident tracking.\nTools: Python, SQL, REST APIs, Linux, Jira, Salesforce.'],
    education: ['MY JOURNEY', '2019 | Class X, Indirapuram Public School / CBSE\n2021 | Class XII, Indirapuram Public School / CBSE\n2026 | B.Tech Mathematics and Computing, RGIPT\n       November 2022 - 2026'],
    achievements: ['A LITTLE IMPACT', "Sponsorship Head, Kaltarang'25 | 40+ companies reached\nEvent Team Head, GDSC RGIPT | 40-50 volunteers, 10+ events\nPR Head, GeeksforGeeks Student Chapter | 15+ outreach connections\nReliance Foundation Scholar\n500+ DSA problems | LeetCode contest rating: 1615\nHackathon participant and team collaborator"],
    interests: ['OUTSIDE THE CODE', 'New places and cafes\nPsychological thrillers, mystery and contemporary romance\nMusic, live events and new genres\nMinimal aesthetics and visual design\nEmerging technologies and a good what if.'],
    resume: ['RESUME', 'My resume is not available here yet.\nYou can reach me at snehapal1708@gmail.com.'],
    whoami: ['HELLO, CURIOUS HUMAN', "You're exploring Sneha's portfolio. Welcome in."],
    pwd: ['YOU ARE HERE', '~/sneha/portfolio'],
    ls: ['PORTFOLIO CHAPTERS', 'about / projects / journey / experience / achievements / interests / contact'],
    contact: ['SAY HELLO', 'Email: snehapal1708@gmail.com', [['Email', 'mailto:snehapal1708@gmail.com'], ['GitHub', 'https://github.com/snehapal0709'], ['LinkedIn', 'https://www.linkedin.com/in/sneha-pal-37a518257/']]],
    github: ['GITHUB', 'Things I build, learn and explore.', [['Visit GitHub', 'https://github.com/snehapal0709']]],
    linkedin: ['LINKEDIN', "Let's connect.", [['Visit LinkedIn', 'https://www.linkedin.com/in/sneha-pal-37a518257/']]],
    spotify: ['THE SOUNDTRACK', 'Wanna listen? A playlist by Sneha.', [['Open Spotify', 'https://open.spotify.com/playlist/5ySrKP617xTgcdm5CAcqIB']]],
    projects: ['THE PROJECT COLLECTION', '01 HirePrep - AI resume analysis and interview preparation\n02 ChefKart - Personal chef marketplace\n03 Document Management System - RAG / forked exploration\n04 Auto Mail Sender - Project brief; implementation pending\n05 Fake News Detection - Project brief; implementation pending', [['HirePrep', 'https://github.com/snehapal0709/HirePrep'], ['ChefKart', 'https://github.com/akshatg1403/chefkart/'], ['RAG', 'https://github.com/snehapal0709/RAG'], ['Auto Mail', 'https://github.com/snehapal0709/auto-mail-sender'], ['Fake News', 'https://github.com/snehapal0709/fake-news-detection']]]
  };
  if (command === 'clear') return { clear: true };
  if (command === 'journey') return { title: responses.education[0], body: responses.education[1] };
  if (command === 'download resume') return { title: responses.resume[0], body: responses.resume[1] };
  const data = responses[command];
  return data ? { title: data[0], body: data[1], links: data[2] } : { title: 'A LITTLE DETOUR', body: `Command not found: ${raw.trim()}\nType help for the available commands.`, error: true };
}
const shellForm = document.querySelector('#terminal-form');
const shellInput = document.querySelector('#terminal-input');
const shellOutput = document.querySelector('#terminal-output');
const shellScreen = document.querySelector('#terminal-screen');
const shellHistory = [];
let historyPosition = 0;
let shellDraft = '';
const shellCommands = ['help','about','projects','skills','experience','education','achievements','interests','contact','github','linkedin','spotify','resume','clear','whoami','pwd','ls','open about','open projects','open journey','open experience','open achievements','open interests','open contact'];
function runPortfolioCommand(raw) {
  const value = raw.trim().slice(0,160);
  if (!value) return;
  shellHistory.push(value);
  if (shellHistory.length > 60) shellHistory.shift();
  historyPosition = shellHistory.length; shellDraft = '';
  const result = portfolioCommand(value);
  if (result.clear) shellOutput.replaceChildren();
  else {
    const entry = document.createElement('div'); entry.className = 'terminal-entry';
    const echo = document.createElement('div'); echo.className = 'terminal-echo';
    const prompt = document.createElement('strong'); prompt.textContent = 'sneha@portfolio:~$ ';
    echo.append(prompt, document.createTextNode(value));
    const response = document.createElement('div'); response.className = `terminal-result${result.error ? ' terminal-error' : ''}`;
    const title = document.createElement('span'); title.className = 'terminal-result-title'; title.textContent = result.title;
    response.append(title, document.createTextNode(result.body));
    if (result.links) {
      const links = document.createElement('div'); links.className = 'terminal-link-row';
      result.links.forEach(([label,url]) => {
        const link = document.createElement('a'); link.textContent = `${label} ↗`; link.href = url;
        if (url.startsWith('https:')) { link.target = '_blank'; link.rel = 'noopener noreferrer'; }
        links.append(link);
      });
      response.append(links);
    }
    entry.append(echo,response); shellOutput.append(entry);
    while (shellOutput.children.length > 35) shellOutput.firstElementChild.remove();
  }
  shellInput.value = '';
  shellScreen.scrollTop = shellScreen.scrollHeight;
  shellInput.focus({ preventScroll:true });
}
shellForm.addEventListener('submit', event => { event.preventDefault(); runPortfolioCommand(shellInput.value); });
document.querySelectorAll('[data-command]').forEach(button => button.addEventListener('click', () => runPortfolioCommand(button.dataset.command)));
shellInput.addEventListener('keydown', event => {
  if (event.key === 'Enter' && !event.isComposing) {
    event.preventDefault(); event.stopPropagation(); runPortfolioCommand(shellInput.value);
  } else if (event.key === 'ArrowUp') {
    event.preventDefault(); if (historyPosition === shellHistory.length) shellDraft = shellInput.value;
    historyPosition = Math.max(0,historyPosition - 1); shellInput.value = shellHistory[historyPosition] || '';
  } else if (event.key === 'ArrowDown') {
    event.preventDefault(); historyPosition = Math.min(shellHistory.length,historyPosition + 1);
    shellInput.value = historyPosition === shellHistory.length ? shellDraft : shellHistory[historyPosition];
  } else if (event.key === 'Tab' && shellInput.value.trim()) {
    const matches = shellCommands.filter(command => command.startsWith(shellInput.value.trim().toLowerCase()));
    if (matches.length === 1) { event.preventDefault(); shellInput.value = matches[0]; }
  } else if (event.ctrlKey && event.key.toLowerCase() === 'l') {
    event.preventDefault(); shellOutput.replaceChildren(); shellInput.value = '';
  }
});

const copyEmailButton = document.querySelector('#copy-email');
const copyEmailStatus = document.querySelector('#copy-email-status');
copyEmailButton.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText('snehapal1708@gmail.com');
    copyEmailStatus.textContent = 'Email copied. A little hello is all it takes.';
  } catch {
    copyEmailStatus.textContent = 'Copy this address: snehapal1708@gmail.com';
  }
});
