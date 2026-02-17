/* =============================================================
   QUIZ-PLAY.JS  —  v3 (Clean & Fixed)

   BUGS FIXED vs previous version:
   ✅  All 4 options always render  (was: option A sometimes missing
       because CSS animation-delay caused it to appear transparent)
   ✅  Timer NEVER pauses when an answer is selected  (was: stopTimer()
       was called on selectAnswer)
   ✅  Timer NEVER stops on advance  (continuous single countdown)
   ✅  Clean professional layout with no disappearing elements
   ============================================================= */

// ── Quiz bank ──────────────────────────────────────────────────
const QUIZ_DATA = {
  climate: [
    { q: "What is the primary greenhouse gas responsible for global warming?",            a: ["Carbon Dioxide (CO₂)",                      "Methane (CH₄)",                          "Water Vapor (H₂O)",                    "Nitrous Oxide (N₂O)"],                   c: 0 },
    { q: "Which human activity contributes the most to climate change?",                 a: ["Burning fossil fuels",                      "Deforestation",                          "Agriculture",                          "Industrial processes"],                  c: 0 },
    { q: "What is the main cause of rising sea levels?",                                 a: ["Melting glaciers and ice caps",              "Increased rainfall",                     "Underwater volcanic activity",         "Ocean currents changing"],               c: 0 },
    { q: "What does 'carbon footprint' refer to?",                                       a: ["Total greenhouse gases emitted by humans",   "Amount of carbon in soil",               "CO₂ in the atmosphere",                "Carbon stored in forests"],              c: 0 },
    { q: "Which of these is a renewable energy source?",                                 a: ["Solar power",                               "Coal",                                   "Natural gas",                          "Nuclear energy"],                        c: 0 },
    { q: "What is the Paris Agreement's main goal?",                                     a: ["Limit global warming to well below 2°C",    "Eliminate all fossil fuels by 2050",     "Plant 1 trillion trees worldwide",     "Reduce plastic use by 50%"],             c: 0 },
    { q: "Which ecosystem is most effective at absorbing carbon dioxide?",               a: ["Rainforests",                               "Deserts",                                "Grasslands",                           "Tundra"],                                c: 0 },
    { q: "What does 'net zero emissions' mean?",                                         a: ["Balancing emitted and removed greenhouse gases", "No emissions at all",               "Only using solar energy",              "Planting trees for every emission"],     c: 0 },
    { q: "Which of these is NOT a consequence of climate change?",                       a: ["Increased oxygen levels",                   "More extreme weather events",            "Ocean acidification",                  "Loss of biodiversity"],                  c: 0 },
    { q: "What percentage of climate scientists agree humans cause climate change?",     a: ["Over 97%",                                  "About 50%",                              "Less than 30%",                        "Exactly 75%"],                           c: 0 },
    { q: "Which gas is released when permafrost melts?",                                 a: ["Methane",                                   "Oxygen",                                 "Nitrogen",                             "Helium"],                                c: 0 },
    { q: "What is the albedo effect?",                                                   a: ["Reflection of sunlight by Earth's surface", "Absorption of heat by oceans",           "Greenhouse gas trapping heat",         "Carbon cycling in ecosystems"],          c: 0 },
    { q: "Which industry is the largest contributor to greenhouse gases?",               a: ["Energy production",                         "Transportation",                         "Agriculture",                          "Manufacturing"],                         c: 0 },
    { q: "What is coral bleaching caused by?",                                           a: ["Warmer ocean temperatures",                  "Overfishing",                            "Plastic pollution",                    "Oil spills"],                            c: 0 },
    { q: "Which country currently emits the most greenhouse gases?",                     a: ["China",                                     "United States",                          "India",                                "Russia"],                                c: 0 },
    { q: "What does IPCC stand for?",                                                    a: ["Intergovernmental Panel on Climate Change", "International Pollution Control Committee","Institute for Planetary Climate Care", "International Panel for Climate Conservation"], c: 0 },
    { q: "Which of these is a carbon sink?",                                             a: ["Forests",                                   "Coal mines",                             "Oil refineries",                       "Cement factories"],                      c: 0 },
    { q: "What is the main cause of the ozone hole?",                                    a: ["CFCs (Chlorofluorocarbons)",                 "Carbon dioxide",                         "Methane",                              "Water vapor"],                           c: 0 },
    { q: "Which renewable energy source uses heat from within the Earth?",               a: ["Geothermal",                                "Hydroelectric",                          "Wind",                                 "Biomass"],                               c: 0 },
    { q: "What is the Keeling Curve?",                                                   a: ["Graph showing rising CO₂ levels",           "Sea level rise measurement",             "Global temperature record",            "Ice melt tracking"],                     c: 0 }
  ],
  pollution: [
    { q: "Which type of pollution causes the most human deaths worldwide?",              a: ["Air pollution",                             "Water pollution",                        "Soil pollution",                       "Noise pollution"],                       c: 0 },
    { q: "What are microplastics?",                                                      a: ["Tiny plastic particles less than 5mm",       "Biodegradable plastics",                 "Plastic recycling pellets",            "Plastic manufacturing waste"],           c: 0 },
    { q: "Which river is considered the most polluted in the world?",                    a: ["Ganges River",                              "Nile River",                             "Amazon River",                         "Yangtze River"],                         c: 0 },
    { q: "What is the Great Pacific Garbage Patch?",                                     a: ["A massive collection of marine debris",      "A polluted fishing area",                "An oil spill location",                "A toxic algae bloom"],                   c: 0 },
    { q: "Which air pollutant causes acid rain?",                                        a: ["Sulfur dioxide",                            "Carbon monoxide",                        "Ozone",                                "Particulate matter"],                    c: 0 },
    { q: "What is eutrophication?",                                                      a: ["Excess nutrients causing algae blooms",      "Water turning acidic",                   "Oil spill contamination",              "Heavy metal accumulation"],              c: 0 },
    { q: "Which plastic item is most commonly found in ocean pollution?",                a: ["Plastic bags",                              "Plastic bottles",                        "Fishing nets",                         "Food wrappers"],                         c: 0 },
    { q: "What does PM2.5 refer to?",                                                    a: ["Fine particulate matter ≤2.5 micrometers",  "Pollution at 2.5 m height",              "Water pollution index",                "Noise pollution level"],                 c: 0 },
    { q: "Which heavy metal causes Minamata disease?",                                   a: ["Mercury",                                   "Lead",                                   "Cadmium",                              "Arsenic"],                               c: 0 },
    { q: "What is light pollution?",                                                     a: ["Excessive artificial light",                "Light from pollution fires",             "Reflected pollution light",            "Natural light disruption"],              c: 0 },
    { q: "Which chemical caused the Bhopal disaster?",                                   a: ["Methyl isocyanate",                         "Cyanide",                                "Dioxin",                               "PCB"],                                   c: 0 },
    { q: "What is bioremediation?",                                                      a: ["Using organisms to clean pollution",         "Chemical treatment of waste",            "Physical removal of pollutants",       "Burning waste at high temperatures"],    c: 0 },
    { q: "Which pollutant causes 'blue baby syndrome'?",                                 a: ["Nitrates",                                  "Lead",                                   "Mercury",                              "Arsenic"],                               c: 0 },
    { q: "What is thermal pollution?",                                                   a: ["Discharge of heated water into water bodies","Pollution causing temperature rise",     "Heat from industrial processes",       "Global warming effects"],                c: 0 },
    { q: "Which gas causes indoor air pollution from cooking fires?",                    a: ["Carbon monoxide",                           "Methane",                                "Ozone",                                "Radon"],                                 c: 0 },
    { q: "What does DDT stand for?",                                                     a: ["Dichlorodiphenyltrichloroethane",            "Dioxin Derivative Toxin",                "Dangerous Developmental Toxin",        "Degradable Detergent Type"],             c: 0 },
    { q: "Which pollution type affects whales and dolphins most?",                       a: ["Noise pollution",                           "Plastic pollution",                      "Chemical pollution",                   "Oil pollution"],                         c: 0 },
    { q: "What is the main source of ocean plastic pollution?",                          a: ["Land-based sources (rivers, coastlines)",   "Ships and boats",                        "Offshore drilling",                    "Natural sources"],                       c: 0 },
    { q: "Which country has the world's worst air pollution?",                           a: ["Bangladesh",                                "China",                                  "India",                                "Pakistan"],                              c: 0 },
    { q: "What is smog?",                                                                a: ["Smoke + fog air pollution",                 "Soil contamination",                     "Water pollution foam",                 "Industrial smoke"],                      c: 0 }
  ],
  recycling: [
    { q: "Which material takes the longest to decompose in a landfill?",                 a: ["Glass",                                     "Plastic",                                "Paper",                                "Aluminum"],                              c: 0 },
    { q: "What does the recycling symbol with three arrows represent?",                  a: ["Reduce, Reuse, Recycle",                    "Collect, Process, Manufacture",          "Paper, Plastic, Glass",                "Home, Factory, Store"],                  c: 0 },
    { q: "Which plastic recycling number indicates PET?",                                a: ["1",                                         "2",                                      "3",                                    "4"],                                     c: 0 },
    { q: "What is composting?",                                                          a: ["Decomposing organic waste into fertilizer",  "Burning waste for energy",               "Melting plastic for reuse",            "Sorting recyclables"],                   c: 0 },
    { q: "Which item is NOT typically accepted in curbside recycling?",                  a: ["Pizza boxes with grease stains",            "Clean glass bottles",                    "Aluminum cans",                        "Newspapers"],                            c: 0 },
    { q: "What percentage of plastic ever produced has been recycled?",                  a: ["Less than 10%",                             "About 25%",                              "Around 50%",                           "Over 75%"],                              c: 0 },
    { q: "Which country recycles the highest percentage of its waste?",                  a: ["Germany",                                   "Sweden",                                 "Japan",                                "South Korea"],                           c: 0 },
    { q: "What is upcycling?",                                                           a: ["Turning waste into higher-value products",  "Basic recycling processes",              "Downcycling materials",                "Composting at home"],                    c: 0 },
    { q: "Which material is infinitely recyclable without quality loss?",                a: ["Aluminum",                                  "Plastic",                                "Paper",                                "Glass"],                                 c: 0 },
    { q: "What does EPR stand for in recycling?",                                        a: ["Extended Producer Responsibility",          "Environmental Protection Recycling",     "Eco-Friendly Product Recovery",        "Efficient Plastic Reuse"],               c: 0 },
    { q: "Which item should never go in recycling bins?",                                a: ["Batteries",                                 "Clean cardboard",                        "Metal cans",                           "Plastic bottles"],                       c: 0 },
    { q: "What is wishcycling?",                                                         a: ["Putting non-recyclables in recycling hoping they'll be recycled", "Wishing for better recycling facilities", "Recycling only certain items", "Hoping recycled items get reused"], c: 0 },
    { q: "How many times can paper typically be recycled?",                              a: ["5–7 times",                                 "1–2 times",                              "10–12 times",                          "Unlimited times"],                       c: 0 },
    { q: "What is the main benefit of recycling aluminum?",                              a: ["Saves 95% of energy vs new production",     "Creates better quality aluminum",        "It's easier than other materials",     "No sorting required"],                   c: 0 },
    { q: "Which plastic is most commonly recycled?",                                     a: ["PET (plastic bottles)",                     "PVC (pipes)",                            "Polystyrene (foam)",                   "LDPE (plastic bags)"],                   c: 0 },
    { q: "What does MRF stand for?",                                                     a: ["Materials Recovery Facility",               "Municipal Recycling Factory",            "Mixed Resource Facility",              "Main Recycling Facility"],               c: 0 },
    { q: "Which country invented the first curbside recycling program?",                 a: ["United States",                             "Germany",                                "Japan",                                "Sweden"],                                c: 0 },
    { q: "What is the circular economy?",                                                a: ["Eliminating waste through continual resource use", "Recycling everything possible",   "Using only renewable resources",       "Trading recycled materials globally"],   c: 0 },
    { q: "Which city has the highest recycling rate in the world?",                      a: ["San Francisco, USA",                        "Tokyo, Japan",                           "Berlin, Germany",                      "Seoul, South Korea"],                    c: 0 },
    { q: "What percentage of e-waste gets recycled globally?",                           a: ["Less than 20%",                             "About 40%",                              "Around 60%",                           "Over 80%"],                              c: 0 }
  ],
  biodiversity: [
    { q: "What percentage of Earth's species have gone extinct in the last 500 years?",  a: ["About 75%",                                 "Less than 10%",                          "Around 25%",                           "Over 90%"],                              c: 2 },
    { q: "Which habitat has the highest biodiversity?",                                  a: ["Tropical rainforests",                      "Coral reefs",                            "Savannas",                             "Temperate forests"],                     c: 0 },
    { q: "What does IUCN stand for?",                                                    a: ["International Union for Conservation of Nature", "International United Conservation Network", "Institute for Understanding Climate Nature", "International Union of Conservation Needs"], c: 0 },
    { q: "Which is the most biodiverse country in the world?",                           a: ["Brazil",                                    "Indonesia",                              "Colombia",                             "China"],                                 c: 0 },
    { q: "What is an endemic species?",                                                  a: ["Species found only in one specific location","Species that migrate seasonally",        "Species that adapt easily",            "Species found worldwide"],               c: 0 },
    { q: "Which group of animals is most threatened with extinction?",                   a: ["Amphibians",                                "Birds",                                  "Mammals",                              "Reptiles"],                              c: 0 },
    { q: "What is the main cause of biodiversity loss?",                                 a: ["Habitat destruction",                       "Climate change",                         "Pollution",                            "Overhunting"],                           c: 0 },
    { q: "How many mass extinctions has Earth experienced?",                             a: ["5",                                         "3",                                      "7",                                    "10"],                                    c: 0 },
    { q: "What is a biodiversity hotspot?",                                              a: ["Region with many endemic species under threat", "Area with highest species count",    "Place where new species are found",    "Protected natural reserve"],             c: 0 },
    { q: "Which animal is a keystone species in its ecosystem?",                         a: ["Sea otter",                                 "Panda",                                  "Tiger",                                "Elephant"],                              c: 0 },
    { q: "What percentage of insect species are declining?",                             a: ["Over 40%",                                  "Less than 10%",                          "About 25%",                            "Exactly 50%"],                           c: 0 },
    { q: "Which treaty protects endangered species from international trade?",           a: ["CITES",                                     "CBD",                                    "UNFCCC",                               "Ramsar"],                                c: 0 },
    { q: "What is the current extinction rate vs natural background rate?",              a: ["100–1000× higher",                          "About the same",                         "10–50× higher",                        "Slightly lower"],                        c: 0 },
    { q: "Which is the world's most trafficked mammal?",                                 a: ["Pangolin",                                  "Rhino",                                  "Elephant",                             "Tiger"],                                 c: 0 },
    { q: "What does CBD stand for in conservation?",                                     a: ["Convention on Biological Diversity",        "Conservation Biodiversity Directive",    "Center for Biological Diversity",      "Committee for Biodiversity Development"],c: 0 },
    { q: "Which coral reef system is the largest in the world?",                         a: ["Great Barrier Reef",                        "Mesoamerican Reef",                      "Red Sea Coral Reef",                   "New Caledonia Barrier Reef"],            c: 0 },
    { q: "What percentage of the world's plants are used in medicine?",                  a: ["About 25%",                                 "Less than 5%",                           "Over 50%",                             "Nearly 75%"],                            c: 0 },
    { q: "Which animal went extinct in 2016?",                                           a: ["Bramble Cay melomys (rodent)",              "Dodo bird",                              "Passenger pigeon",                     "Tasmanian tiger"],                       c: 0 },
    { q: "What is genetic diversity?",                                                   a: ["Variety of genes within a species",         "Number of different species",            "Different ecosystems in an area",      "Variety of plant species"],              c: 0 },
    { q: "Which country has the most UNESCO World Heritage natural sites?",              a: ["China",                                     "United States",                          "Australia",                            "Brazil"],                                c: 0 }
  ]
};

