const API = "http://127.0.0.1:8000";

/* ---------- AUTH ---------- */
const storedUser = JSON.parse(localStorage.getItem("currentUser"));
if (!storedUser) {
  window.location.href = "index.html";
}
const currentUsername = storedUser.username;

/* ---------- DOM ---------- */
const listEl = document.getElementById("list");
const statsSummaryEl = document.getElementById("statsSummary");
const loadingEl = document.getElementById("loading");

/* ---------- UTILS ---------- */
function getUserInitials(username) {
  return username.charAt(0).toUpperCase();
}

function getUserColor(username) {
  const colors = [
    "#667eea", "#764ba2", "#f093fb", "#f5576c",
    "#4facfe", "#00f2fe", "#43e97b", "#38f9d7",
    "#fa709a", "#fee140"
  ];
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function getLevelTitle(level) {
  return ["Beginner", "Intermediate", "Advanced", "Master"][level - 1] || `Level ${level}`;
}

function getBadgesHTML(user) {
  const badges = user.subjectCertificates || [];
  let html = "";

  badges.slice(0, 3).forEach(badge => {
    html += `<div class="badge-icon"><i class="fas fa-certificate"></i></div>`;
  });

  if (badges.length > 3) {
    html += `<div class="badge-icon"><span>+${badges.length - 3}</span></div>`;
  }

  return html;
}

/* ---------- STATS ---------- */
function renderStats(users) {
  const totalUsers = users.length;
  const totalScore = users.reduce((a, b) => a + b.score, 0);
  const highestScore = users.length ? Math.max(...users.map(u => u.score)) : 0;
  const averageScore = totalUsers ? Math.round(totalScore / totalUsers) : 0;

  statsSummaryEl.innerHTML = `
    <div class="stat-card"><i class="fas fa-users"></i><div class="stat-value">${totalUsers}</div><div class="stat-label">Players</div></div>
    <div class="stat-card"><i class="fas fa-trophy"></i><div class="stat-value">${highestScore}</div><div class="stat-label">Top Score</div></div>
    <div class="stat-card"><i class="fas fa-chart-line"></i><div class="stat-value">${averageScore}</div><div class="stat-label">Avg Score</div></div>
  `;
}

/* ---------- LOAD LEADERBOARD ---------- */
async function loadLeaderboard() {
  try {
    loadingEl.style.display = "block";

    const res = await fetch(`${API}/leaderboard`);
    const users = await res.json();

    listEl.innerHTML = "";
    renderStats(users);

    if (!users.length) {
      listEl.innerHTML = `<div class="empty-state">No players yet</div>`;
      loadingEl.style.display = "none";
      return;
    }

    users.sort((a, b) => b.score - a.score);

    users.slice(0, 10).forEach((user, index) => {
      const rank = index + 1;
      const isYou = user.username === currentUsername;

      const li = document.createElement("li");
      li.className = `leaderboard-item ${isYou ? "current-user" : ""}`;
      li.innerHTML = `
        <div class="rank">${rank}</div>
        <div class="user-info">
          <div class="user-avatar" style="background:${getUserColor(user.username)}">
            ${getUserInitials(user.username)}
          </div>
          <div>
            <h3>${user.username} ${isYou ? "(You)" : ""}</h3>
            <small>${getLevelTitle(user.level)}</small>
          </div>
        </div>
        <div class="score">${user.score}</div>
        <div class="level-badge">Level ${user.level}</div>
        <div class="badges">${getBadgesHTML(user)}</div>
      `;
      listEl.appendChild(li);
    });

    loadingEl.style.display = "none";

  } catch (err) {
    console.error(err);
    alert("Leaderboard backend not running");
  }
}

/* ---------- INIT ---------- */
loadLeaderboard();
setInterval(loadLeaderboard, 15000); // real-time refresh
