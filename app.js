let rival = 'all';
let allEvents = [];
let observations = [];

function setRival(r, el) {
  rival = r;
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('on'));
  el.classList.add('on');
  render();
}

function badgeClass(r) {
  return 'rb-' + r;
}

function rivalLabel(r) {
  const m = { rillet:'Rillet', numeric:'Numeric', campfire:'Campfire', klarity:'Klarity', floqast:'FloQast', blackline:'BlackLine' };
  return m[r] || r;
}

function render() {
  const area = document.getElementById('area');
  const evts = rival === 'all' ? allEvents : allEvents.filter(e => e.rival === rival);

  if (evts.length === 0 && allEvents.length > 0) {
    area.innerHTML = '<div class="empty"><i class="ti ti-search-off"></i><strong>No events for this filter</strong><span>Try another competitor.</span></div>';
    return;
  }
  if (allEvents.length === 0) return;

  let html = '<div class="section-label">Events detected</div>';

  html += evts.map(e => `
    <div class="card">
      <div class="card-top">
        <div>
          <div class="card-meta">
            <span class="rbadge ${badgeClass(e.rival)}">${rivalLabel(e.rival)}</span>
            <span class="ftype">${e.format || 'Event'}</span>
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
      <div class="card-foot">
        <span class="src"><i class="ti ti-link" style="font-size:12px;"></i>${e.source || ''}</span>
        ${e.url ? `<a class="viewlink" href="${e.url}" target="_blank">Source <i class="ti ti-external-link" style="font-size:12px;"></i></a>` : ''}
      </div>
    </div>
  `).join('');

  if (rival === 'all' && observations.length > 0) {
    html += '<div class="section-label">Patterns and observations</div>';
    html += observations.map(o => `<div class="obs-card"><p>${o}</p></div>`).join('');
  }

  area.innerHTML = html;
}

function updateSummary() {
  const rivals = new Set(allEvents.map(e => e.rival)).size;
  const cities = {};
  allEvents.forEach(e => {
    if (e.location) {
      const c = e.location.split(',')[0].trim();
      cities[c] = (cities[c] || 0) + 1;
    }
  });
  const topCity = Object.entries(cities).sort((a, b) => b[1] - a[1])[0];

  document.getElementById('evtCount').textContent = allEvents.length;
  document.getElementById('rivalCount').textContent = rivals;
  document.getElementById('hotCity').textContent = topCity ? topCity[0] : 'Various';
  document.getElementById('summaryRow').style.display = 'grid';
}

async function runScan() {
  const btn = document.getElementById('runBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="ti ti-loader-2"></i> Scanning...';

  const steps = [
    'Checking Rillet and Numeric...',
    'Scanning Campfire and Klarity...',
    'Pulling FloQast events...',
    'Checking BlackLine activity...',
    'Compiling briefing...'
  ];
  let si = 0;
  const area = document.getElementById('area');
  area.innerHTML = `
    <div class="loading">
      <div class="lstep" id="lstep">${steps[0]}</div>
      <div class="lbar"><div class="lbar-fill"></div></div>
      <div class="lsub">Searching web, event pages, and LinkedIn signals. Real sources only.</div>
    </div>
  `;
  const iv = setInterval(() => {
    si = (si + 1) % steps.length;
    const el = document.getElementById('lstep');
    if (el) el.textContent = steps[si];
  }, 2000);

  const today = new Date().toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' });

  const prompt = `You are a competitive intelligence analyst for Maxima, an agentic accounting and finance software company.

Today is ${today}. Search the web for field marketing events from the past 30 days for these six competitors:

1. Rillet (rillet.com, linkedin.com/company/team-rillet)
2. Numeric (numeric.io, linkedin.com/company/numeric-io)
3. Campfire (hi.meetcampfire.com/events, linkedin.com/company/meetcampfire)
4. Klarity (klarity.ai/events, linkedin.com/company/tryklarity)
5. FloQast (floqast.com/events, linkedin.com/company/floqast)
6. BlackLine (blackline.com/events, linkedin.com/company/blackline-systems)

For each company search for: field events, executive dinners, roundtables, happy hours, webinars, conference sponsorships, user conferences, golf outings. Also look for LinkedIn posts about events and marketing leader activity.

Return ONLY a JSON object with two keys:
- "events": array of event objects (find as many real ones as possible, aim for 8 to 15)
- "observations": array of 3 to 4 strings about patterns or trends Maxima should know about

Each event object must have:
- rival: one of "rillet","numeric","campfire","klarity","floqast","blackline"
- title: short event title (max 10 words)
- summary: what this event is and why it matters to Maxima (max 35 words, no em dashes)
- format: "Dinner" or "Happy hour" or "Roundtable" or "Webinar" or "Conference" or "Workshop" or "Golf outing" or "User conference" or another relevant label
- location: city and state or country (or "Virtual")
- date: specific date or "Month YYYY"
- audience: target titles like "CFOs, Controllers" etc
- cohost: partner or co-host name, or null
- theme: event topic or theme, or null
- promotion: how it was promoted such as "LinkedIn post" or "Event page" or "Email", or null
- source: domain only e.g. "floqast.com"
- url: real full URL if found, otherwise null

Only include real events you actually find. Use null for unknown fields rather than guessing. Return ONLY the JSON object, no other text.`;

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

    updateSummary();
    render();

    const note = document.getElementById('footNote');
    note.style.display = 'block';
    note.textContent = `Scanned ${new Date().toLocaleString()}. Sources: competitor event pages, web search, LinkedIn signals. Verify URLs before sharing externally.`;

  } catch (err) {
    clearInterval(iv);
    area.innerHTML = `<div class="empty"><i class="ti ti-alert-triangle"></i><strong>Scan failed</strong><span>Try again in a moment. ${err.message}</span></div>`;
  }

  btn.disabled = false;
  btn.innerHTML = '<i class="ti ti-radar"></i> Run weekly scan';
}