// ── Constants ──────────────────────────────────────────────────
const TOTAL_SEC  = 10 * 60;          // 600 seconds = 10 minutes
const CIRC       = 2 * Math.PI * 33; // SVG circle r=33 → 207.3

// ── State ──────────────────────────────────────────────────────
let domain    = "";
let questions = [];
let qIndex    = 0;
let score     = 0;
let locked    = false;
let timerID   = null;
let timeLeft  = TOTAL_SEC;
let log       = [];  // answer review entries

// ── DOM ────────────────────────────────────────────────────────
const quizScreen    = document.getElementById("quizScreen");
const resultScreen  = document.getElementById("resultScreen");
const questionCountEl = document.getElementById("questionCounter");
const progressFill  = document.getElementById("progressFill");
const liveScoreEl   = document.getElementById("liveScore");
const domainTag     = document.getElementById("domainTag");
const timerArcEl    = document.getElementById("timerArc");
const timerLabelEl  = document.getElementById("timerLabel");
const qNumEl        = document.getElementById("qNum");
const questionTextEl= document.getElementById("questionText");
const optionsGrid   = document.getElementById("optionsGrid");

// ── Helpers ────────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function prepareQuestions(raw) {
  return shuffle(raw).map(item => {
    const pairs       = item.a.map((text, i) => ({ text, correct: i === item.c }));
    const shuffled    = shuffle(pairs);
    const correctIdx  = shuffled.findIndex(p => p.correct);
    return { q: item.q, a: shuffled.map(p => p.text), c: correctIdx };
  });
}

