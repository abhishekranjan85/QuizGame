const API = "http://127.0.0.1:8000";

/* ---------- AUTH CHECK ---------- */
const storedUser = JSON.parse(localStorage.getItem("currentUser"));
if (!storedUser) {
  window.location.href = "index.html";
}

/* ---------- CONSTANTS ---------- */
const MAX_POINTS = 80;

/* ---------- LOAD DASHBOARD ---------- */
async function loadDashboard() {
  try {
    const res = await fetch(`${API}/user/${storedUser.username}`);
    if (!res.ok) throw new Error("Backend not responding");

    const user = await res.json();

    /* ---------- BASIC INFO ---------- */
    document.getElementById("name").innerText = "Welcome " + user.username;
    document.getElementById("score").innerText = user.score;
    document.getElementById("level").innerText = user.level;

    /* ---------- BADGES ---------- */
    const badgeBox = document.querySelector(".badges");
    badgeBox.innerHTML = "";

    if (user.badges.length === 0) {
      badgeBox.innerHTML = `<span class="badge">No badges yet</span>`;
    } else {
      user.badges.forEach(b => {
        badgeBox.innerHTML += `<span class="badge">${b}</span>`;
      });
    }

    /* ---------- STATS ---------- */
    document.querySelector(".notification-count").innerText =
      user.notifications ?? 0;

    document.querySelectorAll(".stat-card p")[2].innerText =
      (user.streak ?? 0) + " days";

    document.querySelectorAll(".stat-card p")[3].innerText =
      (user.carbonSaved ?? 0) + " kg";

    /* ---------- PROGRESS (POINT BASED) ---------- */
    const percent = Math.min(
      Math.round((user.score / MAX_POINTS) * 100),
      100
    );

    document.getElementById("progress").style.width = percent + "%";

    document.querySelector(".progress-details span:first-child")
      .innerText = percent + "% Complete";

    document.querySelector(".progress-details span:last-child")
      .innerText = `Total Points: ${user.score} / ${MAX_POINTS}`;

    /* ---------- CERTIFICATES ---------- */
    const certCount =
      (user.subjectCertificates?.length || 0) +
      (user.levelCertificates?.length || 0);

    document.getElementById("certCount").innerText = certCount;

    /* ---------- RANK ---------- */
    document.querySelector(".card-stats span").innerHTML =
      `<i class="fas fa-crown"></i> Rank: #${user.rank}`;

    /* ---------- RECENT ACTIVITY ---------- */
    const list = document.querySelector(".activity-list");
    list.innerHTML = "";

    if (!user.recentActivity || user.recentActivity.length === 0) {
      list.innerHTML = `
        <div class="activity-item">
          <div class="activity-icon info">
            <i class="fas fa-info-circle"></i>
          </div>
          <div class="activity-content">
            <p>No recent activity</p>
            <span class="activity-time">Start a quiz to earn points</span>
          </div>
        </div>`;
    } else {
      user.recentActivity.forEach(a => {
        list.innerHTML += `
          <div class="activity-item">
            <div class="activity-icon success">
              <i class="fas fa-check-circle"></i>
            </div>
            <div class="activity-content">
              <p>${a.text}</p>
              <span class="activity-time">+${a.points} points</span>
            </div>
          </div>`;
      });
    }

  } catch (err) {
    alert("Dashboard backend not running");
    console.error(err);
  }
}

loadDashboard();

/* ---------- NAV ---------- */
window.go = page => window.location.href = page;
