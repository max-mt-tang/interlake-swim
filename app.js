'use strict';

const $ = selector => document.querySelector(selector);
const CAL_MONTHS = ['2026-11', '2026-12', '2027-01', '2027-02'];
const mobileCalendar = window.matchMedia('(max-width: 700px)');
let calendarMonth = Math.max(0, CAL_MONTHS.indexOf(today().slice(0, 7)));
let calendarView = mobileCalendar.matches ? 'agenda' : 'month';
let viewChosen = false;
let events = [];

function el(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined && text !== null) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function icon(name) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  svg.classList.add('icon');
  svg.setAttribute('aria-hidden', 'true');
  use.setAttribute('href', `assets/icons.svg#${name}`);
  svg.append(use);
  return svg;
}

function safe(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
}

function link(value, label, className = 'text-button') {
  const url = safe(value);
  if (!url) return null;
  const parsed = new URL(url);
  const trainingVideo = (parsed.hostname === 'youtu.be' && parsed.pathname === '/bPFJCbQkZnc') || (['www.youtube.com', 'youtube.com'].includes(parsed.hostname) && parsed.searchParams.get('v') === 'bPFJCbQkZnc');
  const anchor = el('a', trainingVideo ? null : label, trainingVideo ? 'video-preview' : className);
  if (trainingVideo) {
    const frame = el('span', null, 'video-preview-image');
    const image = el('img');
    image.src = 'https://i.ytimg.com/vi/bPFJCbQkZnc/hqdefault.jpg';
    image.alt = ''; image.loading = 'lazy'; image.width = 480; image.height = 360;
    const play = el('span', '▶', 'video-play'); play.setAttribute('aria-hidden', 'true');
    frame.append(image, play);
    anchor.append(frame, el('span', label + ' · Watch on YouTube', 'video-preview-caption'));
  }
  anchor.href = url;
  anchor.target = '_blank';
  anchor.rel = 'noopener noreferrer';
  anchor.append(icon('arrow-up-right'));
  return anchor;
}

function poolLink(location) {
  const pool = POOL_DIRECTORY[location];
  const label = pool ? pool.name + ' · ' + pool.address : location;
  const anchor = link('https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(label), '', 'pool-map-link');
  const name = el('span', pool?.name || location, 'pool-name');
  name.append(icon('arrow-up-right'));
  anchor.replaceChildren(name);
  if (pool?.address) anchor.append(el('span', pool.address, 'pool-address'));
  return anchor;
}

function action(label, handler, className = 'text-button') {
  const button = el('button', label, className);
  button.type = 'button';
  button.append(icon('arrow-right'));
  button.addEventListener('click', handler);
  return button;
}

function csv(text) {
  const rows = [];
  let row = [], cell = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (quoted && text[i + 1] === '"') { cell += char; i++; }
      else quoted = !quoted;
    } else if (char === ',' && !quoted) {
      row.push(cell); cell = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && text[i + 1] === '\n') i++;
      row.push(cell);
      if (row.some(value => value.trim())) rows.push(row);
      row = []; cell = '';
    } else cell += char;
  }
  if (quoted) throw new Error('Unclosed CSV quote');
  row.push(cell);
  if (row.some(value => value.trim())) rows.push(row);
  const headers = (rows.shift() || []).map(value => value.trim());
  return rows.map(values => Object.fromEntries(headers.map((header, i) => [header, (values[i] || '').trim()])));
}

function valid(value) {
  return /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(value) &&
    !isNaN(new Date(value + 'T12:00:00Z')) &&
    new Date(value + 'T12:00:00Z').toISOString().slice(0, 10) === value;
}

function pacificParts() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  }).formatToParts(new Date());
  return Object.fromEntries(parts.map(part => [part.type, part.value]));
}

function today() {
  const p = pacificParts();
  return `${p.year}-${p.month}-${p.day}`;
}

function nowKey() {
  const p = pacificParts();
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}

function eventKey(event) {
  return (valid(event.date) ? event.date : '9999-12-31') + 'T' + (/^([01][0-9]|2[0-3]):[0-5][0-9]$/.test(event.time) ? event.time : '23:59');
}

function date(value, options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) {
  return new Date(value + 'T12:00:00Z').toLocaleDateString('en-US', { ...options, timeZone: 'UTC' });
}

function time(value) {
  if (!/^([01][0-9]|2[0-3]):[0-5][0-9]$/.test(value)) return 'Time to be confirmed';
  const [hour, minute] = value.split(':').map(Number);
  return `${hour % 12 || 12}:${String(minute).padStart(2, '0')} ${hour < 12 ? 'AM' : 'PM'}`;
}