function fmtTime(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, "0");
  const s = String(sec % 60).padStart(2, "0");
  return `${m}:${s}`;
}

// ── Init ───────────────────────────────────────────────────────
function init() {
  domain = localStorage.getItem("quizDomain") || "climate";
  if (!QUIZ_DATA[domain]) { alert("Unknown domain: " + domain); return; }

  questions = prepareQuestions(QUIZ_DATA[domain]);
  domainTag.textContent = domain.toUpperCase();

  startTimer();
  renderQuestion();
}

// ── Timer (runs continuously — never pauses) ───────────────────
function startTimer() {
  timeLeft = TOTAL_SEC;
  updateTimerUI();

  timerID = setInterval(() => {
    timeLeft--;
    updateTimerUI();

    if (timeLeft <= 0) {
      clearInterval(timerID);
      handleTimesUp();
    }
  }, 1000);
}

function updateTimerUI() {
  const pct    = timeLeft / TOTAL_SEC;
  const offset = CIRC * (1 - pct);

  timerArcEl.style.strokeDashoffset = offset;
  timerLabelEl.textContent = fmtTime(timeLeft);

  // Colour states
  timerArcEl.classList.remove("warn", "danger");
  timerLabelEl.classList.remove("warn", "danger");

  if (timeLeft <= 60) {
    timerArcEl.classList.add("danger");
    timerLabelEl.classList.add("danger");
  } else if (timeLeft <= 3 * 60) {
    timerArcEl.classList.add("warn");
    timerLabelEl.classList.add("warn");
  }
}

