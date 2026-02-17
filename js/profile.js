const API = "http://127.0.0.1:8000";
const storedUser = JSON.parse(localStorage.getItem("currentUser"));

if (!storedUser) {
    location.href = "index.html";
}

// Add particle effect
function createParticles() {
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.width = Math.random() * 5 + 2 + 'px';
        particle.style.height = particle.style.width;
        particle.style.left = Math.random() * 100 + 'vw';
        particle.style.top = Math.random() * 100 + 'vh';
        particle.style.animation = `float ${Math.random() * 5 + 3}s ease-in-out infinite`;
        particle.style.animationDelay = Math.random() * 2 + 's';
        document.body.appendChild(particle);
    }
}

async function loadProfile() {
    // Show loading
    document.body.style.opacity = '0.8';
    
    try {
        const res = await fetch(`${API}/profile/${storedUser.username}`);
        if (!res.ok) throw new Error('Failed to load profile');
        
        const user = await res.json();

        // Set user data
        document.getElementById("username").textContent = user.username;
        document.getElementById("rank").textContent = `Rank #${user.rank} • Level ${user.level}`;
        
        // Update stats
        document.getElementById("score").textContent = user.score.toLocaleString();
        document.getElementById("streak").textContent = user.streak;
        document.getElementById("carbon").textContent = user.carbonSaved.toLocaleString();

        // Calculate total certificates
        const totalCerts = 
            (user.subjectCertificates?.length || 0) + 
            (user.levelCertificates?.length || 0);
        
        document.getElementById("certs").textContent = totalCerts;

        // Load badges
        loadBadges(user.badges);
        
        // Load certificates
        loadCertificates(user.levelCertificates, user.subjectCertificates);
        
        // Show achievement if level increased
        checkAchievements(user);
        
        // Add floating animation to avatar
        document.querySelector('.avatar').classList.add('floating');

    } catch (error) {
        console.error('Error loading profile:', error);
        showNotification('Failed to load profile data', 'error');
    } finally {
        document.body.style.opacity = '1';
    }
}

function loadBadges(badges) {
    const badgeBox = document.getElementById("badges");
    
    if (!badges || badges.length === 0) {
        badgeBox.innerHTML = "<p>No badges yet. Complete challenges to earn them! ⭐</p>";
        return;
    }

    // Clear and add new badges
    badgeBox.innerHTML = '';
    
    badges.forEach((badge, index) => {
        const badgeElement = document.createElement('span');
        badgeElement.className = 'badge';
        badgeElement.textContent = badge;
        badgeElement.style.animationDelay = `${index * 0.1}s`;
        badgeElement.onclick = () => showBadgeDetails(badge);
        badgeBox.appendChild(badgeElement);
    });
}

function loadCertificates(levelCerts, subjectCerts) {
    const certList = document.getElementById("certList");
    certList.innerHTML = '';

    // Add level certificates
    if (levelCerts && levelCerts.length > 0) {
        levelCerts.forEach((level, index) => {
            const li = document.createElement('li');
            li.textContent = `🏆 Level ${level} Certificate`;
            li.style.animationDelay = `${index * 0.1}s`;
            certList.appendChild(li);
        });
    }

    // Add subject certificates
    if (subjectCerts && subjectCerts.length > 0) {
        subjectCerts.forEach((subject, index) => {
            const li = document.createElement('li');
            li.textContent = `📘 ${subject} Certificate`;
            li.style.animationDelay = `${(index + (levelCerts?.length || 0)) * 0.1}s`;
            certList.appendChild(li);
        });
    }

    // If no certificates
    if (certList.children.length === 0) {
        certList.innerHTML = '<li style="color: #94a3b8; font-style: italic;">Complete courses to earn certificates!</li>';
    }
}

function showBadgeDetails(badgeName) {
    const descriptions = {
        'Beginner': '🎯 Awarded for completing your first lesson',
        'Explorer': '🌍 Completed 10 different topics',
        'Hero': '🛡️ Helped save 100kg of carbon',
        'Master': '👑 Reached level 10',
        'Eco-Warrior': '🌿 Completed all environmental courses',
        'Scholar': '🎓 Earned 5 certificates',
        'Streak Master': '🔥 Maintained a 30-day streak',
        'Quick Learner': '⚡ Completed 50 lessons in a week',
        'Quiz Champion': '🏅 Scored 100% on 10 quizzes',
        'Carbon Savior': '🌳 Saved 1000kg of carbon'
    };
    
    const description = descriptions[badgeName] || '🌟 A special achievement!';
    showNotification(`${badgeName}: ${description}`, 'success');
}

function checkAchievements(user) {
    // Check for new level
    const lastLevel = localStorage.getItem('lastLevel') || 1;
    if (user.level > lastLevel) {
        showAchievementPopup(`🎉 Level Up! You've reached level ${user.level}!`);
        localStorage.setItem('lastLevel', user.level);
    }
    
    // Check for new badge
    const lastBadges = JSON.parse(localStorage.getItem('lastBadges')) || [];
    const newBadges = user.badges.filter(badge => !lastBadges.includes(badge));
    if (newBadges.length > 0) {
        newBadges.forEach(badge => {
            showAchievementPopup(`🏆 New Badge: ${badge}`);
        });
        localStorage.setItem('lastBadges', JSON.stringify(user.badges));
    }
}

function showAchievementPopup(message) {
    const popup = document.createElement('div');
    popup.className = 'achievement-popup';
    popup.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <div style="font-size: 24px;">🎉</div>
            <div>
                <strong>New Achievement!</strong>
                <p style="margin: 5px 0 0; font-size: 14px;">${message}</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(popup);
    
    setTimeout(() => popup.classList.add('show'), 100);
    
    setTimeout(() => {
        popup.classList.remove('show');
        setTimeout(() => popup.remove(), 500);
    }, 3000);
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'};
        color: white;
        padding: 15px 25px;
        border-radius: 12px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.3);
        z-index: 1000;
        transform: translateX(150%);
        transition: transform 0.3s ease;
        border: 2px solid rgba(255,255,255,0.2);
    `;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(150%)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function logout() {
    showNotification('Logging out...', 'info');
    setTimeout(() => {
        localStorage.removeItem("currentUser");
        localStorage.removeItem('lastLevel');
        localStorage.removeItem('lastBadges');
        location.href = "index.html";
    }, 1000);
}

// Add hover effects to stats
document.addEventListener('DOMContentLoaded', () => {
    createParticles();
    loadProfile();
    
    // Add hover effects to stat cards
    const stats = document.querySelectorAll('.stat');
    stats.forEach((stat, index) => {
        stat.style.animationDelay = `${index * 0.1}s`;
        stat.style.animation = 'fadeIn 0.5s ease forwards';
        stat.style.opacity = '0';
        
        stat.addEventListener('mouseenter', () => {
            stat.style.transform = 'translateY(-5px) scale(1.05)';
        });
        
        stat.addEventListener('mouseleave', () => {
            stat.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Add click sound effect to buttons
    const buttons = document.querySelectorAll('button, .back-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            // You can add a sound effect here if you want
            btn.style.transform = 'scale(0.95)';
            setTimeout(() => {
                btn.style.transform = 'scale(1)';
            }, 150);
        });
    });
});