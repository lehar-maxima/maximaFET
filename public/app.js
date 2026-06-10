// ── State ──────────────────────────────────────────────────────────────────
let filters = { rival: 'all', format: 'all' };
let sortMode = 'all';
let allEvents = [];
let observations = [];
let topSignal = '';
let expandedCards = {};

// ── Competitor data ────────────────────────────────────────────────────────
const COMPETITORS = [
  {
    id: 'rillet', label: 'Rillet',
    website: 'rillet.com',
    eventsPage: 'https://rillet.com',
    linkedin: 'https://www.linkedin.com/company/team-rillet',
    rss: 'https://rillet.com/feed',
    alerts: ['Rillet event OR dinner OR roundtable', 'Rillet accounting conference'],
    people: [
      { name: 'Rillet team', role: 'Company page', url: 'https://www.linkedin.com/company/team-rillet' },
    ]
  },
  {
    id: 'numeric', label: 'Numeric',
    website: 'numeric.io',
    eventsPage: 'https://numeric.io',
    linkedin: 'https://www.linkedin.com/company/numeric-io',
    rss: 'https://numeric.io/feed',
    alerts: ['Numeric.io event OR dinner OR roundtable', 'Numeric accounting software conference'],
    people: [
      { name: 'Numeric team', role: 'Company page', url: 'https://www.linkedin.com/company/numeric-io' },
    ]
  },
  {
    id: 'campfire', label: 'Campfire',
    website: 'hi.meetcampfire.com',
    eventsPage: 'https://hi.meetcampfire.com/events',
    linkedin: 'https://www.linkedin.com/company/meetcampfire',
    rss: 'https://hi.meetcampfire.com/feed',
    alerts: ['Campfire accounting event OR dinner OR roundtable', 'meetcampfire conference'],
    people: [
      { name: 'Campfire team', role: 'Company page', url: 'https://www.linkedin.com/company/meetcampfire' },
    ]
  },
  {
    id: 'klarity', label: 'Klarity',
    website: 'klarity.ai',
    eventsPage: 'https://klarity.ai/events',
    linkedin: 'https://www.linkedin.com/company/tryklarity',
    rss: 'https://klarity.ai/feed',
    alerts: ['Klarity AI event OR dinner OR roundtable', 'tryklarity finance conference'],
    people: [
      { name: 'Klarity team', role: 'Company page', url: 'https://www.linkedin.com/company/tryklarity' },
    ]
  },
  {
    id: 'floqast', label: 'FloQast',
    website: 'floqast.com',
    eventsPage: 'https://floqast.com/events',
    linkedin: 'https://www.linkedin.com/company/floqast',
    rss: 'https://floqast.com/feed',
    alerts: ['FloQast event OR dinner OR roundtable', 'FloQast accounting conference 2026'],
    people: [
      { name: 'FloQast team', role: 'Company page', url: 'https://www.linkedin.com/company/floqast' },
      { name: 'Search: FloQast field marketing', role: 'Field marketing leads', url: 'https://www.linkedin.com/search/results/people/?keywords=floqast%20field%20marketing' },
    ]
  },
  {
    id: 'blackline', label: 'BlackLine',
    website: 'blackline.com',
    eventsPage: 'https://www.blackline.com/events',
    linkedin: 'https://www.linkedin.com/company/blackline-systems',
    rss: 'https://www.blackline.com/feed',
    alerts: ['BlackLine event OR dinner OR roundtable', 'BlackLine accounting conference 2026'],
    people: [
      { name: 'BlackLine team', role: 'Company page', url: 'https://www.linkedin.com/company/blackline-systems' },
      { name: 'Search: BlackLine field marketing', role: 'Field marketing leads', url: 'https://www.linkedin.com/search/results/people/?keywords=blackline%20field%20marketing' },
    ]
  }
];

// ── Tab switching ──────────────────────────────────────────────────────────
function showTab(name, el) {
  document.querySelectorAll('.tab-panel').forEach(p => p.style.display = 'none');
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('tab-' + name).style.display = 'block';
  el.classList.add('active');
  if (name === 'alerts') renderAlerts();
  if (name === 'rss') renderRSS();
  if (name === 'linkedin') renderLinkedIn();
}