// ── Render Question ────────────────────────────────────────────
function renderQuestion() {
  locked = false;

  const total = questions.length;
  const q     = questions[qIndex];
  const LETTERS = ["A", "B", "C", "D"];

  // HUD
  questionCountEl.textContent  = `${qIndex + 1} / ${total}`;
  qNumEl.textContent           = `Q${qIndex + 1}`;
  progressFill.style.width     = `${(qIndex / total) * 100}%`;
  liveScoreEl.textContent      = score;
  questionTextEl.textContent   = q.q;

  // ── Build all 4 option buttons immediately (no opacity animation) ──
  optionsGrid.innerHTML = "";

  q.a.forEach((optText, i) => {
    const btn = document.createElement("button");
    btn.className = "opt-btn";
    btn.innerHTML = `
      <span class="opt-letter">${LETTERS[i]}</span>
      <span class="opt-text">${optText}</span>
    `;
    // Use onclick (not addEventListener) to avoid any async/closure issues
    btn.onclick = () => handleAnswer(btn, i);
    optionsGrid.appendChild(btn);
  });
}

// ── Handle Answer ──────────────────────────────────────────────
function handleAnswer(clickedBtn, selectedIdx) {
  if (locked) return;
  locked = true;
  // ⚠️  Timer intentionally NOT stopped here — it keeps running!

  const q = questions[qIndex];
  disableAllOptions();

  if (selectedIdx === q.c) {
    clickedBtn.classList.add("correct");
    score++;
    liveScoreEl.textContent = score;
    log.push({ q: q.q, your: q.a[selectedIdx], correct: q.a[q.c], status: "correct" });
  } else {
    clickedBtn.classList.add("wrong");
    optionsGrid.children[q.c].classList.add("correct");
    log.push({ q: q.q, your: q.a[selectedIdx], correct: q.a[q.c], status: "wrong" });
  }

  setTimeout(advance, 1000);
}

