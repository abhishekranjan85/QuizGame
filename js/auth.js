const API = "http://127.0.0.1:8000";

async function auth(endpoint) {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    alert("Enter username and password");
    return;
  }

  try {
    const res = await fetch(API + endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.detail || "Auth failed");
      return;
    }

    // ✅ STORE ONLY ONE USER OBJECT
    localStorage.setItem("currentUser", JSON.stringify(data.user));

    window.location.href = "dashboard.html";

  } catch (err) {
    console.error(err);
    alert("Backend not running");
  }
}

document.getElementById("signupBtn").onclick = () => auth("/signup");
document.getElementById("loginBtn").onclick = () => auth("/login");