// ── Alerts tab ─────────────────────────────────────────────────────────────
function renderAlerts() {
  const el = document.getElementById('alertsList');
  el.innerHTML = COMPETITORS.map(c => `
    <div class="rival-section">
      <div class="rival-section-header">
        <span class="rbadge rb-${c.id}">${c.label}</span>
      </div>
      ${c.alerts.map(q => {
        const url = `https://www.google.com/alerts#create:q=${encodeURIComponent(q)}&t=7&f=1&deliveryTime=0&ts=0&rt=1`;
        return `
        <div class="source-row">
          <div class="source-row-left">
            <div class="source-row-label">${q}</div>
            <div class="source-row-sub">Google Alert — delivered daily by email</div>
          </div>
          <div class="source-row-right">
            <a class="open-btn" href="${url}" target="_blank" rel="noopener"><i class="ti ti-bell-plus"></i> Create alert</a>
          </div>
        </div>`;
      }).join('')}
    </div>
  `).join('');
}

// ── RSS tab ────────────────────────────────────────────────────────────────
function renderRSS() {
  const el = document.getElementById('rssList');
  el.innerHTML = COMPETITORS.map(c => {
    const notionRssUrl = `https://www.notion.so/new?importSource=rss&importUrl=${encodeURIComponent(c.rss)}`;
    return `
    <div class="rival-section">
      <div class="rival-section-header">
        <span class="rbadge rb-${c.id}">${c.label}</span>
      </div>
      <div class="source-row">
        <div class="source-row-left">
          <div class="source-row-label">Blog / news feed</div>
          <div class="source-row-sub">${c.rss}</div>
        </div>
        <div class="source-row-right">
          <button class="copy-btn" onclick="copyText('${c.rss}', this)"><i class="ti ti-copy" style="font-size:12px;"></i> Copy URL</button>
          <a class="open-btn" href="${notionRssUrl}" target="_blank" rel="noopener"><i class="ti ti-brand-notion"></i> Copy for Notion</a>
        </div>
      </div>
      <div class="source-row">
        <div class="source-row-left">
          <div class="source-row-label">Events page</div>
          <div class="source-row-sub">${c.eventsPage}</div>
        </div>
        <div class="source-row-right">
          <button class="copy-btn" onclick="copyText('${c.eventsPage}', this)"><i class="ti ti-copy" style="font-size:12px;"></i> Copy URL</button>
          <a class="open-btn" href="${c.eventsPage}" target="_blank" rel="noopener"><i class="ti ti-external-link"></i> Visit page</a>
        </div>
      </div>
    </div>`;
  }).join('');
}

function copyText(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    btn.innerHTML = '<i class="ti ti-check" style="font-size:12px;"></i> Copied';
    setTimeout(() => { btn.innerHTML = '<i class="ti ti-copy" style="font-size:12px;"></i> Copy URL'; }, 2000);
  });
}

// ── LinkedIn tab ───────────────────────────────────────────────────────────
function renderLinkedIn() {
  const el = document.getElementById('linkedinList');
  el.innerHTML = COMPETITORS.map(c => `
    <div class="rival-section">
      <div class="rival-section-header">
        <span class="rbadge rb-${c.id}">${c.label}</span>
      </div>
      ${c.people.map(p => `
        <div class="source-row">
          <div class="source-row-left">
            <div class="source-row-label">${p.name}</div>
            <div class="source-row-sub">${p.url.replace('https://www.linkedin.com/', 'linkedin.com/')}</div>
          </div>
          <div class="source-row-right">
            <span class="person-role">${p.role}</span>
            <a class="open-btn" href="${p.url}" target="_blank" rel="noopener"><i class="ti ti-brand-linkedin"></i> Open</a>
          </div>
        </div>
      `).join('')}
    </div>
  `).join('');
}

// ── Events tab ─────────────────────────────────────────────────────────────
function setFilter(type, val, el) {
  filters[type] = val;
  el.closest('.chips').querySelectorAll('.chip').forEach(c => c.classList.remove('on'));
  el.classList.add('on');
  render();
}

function setSort(mode, el) {
  sortMode = mode;
  el.closest('.chips').querySelectorAll('.chip').forEach(c => c.classList.remove('on'));
  el.classList.add('on');
  render();
}

function rivalLabel(r) {
  return { rillet:'Rillet', numeric:'Numeric', campfire:'Campfire', klarity:'Klarity', floqast:'FloQast', blackline:'BlackLine' }[r] || r;
}

function isVirtual(e) {
  return e.location && e.location.toLowerCase().includes('virtual');
}

function parseDate(d) {
  if (!d) return new Date(0);
  const p = new Date(d);
  return isNaN(p) ? new Date(0) : p;
}