function disableAllOptions() {
  Array.from(optionsGrid.children).forEach(b => { b.disabled = true; });
}

// ── Advance ────────────────────────────────────────────────────
function advance() {
  qIndex++;
  if (qIndex < questions.length) {
    renderQuestion();
  } else {
    clearInterval(timerID);
    showResults();
  }
}

// ── Times Up ───────────────────────────────────────────────────
function handleTimesUp() {
  if (locked) {
    // mid-answer-delay: log remaining and go
    logRemaining(qIndex + 1);
  } else {
    locked = true;
    disableAllOptions();

    // Show correct answer for current question
    const q = questions[qIndex];
    optionsGrid.children[q.c].classList.add("correct");
    log.push({ q: q.q, your: "⏱ Time's up", correct: q.a[q.c], status: "skipped" });
    logRemaining(qIndex + 1);
  }

  showTimesUpOverlay();
  setTimeout(showResults, 2000);
}

function logRemaining(from) {
  for (let i = from; i < questions.length; i++) {
    log.push({ q: questions[i].q, your: "Not reached", correct: questions[i].a[questions[i].c], status: "skipped" });
  }
}

function showTimesUpOverlay() {
  const el = document.createElement("div");
  el.id = "timesUpOverlay";
  el.className = "timesup-overlay";
  el.innerHTML = `
    <div class="timesup-box">
      <div class="timesup-icon">⏰</div>
      <div class="timesup-title">Time's Up!</div>
      <div class="timesup-sub">Calculating your results…</div>
    </div>
  `;
  document.body.appendChild(el);
}