function calendarTime(event) {
  return time(event.time) + (event.end_time ? '–' + time(event.end_time) : '');
}

function calendarClass(event) {
  if (event.type === 'Practice') return event.title.toLowerCase().includes('diving') ? 'dive' : 'swim';
  if (event.type === 'Team event') return 'team';
  return event.type === 'Home meet' ? 'home' : event.type === 'WA State' ? 'state' : 'meet';
}

function sportBadge(event) {
  const kind = calendarClass(event);
  const labels = { swim: 'SWIM', dive: 'DIVE', home: 'HOME MEET', meet: event.type === 'Dual meet' ? 'AWAY MEET' : event.type.toUpperCase(), state: 'STATE', team: 'TEAM EVENT' };
  const icons = { swim: 'swimmer', dive: 'diver', home: 'house', meet: 'map-pin', state: 'trophy', team: 'calendar-days' };
  const badge = el('span', null, 'sport-badge');
  if (icons[kind]) badge.append(icon(icons[kind]));
  badge.append(el('span', labels[kind]));
  if (event.senior_night === 'TRUE') badge.append(el('span', 'SENIOR NIGHT', 'senior-label'));
  return badge;
}

function schoolDayOff(value) {
  const holiday = SCHOOL_BREAKS.find(item => value >= item.start && value <= item.end);
  if (!holiday) return null;
  if (value === '2027-02-15') return 'Presidents Day / Midwinter break';
  if (value === '2027-01-01') return 'New Year / Winter break';
  return holiday.title;
}

async function load(url, required, fallback, allowUndated = false) {
  if (!url) return fallback;
  if (!safe(url)) throw new Error('Invalid feed URL');
  const response = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error('Feed unavailable');
  const rows = csv(await response.text());
  if (rows[0] && !required.every(header => Object.hasOwn(rows[0], header))) throw new Error('Incorrect headings');
  return rows.filter(row => row.published?.toLowerCase() === 'true' && row.title && (valid(row.date) || (allowUndated && row.type === 'Team event' && !row.date)));
}

function renderPosts(rows) {
  const target = $('#posts');
  target.replaceChildren();
  const results = $('#result-posts');
  results.replaceChildren();
  const postTime = row => row.updatedAt?.toMillis?.() ?? row.createdAt?.toMillis?.() ?? 0;
  const sorted = [...rows].filter(row => row.category !== 'Coach introduction').sort((a, b) =>
    b.date.localeCompare(a.date) || postTime(b) - postTime(a));
  if (!sorted.length) target.append(el('p', 'No announcements posted yet. Coach’s weekly updates will appear here.', 'empty'));
  for (const original of sorted) {
    // The saved legacy post still contains a removed diving note and an unrelated video link.
    const row = original.id === 'weekly-update-2026-11-22' ? {
      ...original,
      body: (original.body || '').split('\n\n').filter(paragraph => !paragraph.startsWith('Diving practice is listed Monday–Friday')).join('\n\n'),
      link: original.link?.includes('bPFJCbQkZnc') ? '' : original.link
    } : original;
    const post = el('article', null, 'post');
    const meta = el('div', null, 'post-meta');
    meta.append(el('span', date(row.date)), el('span', '·'), el('span', row.category || 'Team update'));
    const body = el('div', null, 'body');
    SwimContent.render(body, row.body || '');
    post.append(meta, el('h3', row.title), body);
    if (row.id) {
      const manage = el('a', 'Edit / delete post →', 'post-manage');
      manage.href = 'admin.html?post=' + encodeURIComponent(row.id);
      meta.append(manage);
    }
    const more = link(row.link, row.link_label || 'Read more');
    if (more) post.append(more);
    (row.category === 'Meet results' ? results : target).append(post);
  }
  if (!results.children.length) results.append(el('p', 'Meet results and PDF reports will appear here after the coach publishes them.', 'empty'));
}