function render() {
  const area = document.getElementById('area');
  let evts = [...allEvents];
  if (filters.rival !== 'all') evts = evts.filter(e => e.rival === filters.rival);
  if (filters.format === 'virtual') evts = evts.filter(e => isVirtual(e));
  if (filters.format === 'inperson') evts = evts.filter(e => !isVirtual(e));
  if (sortMode === 'recent') evts.sort((a, b) => parseDate(b.date) - parseDate(a.date));
  else if (sortMode === 'relevance') evts.sort((a, b) => (b.relevance || 5) - (a.relevance || 5));
  // 'all' = no sort, show in order returned

  if (evts.length === 0 && allEvents.length > 0) {
    area.innerHTML = '<div class="empty"><i class="ti ti-search-off"></i><strong>No events match this filter</strong><span>Try adjusting your filters above.</span></div>';
    return;
  }
  if (allEvents.length === 0) return;

  let html = `<div class="section-label">${evts.length} event${evts.length !== 1 ? 's' : ''} detected</div>`;

  html += evts.map((e, i) => {
    const virtual = isVirtual(e);
    const expanded = expandedCards[i];
    const relevancePct = Math.round((e.relevance || 5) / 10 * 100);
    const url = e.url && e.url.startsWith('http') ? e.url : (e.source ? `https://${e.source}` : null);

    return `
    <div class="card">
      <div class="card-main">
        <div class="card-top">
          <div style="flex:1;">
            <div class="card-meta">
              <span class="rbadge rb-${e.rival}">${rivalLabel(e.rival)}</span>
              <span class="ftype">${e.format || 'Event'}</span>
              <span class="${virtual ? 'virtual-tag' : 'inperson-tag'}">${virtual ? 'Virtual' : 'In person'}</span>
            </div>
            <div class="ctitle">${e.title}</div>
          </div>
          <div class="cdate">${e.date || ''}</div>
        </div>
        <div class="csummary">${e.summary}</div>
        <div class="details-grid">
          ${e.location  ? `<div class="drow"><strong>Location</strong>${e.location}</div>` : ''}
          ${e.audience  ? `<div class="drow"><strong>Audience</strong>${e.audience}</div>` : ''}
          ${e.cohost    ? `<div class="drow"><strong>Co-host</strong>${e.cohost}</div>` : ''}
          ${e.theme     ? `<div class="drow"><strong>Theme</strong>${e.theme}</div>` : ''}
          ${e.promotion ? `<div class="drow"><strong>Promoted via</strong>${e.promotion}</div>` : ''}
        </div>
        ${sortMode === 'relevance' ? `<div class="relevance-bar"><div class="relevance-fill" style="width:${relevancePct}%"></div></div>` : ''}
      </div>

      <div class="mx-response" id="mx-${i}" style="${expanded ? '' : 'display:none;'}">
        <div class="mx-response-header">
          <div class="mx-avatar"><svg viewBox="0 0 12 12"><path d="M6 1L11 10H1L6 1Z"/></svg></div>
          <span class="mx-response-label">Maxima play</span>
        </div>
        <div class="mx-response-text">${e.maximaPlay || ''}</div>
      </div>

      <div class="card-foot">
        <span class="src"><i class="ti ti-link" style="font-size:12px;"></i>${e.source || ''}</span>
        <div style="display:flex;align-items:center;gap:10px;">
          <button class="mx-toggle" onclick="togglePlay(${i},this)">
            <i class="ti ti-sparkles" style="font-size:12px;"></i>
            ${expanded ? 'Hide play' : 'Maxima play'}
          </button>
          ${url ? `<a class="viewlink" href="${url}" target="_blank" rel="noopener">Source <i class="ti ti-external-link" style="font-size:12px;"></i></a>` : ''}
        </div>
      </div>
    </div>`;
  }).join('');

  if (observations.length > 0 && filters.rival === 'all') {
    html += '<div class="section-label">Patterns and observations</div>';
    html += observations.map(o => `<div class="obs-card"><p>${o}</p></div>`).join('');
  }

  area.innerHTML = html;
}

function togglePlay(idx, btn) {
  expandedCards[idx] = !expandedCards[idx];
  document.getElementById(`mx-${idx}`).style.display = expandedCards[idx] ? 'block' : 'none';
  btn.innerHTML = `<i class="ti ti-sparkles" style="font-size:12px;"></i> ${expandedCards[idx] ? 'Hide play' : 'Maxima play'}`;
}

