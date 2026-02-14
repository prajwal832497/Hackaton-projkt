// Security Scanner - Simplified for EXE/APK Only

const API_BASE_URL = 'http://localhost:5000/api';

class ImmersiveApp {
    constructor() {
        this.lenis = null;
        this.cursor = { dot: null, circle: null };
        this.selectedFile = null;

        this.init();
    }

    async init() {
        // Initialize Smooth Scroll
        this.initLenis();

        // Initialize Custom Cursor
        this.initCursor();

        // Initialize GSAP Animations
        this.initAnimations();

        // Initialize Scanner Logic
        this.initScanner();

        // Simulate Loading Sequence
        await this.simulateLoading();
    }

    initLenis() {
        this.lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
        });

        // Connect Lenis to GSAP ScrollTrigger
        this.lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time) => {
            this.lenis.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0);
    }

    initCursor() {
        this.cursor.dot = document.querySelector('.cursor-dot');
        this.cursor.circle = document.querySelector('.cursor-circle');

        document.addEventListener('mousemove', (e) => {
            gsap.to(this.cursor.dot, {
                x: e.clientX,
                y: e.clientY,
                duration: 0.1
            });
            gsap.to(this.cursor.circle, {
                x: e.clientX,
                y: e.clientY,
                duration: 0.3
            });
        });

        // Hover effects
        const interactiveElements = document.querySelectorAll('a, button, input, .upload-zone, .xr-card');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                gsap.to(this.cursor.circle, { scale: 1.5, borderColor: '#00f3ff', opacity: 0.8 });
            });
            el.addEventListener('mouseleave', () => {
                gsap.to(this.cursor.circle, { scale: 1, borderColor: 'rgba(255,255,255,0.5)', opacity: 1 });
            });
        });
    }

    initAnimations() {
        // Register ScrollTrigger
        gsap.registerPlugin(ScrollTrigger);

        // Hero Text Reveal
        const splitText = document.querySelectorAll('.reveal-text');
        gsap.fromTo(splitText,
            { y: 100, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 1.5,
                stagger: 0.2,
                ease: 'power4.out',
                delay: 2.5 // Wait for loader
            }
        );

        gsap.fromTo('.reveal-text-delay',
            { y: 50, opacity: 0 },
            { y: 0, opacity: 0.8, duration: 1.5, delay: 3.2, ease: 'power3.out' }
        );

        // Scanner Section Animation
        gsap.from('.scanner-container', {
            scrollTrigger: {
                trigger: '.scanner-section',
                start: 'top 80%',
                end: 'bottom 20%',
                toggleActions: 'play none none reverse'
            },
            y: 100,
            opacity: 0,
            duration: 1,
            ease: 'power3.out'
        });
    }

    simulateLoading() {
        return new Promise(resolve => {
            const progress = document.querySelector('.loader-progress');
            const percent = document.querySelector('.loader-percentage');
            const overlay = document.querySelector('.loader-overlay');
            const body = document.body;

            let val = 0;
            const interval = setInterval(() => {
                val += Math.random() * 5;
                if (val > 100) val = 100;

                progress.style.width = `${val}%`;
                percent.textContent = `${Math.floor(val)}%`;

                if (val === 100) {
                    clearInterval(interval);

                    // Fade out loader
                    gsap.to(overlay, {
                        y: '-100%',
                        duration: 1,
                        ease: 'power4.inOut',
                        delay: 0.5,
                        onComplete: () => {
                            body.classList.remove('loading');
                            resolve();
                        }
                    });
                }
            }, 50);
        });
    }

    // Scanner Logic Integration
    initScanner() {
        const dropZone = document.getElementById('dropZone');
        const fileInput = document.getElementById('fileInput');
        const fileView = document.querySelector('.file-view');
        const removeBtn = document.getElementById('removeFile');
        const scanBtn = document.getElementById('scanButton');

        // File Upload Handling
        if (dropZone) {
            dropZone.addEventListener('click', () => fileInput.click());
            dropZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropZone.style.borderColor = '#00f3ff';
            });

            dropZone.addEventListener('dragleave', (e) => {
                e.preventDefault();
                dropZone.style.borderColor = 'rgba(255,255,255,0.2)';
            });

            dropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                dropZone.style.borderColor = 'rgba(255,255,255,0.2)';
                if (e.dataTransfer.files.length > 0) {
                    this.handleFile(e.dataTransfer.files[0]);
                }
            });
        }

        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        }

        if (removeBtn) {
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectedFile = null;
                fileInput.value = '';
                document.querySelector('.upload-content').style.display = 'block';
                fileView.style.display = 'none';
            });
        }

        // Scan Action
        if (scanBtn) {
            scanBtn.addEventListener('click', () => this.performScan());
        }
    }

    handleFileSelect(e) {
        if (e.target.files.length > 0) {
            this.handleFile(e.target.files[0]);
        }
    }

    handleFile(file) {
        // Validate file type
        const ext = file.name.split('.').pop().toLowerCase();
        if (ext !== 'exe' && ext !== 'apk') {
            alert('Only .exe and .apk files are supported!');
            return;
        }

        this.selectedFile = file;

        // Update UI
        document.querySelector('.upload-content').style.display = 'none';
        const fileView = document.querySelector('.file-view');
        fileView.style.display = 'flex';

        document.getElementById('fileName').textContent = file.name;
        document.getElementById('fileSize').textContent = this.formatSize(file.size);
    }

    formatSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async performScan() {
        const resultsSection = document.getElementById('resultsSection');

        if (!this.selectedFile) {
            alert('Please select a file first.');
            return;
        }

        // Show scanning state
        const btn = document.getElementById('scanButton');
        const originalText = btn.querySelector('.btn-text').textContent;
        btn.querySelector('.btn-text').textContent = 'SCANNING...';
        btn.disabled = true;

        try {
            const formData = new FormData();
            formData.append('file', this.selectedFile);

            const response = await fetch(`${API_BASE_URL}/scan/file`, {
                method: 'POST',
                body: formData
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Scan failed');
            }

            // Show Results
            resultsSection.style.display = 'block';

            // Scroll to results
            this.lenis.scrollTo('#resultsSection', { offset: -50 });

            this.displayResults(data);

        } catch (e) {
            console.error(e);
            alert(`Scan failed: ${e.message}\n\nPlease ensure the backend server is running.`);
        } finally {
            btn.querySelector('.btn-text').textContent = originalText;
            btn.disabled = false;
        }
    }

    displayResults(data) {
        // Animate Score
        const score = data.security_score || 0;
        const scoreCircle = document.getElementById('scoreCircle');
        const circumference = 2 * Math.PI * 90;
        const offset = circumference - (score / 100) * circumference;

        // Reset stroke
        scoreCircle.style.strokeDashoffset = circumference;
        setTimeout(() => {
            scoreCircle.style.strokeDashoffset = offset;

            // Color based on risk
            let color = '#00f3ff'; // Safe
            if (data.risk_level === 'CRITICAL') color = '#ff0055';
            else if (data.risk_level === 'HIGH') color = '#ff5500';
            else if (data.risk_level === 'MEDIUM') color = '#ffcc00';

            scoreCircle.style.stroke = color;
        }, 100);

        // Counter
        const scoreVal = document.getElementById('scoreValue');
        let currentScore = 0;
        const interval = setInterval(() => {
            currentScore += 1;
            scoreVal.textContent = currentScore;
            if (currentScore >= score) {
                clearInterval(interval);
                scoreVal.textContent = score;
            }
        }, 20);

        // Findings Grid
        const grid = document.getElementById('overviewGrid');
        grid.innerHTML = '';

        const summary = data.summary || { critical: 0, high: 0, medium: 0, total_issues: 0 };
        const stats = [
            { label: 'CRITICAL THREATS', value: summary.critical, color: '#ff0055' },
            { label: 'HIGH RISK', value: summary.high, color: '#ff5500' },
            { label: 'WARNINGS', value: summary.medium, color: '#ffcc00' },
            { label: 'TOTAL ISSUES', value: summary.total_issues, color: '#ffffff' }
        ];

        stats.forEach((stat, index) => {
            const card = document.createElement('div');
            card.className = 'xr-card';
            card.innerHTML = `
                <div class="xr-card-title" style="color: ${stat.color}">${stat.label}</div>
                <div class="xr-card-value">${stat.value}</div>
            `;
            grid.appendChild(card);

            gsap.from(card, {
                y: 50,
                opacity: 0,
                duration: 0.5,
                delay: index * 0.1
            });
        });

        // Findings List
        const list = document.getElementById('findingsList');
        list.innerHTML = '';

        let allFindings = [];
        if (data.findings) {
            for (let key in data.findings) {
                if (data.findings[key].findings) {
                    allFindings = [...allFindings, ...data.findings[key].findings];
                } else if (Array.isArray(data.findings[key])) {
                    allFindings = [...allFindings, ...data.findings[key]];
                }
            }
        } else if (data.issues) {
            allFindings = data.issues;
        }

        if (allFindings.length === 0) {
            list.innerHTML = '<div class="xr-card" style="text-align:center; padding: 2rem;">NO THREATS DETECTED. SYSTEM SECURE.</div>';
        } else {
            allFindings.forEach(f => {
                const item = document.createElement('div');
                item.className = 'xr-card';
                item.style.marginBottom = '1rem';
                item.innerHTML = `
                    <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
                        <span style="color:#00f3ff; font-family:var(--font-heading); font-size:0.8rem;">${f.type || 'ISSUE'}</span>
                        <span style="font-size:0.7rem; border:1px solid rgba(255,255,255,0.2); padding:2px 8px;">${f.severity || 'UNKNOWN'}</span>
                    </div>
                    <div style="font-size:0.9rem; opacity:0.8;">${f.description || f.value || JSON.stringify(f)}</div>
                `;
                list.appendChild(item);
            });
        }

        // Report Tab Switching
        const tabs = document.querySelectorAll('.report-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                const view = tab.dataset.view;
                document.getElementById('findingsList').style.display = view === 'findings' ? 'block' : 'none';
                document.getElementById('recommendationsList').style.display = view === 'recommendations' ? 'block' : 'none';
            });
        });

        // Recommendations
        const recList = document.getElementById('recommendationsList');
        recList.innerHTML = '';
        if (data.recommendations && data.recommendations.length > 0) {
            data.recommendations.forEach(rec => {
                const item = document.createElement('div');
                item.className = 'xr-card';
                item.style.marginBottom = '1rem';
                item.innerHTML = `<div style="font-size:0.9rem;">${rec}</div>`;
                recList.appendChild(item);
            });
        } else {
            recList.innerHTML = '<div class="xr-card" style="text-align:center; padding: 2rem;">NO RECOMMENDATIONS AVAILABLE.</div>';
        }
    }
}

// Initializer
document.addEventListener('DOMContentLoaded', () => {
    new ImmersiveApp();
});