function renderHome() {
  const upcoming = events.filter(event => valid(event.date) && eventKey(event) >= nowKey());
  const meet = upcoming.find(event => ['Dual meet', 'Home meet', 'WA State'].includes(event.type));
  const actions = $('#home-meet-actions');
  const deadline = $('#home-meet-deadline');
  actions.replaceChildren();
  deadline.replaceChildren();
  deadline.hidden = true;
  if (meet) {
    $('#home-meet-title').textContent = meet.title;
    $('#home-meet-month').textContent = date(meet.date, { month: 'short' }).toUpperCase();
    $('#home-meet-day').textContent = Number(meet.date.slice(8));
    $('#home-meet-kind').textContent = meet.type === 'Home meet' ? (meet.senior_night === 'TRUE' ? 'HOME · SENIOR NIGHT' : 'HOME MEET') : meet.type === 'WA State' ? 'State' : 'Away meet';
    $('#home-meet-time').textContent = date(meet.date) + ' · ' + calendarTime(meet) + ' PT';
    $('#home-meet-pool').replaceChildren(poolLink(meet.location));
    if (valid(meet.signup_deadline)) {
      deadline.hidden = false;
      const closed = meet.signup_deadline < today();
      deadline.append(el('strong', (closed ? 'Sign-up deadline passed · ' : 'Sign up by ') + date(meet.signup_deadline)));
    }
    const signup = link(meet.link, meet.type === 'Dual meet' ? 'Meet sign-up' : 'Official details', 'button');
    if (signup) actions.append(signup);
    actions.append(action('Meet details', () => showCalendarEvent(meet)));
  } else {
    $('#home-meet-title').textContent = 'Awaiting the next meet';
    $('#home-meet-month').textContent = 'NEXT';
    $('#home-meet-day').textContent = '—';
    $('#home-meet-kind').textContent = 'Stay tuned';
    $('#home-meet-time').textContent = 'New meet dates will appear here.';
    $('#home-meet-pool').textContent = 'Check the latest coach update.';
  }
  for (const kind of ['swim', 'dive']) {
    const practice = upcoming.find(event => event.type === 'Practice' && calendarClass(event) === kind);
    const heading = $(`#home-${kind}-time`);
    const button = $(`#home-${kind}-details`);
    heading.replaceChildren();
    button.hidden = !practice;
    if (practice) {
      heading.append(el('span', date(practice.date, { weekday: 'short', month: 'short', day: 'numeric' }), 'practice-date'), el('span', calendarTime(practice), 'practice-time'));
      $(`#home-${kind}-pool`).replaceChildren(poolLink(practice.location));
      button.onclick = () => showCalendarEvent(practice);
    } else {
      heading.textContent = 'Next dates coming soon';
      $(`#home-${kind}-pool`).textContent = 'Check back for the coach’s schedule.';
    }
  }
}

