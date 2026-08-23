document.addEventListener('DOMContentLoaded', () => {
    // 1. Auth State Management
    const authContainer = document.querySelector('.navbar-auth');
    const user = JSON.parse(localStorage.getItem('pulsewaveUser'));

    if (authContainer) {
        if (user) {
            // User is logged in
            authContainer.innerHTML = `
                <div class="user-profile" style="display: flex; align-items: center; gap: 10px; cursor: pointer; position: relative;">
                    <div style="width: 35px; height: 35px; background: linear-gradient(135deg, #7928CA, #FF0080, #00DFD8); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; color: white; box-shadow: 0 0 10px rgba(0, 223, 216, 0.4);">
                        ${user.name.charAt(0).toUpperCase()}
                    </div>
                    <span style="color: white; font-weight: 600;">${user.name}</span>
                    <i class="fas fa-caret-down" style="color: white;"></i>
                    <div class="dropdown-menu" style="display: none; position: absolute; top: 45px; right: 0; background: #282828; border-radius: 4px; padding: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.5); min-width: 150px; z-index: 1000;">
                        <ul style="list-style: none; margin: 0; padding: 0;">
                            <li style="padding: 8px 12px; color: #b3b3b3; cursor: pointer; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#b3b3b3'">Account</li>
                            <li style="padding: 8px 12px; color: #b3b3b3; cursor: pointer; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#b3b3b3'">Profile</li>
                            <li id="logoutBtn" style="padding: 8px 12px; color: #b3b3b3; cursor: pointer; transition: color 0.2s; border-top: 1px solid #3e3e3e; margin-top: 5px;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#b3b3b3'">Log out</li>
                        </ul>
                    </div>
                </div>
            `;

            // Toggle dropdown
            const profile = authContainer.querySelector('.user-profile');
            const dropdown = authContainer.querySelector('.dropdown-menu');
            profile.addEventListener('click', (e) => {
                dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
                e.stopPropagation();
            });
            document.addEventListener('click', () => {
                if(dropdown) dropdown.style.display = 'none';
            });

            // Logout
            document.getElementById('logoutBtn').addEventListener('click', () => {
                localStorage.removeItem('pulsewaveUser');
                window.location.reload();
            });
        } else {
            // User is not logged in
            const loginBtn = authContainer.querySelector('.btn-login');
            const signupBtn = authContainer.querySelector('.btn-signup');
            if (loginBtn) loginBtn.addEventListener('click', () => window.location.href = 'login.html');
            if (signupBtn) signupBtn.addEventListener('click', () => window.location.href = 'signup.html');
        }
    }

    // 2. Navbar Logo / Brand navigation
    const brandLinks = document.querySelectorAll('.navbar-brand');
    brandLinks.forEach(brand => {
        brand.addEventListener('click', (e) => {
            // Ensure navigation to index.html
            if (!brand.getAttribute('href')) {
                window.location.href = 'index.html';
            }
        });
    });

    // 3. Global Button Functionalities
    const playBtns = document.querySelectorAll('.play-btn');
    playBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = btn.closest('.playlist-card, .artist-card, .album-card');
            const title = card ? card.querySelector('h3').innerText : 'Track';
            alert('▶ Playing: ' + title);
        });
    });

    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            const category = card.querySelector('h3').innerText;
            window.location.href = 'search.html?category=' + encodeURIComponent(category);
        });
    });
    
    // Hero buttons
    const heroPrimary = document.querySelector('.btn-primary');
    if (heroPrimary && !heroPrimary.closest('form') && !heroPrimary.innerText.toLowerCase().includes('back')) { 
        heroPrimary.addEventListener('click', (e) => {
            window.location.href = 'home.html';
        });
    }

    const heroSecondary = document.querySelector('.btn-secondary');
    if (heroSecondary) {
        heroSecondary.addEventListener('click', () => {
            window.location.href = 'library.html';
        });
    }

    // Newsletter subscription
    const newsletterBtn = document.querySelector('.newsletter-btn');
    const newsletterInput = document.querySelector('.newsletter-input');
    if (newsletterBtn && newsletterInput) {
        newsletterBtn.addEventListener('click', () => {
            const email = newsletterInput.value;
            if(email && email.includes('@')) {
                alert('Thank you for subscribing with ' + email + '!');
                newsletterInput.value = '';
            } else {
                alert('Please enter a valid email address.');
            }
        });
    }
});
