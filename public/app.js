let filters = { rival: 'all', format: 'all' };
let sortMode = 'recent';
let allEvents = [];
let observations = [];
let topSignal = '';
let expandedCards = {};

function setFilter(type, val, el) {
  filters[type] = val;
  const group = el.closest('.chips');
  group.querySelectorAll('.chip').forEach(c => c.classList.remove('on'));
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

function parseDate(dateStr) {
  if (!dateStr) return new Date(0);
  const d = new Date(dateStr);
  return isNaN(d) ? new Date(0) : d;
}

function render() {
  const area = document.getElementById('area');
  let evts = [...allEvents];

  if (filters.rival !== 'all') evts = evts.filter(e => e.rival === filters.rival);
  if (filters.format === 'virtual') evts = evts.filter(e => isVirtual(e));
  if (filters.format === 'inperson') evts = evts.filter(e => !isVirtual(e));

  if (sortMode === 'recent') {
    evts.sort((a, b) => parseDate(b.date) - parseDate(a.date));
  } else {
    evts.sort((a, b) => (b.relevance || 5) - (a.relevance || 5));
  }

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
          <div class="mx-avatar">
            <svg viewBox="0 0 12 12"><path d="M6 1L11 10H1L6 1Z"/></svg>
          </div>
          <span class="mx-response-label">Maxima play</span>
        </div>
        <div class="mx-response-text">${e.maximaPlay || 'Loading...'}</div>
      </div>

      <div class="card-foot">
        <span class="src"><i class="ti ti-link" style="font-size:12px;"></i>${e.source || ''}</span>
        <div style="display:flex;align-items:center;gap:10px;">
          <button class="mx-toggle" onclick="togglePlay(${i}, this)">
            <i class="ti ti-sparkles" style="font-size:12px;"></i>
            ${expanded ? 'Hide Maxima play' : 'Maxima play'}
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
  const panel = document.getElementById(`mx-${idx}`);
  if (expandedCards[idx]) {
    panel.style.display = 'block';
    btn.innerHTML = '<i class="ti ti-sparkles" style="font-size:12px;"></i> Hide Maxima play';
  } else {
    panel.style.display = 'none';
    btn.innerHTML = '<i class="ti ti-sparkles" style="font-size:12px;"></i> Maxima play';
  }
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

async function runScan() {
  const btn = document.getElementById('runBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="ti ti-loader-2"></i> Scanning...';
  expandedCards = {};

  const steps = ['Checking Rillet and Numeric...', 'Scanning Campfire and Klarity...', 'Pulling FloQast events...', 'Checking BlackLine activity...', 'Generating Maxima plays...'];
  let si = 0;
  const area = document.getElementById('area');
  area.innerHTML = `<div class="loading"><div class="lstep" id="lstep">${steps[0]}</div><div class="lbar"><div class="lbar-fill"></div></div><div class="lsub">Searching web, event pages, and LinkedIn signals. Real sources only.</div></div>`;
  const iv = setInterval(() => { si = (si+1)%steps.length; const el = document.getElementById('lstep'); if(el) el.textContent = steps[si]; }, 2000);

  const today = new Date().toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' });

  const prompt = `You are a competitive intelligence analyst for Maxima, an agentic accounting and finance software company. Today is ${today}.

Search the web for field marketing events from the past 30 days for these six competitors:
1. Rillet (rillet.com, linkedin.com/company/team-rillet)
2. Numeric (numeric.io, linkedin.com/company/numeric-io)
3. Campfire (hi.meetcampfire.com/events, linkedin.com/company/meetcampfire)
4. Klarity (klarity.ai/events, linkedin.com/company/tryklarity)
5. FloQast (floqast.com/events, linkedin.com/company/floqast)
6. BlackLine (blackline.com/events, linkedin.com/company/blackline-systems)

Search for: executive dinners, roundtables, happy hours, webinars, conference sponsorships, user conferences, golf outings, field events.

Return ONLY a JSON object with three keys:

"events": array of event objects. For each event:
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
- url: real full URL if found, otherwise construct the most likely URL from the source domain. Never return null for url.
- relevance: integer 1-10, how relevant is this to Maxima's competitive positioning (10 = very relevant)
- maximaPlay: 2-3 sentences on what Maxima should specifically do in response to this event. Be direct, tactical, and action-oriented. Reference the competitor by name. No em dashes.

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

  } catch (err) {
    clearInterval(iv);
    area.innerHTML = `<div class="empty"><i class="ti ti-alert-triangle"></i><strong>Scan failed</strong><span>${err.message}</span></div>`;
  }

  btn.disabled = false;
  btn.innerHTML = '<i class="ti ti-radar"></i> Run weekly scan';
}