function showCalendarEvent(event) {
  $('#cal-event-type').textContent = event.senior_night === 'TRUE' ? 'HOME MEET · SENIOR NIGHT' : event.type;
  $('#cal-event-title').textContent = event.title;
  $('#cal-event-time').textContent = valid(event.date) ? date(event.date) + ' · ' + calendarTime(event) + ' PT' : 'Date and time to be announced';
  const pool = POOL_DIRECTORY[event.location];
  $('#cal-event-location').replaceChildren(poolLink(event.location));
  $('#cal-event-notes').textContent = event.notes || '';
  $('#cal-event-notes').hidden = !event.notes;
  const links = $('#cal-event-links');
  links.replaceChildren();
  const query = pool ? pool.name + ', ' + pool.address : event.location;
  if (query) links.append(link('https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(query), 'Pool directions', 'button button-outline'));
  const extra = link(event.link, event.type === 'Dual meet' ? 'Meet sign-up' : 'Official event details', 'button');
  if (extra) links.append(extra);
  $('#cal-dialog').showModal();
}

function renderMonth(key, year, month, count) {
  const offset = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const body = $('#cal-days');
  body.replaceChildren();
  const firstEvent = events.find(event => event.date.startsWith(key));
  // November begins with the first published practice week, matching the season start.
  const firstWeek = calendarMonth === 0 && firstEvent ? Math.floor((offset + Number(firstEvent.date.slice(8)) - 1) / 7) : 0;
  for (let week = firstWeek; week < Math.ceil((offset + count) / 7); week++) {
    const row = el('tr');
    for (let weekday = 0; weekday < 7; weekday++) {
      const day = week * 7 + weekday - offset + 1;
      const cell = el('td');
      if (day < 1 || day > count) {
        cell.className = 'cal-outside';
        cell.setAttribute('aria-hidden', 'true');
      } else {
        const keyDate = key + '-' + String(day).padStart(2, '0');
        cell.setAttribute('aria-label', date(keyDate));
        if (keyDate === today()) cell.classList.add('cal-today');
        cell.append(el('span', day, 'cal-day-number'));
        const holiday = schoolDayOff(keyDate);
        if (holiday) {
          cell.classList.add('cal-no-school');
          cell.append(el('div', holiday + ' · No school', 'cal-holiday'));
        }
        for (const event of events.filter(item => item.date === keyDate)) {
          const button = el('button', null, 'cal-event ' + calendarClass(event));
          const badge = sportBadge(event);
          if (badge) button.append(badge);
          button.type = 'button';
          button.append(el('strong', calendarTime(event)), el('span', event.title.replace('Interlake vs. ', 'vs. ').replace(' · 3A boys swim & dive', '')));
          button.setAttribute('aria-label', `${event.title}, ${date(event.date)}, ${calendarTime(event)}`);
          button.addEventListener('click', () => showCalendarEvent(event));
          cell.append(button);
        }
      }
      row.append(cell);
    }
    body.append(row);
  }
}

function renderAgenda(key, count) {
  const agenda = $('#agenda-view');
  agenda.replaceChildren();
  const monthlyEvents = events.filter(event => event.date.startsWith(key));
  const breaks = SCHOOL_BREAKS.filter(item => item.start.slice(0, 7) <= key && item.end.slice(0, 7) >= key);
  const holidayStarts = new Map(breaks.map(item => [item.start < key + '-01' ? key + '-01' : item.start, item]));
  const firstEventDay = Number(monthlyEvents[0]?.date.slice(8) || 1);
  const firstWeekday = new Date(key + '-01T12:00:00Z').getUTCDay();
  const seasonStart = calendarMonth === 0 ? key + '-' + String(Math.max(1, firstEventDay - (firstWeekday + firstEventDay - 1) % 7)).padStart(2, '0') : key + '-01';
  const dates = [...new Set([...monthlyEvents.map(event => event.date), ...holidayStarts.keys()])].filter(value => value >= seasonStart).sort();
  for (const keyDate of dates) {
    const day = el('div', null, 'agenda-day' + (keyDate === today() ? ' agenda-today' : ''));
    const dateBlock = el('div', null, 'agenda-date');
    dateBlock.append(el('span', date(keyDate, { weekday: 'short' })), el('strong', Number(keyDate.slice(8))), el('span', date(keyDate, { month: 'short' })));
    const items = el('div', null, 'agenda-items');
    const holiday = holidayStarts.get(keyDate);
    if (holiday) {
      const end = holiday.end > key + '-' + count ? key + '-' + count : holiday.end;
      items.append(el('div', holiday.title + ' · No school' + (end !== keyDate ? ' through ' + date(end, { weekday: 'short', month: 'short', day: 'numeric' }) : ''), 'agenda-holiday'));
    }
    for (const event of monthlyEvents.filter(item => item.date === keyDate)) {
      const button = el('button', null, 'agenda-event ' + calendarClass(event));
      button.type = 'button';
      const content = el('span');
      const badge = sportBadge(event);
      if (badge) content.append(badge);
      content.append(el('span', calendarTime(event), 'agenda-time'), el('span', (event.type === 'Home meet' ? 'HOME MEET · ' : '') + event.title, 'agenda-title'), el('span', POOL_DIRECTORY[event.location]?.name || event.location, 'agenda-location'));
      button.append(content, icon('chevron-right'));
      button.setAttribute('aria-label', `${event.title}, ${date(event.date)}, ${calendarTime(event)}`);
      button.addEventListener('click', () => showCalendarEvent(event));
      items.append(button);
    }
    day.append(dateBlock, items);
    agenda.append(day);
  }
  if (!monthlyEvents.length) agenda.append(el('p', 'No team events confirmed for this month yet.', 'empty'));
}

function renderCalendar() {
  const key = CAL_MONTHS[calendarMonth];
  const [year, month] = key.split('-').map(Number);
  const count = new Date(Date.UTC(year, month, 0)).getUTCDate();
  $('#cal-heading').textContent = date(key + '-01', { month: 'long', year: 'numeric' });
  document.querySelectorAll('[data-month]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.month) === calendarMonth)));
  $('#cal-prev').disabled = calendarMonth === 0;
  $('#cal-next').disabled = calendarMonth === CAL_MONTHS.length - 1;
  const summary = $('#cal-school-summary');
  summary.replaceChildren();
  const breaks = SCHOOL_BREAKS.filter(item => item.start.slice(0, 7) <= key && item.end.slice(0, 7) >= key);
  for (const item of breaks) summary.append(el('span', item.title + ': ' + date(item.start) + (item.start === item.end ? '' : ' – ' + date(item.end))));
  if (!breaks.length) summary.append(el('span', 'No school days off listed this month.'));
  renderMonth(key, year, month, count);
  renderAgenda(key, count);
  setCalendarView(calendarView);
}

function renderPendingEvents() {
  const section = $('#pending-events');
  const list = $('#pending-event-list');
  const pending = events.filter(event => event.type === 'Team event' && !valid(event.date) && event.title !== 'Final Banquet');
  section.hidden = !pending.length;
  list.replaceChildren();
  for (const event of pending) {
    const card = el('article', null, 'pending-event-card');
    const info = el('div');
    info.append(el('p', 'Date & time to be announced', 'eyebrow'), el('h4', event.title), poolLink(event.location));
    card.append(info);
    list.append(card);
  }
}

function renderBanquet() {
  const section = $('#banquet');
  const details = $('#banquet-details');
  const banquet = events.find(event => event.type === 'Team event' && event.title === 'Final Banquet');
  section.hidden = !banquet;
  details.replaceChildren();
  if (!banquet) return;
  const card = el('article', null, 'pending-event-card');
  const info = el('div');
  const when = valid(banquet.date) ? `${date(banquet.date)} · ${time(banquet.time)}` : 'Tentatively the second week of February 2027 · exact date and time to be announced';
  info.append(
    el('p', when, 'eyebrow'),
    poolLink(banquet.location),
    el('p', 'The final banquet will be a potluck. Coach Eberth expects all swimmers and parents to attend as we celebrate the season together.', 'banquet-attendance'),
    el('p', 'The potluck SignUpGenius link will be added once the date is finalized.', 'banquet-signup-note')
  );
  const signup = el('button', 'Potluck sign-up link to be added', 'button banquet-signup-button');
  signup.type = 'button';
  signup.disabled = true;
  info.append(signup);
  const image = el('img', null, 'banquet-photo');
  image.src = 'assets/banquet/chips-and-dips.jpg';
  image.alt = 'Chips with salsa and dips';
  image.loading = 'lazy';
  image.width = 325;
  image.height = 217;
  card.append(info, image);
  details.append(card);
}

function setCalendarView(view) {
  calendarView = view;
  $('#month-view').hidden = view !== 'month';
  $('#agenda-view').hidden = view !== 'agenda';
  $('#view-month').setAttribute('aria-pressed', String(view === 'month'));
  $('#view-agenda').setAttribute('aria-pressed', String(view === 'agenda'));
}

function renderMeets() {
  const target = $('#meet-rows');
  target.replaceChildren();
  for (const event of events.filter(item => item.type === 'Dual meet' || item.type === 'Home meet')) {
    const isHome = event.type === 'Home meet';
    const row = el('tr', null, isHome ? 'home-meet' : '');
    const dateCell = el('td');
    dateCell.append(el('strong', date(event.date)));
    const timeCell = el('td', time(event.time), 'meet-start');
    const matchup = el('td', null, 'meet-matchup');
    matchup.append(el('strong', event.title.replace('Senior Night · ', '').replace(' @ ', ' vs. ')), el('span', isHome ? (event.senior_night === 'TRUE' ? 'HOME MEET · SENIOR NIGHT' : 'HOME MEET') : 'AWAY MEET', 'meet-badge ' + (isHome ? 'home-badge' : 'away-badge')));
    if (event.senior_night === 'TRUE') matchup.append(el('span', 'A small party celebrating our seniors.', 'cell-detail'));
    if (event.volunteer_note) matchup.append(el('span', event.volunteer_note, 'cell-detail'));
    const poolCell = el('td');
    poolCell.append(poolLink(event.location));
    poolCell.append(action('Meet details', () => showCalendarEvent(event)));
    row.append(dateCell, timeCell, matchup, poolCell);
    target.append(row);
  }
  if (!target.children.length) {
    const row = el('tr');
    const cell = el('td', 'No dual meets posted yet.', 'empty');
    cell.colSpan = 4;
    row.append(cell);
    target.append(row);
  }
}

function renderPostseason() {
  const target = $('#postseason-rows');
  target.replaceChildren();
  for (const title of ['KingCo championships', 'District championships']) {
    const row = el('tr');
    row.append(el('th', title), el('td', 'To be confirmed'), el('td', 'Awaiting the official schedule'));
    row.firstChild.scope = 'row';
    target.append(row);
  }
  for (const event of events.filter(item => item.type === 'WA State')) {
    const row = el('tr');
    const title = el('th', event.title.replace(' · 3A boys swim & dive', ' · 3A'));
    title.scope = 'row';
    const when = el('td');
    when.append(el('strong', date(event.date)), el('span', time(event.time), 'cell-detail'));
    const location = el('td');
    location.append(poolLink(event.location));
    location.append(action('Event details', () => showCalendarEvent(event)));
    row.append(title, when, location);
    target.append(row);
  }
}

function setNavigation(open) {
  $('.site-header').classList.toggle('nav-open', open);
  $('#nav-toggle').setAttribute('aria-expanded', String(open));
  $('#nav-toggle').setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  $('#nav-toggle').replaceChildren(icon(open ? 'x' : 'menu'));
}

$('#nav-toggle').addEventListener('click', () => setNavigation($('#nav-toggle').getAttribute('aria-expanded') !== 'true'));
$('#main-nav').addEventListener('click', event => { if (event.target.closest('a')) setNavigation(false); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && $('#nav-toggle').getAttribute('aria-expanded') === 'true') {
    setNavigation(false);
    $('#nav-toggle').focus();
  }
});
document.querySelectorAll('[data-month]').forEach(button => button.addEventListener('click', () => { calendarMonth = Number(button.dataset.month); renderCalendar(); }));
$('#cal-prev').addEventListener('click', () => { if (calendarMonth > 0) { calendarMonth--; renderCalendar(); } });
$('#cal-next').addEventListener('click', () => { if (calendarMonth < CAL_MONTHS.length - 1) { calendarMonth++; renderCalendar(); } });
for (const view of ['month', 'agenda']) $(`#view-${view}`).addEventListener('click', () => { viewChosen = true; setCalendarView(view); });
mobileCalendar.addEventListener('change', () => { if (!viewChosen) setCalendarView(mobileCalendar.matches ? 'agenda' : 'month'); });
$('#cal-close').addEventListener('click', () => $('#cal-dialog').close());
$('#cal-dialog').addEventListener('click', event => {
  if (event.target !== $('#cal-dialog')) return;
  const bounds = event.target.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) event.target.close();
});

// Keep the navigation aligned with the section currently being read.
const sectionObserver = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    document.querySelectorAll('#main-nav a').forEach(anchor => {
      const active = anchor.hash === '#' + entry.target.id;
      anchor.classList.toggle('active', active);
      if (active) anchor.setAttribute('aria-current', 'location');
      else anchor.removeAttribute('aria-current');
    });
  }
}, { rootMargin: '-100px 0px -65% 0px', threshold: 0 });
document.querySelectorAll('main > section').forEach(section => sectionObserver.observe(section));

