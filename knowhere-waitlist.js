/* knowhere-waitlist.js — pre-launch waitlist (modal + inline)
 * Include once per page:  <script src="./knowhere-waitlist.js?v=6" defer></script>
 * - Turns every "start knowing"/"free week"/"Log in" CTA into a waitlist opener (no markup edits).
 * - window.KnowhereWaitlist.open({type,plan,source})   → modal
 * - window.KnowhereWaitlist.mount(el,{type})            → inline form (waitlist.html, teacher card)
 * - Set window.KNOWHERE_LIVE = true (or remove this script) at launch and CTAs go back to normal.
 * Posts to /api/waitlist (server.js). Vanilla JS, no deps.
 */
(function () {
  'use strict';
  if (window.KNOWHERE_LIVE) return;
  if (window.KnowhereWaitlist) return; // the dc runtime can execute helmet scripts a second time
  var API = (window.KNOWHERE_WAITLIST_API || '') + '/api/waitlist';
  var STATES = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT', 'Outside AU'];
  var YEARS = {
    student: { label: "I'm in", opts: ['Year 12', 'Year 11', 'Year 10 or below'] },
    parent:  { label: 'My kid is in', opts: ['Year 12', 'Year 11', 'Year 10 or below'] },
    teacher: { label: 'I teach', opts: ['Year 12', 'Year 11', 'Both Year 11 & 12', 'Other'] }
  };
  var COPY = {
    student: { h: "if you're waiting for a sign, this is it.", p: "Year 12, rebuilt for your brain. The doors open before the exams — get on the list and you're at the front of the queue. No elbows required.", btn: 'get on the list' },
    parent:  { h: "if you're waiting for a sign, this is it.", p: "A study system built for how your kid actually learns — and a window into how it's really going. Three emails: a week out, three days out, launch day. Then peace breaks out at dinner.", btn: 'get on the list' },
    teacher: { h: "if you're waiting for a sign, this is it.", p: "The teacher experience lands right after the student launch. The first 50 on this list get three months free and first say in how the classroom tools work. Yes, that's a bribe. A good one.", btn: 'claim a founding seat' },
    login:   { h: "nothing to log into. yet.", p: "The Goat is still cooking. Get on the list and we'll hold the door — you'll be first through it before the exams.", btn: 'get on the list' }
  };
  var DONE = {
    student: "You're on the list. Check your inbox — and until the doors open, the real thing is already on the site to poke.",
    parent:  "You're on the list. You'll hear from us a week out, three days out, and on the day. Then it's their turn.",
    teacherSeat: "Seat confirmed. Three months free, first say on the classroom tools, and the Goat's personal respect.",
    teacher: "The founding seats are gone, but you're first in line for what's next. The Goat has noted your enthusiasm."
  };

  /* ── The Goat (head paths lifted verbatim from the app's GOAT_PATHS; legs + treadmill from GoatTyping) ── */
  var GOAT = {"sage-l":[{"d":"M29.4,24.4 C25,21.4 18,21.6 15.2,24.8 C18.6,28.8 24.4,30.2 29.4,29.2 Z","f":"c"},{"d":"M19.4,24.6 C21.8,25.1 24,25.9 25.6,26.7","f":"n","s":"b","w":0.75},{"d":"M23.30,31.30 A2.1,2.1 0 0 1 19.10,31.30 A2.1,2.1 0 0 1 23.30,31.30 Z","f":"n","s":"a","w":1.4},{"d":"M40.6,25.4 C42.8,20.4 46.6,18 50.6,19 C49,22.8 45.2,25.8 41.4,27 Z","f":"c"},{"d":"M43.4,24 C45.6,21.9 47.8,20.6 49.7,20.2","f":"n","s":"b","w":0.95},{"d":"M30.8,24.4 C29.6,17 26,10.2 18.6,6 C22.2,11.2 24.8,17.8 26.6,25 Z","f":"c"},{"d":"M40.6,24.2 C39.4,15.4 36,7.4 29.8,2.4 C32.8,8.4 34.9,15.6 35.5,24.4 Z","f":"c"},{"d":"M28.8,21.6 C27.6,23.8 27.2,25.4 27.2,27.2 C27.2,29.6 27.3,31.2 27.5,32.7 C27.9,35 28.3,36.6 29,37.7 C29.8,39.4 30.6,40.8 31.7,41.8 C32.8,43.4 34,44.8 35.2,45.7 C36.4,47.2 37.4,48.2 38.4,48.7 C39.2,49.2 40,49.2 40.7,49 C42.6,48.6 45,48 46.7,47.2 C47.6,46.8 48.2,46.5 48.2,45.9 C48.4,44.6 47.9,43.8 47.3,42.9 C46.6,41.2 45.9,39.4 45.3,37.7 C44.7,35.6 44,33.6 43.3,31.6 C42.6,29.4 41.8,27.4 40.9,25.5 C40.4,23.6 39.8,22.2 39,21 C35.6,21.4 32,21.6 28.8,21.6 Z","f":"c"},{"d":"M39.4,49.2 L46.8,48.4 L46.6,56.6 L45.4,49.6 L44.6,59.2 L43.4,49.8 L42.6,62.6 L41.6,49.8 L40.8,58.2 L39.9,49.6 Z","f":"g"},{"d":"M30.2,22.2 L31,15.8 L31.9,21.6 L32.7,14.4 L33.5,21.4 L34.3,16 L35.1,22.2 Z","f":"g"},{"d":"M44.64,45.37 A1,0.38 42 0 1 43.16,44.03 A1,0.38 42 0 1 44.64,45.37 Z","f":"b"},{"d":"M46.89,45.04 A0.8,0.33 42 0 1 45.71,43.96 A0.8,0.33 42 0 1 46.89,45.04 Z","f":"b"},{"d":"M34.49,31.18 A1.3,2 8 0 1 31.91,30.82 A1.3,2 8 0 1 34.49,31.18 Z","f":"b"},{"d":"M40.19,30.78 A1.3,2 8 0 1 37.61,30.42 A1.3,2 8 0 1 40.19,30.78 Z","f":"b"},{"d":"M40.9,48.3 C42.8,49.2 45.4,48.4 47,47.2","f":"n","s":"b","w":1.1},{"d":"M31.01,26.20 L35.12,25.33 L35.39,26.60 L31.28,27.47 Z","f":"b"},{"d":"M36.70,25.55 L40.74,24.40 L41.10,25.65 L37.06,26.80 Z","f":"b"},{"d":"M30.20,29.61 Q30.13,28.71 31.03,28.65 L35.02,28.37 Q35.92,28.30 35.98,29.20 L36.20,32.39 Q36.27,33.29 35.37,33.35 L31.38,33.63 Q30.48,33.70 30.42,32.80 L30.20,29.61 Z","f":"n","s":"b","w":1.15},{"d":"M35.90,29.21 Q35.83,28.31 36.73,28.25 L40.72,27.97 Q41.62,27.90 41.68,28.80 L41.90,31.99 Q41.97,32.89 41.07,32.95 L37.08,33.23 Q36.18,33.30 36.12,32.40 L35.90,29.21 Z","f":"n","s":"b","w":1.15},{"d":"M30.31,31.20 L28.35,29.95","f":"n","s":"b","w":1.0},{"d":"M41.79,30.40 L43.65,29.15","f":"n","s":"b","w":1.0},{"d":"M34.53,31.19 A0.62,1.35 8 0 1 33.31,31.01 A0.62,1.35 8 0 1 34.53,31.19 Z","f":"c"},{"d":"M40.23,30.79 A0.62,1.35 8 0 1 39.01,30.61 A0.62,1.35 8 0 1 40.23,30.79 Z","f":"c"}],"sage-r":[{"d":"M29.4,24.4 C25,21.4 18,21.6 15.2,24.8 C18.6,28.8 24.4,30.2 29.4,29.2 Z","f":"c"},{"d":"M19.4,24.6 C21.8,25.1 24,25.9 25.6,26.7","f":"n","s":"b","w":0.75},{"d":"M23.30,31.30 A2.1,2.1 0 0 1 19.10,31.30 A2.1,2.1 0 0 1 23.30,31.30 Z","f":"n","s":"a","w":1.4},{"d":"M40.6,25.4 C42.8,20.4 46.6,18 50.6,19 C49,22.8 45.2,25.8 41.4,27 Z","f":"c"},{"d":"M43.4,24 C45.6,21.9 47.8,20.6 49.7,20.2","f":"n","s":"b","w":0.95},{"d":"M30.8,24.4 C29.6,17 26,10.2 18.6,6 C22.2,11.2 24.8,17.8 26.6,25 Z","f":"c"},{"d":"M40.6,24.2 C39.4,15.4 36,7.4 29.8,2.4 C32.8,8.4 34.9,15.6 35.5,24.4 Z","f":"c"},{"d":"M28.8,21.6 C27.6,23.8 27.2,25.4 27.2,27.2 C27.2,29.6 27.3,31.2 27.5,32.7 C27.9,35 28.3,36.6 29,37.7 C29.8,39.4 30.6,40.8 31.7,41.8 C32.8,43.4 34,44.8 35.2,45.7 C36.4,47.2 37.4,48.2 38.4,48.7 C39.2,49.2 40,49.2 40.7,49 C42.6,48.6 45,48 46.7,47.2 C47.6,46.8 48.2,46.5 48.2,45.9 C48.4,44.6 47.9,43.8 47.3,42.9 C46.6,41.2 45.9,39.4 45.3,37.7 C44.7,35.6 44,33.6 43.3,31.6 C42.6,29.4 41.8,27.4 40.9,25.5 C40.4,23.6 39.8,22.2 39,21 C35.6,21.4 32,21.6 28.8,21.6 Z","f":"c"},{"d":"M39.4,49.2 L46.8,48.4 L46.6,56.6 L45.4,49.6 L44.6,59.2 L43.4,49.8 L42.6,62.6 L41.6,49.8 L40.8,58.2 L39.9,49.6 Z","f":"g"},{"d":"M30.2,22.2 L31,15.8 L31.9,21.6 L32.7,14.4 L33.5,21.4 L34.3,16 L35.1,22.2 Z","f":"g"},{"d":"M44.64,45.37 A1,0.38 42 0 1 43.16,44.03 A1,0.38 42 0 1 44.64,45.37 Z","f":"b"},{"d":"M46.89,45.04 A0.8,0.33 42 0 1 45.71,43.96 A0.8,0.33 42 0 1 46.89,45.04 Z","f":"b"},{"d":"M34.49,31.18 A1.3,2 8 0 1 31.91,30.82 A1.3,2 8 0 1 34.49,31.18 Z","f":"b"},{"d":"M40.19,30.78 A1.3,2 8 0 1 37.61,30.42 A1.3,2 8 0 1 40.19,30.78 Z","f":"b"},{"d":"M40.9,48.3 C42.8,49.2 45.4,48.4 47,47.2","f":"n","s":"b","w":1.1},{"d":"M31.01,26.20 L35.12,25.33 L35.39,26.60 L31.28,27.47 Z","f":"b"},{"d":"M36.70,25.55 L40.74,24.40 L41.10,25.65 L37.06,26.80 Z","f":"b"},{"d":"M30.20,29.61 Q30.13,28.71 31.03,28.65 L35.02,28.37 Q35.92,28.30 35.98,29.20 L36.20,32.39 Q36.27,33.29 35.37,33.35 L31.38,33.63 Q30.48,33.70 30.42,32.80 L30.20,29.61 Z","f":"n","s":"b","w":1.15},{"d":"M35.90,29.21 Q35.83,28.31 36.73,28.25 L40.72,27.97 Q41.62,27.90 41.68,28.80 L41.90,31.99 Q41.97,32.89 41.07,32.95 L37.08,33.23 Q36.18,33.30 36.12,32.40 L35.90,29.21 Z","f":"n","s":"b","w":1.15},{"d":"M30.31,31.20 L28.35,29.95","f":"n","s":"b","w":1.0},{"d":"M41.79,30.40 L43.65,29.15","f":"n","s":"b","w":1.0},{"d":"M33.09,30.99 A0.62,1.35 8 0 1 31.87,30.81 A0.62,1.35 8 0 1 33.09,30.99 Z","f":"c"},{"d":"M38.79,30.59 A0.62,1.35 8 0 1 37.57,30.41 A0.62,1.35 8 0 1 38.79,30.59 Z","f":"c"}],"delighted":[{"d":"M29.4,24.4 C25,21.4 18,21.6 15.2,24.8 C18.6,28.8 24.4,30.2 29.4,29.2 Z","f":"c"},{"d":"M19.4,24.6 C21.8,25.1 24,25.9 25.6,26.7","f":"n","s":"b","w":0.75},{"d":"M23.30,31.30 A2.1,2.1 0 0 1 19.10,31.30 A2.1,2.1 0 0 1 23.30,31.30 Z","f":"n","s":"a","w":1.4},{"d":"M40.6,25.4 C42.8,20.4 46.6,18 50.6,19 C49,22.8 45.2,25.8 41.4,27 Z","f":"c"},{"d":"M43.4,24 C45.6,21.9 47.8,20.6 49.7,20.2","f":"n","s":"b","w":0.95},{"d":"M30.8,24.4 C29.6,17 26,10.2 18.6,6 C22.2,11.2 24.8,17.8 26.6,25 Z","f":"c"},{"d":"M40.6,24.2 C39.4,15.4 36,7.4 29.8,2.4 C32.8,8.4 34.9,15.6 35.5,24.4 Z","f":"c"},{"d":"M28.8,21.6 C27.6,23.8 27.2,25.4 27.2,27.2 C27.2,29.6 27.3,31.2 27.5,32.7 C27.9,35 28.3,36.6 29,37.7 C29.8,39.4 30.6,40.8 31.7,41.8 C32.8,43.4 34,44.8 35.2,45.7 C36.4,47.2 37.4,48.2 38.4,48.7 C39.2,49.2 40,49.2 40.7,49 C42.6,48.6 45,48 46.7,47.2 C47.6,46.8 48.2,46.5 48.2,45.9 C48.4,44.6 47.9,43.8 47.3,42.9 C46.6,41.2 45.9,39.4 45.3,37.7 C44.7,35.6 44,33.6 43.3,31.6 C42.6,29.4 41.8,27.4 40.9,25.5 C40.4,23.6 39.8,22.2 39,21 C35.6,21.4 32,21.6 28.8,21.6 Z","f":"c"},{"d":"M39.4,49.2 L46.8,48.4 L46.6,56.6 L45.4,49.6 L44.6,59.2 L43.4,49.8 L42.6,62.6 L41.6,49.8 L40.8,58.2 L39.9,49.6 Z","f":"g"},{"d":"M30.2,22.2 L31,15.8 L31.9,21.6 L32.7,14.4 L33.5,21.4 L34.3,16 L35.1,22.2 Z","f":"g"},{"d":"M44.64,45.37 A1,0.38 42 0 1 43.16,44.03 A1,0.38 42 0 1 44.64,45.37 Z","f":"b"},{"d":"M46.89,45.04 A0.8,0.33 42 0 1 45.71,43.96 A0.8,0.33 42 0 1 46.89,45.04 Z","f":"b"},{"d":"M31.6,31.5 Q33.2,28.8 34.800000000000004,31.5","f":"n","s":"b","w":1.25},{"d":"M37.3,31.1 Q38.9,28.400000000000002 40.5,31.1","f":"n","s":"b","w":1.25},{"d":"M40.6,47.9 Q44.2,52.2 47.4,46.5","f":"n","s":"b","w":1.1}],"wink":[{"d":"M29.4,24.4 C25,21.4 18,21.6 15.2,24.8 C18.6,28.8 24.4,30.2 29.4,29.2 Z","f":"c"},{"d":"M19.4,24.6 C21.8,25.1 24,25.9 25.6,26.7","f":"n","s":"b","w":0.75},{"d":"M23.30,31.30 A2.1,2.1 0 0 1 19.10,31.30 A2.1,2.1 0 0 1 23.30,31.30 Z","f":"n","s":"a","w":1.4},{"d":"M40.6,25.4 C42.8,20.4 46.6,18 50.6,19 C49,22.8 45.2,25.8 41.4,27 Z","f":"c"},{"d":"M43.4,24 C45.6,21.9 47.8,20.6 49.7,20.2","f":"n","s":"b","w":0.95},{"d":"M30.8,24.4 C29.6,17 26,10.2 18.6,6 C22.2,11.2 24.8,17.8 26.6,25 Z","f":"c"},{"d":"M40.6,24.2 C39.4,15.4 36,7.4 29.8,2.4 C32.8,8.4 34.9,15.6 35.5,24.4 Z","f":"c"},{"d":"M28.8,21.6 C27.6,23.8 27.2,25.4 27.2,27.2 C27.2,29.6 27.3,31.2 27.5,32.7 C27.9,35 28.3,36.6 29,37.7 C29.8,39.4 30.6,40.8 31.7,41.8 C32.8,43.4 34,44.8 35.2,45.7 C36.4,47.2 37.4,48.2 38.4,48.7 C39.2,49.2 40,49.2 40.7,49 C42.6,48.6 45,48 46.7,47.2 C47.6,46.8 48.2,46.5 48.2,45.9 C48.4,44.6 47.9,43.8 47.3,42.9 C46.6,41.2 45.9,39.4 45.3,37.7 C44.7,35.6 44,33.6 43.3,31.6 C42.6,29.4 41.8,27.4 40.9,25.5 C40.4,23.6 39.8,22.2 39,21 C35.6,21.4 32,21.6 28.8,21.6 Z","f":"c"},{"d":"M39.4,49.2 L46.8,48.4 L46.6,56.6 L45.4,49.6 L44.6,59.2 L43.4,49.8 L42.6,62.6 L41.6,49.8 L40.8,58.2 L39.9,49.6 Z","f":"g"},{"d":"M30.2,22.2 L31,15.8 L31.9,21.6 L32.7,14.4 L33.5,21.4 L34.3,16 L35.1,22.2 Z","f":"g"},{"d":"M44.64,45.37 A1,0.38 42 0 1 43.16,44.03 A1,0.38 42 0 1 44.64,45.37 Z","f":"b"},{"d":"M46.89,45.04 A0.8,0.33 42 0 1 45.71,43.96 A0.8,0.33 42 0 1 46.89,45.04 Z","f":"b"},{"d":"M34.49,31.18 A1.3,2 8 0 1 31.91,30.82 A1.3,2 8 0 1 34.49,31.18 Z","f":"b"},{"d":"M37.3,30.6 Q38.9,32.4 40.5,30.3","f":"n","s":"b","w":1.3},{"d":"M40.9,48.4 Q44,51 47.2,46.9","f":"n","s":"b","w":1.1}]};
  function gcol(f) { return f === 'c' ? 'currentColor' : f === 'g' ? 'var(--gm-goatee,#7BEA5A)' : f === 'b' ? 'var(--gm-bg,#0C0D10)' : f === 'n' ? 'none' : f; }
  function gscol(x) { return x === 'b' ? 'var(--gm-bg,#0C0D10)' : x === 'a' ? 'var(--gm-accent,#9EA0A6)' : x; }
  function goatHead(pose, cls) {
    var ps = GOAT[pose] || [], out = '<g class="' + (cls || '') + '">';
    for (var i = 0; i < ps.length; i++) { var q = ps[i]; out += '<path d="' + q.d + '" fill="' + gcol(q.f) + '"' + (q.s ? ' stroke="' + gscol(q.s) + '" stroke-width="' + (q.w || 1) + '" stroke-linecap="round" stroke-linejoin="round"' : '') + '/>'; }
    return out + '</g>';
  }
  var LEGS = '<g class="kwl-legL"><path d="M18.2,2 L23.8,1.4 L24.8,13.6 L19.2,13.8 Z" fill="#FFFFFF"/><path d="M19.0,13.2 L25.0,13.0 L25.5,16.5 Q25.6,18.2 22.3,18.3 Q19.1,18.4 19.0,16.6 Z" fill="#111113" stroke="#FFFFFF" stroke-width="0.7"/><path d="M22.3,13.6 L22.4,17.6" stroke="#FFFFFF" stroke-width="0.6"/></g>' +
    '<g class="kwl-legR"><path d="M40.2,1.4 L45.8,2 L44.8,13.8 L39.2,13.6 Z" fill="#FFFFFF"/><path d="M39.0,13.0 L45.0,13.2 L45.0,16.6 Q44.9,18.4 41.7,18.3 Q38.4,18.2 38.5,16.5 Z" fill="#111113" stroke="#FFFFFF" stroke-width="0.7"/><path d="M41.7,13.6 L41.6,17.6" stroke="#FFFFFF" stroke-width="0.6"/></g>' +
    '<rect x="6" y="20.5" width="52" height="7" rx="3.2" fill="rgba(255,255,255,0.13)" stroke="rgba(255,255,255,0.16)" stroke-width="1"/><path d="M11,24 h4 M19,24 h4 M27,24 h4 M35,24 h4 M43,24 h4 M51,24 h2" stroke="rgba(255,255,255,0.3)" stroke-width="1.3" stroke-linecap="round"/>';
  function goatCooking(label) {
    return '<div class="kwl-goat" aria-hidden="true"><div class="kwl-goat-head"><svg viewBox="0 0 64 64">' + goatHead('sage-l', 'kwl-gA') + goatHead('sage-r', 'kwl-gB') + '</svg></div>' +
      '<svg class="kwl-goat-legs" viewBox="0 0 64 30">' + LEGS + '</svg>' +
      '</div>';
  }
  var GM_RIG = '<svg class="gm-rig" aria-hidden="true" viewBox="0 0 300 200" style="position:absolute;width:0;height:0;overflow:hidden;pointer-events:none"> <g class="gm-root"> <g data-j="g-torso" transform="translate(140,112)"> <g data-j="g-tail" transform="translate(-43,-12)"> <circle cx="0" cy="0" r="5" fill="var(--goat-coat,#F5F5EF)"/> <path d="M3,4 C0.5,-5 -4,-13 -10,-18 C-8,-9 -5,-2 -2,4.5 Z" fill="var(--goat-coat,#F5F5EF)"/></g> <g data-j="g-leg-bl" transform="translate(-38,12)" opacity="0.62"> <circle cx="0" cy="0" r="5.6" fill="var(--goat-coat,#F5F5EF)"/> <path d="M5.4,0 Q3.3,13 4.7,25.4 L-4.7,25.4 Q-3.3,13 -5.4,0 Z" fill="var(--goat-coat,#F5F5EF)"/> <circle cx="0" cy="26" r="4.9" fill="var(--goat-coat,#F5F5EF)"/> <g data-j="g-leg-bl-lo" transform="translate(0,26)"> <circle cx="0" cy="0" r="4.7" fill="var(--goat-coat,#F5F5EF)"/> <path d="M4.6,0 Q3.1,10 3.9,18.6 L-3.9,18.6 Q-3.1,10 -4.6,0 Z" fill="var(--goat-coat,#F5F5EF)"/> <circle cx="0" cy="19" r="4.1" fill="var(--goat-coat,#F5F5EF)"/> <path d="M-4.4,18.4 H4.4 L4.9,26.4 Q4.9,30 2.1,30 L0,25.8 L-2.1,30 Q-4.9,30 -4.9,26.4 Z" fill="var(--goat-hoof,#AEB6AE)"/></g></g> <g data-j="g-leg-br" transform="translate(-28,12)"> <circle cx="0" cy="0" r="5.6" fill="var(--goat-coat,#F5F5EF)"/> <path d="M5.4,0 Q3.3,13 4.7,25.4 L-4.7,25.4 Q-3.3,13 -5.4,0 Z" fill="var(--goat-coat,#F5F5EF)"/> <circle cx="0" cy="26" r="4.9" fill="var(--goat-coat,#F5F5EF)"/> <g data-j="g-leg-br-lo" transform="translate(0,26)"> <circle cx="0" cy="0" r="4.7" fill="var(--goat-coat,#F5F5EF)"/> <path d="M4.6,0 Q3.1,10 3.9,18.6 L-3.9,18.6 Q-3.1,10 -4.6,0 Z" fill="var(--goat-coat,#F5F5EF)"/> <circle cx="0" cy="19" r="4.1" fill="var(--goat-coat,#F5F5EF)"/> <path d="M-4.4,18.4 H4.4 L4.9,26.4 Q4.9,30 2.1,30 L0,25.8 L-2.1,30 Q-4.9,30 -4.9,26.4 Z" fill="var(--goat-hoof,#AEB6AE)"/></g></g> <g data-j="g-body" transform="translate(0,0)"> <path d="M-45,-10 C-44,-22 -32,-25 -14,-25 C4,-25 26,-24 38,-19 C47,-15 51,-9 50,-2 C49,7 44,17 34,21 C22,26 4,25 -12,21 C-28,17 -44,12 -45,2 C-46,-3 -46,-6 -45,-10 Z" fill="var(--goat-coat,#F5F5EF)"/></g> <g data-j="g-leg-fl" transform="translate(32,12)" opacity="0.62"> <circle cx="0" cy="0" r="5.6" fill="var(--goat-coat,#F5F5EF)"/> <path d="M5.4,0 Q3.3,13 4.7,25.4 L-4.7,25.4 Q-3.3,13 -5.4,0 Z" fill="var(--goat-coat,#F5F5EF)"/> <circle cx="0" cy="26" r="4.9" fill="var(--goat-coat,#F5F5EF)"/> <g data-j="g-leg-fl-lo" transform="translate(0,26)"> <circle cx="0" cy="0" r="4.7" fill="var(--goat-coat,#F5F5EF)"/> <path d="M4.6,0 Q3.1,10 3.9,18.6 L-3.9,18.6 Q-3.1,10 -4.6,0 Z" fill="var(--goat-coat,#F5F5EF)"/> <circle cx="0" cy="19" r="4.1" fill="var(--goat-coat,#F5F5EF)"/> <path d="M-4.4,18.4 H4.4 L4.9,26.4 Q4.9,30 2.1,30 L0,25.8 L-2.1,30 Q-4.9,30 -4.9,26.4 Z" fill="var(--goat-hoof,#AEB6AE)"/></g></g> <g data-j="g-leg-fr" transform="translate(42,12)"> <circle cx="0" cy="0" r="5.6" fill="var(--goat-coat,#F5F5EF)"/> <path d="M5.4,0 Q3.3,13 4.7,25.4 L-4.7,25.4 Q-3.3,13 -5.4,0 Z" fill="var(--goat-coat,#F5F5EF)"/> <circle cx="0" cy="26" r="4.9" fill="var(--goat-coat,#F5F5EF)"/> <g data-j="g-leg-fr-lo" transform="translate(0,26)"> <circle cx="0" cy="0" r="4.7" fill="var(--goat-coat,#F5F5EF)"/> <path d="M4.6,0 Q3.1,10 3.9,18.6 L-3.9,18.6 Q-3.1,10 -4.6,0 Z" fill="var(--goat-coat,#F5F5EF)"/> <circle cx="0" cy="19" r="4.1" fill="var(--goat-coat,#F5F5EF)"/> <path d="M-4.4,18.4 H4.4 L4.9,26.4 Q4.9,30 2.1,30 L0,25.8 L-2.1,30 Q-4.9,30 -4.9,26.4 Z" fill="var(--goat-hoof,#AEB6AE)"/></g></g> <g data-j="g-neck" transform="translate(37,-10)"> <circle cx="0" cy="0" r="11" fill="var(--goat-coat,#F5F5EF)"/> <path d="M-10.5,4 Q-8,-22 3,-49 L19,-45 Q12,-21 10.5,3 Z" fill="var(--goat-coat,#F5F5EF)"/> <circle cx="11" cy="-48" r="8.6" fill="var(--goat-coat,#F5F5EF)"/> <g data-j="g-head" transform="translate(11,-48)"> <g transform="scale(1.35) translate(-29,-31)"> <g data-j="g-ear-l" transform="translate(29.4,26.8) rotate(-18)"> <path d="M0,-2.4 C-4.4,-5.4 -11.4,-5.2 -14.2,-2 C-10.8,2 -5,3.4 0,2.4 Z" fill="var(--goat-coat,#F5F5EF)"/></g> <g data-j="g-ear-r" transform="translate(41,26.2) rotate(20)"> <path d="M-0.4,-0.8 C1.8,-5.8 5.6,-8.2 9.6,-7.2 C8,-3.4 4.2,-0.4 0.4,0.8 Z" fill="var(--goat-coat,#F5F5EF)"/></g> <path d="M28.8,21.6 C27.6,23.8 27.2,25.4 27.2,27.2 C27.2,29.6 27.3,31.2 27.5,32.7 C27.9,35 28.3,36.6 29,37.7 C29.8,39.4 30.6,40.8 31.7,41.8 C32.8,43.4 34,44.8 35.2,45.7 C36.4,47.2 37.4,48.2 38.4,48.7 C39.2,49.2 40,49.2 40.7,49 C42.6,48.6 45,48 46.7,47.2 C47.6,46.8 48.2,46.5 48.2,45.9 C48.4,44.6 47.9,43.8 47.3,42.9 C46.6,41.2 45.9,39.4 45.3,37.7 C44.7,35.6 44,33.6 43.3,31.6 C42.6,29.4 41.8,27.4 40.9,25.5 C40.4,23.6 39.8,22.2 39,21 C35.6,21.4 32,21.6 28.8,21.6 Z" fill="var(--goat-coat,#F5F5EF)"/> <path d="M39.4,49.2 L46.8,48.4 L46.6,56.6 L45.4,49.6 L44.6,59.2 L43.4,49.8 L42.6,62.6 L41.6,49.8 L40.8,58.2 L39.9,49.6 Z" fill="var(--goat-hair,#7BEA5A)"/> <path d="M30.2,22.2 L31,15.8 L31.9,21.6 L32.7,14.4 L33.5,21.4 L34.3,16 L35.1,22.2 Z" fill="var(--goat-hair,#7BEA5A)"/> <g data-j="g-horns" transform="translate(33,24)"> <path d="M-2.2,0.4 C-3.4,-7 -7,-13.8 -14.4,-18 C-10.8,-12.8 -8.2,-6.2 -6.4,1 Z" fill="var(--goat-horn,#E4E4DA)"/> <path d="M7.6,0.2 C6.4,-8.6 3,-16.6 -3.2,-21.6 C-0.2,-15.6 1.9,-8.4 2.5,0.4 Z" fill="var(--goat-horn,#E4E4DA)"/></g> <g data-j="g-face"> <path d="M34.49,31.18 A1.3,2 8 0 1 31.91,30.82 A1.3,2 8 0 1 34.49,31.18 Z" fill="var(--goat-ink,#0A0C0A)"/> <path d="M40.19,30.78 A1.3,2 8 0 1 37.61,30.42 A1.3,2 8 0 1 40.19,30.78 Z" fill="var(--goat-ink,#0A0C0A)"/> <path d="M40.9,48.3 C42.8,49.2 45.4,48.4 47,47.2" fill="none" stroke="var(--goat-ink,#0A0C0A)" stroke-width="1.1" stroke-linecap="round"/></g> </g></g></g></g></g> </svg>';
  var GM_P = {
    idle:{"g-neck":-21,"g-head":17,"g-ear-l":8,"g-leg-fr":-1,"g-leg-fr-lo":-1,"g-leg-br":-1,"g-leg-bl":-1,"g-leg-bl-lo":2},
    midstride:{ty:-1,"g-tail":-6,"g-neck":-15,"g-ear-l":21,"g-ear-r":-51,"g-leg-fr":-30,"g-leg-fr-lo":23,"g-leg-fl":7,"g-leg-fl-lo":17,"g-leg-br":-26,"g-leg-br-lo":27,"g-leg-bl":10,"g-leg-bl-lo":21},
    prance:{rot:-10,ty:-6,"g-tail":22,"g-neck":-38,"g-head":-44,"g-ear-l":48,"g-ear-r":-53,"g-leg-fr":-95,"g-leg-fr-lo":-19,"g-leg-fl":-102,"g-leg-fl-lo":-26,"g-leg-br":82,"g-leg-br-lo":31,"g-leg-bl":101,"g-leg-bl-lo":32},
    laydown:{ty:30,"g-tail":-90,"g-neck":96,"g-head":1,"g-ear-l":42,"g-ear-r":-44,"g-leg-fr":-75,"g-leg-fr-lo":150,"g-leg-fl":-72,"g-leg-fl-lo":148,"g-leg-br":-72,"g-leg-br-lo":155,"g-leg-bl":-73,"g-leg-bl-lo":156}
  };
  var GM_J = ["g-tail","g-neck","g-head","g-ear-l","g-ear-r","g-leg-fr","g-leg-fr-lo","g-leg-fl","g-leg-fl-lo","g-leg-br","g-leg-br-lo","g-leg-bl","g-leg-bl-lo"];
  function gmLerp(a, b, k) { var o = {}; ['rot','ty','tx'].concat(GM_J).forEach(function (j) { var x = (a && a[j]) || 0, y = (b && b[j]) || 0; if (x || y) o[j] = x + (y - x) * k; }); return o; }
  var GM_S2 = (function (p) { var q = {}; for (var k in p) q[k] = p[k]; [["g-leg-fr","g-leg-fl"],["g-leg-fr-lo","g-leg-fl-lo"],["g-leg-br","g-leg-bl"],["g-leg-br-lo","g-leg-bl-lo"]].forEach(function (pr) { var t = q[pr[0]] || 0; q[pr[0]] = q[pr[1]] || 0; q[pr[1]] = t; }); return q; })(GM_P.midstride);
  function gmGait(ph) { return gmLerp(GM_P.midstride, GM_S2, 0.5 - 0.5 * Math.cos(ph * Math.PI * 2)); }
  function gmEase(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  var GM_GROUND = 150, GM_DUR = 3400;
  function gmFrame(t) { // the app's EXAMS OVER moment: prance-hop across, spin, flop in the grass
    if (t < 0.66) { var k = t / 0.66, ph = k * 3, kk = ph - Math.floor(ph), x = 48 + 192 * k, hop = Math.sin(kk * Math.PI) * 44;
      return { x: x, y: GM_GROUND - hop, pose: hop > 6 ? gmLerp(GM_P.midstride, GM_P.prance, Math.min(1, hop / 30)) : GM_P.midstride, spin: hop > 6 ? Math.sin(kk * Math.PI) * -8 : 0 }; }
    var k2 = (t - 0.66) / 0.34; return { x: 240, pose: gmLerp(GM_P.midstride, GM_P.laydown, gmEase(k2)) };
  }
  function goatPrance(host) {
    var NS = 'http://www.w3.org/2000/svg';
    function mk(tag, at) { var n = document.createElementNS(NS, tag); for (var k in at) n.setAttribute(k, at[k]); return n; }
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var svg = mk('svg', { 'class': 'kwl-stage', viewBox: '0 0 320 185' }); host.appendChild(svg);
    svg.appendChild(mk('line', { x1: 16, x2: 304, y1: GM_GROUND, y2: GM_GROUND, stroke: 'rgba(255,255,255,.22)', 'stroke-width': 1.4 }));
    function tuft(x, h, col, op) { var g2 = mk('g', { opacity: op }); [[-4,-0.75,-2],[0,-1,0],[4,-0.7,3]].forEach(function (b) { g2.appendChild(mk('path', { d: 'M' + (x + b[0]) + ',' + GM_GROUND + ' Q' + (x + b[0] + b[2]) + ',' + (GM_GROUND - h * b[1] * 0.6) + ' ' + (x + b[0] + b[2] * 1.6) + ',' + (GM_GROUND - h * (-b[1])), stroke: col, 'stroke-width': 1.5, 'stroke-linecap': 'round', fill: 'none' })); }); svg.appendChild(g2); }
    for (var gi = 0; gi < 12; gi++) { var gx = 24 + gi * 24 + ((gi * 7) % 9), gh = 6 + ((gi * 5) % 7); tuft(gx, gh, gi % 3 ? '#4E8F44' : '#7BEA5A', 0.5 + ((gi * 3) % 4) * 0.09); }
    var parts = []; if (!reduce) for (var i = 0; i < 10; i++) { var pp = mk('circle', { r: 2.4, fill: i % 2 ? '#EDECE8' : '#7BEA5A', opacity: 0 }); svg.appendChild(pp); parts.push({ n: pp, a: Math.PI * (0.15 + 0.7 * Math.random()) + Math.PI, v: 40 + Math.random() * 55, d: Math.random() * 0.35 }); }
    var tmp = document.createElement('div'); tmp.innerHTML = GM_RIG; var root = tmp.querySelector('.gm-root');
    var wrap = mk('g', {}); wrap.appendChild(root); svg.appendChild(wrap);
    [[214,9],[236,7],[258,10],[276,6]].forEach(function (tf, ti) { tuft(tf[0], tf[1], ti % 2 ? '#7BEA5A' : '#4E8F44', 0.8); });
    var base = {}; GM_J.concat(['g-torso']).forEach(function (j) { var n = root.querySelector('[data-j="' + j + '"]'); if (n) base[j] = n.getAttribute('transform') || ''; });
    function setG(x, y, sc, pose) {
      wrap.setAttribute('transform', 'translate(' + x + ',' + y + ') scale(' + sc + ',' + sc + ') translate(-153.5,-180)');
      GM_J.forEach(function (j) { var n = root.querySelector('[data-j="' + j + '"]'); if (!n) return; var v = pose[j] || 0; n.setAttribute('transform', base[j] + (v ? ' rotate(' + v.toFixed(2) + ')' : '')); });
      var tq = root.querySelector('[data-j="g-torso"]'), r = pose.rot || 0, ty = pose.ty || 0;
      tq.setAttribute('transform', base['g-torso'] + (ty ? ' translate(0,' + ty.toFixed(2) + ')' : '') + (r ? ' rotate(' + r.toFixed(2) + ')' : ''));
    }
    if (reduce) { setG(240, GM_GROUND, 0.5, GM_P.laydown); return; }
    var t0 = null;
    function step(ts) {
      if (t0 === null) t0 = ts; var t = Math.min(1, (ts - t0) / GM_DUR), f = gmFrame(t);
      var pose = f.spin ? Object.assign({}, f.pose, { rot: (f.pose.rot || 0) + f.spin }) : f.pose;
      setG(f.x, f.y != null ? f.y : GM_GROUND, 0.5, pose);
      parts.forEach(function (p) { var pt = Math.max(0, Math.min(1, (t - p.d) / 0.5)); if (pt <= 0 || pt >= 1) { p.n.setAttribute('opacity', 0); return; }
        p.n.setAttribute('opacity', (1 - pt) * 0.9); p.n.setAttribute('cx', 160 + Math.cos(p.a) * p.v * pt * 1.6); p.n.setAttribute('cy', GM_GROUND - 30 + Math.sin(p.a) * p.v * pt + 30 * pt * pt); });
      if (t < 1 && host.isConnected) requestAnimationFrame(step); else setG(240, GM_GROUND, 0.5, GM_P.laydown);
    }
    requestAnimationFrame(step);
  }

  var CSS = '\
.kwl-backdrop{position:fixed;inset:0;z-index:1000;background:rgba(7,7,8,.55);backdrop-filter:blur(10px) saturate(130%);-webkit-backdrop-filter:blur(10px) saturate(130%);display:flex;align-items:center;justify-content:center;padding:18px;opacity:0;transition:opacity .28s ease}\
.kwl-backdrop.in{opacity:1}\
.kwl-modal{position:relative;width:100%;max-width:540px;max-height:calc(100vh - 36px);overflow:auto;background:linear-gradient(160deg,rgba(255,255,255,.085),rgba(255,255,255,.035) 45%,rgba(123,234,90,.035));backdrop-filter:blur(28px) saturate(170%);-webkit-backdrop-filter:blur(28px) saturate(170%);border:1px solid rgba(255,255,255,.14);border-radius:28px;padding:34px 36px 30px;box-shadow:0 40px 110px rgba(0,0,0,.65),inset 0 1px 0 rgba(255,255,255,.18),0 0 0 1px rgba(123,234,90,.05);transform:translateY(14px) scale(.985);transition:transform .32s cubic-bezier(.2,.7,.2,1);font-family:Geist,-apple-system,"Segoe UI",Helvetica,Arial,sans-serif;color:#EDECE8;scrollbar-width:thin}\
.kwl-modal::before{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;background:radial-gradient(120% 60% at 50% -10%,rgba(255,255,255,.10),transparent 60%)}\
.kwl-backdrop.in .kwl-modal{transform:none}\
.kwl-x{position:absolute;top:14px;right:14px;z-index:2;width:36px;height:36px;border:0;border-radius:10px;background:rgba(255,255,255,.06);color:#8C8B87;font-size:18px;line-height:1;cursor:pointer}\
.kwl-x:hover,.kwl-x:focus-visible{background:rgba(255,255,255,.12);color:#EDECE8;outline:none}\
.kwl{position:relative}\
.kwl-kick{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;font-weight:600;letter-spacing:.26em;text-transform:uppercase;color:#7BEA5A;margin:0 0 10px}\
.kwl h2{font-size:clamp(26px,4vw,33px);font-weight:800;letter-spacing:-.035em;line-height:1.05;margin:0 0 10px;color:#EDECE8;text-transform:lowercase;text-wrap:balance}\
.kwl p.kwl-lead{font-size:15.5px;line-height:1.5;color:#B4B3AE;margin:0 auto 20px;max-width:46ch}\
.kwl-goat{display:flex;flex-direction:column;align-items:center;gap:0;margin:-6px 0 16px;color:#EDECE8;--gm-bg:#0E100E;--gm-accent:#9EA0A6;--gm-goatee:#7BEA5A}\
.kwl-goat-head{position:relative;width:64px;height:64px;animation:kwlBob .38s ease-in-out infinite alternate}\
.kwl-goat-head svg{position:absolute;inset:0;width:100%;height:100%}\
.kwl-goat-head .kwl-gB{opacity:0;animation:kwlBlink .72s steps(1,end) infinite}\
.kwl-goat-legs{width:64px;height:30px;margin-top:-29px}\
.kwl-legL{animation:kwlStomp .19s ease-in-out infinite}.kwl-legR{animation:kwlStomp .19s ease-in-out infinite .095s}\
.kwl-goat-label{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11.5px;letter-spacing:.05em;color:rgba(237,236,232,.55);margin:6px 0 0}\
.kwl-dots::after{content:"";animation:kwlDots 1.2s steps(4,end) infinite}\
@keyframes kwlDots{0%{content:""}25%{content:"."}50%{content:".."}75%{content:"..."}}\
@keyframes kwlBlink{0%,48%{opacity:0}49%,100%{opacity:1}}@keyframes kwlBob{from{transform:translateY(0)}to{transform:translateY(1.6px)}}@keyframes kwlStomp{0%,100%{transform:translateY(0)}50%{transform:translateY(4px)}}\
.kwl-seg{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;background:rgba(0,0,0,.28);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:5px;margin:0 0 18px}\
.kwl-seg button{border:0;border-radius:10px;background:transparent;color:#9b9a96;font:600 15px/1 Geist,inherit;padding:13px 8px;cursor:pointer;transition:background .18s,color .18s}\
.kwl-seg button[aria-pressed=true]{background:#EDECE8;color:#070708}\
.kwl-seg button:focus-visible{outline:2px solid #7BEA5A;outline-offset:2px}\
.kwl-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}\
.kwl-f{display:flex;flex-direction:column;gap:6px;min-width:0}.kwl-f.full{grid-column:1/-1}\
.kwl-f label{font-size:12.5px;font-weight:600;letter-spacing:.02em;color:#9b9a96}\
.kwl-f input,.kwl-f select{width:100%;appearance:none;-webkit-appearance:none;background:rgba(0,0,0,.30);border:1px solid rgba(255,255,255,.10);border-radius:12px;color:#EDECE8;font:500 19px/1.2 Geist,inherit;padding:0 16px;height:56px;line-height:56px;box-sizing:border-box;outline:none;transition:border-color .18s,box-shadow .18s,background .18s;margin:0}\
.kwl-f select{background-image:url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2712%27 height=%278%27 viewBox=%270 0 12 8%27%3E%3Cpath d=%27M1 1l5 5 5-5%27 fill=%27none%27 stroke=%27%238C8B87%27 stroke-width=%271.8%27/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 14px center;padding-right:36px}\
.kwl-f select option{background:#0C0D10;color:#EDECE8}\
.kwl-f input::placeholder{color:#6B6A66;font-size:19px}\
.kwl-f input:focus,.kwl-f select:focus{border-color:rgba(123,234,90,.65);box-shadow:0 0 0 3px rgba(123,234,90,.16);background:rgba(0,0,0,.38)}\
.kwl-f.err input,.kwl-f.err select{border-color:rgba(241,85,36,.7)}\
.kwl-hp{position:absolute;left:-9999px;width:1px;height:1px;opacity:0}\
.kwl-btn{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;margin-top:18px;border:0;border-radius:12px;background:#7BEA5A;color:#070708;font:800 20px/1 Geist,inherit;letter-spacing:.06em;padding:21px 22px;cursor:pointer;text-transform:uppercase;box-shadow:0 10px 30px rgba(123,234,90,.22);transition:transform .18s,box-shadow .18s,opacity .18s}\
.kwl-btn:hover{transform:translateY(-1px);box-shadow:0 14px 36px rgba(123,234,90,.3)}\
.kwl-btn:focus-visible{outline:2px solid #EDECE8;outline-offset:3px}\
.kwl-btn[disabled]{opacity:.6;cursor:progress;transform:none}\
.kwl-fine{font-size:12px;line-height:1.5;color:#7B7A75;margin:14px 0 0}.kwl-fine a{color:#9b9a96}\
.kwl-msg{font-size:13.5px;line-height:1.45;color:#F15524;margin:12px 0 0;min-height:0}\
.kwl-done{text-align:left}\
.kwl-prance{position:relative;height:84px;margin:0 0 6px;overflow:hidden;color:#EDECE8;--gm-bg:#0E100E;--gm-accent:#9EA0A6;--gm-goatee:#7BEA5A}\
@keyframes kwlHop{from{transform:translateY(0) rotate(-4deg)}to{transform:translateY(-14px) rotate(6deg)}}\
.kwl-done .kwl-num{font-size:clamp(54px,9vw,76px);font-weight:800;letter-spacing:-.05em;line-height:.95;margin:4px 0 10px;background:linear-gradient(90deg,#F15524,#FCB815,#7BEA5A,#23A4DD,#854896,#EC1559,#F15524);background-size:200% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:kwlDrift 8s linear infinite}\
@keyframes kwlDrift{to{background-position:200% 0}}\
.kwl-done .kwl-seat{display:inline-block;margin:0 0 14px;padding:8px 12px;border-radius:999px;background:rgba(123,234,90,.14);color:#7BEA5A;font:700 12px/1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.14em;text-transform:uppercase}\
.kwl-share{display:flex;gap:10px;flex-wrap:wrap;margin-top:20px}\
.kwl-share a,.kwl-share button{flex:1;min-width:150px;text-align:center;border-radius:12px;padding:15px 14px;font:600 16px/1 Geist,inherit;cursor:pointer;text-decoration:none;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.05);color:#EDECE8;transition:background .18s}\
.kwl-share a:hover,.kwl-share button:hover{background:rgba(255,255,255,.11)}\
.kwl{text-align:center}\
.kwl .kwl-grid,.kwl .kwl-f{text-align:left}\
.kwl-sub{font-size:13px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#7BEA5A;margin:2px 0 12px}\
.kwl-prance{position:relative;height:auto;margin:-10px auto 4px;max-width:360px;overflow:visible}\
.kwl-stage{display:block;width:100%;height:auto;--goat-coat:#F5F5EF;--goat-hoof:#AEB6AE;--goat-hair:#7BEA5A;--goat-horn:#E4E4DA;--goat-ink:#0A0C0A}\
.kwl-inline .kwl-modal{max-width:none;box-shadow:none;transform:none;padding:30px}\
@media (max-width:560px){.kwl-modal{padding:26px 20px 22px;border-radius:22px}.kwl-grid{grid-template-columns:1fr}.kwl-seg button{font-size:13px;padding:12px 4px}}\
@media (prefers-reduced-motion:reduce){.kwl-backdrop,.kwl-modal,.kwl-btn{transition:none}.kwl-done .kwl-num{animation:none;background-position:0 0}.kwl-goat-head,.kwl-legL,.kwl-legR,.kwl-dots::after{animation:none}.kwl-goat-head .kwl-gB{opacity:0}}\
';

  function el(tag, attrs, children) {
    var n = document.createElement(tag);
    if (attrs) for (var k in attrs) { if (k === 'text') n.textContent = attrs[k]; else if (k === 'html') n.innerHTML = attrs[k]; else n.setAttribute(k, attrs[k]); }
    (children || []).forEach(function (c) { if (c) n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return n;
  }
  function options(sel, list, placeholder) {
    sel.innerHTML = '';
    sel.appendChild(el('option', { value: '', text: placeholder, disabled: '', selected: '' }));
    list.forEach(function (v) { sel.appendChild(el('option', { value: v, text: v })); });
  }
  function injectCss() {
    if (document.getElementById('kwl-css')) return;
    var s = el('style', { id: 'kwl-css' }); s.textContent = CSS; document.head.appendChild(s);
  }

  // ---------- form ----------
  function buildForm(opts, onDone) {
    opts = opts || {};
    var type = YEARS[opts.type] ? opts.type : 'student';
    var reason = opts.reason || '';
    var wrap = el('div', { 'class': 'kwl' });
    var brand = el('div', { html: goatCooking('The Goat is cooking a fresh one') }).firstChild;
    var kick = el('p', { 'class': 'kwl-kick', text: "we're still cooking" });
    var h = el('h2'); var sub = el('p', { 'class': 'kwl-sub', text: 'join the waitlist' }); var lead = el('p', { 'class': 'kwl-lead' });

    var seg = el('div', { 'class': 'kwl-seg', role: 'group', 'aria-label': 'I am a' });
    ['student', 'parent', 'teacher'].forEach(function (t) {
      var b = el('button', { type: 'button', text: t === 'student' ? 'Student' : t === 'parent' ? 'Parent' : 'Teacher', 'data-t': t });
      b.addEventListener('click', function () { setType(t); }); seg.appendChild(b);
    });

    var form = el('form', { novalidate: '', autocomplete: 'on' });
    var fName = field('First name', 'text', 'kwl-name', { placeholder: 'what the Goat should call you', autocomplete: 'given-name', maxlength: '60' });
    var fEmail = field('Email', 'email', 'kwl-email', { placeholder: 'you@somewhere.com', autocomplete: 'email', required: '', inputmode: 'email', maxlength: '160' });
    var fState = selectField('State', 'kwl-state'); options(fState.input, STATES, 'Pick one');
    var fYear = selectField('Year', 'kwl-year');
    var fSchool = field('School', 'text', 'kwl-school', { placeholder: 'optional', autocomplete: 'organization', maxlength: '120' });
    var hp = el('input', { 'class': 'kwl-hp', type: 'text', name: 'website', tabindex: '-1', autocomplete: 'off', 'aria-hidden': 'true' });
    var btn = el('button', { 'class': 'kwl-btn', type: 'submit', text: 'Join the waitlist' });
    var msg = el('p', { 'class': 'kwl-msg', role: 'alert', 'aria-live': 'polite' });
    var fine = el('p', { 'class': 'kwl-fine', html: "Unsubscribe any time · <a href=\"privacy.html\">privacy</a>" });

    var grid = el('div', { 'class': 'kwl-grid' }, [fName.f, fEmail.f, fState.f, fYear.f, fSchool.f]);
    fEmail.f.classList.add('full'); fName.f.classList.add('full');
    form.appendChild(grid); form.appendChild(hp); form.appendChild(btn); form.appendChild(msg); form.appendChild(fine);
    wrap.appendChild(brand); if (!opts.compact) { wrap.appendChild(kick); wrap.appendChild(h); wrap.appendChild(sub); wrap.appendChild(lead); }
    wrap.appendChild(seg); wrap.appendChild(form);

    function field(label, typ, id, extra) {
      var f = el('div', { 'class': 'kwl-f' }); var l = el('label', { 'for': id, text: label });
      var i = el('input', Object.assign({ id: id, type: typ, name: id }, extra || {}));
      f.appendChild(l); f.appendChild(i); return { f: f, input: i, label: l };
    }
    function selectField(label, id) {
      var f = el('div', { 'class': 'kwl-f' }); var l = el('label', { 'for': id, text: label });
      var s = el('select', { id: id, name: id, required: '' }); f.appendChild(l); f.appendChild(s); return { f: f, input: s, label: l };
    }
    function setType(t) {
      type = t;
      seg.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-t') === t ? 'true' : 'false'); });
      var c = COPY[reason === 'login' ? 'login' : t]; h.textContent = c.h; lead.textContent = c.p;
      fYear.label.textContent = YEARS[t].label; options(fYear.input, YEARS[t].opts, 'Pick one');
      if (t === 'student') { fYear.input.value = 'Year 12'; }
      fSchool.f.style.display = t === 'teacher' ? '' : 'none';
      fSchool.f.classList.toggle('full', t === 'teacher');
      btn.textContent = c.btn;
    }
    setType(type);

    form.addEventListener('submit', function (e) {
      e.preventDefault(); msg.textContent = '';
      [fEmail, fState, fYear].forEach(function (x) { x.f.classList.remove('err'); });
      var email = fEmail.input.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { fEmail.f.classList.add('err'); msg.textContent = "That email doesn't look right."; fEmail.input.focus(); return; }
      if (!fState.input.value) { fState.f.classList.add('err'); msg.textContent = 'Pick your state.'; fState.input.focus(); return; }
      if (!fYear.input.value) { fYear.f.classList.add('err'); msg.textContent = 'Pick a year.'; fYear.input.focus(); return; }
      btn.disabled = true; btn.textContent = 'One sec…';
      var body = { email: email, type: type, state: fState.input.value, year: fYear.input.value, firstName: fName.input.value.trim(),
        school: type === 'teacher' ? fSchool.input.value.trim() : '', plan: opts.plan || '', source: opts.source || location.pathname.replace(/^\//, '') || 'index.html', website: hp.value };
      fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        .then(function (r) { return r.json().then(function (j) { return { s: r.status, j: j }; }); })
        .then(function (x) {
          if (!x.j || !x.j.ok) { throw new Error((x.j && x.j.error) || 'Something went wrong.'); }
          try { if (window.umami) window.umami.track('waitlist_join', { type: type, state: body.state, plan: body.plan || 'none' }); } catch (_) {}
          try { localStorage.setItem('kw_waitlist', JSON.stringify({ email: email, type: type, position: x.j.position, seat: x.j.teacherSeat })); } catch (_) {}
          onDone(Object.assign({ type: type, firstName: body.firstName, compact: !!opts.compact }, x.j));
        })
        .catch(function (err) { msg.textContent = err.message || 'Something went wrong.'; btn.disabled = false; setType(type); });
    });
    return { root: wrap, focus: function () { setTimeout(function () { fName.input.focus(); }, 60); } };
  }

  function buildDone(r) {
    var wrap = el('div', { 'class': 'kwl kwl-done' });
    var hi = r.firstName ? r.firstName + ', ' : '';
    function h2(t){ var e = el('h2'); if (r.firstName) { var sp = el('span', { text: r.firstName, style: 'text-transform:none' }); e.appendChild(sp); e.appendChild(document.createTextNode(', ' + t)); } else e.textContent = t; return e; }
    var stage = el('div', { 'class': 'kwl-prance', 'aria-hidden': 'true' }); wrap.appendChild(stage); goatPrance(stage);
    wrap.appendChild(el('p', { 'class': 'kwl-kick', text: r.existed ? 'already in' : "you're in" }));
    if (r.existed) {
      wrap.appendChild(h2("you were already on the list."));
      wrap.appendChild(el('p', { 'class': 'kwl-lead', text: "Same spot, same three emails. We've updated your details and the Goat has stopped prancing." }));
    } else {
      if (r.teacherSeat) wrap.appendChild(el('div', { 'class': 'kwl-num', text: 'seat #' + r.teacherSeat }));
      if (r.teacherSeat) wrap.appendChild(el('span', { 'class': 'kwl-seat', text: 'founding teacher · ' + r.teacherSeat + ' of 50' }));
      wrap.appendChild(h2("you're good to goat."));
      var p = r.type === 'teacher' ? (r.teacherSeat ? DONE.teacherSeat : DONE.teacher) : DONE[r.type];
      wrap.appendChild(el('p', { 'class': 'kwl-lead', text: p }));
    }
    var share = el('div', { 'class': 'kwl-share' });
    var url = 'https://knowhere.me/waitlist.html';
    if (r.type === 'student') {
      share.appendChild(el('a', { href: 'mailto:?subject=' + encodeURIComponent('This is the study app I want for Year 12') + '&body=' + encodeURIComponent("It's built around how your brain learns, every subject. I'm on the waitlist — the parent plan has a progress view so you can stop asking me how study's going. " + url), text: 'send it to your parent' }));
    } else if (r.type === 'parent') {
      share.appendChild(el('a', { href: 'mailto:?subject=' + encodeURIComponent('Year 12 study app worth a look') + '&body=' + encodeURIComponent('Built around how each kid actually learns — worth a look before the exams. ' + url), text: 'tell another parent' }));
    } else {
      share.appendChild(el('a', { href: 'mailto:?subject=' + encodeURIComponent('Founding teacher seats — knowhere') + '&body=' + encodeURIComponent('First 50 teachers get three months free. ' + url), text: 'tell the staffroom' }));
    }
    share.appendChild(el('a', { href: 'experience-it.html', text: 'poke the real thing →' }));
    wrap.appendChild(share);
    return wrap;
  }

  // ---------- modal ----------
  var open = null;
  function openModal(opts) {
    injectCss(); if (open) closeModal();
    var backdrop = el('div', { 'class': 'kwl-backdrop', role: 'presentation' });
    var modal = el('div', { 'class': 'kwl-modal', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'kwl-title' });
    var x = el('button', { 'class': 'kwl-x', type: 'button', 'aria-label': 'Close', html: '&times;' });
    var form = buildForm(opts, function (r) { modal.replaceChild(buildDone(r), modal.lastChild); modal.querySelector('h2').id = 'kwl-title'; x.focus(); });
    form.root.querySelector('h2').id = 'kwl-title';
    modal.appendChild(x); modal.appendChild(form.root); backdrop.appendChild(modal); document.body.appendChild(backdrop);
    var prevFocus = document.activeElement; var prevOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden';
    requestAnimationFrame(function () { requestAnimationFrame(function () { backdrop.classList.add('in'); }); });
    form.focus();
    function key(e) {
      if (e.key === 'Escape') { closeModal(); return; }
      if (e.key === 'Tab') {
        var f = modal.querySelectorAll('button:not([disabled]),input:not([tabindex="-1"]),select,a[href]'); if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    x.addEventListener('click', closeModal);
    backdrop.addEventListener('click', function (e) { if (e.target === backdrop) closeModal(); });
    document.addEventListener('keydown', key);
    open = { backdrop: backdrop, key: key, prevFocus: prevFocus, prevOverflow: prevOverflow };
    try { if (window.umami) window.umami.track('waitlist_open', { type: (opts && opts.type) || 'student', source: (opts && opts.source) || location.pathname }); } catch (_) {}
  }
  function closeModal() {
    if (!open) return; var o = open; open = null;
    document.removeEventListener('keydown', o.key); document.body.style.overflow = o.prevOverflow;
    o.backdrop.classList.remove('in');
    setTimeout(function () { if (o.backdrop.parentNode) o.backdrop.parentNode.removeChild(o.backdrop); }, 280);
    if (o.prevFocus && o.prevFocus.focus) o.prevFocus.focus();
  }
  function mount(container, opts) {
    injectCss(); container.classList.add('kwl-inline');
    var modal = el('div', { 'class': 'kwl-modal' });
    var form = buildForm(Object.assign({ compact: true }, opts), function (r) { modal.replaceChild(buildDone(r), modal.firstChild); });
    modal.appendChild(form.root); container.innerHTML = ''; container.appendChild(modal);
  }

  // ---------- CTA interception ----------
  var CTA_SEL = 'a.cta,a.kp-cta,a.nav-cta,a.soft,a.kwm-login,a[data-kf-goo],a[href$="pricing.html"],a[href*="app.knowhere.me"],a[data-waitlist]';
  var CTA_TEXT = /start knowing|free week|free trial|start their|claim|founding|join the (wait)?list|get on the list|let.s go|log ?in/i;
  function planOf(a) {
    var card = a.closest('[data-plan]'); if (card) return card.getAttribute('data-plan');
    var box = a.closest('.plan,article,section,.card,div');
    for (var i = 0; i < 4 && box; i++, box = box.parentElement) {
      var hd = box.querySelector('.tier,h2,h3'); if (hd) { var t = hd.textContent.trim().toLowerCase(); if (/^(core|pro|max)\b/.test(t)) return t.split(/\s/)[0]; }
    }
    return '';
  }
  function typeOf(a) {
    if (a.getAttribute('data-waitlist-type')) return a.getAttribute('data-waitlist-type');
    var p = location.pathname; if (/for-parents/.test(p)) return 'parent'; if (/for-teachers/.test(p)) return 'teacher'; return 'student';
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a'); if (!a || !a.matches(CTA_SEL)) return;
    var href = a.getAttribute('href') || '';
    var isLogin = /app\.knowhere\.me|log ?in/i.test(href + ' ' + a.textContent);
    // any "start knowing / free week / log in" intent → waitlist; plain navigation ("Experience it →") passes through
    var wants = a.hasAttribute('data-waitlist') || isLogin || CTA_TEXT.test(a.textContent);
    if (!wants || a.hasAttribute('data-no-waitlist')) return;
    e.preventDefault();
    openModal({ type: typeOf(a), plan: a.getAttribute('data-waitlist-plan') || planOf(a), reason: isLogin ? 'login' : '', source: (location.pathname.replace(/^\//, '') || 'index.html') + (isLogin ? '#login' : '') });
  }, true);

  // auto-mount inline hosts + live seat count
  function ready(fn) { if (document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }
  ready(function () {
    injectCss();
    document.querySelectorAll('[data-waitlist-inline]').forEach(function (host) { mount(host, { type: host.getAttribute('data-waitlist-inline') || 'student', source: location.pathname.replace(/^\//, '') }); });
    var seats = document.querySelectorAll('[data-seats-left-live]');
    if (seats.length) fetch(API + '/stats').then(function (r) { return r.json(); }).then(function (s) {
      seats.forEach(function (n) { n.textContent = s.teacherSeatsLeft; });
      document.querySelectorAll('[data-seats-total-live]').forEach(function (n) { n.textContent = s.teacherSeatsTotal; });
    }).catch(function () {});
    if (/[?#]waitlist/.test(location.href)) openModal({ type: typeOf(document.body), source: location.pathname.replace(/^\//, '') + '#auto' });
  });

  window.KnowhereWaitlist = { open: openModal, close: closeModal, mount: mount };
})();