function updateSummary() {
  const inPerson = allEvents.filter(e => !isVirtual(e)).length;
  const rivals = new Set(allEvents.map(e => e.rival)).size;
  document.getElementById('evtCount').textContent = allEvents.length;
  document.getElementById('inPersonCount').textContent = inPerson;
  document.getElementById('rivalCount').textContent = rivals;
  document.getElementById('hotInsight').textContent = topSignal || '—';
  document.getElementById('summaryRow').style.display = 'grid';
  document.getElementById('filterbar').style.display = 'flex';
}

// ── Scan ───────────────────────────────────────────────────────────────────
async function runScan() {
  const btn = document.getElementById('runBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="ti ti-loader-2"></i> Scanning...';
  expandedCards = {};

  // Switch to events tab
  document.querySelectorAll('.tab-panel').forEach(p => p.style.display = 'none');
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('tab-events').style.display = 'block';
  document.querySelector('.nav-tab').classList.add('active');

  const steps = ['Checking Rillet and Numeric...', 'Scanning Campfire and Klarity...', 'Pulling FloQast events...', 'Checking BlackLine activity...', 'Generating Maxima plays...'];
  let si = 0;
  const area = document.getElementById('area');
  area.innerHTML = `<div class="loading"><div class="lstep" id="lstep">${steps[0]}</div><div class="lbar"><div class="lbar-fill"></div></div><div class="lsub">Searching web, event pages, and LinkedIn signals. Real sources only.</div></div>`;
  const iv = setInterval(() => { si=(si+1)%steps.length; const el=document.getElementById('lstep'); if(el) el.textContent=steps[si]; }, 2000);

  const today = new Date().toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' });

  const prompt = `You are a competitive intelligence analyst for Maxima, an agentic accounting and finance software company. Today is ${today}.

Search the web for field marketing events from the past 30 days for these six competitors:
1. Rillet (rillet.com, linkedin.com/company/team-rillet)
2. Numeric (numeric.io, linkedin.com/company/numeric-io)
3. Campfire (hi.meetcampfire.com/events, linkedin.com/company/meetcampfire)
4. Klarity (klarity.ai/events, linkedin.com/company/tryklarity)
5. FloQast (floqast.com/events, linkedin.com/company/floqast)
6. BlackLine (blackline.com/events, linkedin.com/company/blackline-systems)

Search for: executive dinners, roundtables, happy hours, webinars, conference sponsorships, user conferences, golf outings, field events, LinkedIn posts about events.

Return ONLY a JSON object with three keys:

"events": array of event objects with these fields:
- rival: "rillet"|"numeric"|"campfire"|"klarity"|"floqast"|"blackline"
- title: short event title (max 10 words)
- summary: what this event is (max 30 words, no em dashes)
- format: "Dinner"|"Happy hour"|"Roundtable"|"Webinar"|"Conference"|"Workshop"|"User conference"|"Sponsorship"|other
- location: city and state/country. Use "Virtual" if online
- date: ISO date YYYY-MM-DD if known, else "Month YYYY"
- audience: target titles e.g. "CFOs, Controllers"
- cohost: partner name or null
- theme: event topic or null
- promotion: "LinkedIn post"|"Event page"|"Email"|null
- source: domain only e.g. "floqast.com"
- url: best available URL for this event. Use the real URL if found. If not found, use the competitor events page URL. Never null.
- relevance: integer 1-10 how relevant to Maxima's competitive positioning
- maximaPlay: 2-3 sentences on what Maxima should specifically do in response. Be direct and tactical. No em dashes.

"observations": array of 3-4 strings about patterns Maxima should act on

"topSignal": single most important competitive signal in 8 words or fewer

Return ONLY the JSON. No other text.`;

  try {
    const res = await fetch('/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    const data = await res.json();
    clearInterval(iv);
    if (data.error) throw new Error(data.error);

    allEvents = data.events || [];
    observations = data.observations || [];
    topSignal = data.topSignal || '';

    updateSummary();
    render();

    const note = document.getElementById('footNote');
    note.style.display = 'block';
    note.textContent = `Scanned ${new Date().toLocaleString()}. Sources: competitor event pages, web search, LinkedIn signals. Verify before acting on any intel.`;

  } catch(err) {
    clearInterval(iv);
    area.innerHTML = `<div class="empty"><i class="ti ti-alert-triangle"></i><strong>Scan failed</strong><span>${err.message}</span></div>`;
  }

  btn.disabled = false;
  btn.innerHTML = '<i class="ti ti-radar"></i> Run weekly scan';
}