async function loadUpdates() {
  const { loadPublishedPosts } = await import('./posts-feed.js');
  const posts = await Promise.race([loadPublishedPosts(), new Promise((_, reject) => setTimeout(() => reject(new Error('Updates timed out')), 15000))]);
  if (posts !== null) return posts;
  return load(TEAM_CONFIG.updatesCsvUrl, ['published', 'date', 'title', 'body'], LOCAL_UPDATES);
}

async function init() {
  const results = await Promise.allSettled([
    loadUpdates(),
    load(TEAM_CONFIG.scheduleCsvUrl, ['published', 'date', 'time', 'end_time', 'title', 'type', 'location', 'notes', 'link'], LOCAL_EVENTS, true)
  ]);
  if (results[0].status === 'fulfilled') renderPosts(results[0].value);
  else $('#posts').textContent = 'Updates could not load. Please refresh or contact the coach.';
  events = [...(results[1].status === 'fulfilled' ? results[1].value : LOCAL_EVENTS)].sort((a, b) => eventKey(a).localeCompare(eventKey(b)));
  renderHome();
  renderCalendar();
  renderPendingEvents();
  renderBanquet();
  renderMeets();
  renderPostseason();
  const failed = results[1].status === 'rejected';
  $('#status').textContent = failed
    ? 'The live schedule could not load. Saved schedule is from Nov. 22, 2026; confirm later changes with the coach.'
    : !TEAM_CONFIG.scheduleCsvUrl
      ? 'Schedule from Coach Eberth’s Nov. 22, 2026 update · All times Pacific · Confirm later changes with the coach.'
      : 'Live schedule · All times Pacific · Refresh for the latest changes.';
  $('#editor').hidden = false;
  const editorLink = el('a', 'Sign in to post updates', 'text-button');
  editorLink.href = 'admin.html';
  $('#editor').replaceChildren(editorLink);
}
init();