// ── Show Results ───────────────────────────────────────────────
function showResults() {
  // Remove overlay if present
  const ov = document.getElementById("timesUpOverlay");
  if (ov) ov.remove();

  quizScreen.classList.add("hidden");
  resultScreen.classList.remove("hidden");

  progressFill.style.width = "100%";

  const total   = questions.length;
  const correct = log.filter(r => r.status === "correct").length;
  const wrong   = log.filter(r => r.status === "wrong").length;
  const skipped = log.filter(r => r.status === "skipped").length;
  const pct     = total ? Math.round((correct / total) * 100) : 0;

  document.getElementById("finalScore").textContent  = correct;
  document.getElementById("finalTotal").textContent  = total;
  document.getElementById("statCorrect").textContent = correct;
  document.getElementById("statWrong").textContent   = wrong;
  document.getElementById("statSkipped").textContent = skipped;
  document.getElementById("statAccuracy").textContent= pct + "%";

  const { emoji, msg } = flair(pct);
  document.getElementById("resultEmoji").textContent = emoji;
  document.getElementById("resultMsg").textContent   = msg;

  buildReview();
  submitToBackend(correct, total);
}

function flair(pct) {
  if (pct >= 90) return { emoji: "🏆", msg: "Outstanding! You're an expert!" };
  if (pct >= 75) return { emoji: "🌟", msg: "Great work — you really know this!" };
  if (pct >= 60) return { emoji: "👍", msg: "Good effort! Keep it up!" };
  if (pct >= 40) return { emoji: "📚", msg: "Room to grow — keep learning!" };
  return          { emoji: "🌱", msg: "Every quiz makes you smarter!" };
}

