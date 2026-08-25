document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 0. 3-Dots Header Navigation Toggle
    // ==========================================
    const navDotsBtn = document.getElementById('navDotsBtn') || document.querySelector('.nav-dots-btn');
    const navbarCollapse = document.getElementById('navbarCollapse') || document.querySelector('.navbar-collapse');
    const navbar = document.querySelector('.navbar');

    if (navDotsBtn && navbarCollapse) {
        navDotsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = navbarCollapse.classList.toggle('show');
            navDotsBtn.classList.toggle('active', isOpen);
            navDotsBtn.setAttribute('aria-expanded', isOpen);
        });

        // Close menu when clicking outside navbar
        document.addEventListener('click', (e) => {
            if (navbar && !navbar.contains(e.target)) {
                navbarCollapse.classList.remove('show');
                navDotsBtn.classList.remove('active');
                navDotsBtn.setAttribute('aria-expanded', 'false');
            }
        });

        // Close menu on pressing Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navbarCollapse.classList.contains('show')) {
                navbarCollapse.classList.remove('show');
                navDotsBtn.classList.remove('active');
                navDotsBtn.setAttribute('aria-expanded', 'false');
            }
        });

        // Highlight current page and close menu when link clicked
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = navbarCollapse.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage || (currentPage === '' && href === 'index.html')) {
                link.classList.add('active');
            }
            link.addEventListener('click', () => {
                navbarCollapse.classList.remove('show');
                navDotsBtn.classList.remove('active');
                navDotsBtn.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // ==========================================
    // 1. Auth State Management
    // ==========================================
    const authContainers = document.querySelectorAll('.navbar-auth');
    const user = JSON.parse(localStorage.getItem('pulsewaveUser'));

    if (authContainers.length > 0) {
        authContainers.forEach(authContainer => {
            if (user) {
                // User is logged in - show profile & account info
                authContainer.innerHTML = `
                    <div class="user-profile" style="display: flex; align-items: center; gap: 10px; cursor: pointer; position: relative;">
                        <div class="user-avatar">
                            ${user.name.charAt(0).toUpperCase()}
                        </div>
                        <span class="user-name">${user.name}</span>
                        <i class="fas fa-caret-down" style="color: #b3b3b3; font-size: 0.8rem; transition: transform 0.2s;"></i>
                        <div class="dropdown-menu" style="display: none; position: absolute; top: 48px; right: 0; background: #222226; border-radius: 8px; padding: 8px; box-shadow: 0 8px 24px rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.1); min-width: 160px; z-index: 1100;">
                            <ul style="list-style: none; margin: 0; padding: 0;">
                                <li style="padding: 9px 12px; color: #b3b3b3; cursor: pointer; border-radius: 6px; font-size: 0.88rem; transition: all 0.2s;" onmouseover="this.style.color='white';this.style.background='rgba(255,255,255,0.08)'" onmouseout="this.style.color='#b3b3b3';this.style.background='transparent'"><i class="fas fa-user-circle" style="margin-right: 8px; color: #1db954;"></i>Account</li>
                                <li style="padding: 9px 12px; color: #b3b3b3; cursor: pointer; border-radius: 6px; font-size: 0.88rem; transition: all 0.2s;" onmouseover="this.style.color='white';this.style.background='rgba(255,255,255,0.08)'" onmouseout="this.style.color='#b3b3b3';this.style.background='transparent'"><i class="fas fa-sliders" style="margin-right: 8px;"></i>Settings</li>
                                <li class="logout-btn-item" style="padding: 9px 12px; color: #ff5555; cursor: pointer; border-radius: 6px; font-size: 0.88rem; transition: all 0.2s; border-top: 1px solid rgba(255,255,255,0.08); margin-top: 4px;" onmouseover="this.style.color='#ff7777';this.style.background='rgba(255,0,0,0.1)'" onmouseout="this.style.color='#ff5555';this.style.background='transparent'"><i class="fas fa-sign-out-alt" style="margin-right: 8px;"></i>Log out</li>
                            </ul>
                        </div>
                    </div>
                `;

                // Toggle dropdown
                const profile = authContainer.querySelector('.user-profile');
                const dropdown = authContainer.querySelector('.dropdown-menu');
                const caret = authContainer.querySelector('.fa-caret-down');
                if (profile && dropdown) {
                    profile.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const isOpen = dropdown.style.display === 'block';
                        // Close all other dropdowns
                        document.querySelectorAll('.dropdown-menu').forEach(d => d.style.display = 'none');
                        document.querySelectorAll('.fa-caret-down').forEach(c => c.style.transform = 'rotate(0deg)');
                        dropdown.style.display = isOpen ? 'none' : 'block';
                        if (caret) caret.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
                    });
                }

                // Logout
                const logoutBtn = authContainer.querySelector('.logout-btn-item');
                if (logoutBtn) {
                    logoutBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        localStorage.removeItem('pulsewaveUser');
                        window.location.reload();
                    });
                }
            } else {
                // User is not logged in
                const loginBtn = authContainer.querySelector('.btn-login');
                const signupBtn = authContainer.querySelector('.btn-signup');
                if (loginBtn) loginBtn.addEventListener('click', () => window.location.href = 'login.html');
                if (signupBtn) signupBtn.addEventListener('click', () => window.location.href = 'signup.html');
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            document.querySelectorAll('.dropdown-menu').forEach(d => d.style.display = 'none');
            document.querySelectorAll('.fa-caret-down').forEach(c => c.style.transform = 'rotate(0deg)');
        });
    }

    // ==========================================
    // 2. Navbar Logo / Brand navigation
    // ==========================================
    const brandLinks = document.querySelectorAll('.navbar-brand');
    brandLinks.forEach(brand => {
        brand.addEventListener('click', (e) => {
            if (!brand.getAttribute('href')) {
                window.location.href = 'index.html';
            }
        });
    });

    // ==========================================
    // 3. Category & Navigation Button Handlers
    // ==========================================
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            const category = card.querySelector('h3').innerText;
            window.location.href = 'search.html?category=' + encodeURIComponent(category);
        });
    });

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

    const newsletterBtn = document.querySelector('.newsletter-btn');
    const newsletterInput = document.querySelector('.newsletter-input');
    if (newsletterBtn && newsletterInput) {
        newsletterBtn.addEventListener('click', () => {
            const email = newsletterInput.value.trim();
            if (email && email.includes('@')) {
                alert('Thank you for subscribing with ' + email + '!');
                newsletterInput.value = '';
            } else {
                alert('Please enter a valid email address.');
            }
        });
    }

    // ==========================================
    // 4. STICKY BOTTOM MUSIC PLAYER CONTROLLER
    // ==========================================

    // Auto-inject player bar if not already in the DOM (for multi-page consistency)
    function ensureMusicPlayer() {
        if (!document.getElementById('musicPlayerBar')) {
            const playerHTML = `
            <div class="music-player-bar" id="musicPlayerBar">
                <div class="player-container">
                    <div class="player-track-info">
                        <div class="player-cover-wrap">
                            <img src="../assets/midnight dreams.jpg" alt="Now Playing Track" class="player-cover" id="playerCover">
                            <div class="player-wave-indicator" id="playerWaveIndicator">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                        <div class="player-track-details">
                            <h4 class="player-track-title" id="playerTrackTitle">Starboy</h4>
                            <p class="player-track-artist" id="playerTrackArtist">The Weeknd</p>
                        </div>
                        <button class="player-like-btn" id="playerLikeBtn" aria-label="Save to Liked Songs" title="Like">
                            <i class="far fa-heart"></i>
                        </button>
                    </div>

                    <div class="player-controls-wrapper">
                        <div class="player-buttons">
                            <button class="player-btn-secondary" id="playerShuffleBtn" aria-label="Shuffle" title="Shuffle">
                                <i class="fas fa-shuffle"></i>
                            </button>
                            <button class="player-btn-secondary" id="playerPrevBtn" aria-label="Previous track" title="Previous">
                                <i class="fas fa-backward-step"></i>
                            </button>
                            <button class="player-play-btn" id="playerPlayBtn" aria-label="Play or Pause" title="Play / Pause">
                                <i class="fas fa-play" id="playerPlayIcon"></i>
                            </button>
                            <button class="player-btn-secondary" id="playerNextBtn" aria-label="Next track" title="Next">
                                <i class="fas fa-forward-step"></i>
                            </button>
                            <button class="player-btn-secondary" id="playerRepeatBtn" aria-label="Repeat" title="Repeat">
                                <i class="fas fa-repeat"></i>
                            </button>
                        </div>

                        <div class="player-timeline">
                            <span class="player-time" id="playerCurrentTime">0:00</span>
                            <div class="player-progress-container" id="playerProgressContainer" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
                                <div class="player-progress-bar" id="playerProgressBar">
                                    <span class="player-progress-thumb"></span>
                                </div>
                            </div>
                            <span class="player-time" id="playerTotalDuration">3:50</span>
                        </div>
                    </div>

                    <div class="player-extra-controls">
                        <button class="player-btn-secondary" id="playerMuteBtn" aria-label="Mute / Unmute" title="Mute">
                            <i class="fas fa-volume-high" id="playerVolumeIcon"></i>
                        </button>
                        <div class="player-volume-container" id="playerVolumeContainer" role="slider" aria-label="Volume">
                            <div class="player-volume-bar" id="playerVolumeBar" style="width: 80%;">
                                <span class="player-volume-thumb"></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
            document.body.insertAdjacentHTML('beforeend', playerHTML);
        }
    }

    ensureMusicPlayer();

    // Default playlist with high-definition covers and durations
    const playlist = [
        {
            title: 'Starboy',
            artist: 'The Weeknd',
            cover: '../assets/midnight dreams.jpg',
            duration: 230
        },
        {
            title: 'Cruel Summer',
            artist: 'Taylor Swift',
            cover: '../assets/taylor swift.jpg',
            duration: 178
        },
        {
            title: 'God\'s Plan',
            artist: 'Drake',
            cover: '../assets/drake.jpg',
            duration: 198
        },
        {
            title: 'Circles',
            artist: 'Post Malone',
            cover: '../assets/post malone.jpg',
            duration: 215
        },
        {
            title: 'Shape of You',
            artist: 'Ed Sheeran',
            cover: '../assets/divide ed sheeran.jpg',
            duration: 233
        },
        {
            title: 'Midnight Dreams',
            artist: 'Synthwave Collective',
            cover: '../assets/chill beats.jpg',
            duration: 252
        }
    ];

    let currentTrackIndex = 0;
    let isPlaying = false;
    let isShuffle = false;
    let isRepeat = false;
    let currentSeconds = 0;
    let timerInterval = null;
    let currentVolume = 0.8;
    let isMuted = false;

    // DOM Elements
    const playerBar = document.getElementById('musicPlayerBar');
    const playerCover = document.getElementById('playerCover');
    const playerTrackTitle = document.getElementById('playerTrackTitle');
    const playerTrackArtist = document.getElementById('playerTrackArtist');
    const playerWaveIndicator = document.getElementById('playerWaveIndicator');
    const playerLikeBtn = document.getElementById('playerLikeBtn');

    const playerPlayBtn = document.getElementById('playerPlayBtn');
    const playerPlayIcon = document.getElementById('playerPlayIcon');
    const playerPrevBtn = document.getElementById('playerPrevBtn');
    const playerNextBtn = document.getElementById('playerNextBtn');
    const playerShuffleBtn = document.getElementById('playerShuffleBtn');
    const playerRepeatBtn = document.getElementById('playerRepeatBtn');

    const playerCurrentTime = document.getElementById('playerCurrentTime');
    const playerTotalDuration = document.getElementById('playerTotalDuration');
    const playerProgressContainer = document.getElementById('playerProgressContainer');
    const playerProgressBar = document.getElementById('playerProgressBar');

    const playerMuteBtn = document.getElementById('playerMuteBtn');
    const playerVolumeIcon = document.getElementById('playerVolumeIcon');
    const playerVolumeContainer = document.getElementById('playerVolumeContainer');
    const playerVolumeBar = document.getElementById('playerVolumeBar');

    // Time Formatter (mm:ss)
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    // Load track into the player UI
    function loadTrack(track, autoPlay = false) {
        if (!track) return;
        if (playerCover) playerCover.src = track.cover;
        if (playerTrackTitle) playerTrackTitle.innerText = track.title;
        if (playerTrackArtist) playerTrackArtist.innerText = track.artist;
        if (playerTotalDuration) playerTotalDuration.innerText = formatTime(track.duration);

        currentSeconds = 0;
        updateProgressUI();

        if (autoPlay) {
            playTrack();
        } else if (isPlaying) {
            playTrack();
        }
    }

    function updateProgressUI() {
        const track = playlist[currentTrackIndex];
        const total = track ? track.duration : 200;
        if (playerCurrentTime) playerCurrentTime.innerText = formatTime(currentSeconds);
        const percentage = total > 0 ? (currentSeconds / total) * 100 : 0;
        if (playerProgressBar) playerProgressBar.style.width = `${Math.min(percentage, 100)}%`;
        if (playerProgressContainer) playerProgressContainer.setAttribute('aria-valuenow', Math.round(percentage));
    }

    // Play Track
    function playTrack() {
        isPlaying = true;
        if (playerPlayBtn) playerPlayBtn.classList.add('playing');
        if (playerPlayIcon) {
            playerPlayIcon.classList.remove('fa-play');
            playerPlayIcon.classList.add('fa-pause');
        }
        if (playerWaveIndicator) playerWaveIndicator.classList.add('playing');

        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            const track = playlist[currentTrackIndex];
            const total = track ? track.duration : 200;
            currentSeconds++;
            if (currentSeconds > total) {
                if (isRepeat) {
                    currentSeconds = 0;
                    updateProgressUI();
                } else {
                    nextTrack();
                }
            } else {
                updateProgressUI();
            }
        }, 1000);
    }

    // Pause Track
    function pauseTrack() {
        isPlaying = false;
        if (playerPlayBtn) playerPlayBtn.classList.remove('playing');
        if (playerPlayIcon) {
            playerPlayIcon.classList.remove('fa-pause');
            playerPlayIcon.classList.add('fa-play');
        }
        if (playerWaveIndicator) playerWaveIndicator.classList.remove('playing');
        clearInterval(timerInterval);
    }

    // Toggle Play/Pause
    function togglePlayPause() {
        if (isPlaying) {
            pauseTrack();
        } else {
            playTrack();
        }
    }

    // Next Track
    function nextTrack() {
        if (isShuffle) {
            let nextIndex;
            do {
                nextIndex = Math.floor(Math.random() * playlist.length);
            } while (playlist.length > 1 && nextIndex === currentTrackIndex);
            currentTrackIndex = nextIndex;
        } else {
            currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
        }
        loadTrack(playlist[currentTrackIndex], isPlaying);
    }

    // Previous Track
    function prevTrack() {
        if (currentSeconds > 3) {
            // Restart current track if played for more than 3 seconds
            currentSeconds = 0;
            updateProgressUI();
        } else {
            currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
            loadTrack(playlist[currentTrackIndex], isPlaying);
        }
    }

    // Timeline Scrubber Seeking
    function seekTimeline(e) {
        if (!playerProgressContainer) return;
        const rect = playerProgressContainer.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, clickX / rect.width));
        const track = playlist[currentTrackIndex];
        const total = track ? track.duration : 200;
        currentSeconds = Math.floor(percentage * total);
        updateProgressUI();
    }

    // Event Listeners for Player Controls
    if (playerPlayBtn) playerPlayBtn.addEventListener('click', togglePlayPause);
    if (playerNextBtn) playerNextBtn.addEventListener('click', nextTrack);
    if (playerPrevBtn) playerPrevBtn.addEventListener('click', prevTrack);

    if (playerShuffleBtn) {
        playerShuffleBtn.addEventListener('click', () => {
            isShuffle = !isShuffle;
            playerShuffleBtn.classList.toggle('active', isShuffle);
        });
    }

    if (playerRepeatBtn) {
        playerRepeatBtn.addEventListener('click', () => {
            isRepeat = !isRepeat;
            playerRepeatBtn.classList.toggle('active', isRepeat);
        });
    }

    if (playerLikeBtn) {
        playerLikeBtn.addEventListener('click', () => {
            const icon = playerLikeBtn.querySelector('i');
            const isLiked = playerLikeBtn.classList.toggle('liked');
            if (icon) {
                if (isLiked) {
                    icon.classList.remove('far');
                    icon.classList.add('fas');
                } else {
                    icon.classList.remove('fas');
                    icon.classList.add('far');
                }
            }
        });
    }

    if (playerProgressContainer) {
        let isDraggingProgress = false;
        playerProgressContainer.addEventListener('click', seekTimeline);
        playerProgressContainer.addEventListener('mousedown', (e) => {
            isDraggingProgress = true;
            seekTimeline(e);
        });
        document.addEventListener('mousemove', (e) => {
            if (isDraggingProgress) seekTimeline(e);
        });
        document.addEventListener('mouseup', () => {
            isDraggingProgress = false;
        });
    }

    // Volume Controls
    function setVolume(val) {
        currentVolume = Math.max(0, Math.min(1, val));
        if (playerVolumeBar) playerVolumeBar.style.width = `${currentVolume * 100}%`;
        if (playerVolumeIcon) {
            playerVolumeIcon.className = '';
            if (currentVolume === 0 || isMuted) {
                playerVolumeIcon.className = 'fas fa-volume-xmark';
            } else if (currentVolume < 0.5) {
                playerVolumeIcon.className = 'fas fa-volume-low';
            } else {
                playerVolumeIcon.className = 'fas fa-volume-high';
            }
        }
    }

    if (playerVolumeContainer) {
        playerVolumeContainer.addEventListener('click', (e) => {
            const rect = playerVolumeContainer.getBoundingClientRect();
            const val = (e.clientX - rect.left) / rect.width;
            isMuted = false;
            setVolume(val);
        });
    }

    if (playerMuteBtn) {
        let prevVolume = 0.8;
        playerMuteBtn.addEventListener('click', () => {
            if (isMuted || currentVolume === 0) {
                isMuted = false;
                setVolume(prevVolume || 0.8);
            } else {
                prevVolume = currentVolume;
                isMuted = true;
                setVolume(0);
            }
        });
    }

    // Initialize initial track state
    loadTrack(playlist[0], false);

    // ==========================================
    // 5. Universal Card Play Button Hook
    // ==========================================
    // Clicking any play button on playlist/artist/album cards plays that track directly!
    const playBtns = document.querySelectorAll('.play-btn');
    playBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = btn.closest('.playlist-card, .artist-card, .album-card');
            if (card) {
                const titleEl = card.querySelector('h3, .playlist-title, .artist-name, .album-title');
                const artistEl = card.querySelector('p, .playlist-description, .artist-genre, .album-artist');
                const imgEl = card.querySelector('img');

                const trackTitle = titleEl ? titleEl.innerText.trim() : 'Track';
                const trackArtist = artistEl ? artistEl.innerText.trim() : 'PulseWave Artist';
                const trackCover = imgEl ? imgEl.src : '../assets/midnight dreams.jpg';

                // Check if track is in default playlist or add dynamically
                let foundIndex = playlist.findIndex(t => t.title.toLowerCase() === trackTitle.toLowerCase());
                if (foundIndex === -1) {
                    playlist.push({
                        title: trackTitle,
                        artist: trackArtist,
                        cover: trackCover,
                        duration: 215
                    });
                    foundIndex = playlist.length - 1;
                }

                currentTrackIndex = foundIndex;
                loadTrack(playlist[currentTrackIndex], true);
            }
        });
    });
});

