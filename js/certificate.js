const API = "http://127.0.0.1:8000";

/* ---------- AUTH CHECK ---------- */
const storedUser = JSON.parse(localStorage.getItem("currentUser"));
if (!storedUser) {
  window.location.href = "index.html";
}

const username = storedUser.username;

/* ---------- ELEMENTS ---------- */
const certContainer = document.getElementById("certs");
const loading = document.getElementById("loading");
const modal = document.getElementById("certificateModal");
const closeBtn = document.querySelector(".close");
const certificateView = document.getElementById("certificateView");
const downloadBtn = document.getElementById("downloadPdf");
const printBtn = document.getElementById("printCert");

let currentCertificate = {
  name: "",
  type: ""
};

/* ---------- LOAD CERTIFICATES ---------- */
async function loadCertificates() {
  try {
    const res = await fetch(`${API}/user/${username}`);
    const user = await res.json();

    if (!res.ok) {
      alert("Failed to load certificates");
      return;
    }

    loading.style.display = "none";
    certContainer.innerHTML = "";

    const subjectCerts = user.subjectCertificates || [];
    const levelCerts = user.levelCertificates || [];

    /* ---------- NO CERTIFICATE CASE ---------- */
    if (subjectCerts.length === 0 && levelCerts.length === 0) {
      certContainer.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-award"></i>
          <h3>No Certificates Yet</h3>
          <p>Complete quizzes to earn certificates</p>
        </div>
      `;
      return;
    }

    /* ---------- SUBJECT CERTIFICATES ---------- */
    subjectCerts.forEach(subject => {
      certContainer.innerHTML += `
        <div class="certificate-card">
          <div class="certificate-icon">
            <i class="fas fa-leaf"></i>
          </div>
          <h3>${subject}</h3>
          <p>Subject Certificate</p>
          <button onclick="viewCertificate('${subject}', 'subject')">
            <i class="fas fa-eye"></i> View Certificate
          </button>
        </div>
      `;
    });

    /* ---------- LEVEL CERTIFICATES ---------- */
    levelCerts.forEach(level => {
      certContainer.innerHTML += `
        <div class="certificate-card level">
          <div class="certificate-icon">
            <i class="fas fa-star"></i>
          </div>
          <h3>Level ${level} Certificate</h3>
          <p>Achievement Certificate</p>
          <button onclick="viewCertificate('Level ${level}', 'level')">
            <i class="fas fa-eye"></i> View Certificate
          </button>
        </div>
      `;
    });

  } catch (err) {
    console.error(err);
    alert("Backend not running");
  }
}

/* ---------- VIEW CERTIFICATE ---------- */
function viewCertificate(name, type) {
  currentCertificate = { name, type };
  
  const isLevel = type === 'level';
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  certificateView.className = isLevel ? 'certificate-view level-cert' : 'certificate-view';
  
  certificateView.innerHTML = `
    <div class="certificate-header">
      <h1>CERTIFICATE OF ACHIEVEMENT</h1>
      <h2>${isLevel ? 'LEVEL COMPLETION' : 'SUBJECT MASTERY'}</h2>
    </div>
    
    <div class="badge">
      <i class="fas ${isLevel ? 'fa-star' : 'fa-leaf'}"></i>
    </div>
    
    <div class="certificate-body">
      <p>This certifies that</p>
      <p class="certificate-username">${username}</p>
      <p>has successfully ${isLevel ? 'completed' : 'mastered'}</p>
      <p class="certificate-details">${name}</p>
      <p>and is hereby awarded this certificate</p>
      <p class="certificate-date">Awarded on ${today}</p>
    </div>
    
    <div class="certificate-footer">
      <div class="signature">
        <div class="signature-line"></div>
        <p>Academic Director</p>
      </div>
      <div class="signature">
        <div class="signature-line"></div>
        <p>Head of Education</p>
      </div>
    </div>
  `;
  
  modal.style.display = "block";
}

/* ---------- DOWNLOAD CERTIFICATE ---------- */
function downloadCertificate() {
  const element = certificateView;
  const opt = {
    margin: 0.5,
    filename: `${username}_${currentCertificate.name.replace(/\s+/g, '_')}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2,
      useCORS: true,
      letterRendering: true,
      backgroundColor: '#fdfcfb'
    },
    jsPDF: { 
      unit: 'in', 
      format: 'a4', 
      orientation: 'portrait' 
    }
  };
  
  // Show loading state
  downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating PDF...';
  downloadBtn.disabled = true;
  
  html2pdf().set(opt).from(element).save().finally(() => {
    // Reset button
    downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download PDF';
    downloadBtn.disabled = false;
  });
}

/* ---------- PRINT CERTIFICATE ---------- */
function printCertificate() {
  const originalContent = document.body.innerHTML;
  const printContent = certificateView.innerHTML;
  
  document.body.innerHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Print Certificate</title>
      <style>
        body { 
          margin: 0; 
          padding: 20px; 
          background: #f5f5f5; 
        }
        @media print {
          @page { margin: 0; }
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      ${printContent}
      <script>
        window.onload = function() {
          window.print();
          setTimeout(function() {
            window.close();
          }, 500);
        };
      <\/script>
    </body>
    </html>
  `;
  
  window.print();
  document.body.innerHTML = originalContent;
  window.location.reload(); // Reload to restore event listeners
}

/* ---------- EVENT LISTENERS ---------- */
closeBtn.onclick = function() {
  modal.style.display = "none";
}

window.onclick = function(event) {
  if (event.target === modal) {
    modal.style.display = "none";
  }
}

downloadBtn.onclick = downloadCertificate;
printBtn.onclick = printCertificate;

/* ---------- INIT ---------- */
loadCertificates();

/* ---------- NAV ---------- */
window.go = function(page) {
  window.location.href = page;
};