// ── Build Review ───────────────────────────────────────────────
function buildReview() {
  const list = document.getElementById("reviewList");
  list.innerHTML = "";

  log.forEach((item, i) => {
    const icon = item.status === "correct" ? "✓" : item.status === "wrong" ? "✗" : "—";
    const el = document.createElement("div");
    el.className = "review-item";
    el.innerHTML = `
      <div class="rv-icon ${item.status}">${icon}</div>
      <div class="rv-body">
        <div class="rv-q">Q${i + 1}: ${item.q}</div>
        <div class="rv-ans">
          ${item.status === "correct"
            ? `<span class="rv-yours ok">✓ ${item.your}</span>`
            : `<span class="rv-yours">Your answer: ${item.your}</span>
               <span class="rv-correct">Correct: ${item.correct}</span>`
          }
        </div>
      </div>
    `;
    list.appendChild(el);
  });
}

// ── Backend Submit ─────────────────────────────────────────────
async function submitToBackend(scoreVal, total) {
  try {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (!user) return;

    const res = await fetch("http://127.0.0.1:8000/quiz/submit", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ username: user.username, domain, score: scoreVal })
    });

    if (res.ok) await refreshUser(user.username);
    else console.error("Submit failed:", await res.json());
  } catch (e) {
    console.error("Submit error:", e);
  }
}

async function refreshUser(username) {
  try {
    const res  = await fetch(`http://127.0.0.1:8000/user/${username}`);
    const data = await res.json();
    if (res.ok) localStorage.setItem("currentUser", JSON.stringify(data));
  } catch (e) {
    console.error("Refresh error:", e);
  }
}

// ── Navigation ─────────────────────────────────────────────────
function goDashboard() {
  window.location.href = "dashboard.html";
}

function restartQuiz() {
  clearInterval(timerID);

  qIndex = 0; score = 0; locked = false; log = [];
  questions = prepareQuestions(QUIZ_DATA[domain]);

  resultScreen.classList.add("hidden");
  quizScreen.classList.remove("hidden");

  liveScoreEl.textContent  = 0;
  progressFill.style.width = "0%";

  // Reset timer ring
  timerArcEl.classList.remove("warn","danger");
  timerLabelEl.classList.remove("warn","danger");
  timerArcEl.style.strokeDashoffset = "0";
  timerLabelEl.textContent = "10:00";

  startTimer();
  renderQuestion();
}

// ── Start ──────────────────────────────────────────────────────
init();