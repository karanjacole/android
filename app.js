/* ================================================================
   NEXUS-7 CYBER OPS COMMAND CENTER — APPLICATION CORE
   ================================================================ */

// ======================== GLOBAL STATE ========================

const STATE = {
    loggedIn: false,
    username: '',
    threatLevel: 'elevated', // low, elevated, high, critical
    matrixColor: { r: 0, g: 255, b: 65 },
    targetColor: { r: 0, g: 255, b: 65 },
    breaches: [],
    nodes: [],
    streamItems: [],
    activities: [],
    stats: { attacks: 0, threats: 0, blocked: 0 },
    metrics: { cpu: 47, mem: 62, net: 34, disk: 21, engine: 89 },
    terminalHistory: [],
    historyIndex: -1,
    threatCycleInterval: null,
    dataUpdateInterval: null,
};

// ======================== MATRIX RAIN ========================

class MatrixRain {
    constructor(canvas, isLogin = false) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.isLogin = isLogin;
        this.fontSize = isLogin ? 14 : 12;
        this.columns = 0;
        this.drops = [];
        this.chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF<>{}[]|/\\=+*&^%$#@!';
        this.running = true;
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = this.canvas.parentElement ? this.canvas.parentElement.clientWidth : window.innerWidth;
        this.canvas.height = this.canvas.parentElement ? this.canvas.parentElement.clientHeight : window.innerHeight;
        const cols = Math.floor(this.canvas.width / this.fontSize);
        if (cols !== this.columns) {
            this.columns = cols;
            this.drops = [];
            for (let i = 0; i < this.columns; i++) {
                this.drops.push(Math.random() * -100);
            }
        }
    }

    draw() {
        if (!this.running) return;
        const { r, g, b } = STATE.matrixColor;
        this.ctx.fillStyle = `rgba(10, 10, 15, 0.05)`;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.font = `${this.fontSize}px 'Share Tech Mono', monospace`;

        for (let i = 0; i < this.drops.length; i++) {
            const char = this.chars[Math.floor(Math.random() * this.chars.length)];
            const x = i * this.fontSize;
            const y = this.drops[i] * this.fontSize;

            // Head of the drop (brighter)
            this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.9)`;
            this.ctx.fillText(char, x, y);

            // Trail (dimmer)
            if (this.drops[i] > 1) {
                const prevChar = this.chars[Math.floor(Math.random() * this.chars.length)];
                this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.3)`;
                this.ctx.fillText(prevChar, x, (this.drops[i] - 1) * this.fontSize);
            }

            if (y > this.canvas.height && Math.random() > 0.975) {
                this.drops[i] = 0;
            }
            this.drops[i] += 0.5 + Math.random() * 0.5;
        }
    }

    animate() {
        if (!this.running) return;
        this.draw();
        requestAnimationFrame(() => this.animate());
    }

    stop() {
        this.running = false;
    }

    start() {
        this.running = true;
        this.animate();
    }
}

// ======================== WORLD MAP ========================

class WorldMap {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.attacks = [];
        this.running = true;
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Simplified world map points (continents outline)
        this.mapPoints = this.generateMapPoints();
    }

    resize() {
        const parent = this.canvas.parentElement;
        if (parent) {
            this.canvas.width = parent.clientWidth;
            this.canvas.height = parent.clientHeight;
        }
    }

    generateMapPoints() {
        // Major city coordinates (normalized 0-1 for lat/lon mapping)
        return [
            { name: 'New York', x: 0.24, y: 0.35 },
            { name: 'Los Angeles', x: 0.14, y: 0.38 },
            { name: 'London', x: 0.47, y: 0.28 },
            { name: 'Paris', x: 0.48, y: 0.30 },
            { name: 'Berlin', x: 0.51, y: 0.28 },
            { name: 'Moscow', x: 0.57, y: 0.25 },
            { name: 'Beijing', x: 0.76, y: 0.35 },
            { name: 'Tokyo', x: 0.84, y: 0.36 },
            { name: 'Sydney', x: 0.85, y: 0.72 },
            { name: 'Mumbai', x: 0.67, y: 0.45 },
            { name: 'Dubai', x: 0.60, y: 0.42 },
            { name: 'São Paulo', x: 0.30, y: 0.65 },
            { name: 'Lagos', x: 0.49, y: 0.52 },
            { name: 'Cairo', x: 0.55, y: 0.40 },
            { name: 'Singapore', x: 0.75, y: 0.52 },
            { name: 'Seoul', x: 0.80, y: 0.34 },
            { name: 'Toronto', x: 0.23, y: 0.32 },
            { name: 'Mexico City', x: 0.17, y: 0.47 },
            { name: 'Buenos Aires', x: 0.28, y: 0.73 },
            { name: 'Johannesburg', x: 0.54, y: 0.62 },
            { name: 'Tel Aviv', x: 0.56, y: 0.39 },
            { name: 'Bangkok', x: 0.73, y: 0.47 },
            { name: 'Jakarta', x: 0.76, y: 0.56 },
            { name: 'Riyadh', x: 0.59, y: 0.42 },
            { name: 'Tehran', x: 0.60, y: 0.37 },
            { name: 'Pyongyang', x: 0.79, y: 0.33 },
            { name: 'Taipei', x: 0.79, y: 0.40 },
            { name: 'Hong Kong', x: 0.77, y: 0.42 },
            { name: 'Shanghai', x: 0.78, y: 0.38 },
            { name: 'Kiev', x: 0.54, y: 0.29 },
        ];
    }

    addAttack() {
        const source = this.mapPoints[Math.floor(Math.random() * this.mapPoints.length)];
        const target = this.mapPoints[Math.floor(Math.random() * this.mapPoints.length)];
        this.attacks.push({
            source: { x: source.x, y: source.y },
            target: { x: target.x, y: target.y },
            progress: 0,
            speed: 0.005 + Math.random() * 0.015,
            opacity: 1,
        });
        if (this.attacks.length > 20) this.attacks.shift();
    }

    draw() {
        if (!this.running) return;
        const w = this.canvas.width;
        const h = this.canvas.height;
        if (w === 0 || h === 0) return;

        this.ctx.clearRect(0, 0, w, h);

        // Draw grid
        this.ctx.strokeStyle = 'rgba(0, 255, 65, 0.04)';
        this.ctx.lineWidth = 0.5;
        const gridSpacing = 40;
        for (let x = 0; x < w; x += gridSpacing) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, h);
            this.ctx.stroke();
        }
        for (let y = 0; y < h; y += gridSpacing) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(w, y);
            this.ctx.stroke();
        }

        // Draw city nodes
        const { r, g, b } = STATE.matrixColor;
        this.mapPoints.forEach(pt => {
            const px = pt.x * w;
            const py = pt.y * h;

            // Outer glow
            this.ctx.beginPath();
            this.ctx.arc(px, py, 6, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.1)`;
            this.ctx.fill();

            // Inner dot
            this.ctx.beginPath();
            this.ctx.arc(px, py, 2, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.6)`;
            this.ctx.fill();
        });

        // Draw attacks
        this.attacks = this.attacks.filter(atk => atk.opacity > 0);
        this.attacks.forEach(atk => {
            const sx = atk.source.x * w;
            const sy = atk.source.y * h;
            const tx = atk.target.x * w;
            const ty = atk.target.y * h;

            // Arc path
            const mx = (sx + tx) / 2;
            const my = (sy + ty) / 2 - Math.abs(tx - sx) * 0.2;

            // Draw trail
            this.ctx.beginPath();
            this.ctx.moveTo(sx, sy);
            this.ctx.quadraticCurveTo(mx, my, tx, ty);
            this.ctx.strokeStyle = `rgba(255, 0, 64, ${atk.opacity * 0.4})`;
            this.ctx.lineWidth = 1;
            this.ctx.stroke();

            // Moving dot
            atk.progress += atk.speed;
            if (atk.progress >= 1) {
                atk.opacity -= 0.02;
            }
            const t = Math.min(atk.progress, 1);
            const cx = (1-t)*(1-t)*sx + 2*(1-t)*t*mx + t*t*tx;
            const cy = (1-t)*(1-t)*sy + 2*(1-t)*t*my + t*t*ty;

            this.ctx.beginPath();
            this.ctx.arc(cx, cy, 3, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 0, 64, ${atk.opacity})`;
            this.ctx.fill();

            // Glow on dot
            this.ctx.beginPath();
            this.ctx.arc(cx, cy, 8, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 0, 64, ${atk.opacity * 0.2})`;
            this.ctx.fill();

            // Impact flash at target
            if (atk.progress >= 0.95 && atk.progress < 1.05) {
                this.ctx.beginPath();
                this.ctx.arc(tx, ty, 12, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(255, 0, 64, 0.3)`;
                this.ctx.fill();
            }
        });
    }

    animate() {
        if (!this.running) return;
        this.draw();
        requestAnimationFrame(() => this.animate());
    }

    start() {
        this.running = true;
        this.animate();
    }

    stop() {
        this.running = false;
    }
}

// ======================== LOGIN SYSTEM ========================

let loginMatrix = null;
let mainMatrix = null;
let worldMap = null;

function initLogin() {
    const canvas = document.getElementById('login-matrix');
    loginMatrix = new MatrixRain(canvas, true);
    loginMatrix.animate();
}

function togglePassword() {
    const input = document.getElementById('password');
    input.type = input.type === 'password' ? 'text' : 'password';
}

document.addEventListener('DOMContentLoaded', () => {
    initLogin();

    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        if (!username) {
            shakeLogin();
            return;
        }

        // Show loading state
        const btn = document.querySelector('.login-btn');
        const btnText = btn.querySelector('.btn-text');
        const btnLoader = btn.querySelector('.btn-loader');
        btnText.style.display = 'none';
        btnLoader.style.display = 'flex';
        btn.disabled = true;

        // Simulate authentication
        setTimeout(() => {
            STATE.loggedIn = true;
            STATE.username = username.toUpperCase();
            transitionToCommandCenter();
        }, 1500);
    });
});

function shakeLogin() {
    const container = document.querySelector('.login-container');
    container.classList.add('login-shake');
    setTimeout(() => container.classList.remove('login-shake'), 500);
}

function transitionToCommandCenter() {
    const loginScreen = document.getElementById('login-screen');
    const commandCenter = document.getElementById('command-center');

    // Fade out login
    loginScreen.style.transition = 'opacity 0.5s, transform 0.5s';
    loginScreen.style.opacity = '0';
    loginScreen.style.transform = 'scale(1.05)';

    setTimeout(() => {
        loginScreen.style.display = 'none';
        loginMatrix.stop();

        // Show command center
        commandCenter.style.display = 'flex';
        commandCenter.classList.add('center-transition');

        // Set user
        document.getElementById('active-user').textContent = STATE.username;

        // Init all systems
        initCommandCenter();
    }, 500);
}

function logout() {
    STATE.loggedIn = false;
    const commandCenter = document.getElementById('command-center');
    const loginScreen = document.getElementById('login-screen');

    commandCenter.style.display = 'none';
    loginScreen.style.display = 'flex';
    loginScreen.style.opacity = '1';
    loginScreen.style.transform = 'scale(1)';

    // Stop intervals
    clearInterval(STATE.threatCycleInterval);
    clearInterval(STATE.dataUpdateInterval);

    // Restart login matrix
    const canvas = document.getElementById('login-matrix');
    loginMatrix = new MatrixRain(canvas, true);
    loginMatrix.animate();

    // Reset form
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    const btn = document.querySelector('.login-btn');
    const btnText = btn.querySelector('.btn-text');
    const btnLoader = btn.querySelector('.btn-loader');
    btnText.style.display = 'inline';
    btnLoader.style.display = 'none';
    btn.disabled = false;
}

// ======================== COMMAND CENTER INIT ========================

function initCommandCenter() {
    // Start main matrix
    const mainCanvas = document.getElementById('main-matrix');
    mainMatrix = new MatrixRain(mainCanvas, false);
    mainMatrix.animate();

    // Start world map
    const mapCanvas = document.getElementById('world-map');
    worldMap = new WorldMap(mapCanvas);
    worldMap.animate();

    // Start clocks
    updateClocks();
    setInterval(updateClocks, 1000);

    // Populate initial data
    populateNodes();
    populateBreaches();
    populateStream();
    populateActivity();
    populateTicker();

    // Start live updates
    startLiveUpdates();

    // Init terminal
    initTerminal();

    // Init oracle
    initOracle();

    // Set oracle init time
    document.getElementById('oracle-init-time').textContent = getCurrentTime();

    // Start threat cycle (changes threat level periodically)
    startThreatCycle();

    // Start map attacks
    setInterval(() => {
        if (worldMap) worldMap.addAttack();
    }, 800);

    // Update stats
    setInterval(() => {
        STATE.stats.attacks = Math.floor(Math.random() * 2000) + 800;
        STATE.stats.threats = Math.floor(Math.random() * 150) + 30;
        STATE.stats.blocked = Math.floor(Math.random() * 50000) + 120000;
        document.getElementById('total-attacks').textContent = STATE.stats.attacks.toLocaleString();
        document.getElementById('active-threads').textContent = STATE.stats.threats.toLocaleString();
        document.getElementById('blocked-today').textContent = STATE.stats.blocked.toLocaleString();
    }, 3000);

    // Update metrics
    setInterval(() => {
        updateMetrics();
    }, 2500);

    // Update firewall
    setInterval(() => {
        updateFirewall();
    }, 4000);
}

// ======================== CLOCKS ========================

function updateClocks() {
    const now = new Date();
    document.getElementById('clock-local').textContent = now.toLocaleTimeString('en-US', { hour12: false });
    document.getElementById('clock-utc').textContent = now.toUTCString().split(' ')[4];
    document.getElementById('clock-zulu').textContent = now.toISOString().split('T')[1].split('.')[0];
}

function getCurrentTime() {
    return new Date().toLocaleTimeString('en-US', { hour12: false });
}

// ======================== THREAT SYSTEM ========================

const threatLevels = ['low', 'elevated', 'high', 'critical'];
const threatLabels = { low: 'LOW', elevated: 'ELEVATED', high: 'HIGH', critical: 'CRITICAL' };
const threatPercents = { low: 25, elevated: 50, high: 75, critical: 95 };
const threatColors = {
    low: { r: 0, g: 255, b: 65 },
    elevated: { r: 255, g: 140, b: 0 },
    high: { r: 255, g: 60, b: 0 },
    critical: { r: 255, g: 0, b: 64 },
};

function startThreatCycle() {
    // Randomly change threat level
    function cycleThreat() {
        const rand = Math.random();
        let newLevel;
        if (rand < 0.3) newLevel = 'low';
        else if (rand < 0.65) newLevel = 'elevated';
        else if (rand < 0.88) newLevel = 'high';
        else newLevel = 'critical';

        setThreatLevel(newLevel);
    }

    STATE.threatCycleInterval = setInterval(cycleThreat, 15000 + Math.random() * 20000);
    // Set initial
    setThreatLevel('elevated');
}

function setThreatLevel(level) {
    const prev = STATE.threatLevel;
    STATE.threatLevel = level;
    STATE.targetColor = threatColors[level];

    // Update threat indicator
    document.getElementById('threat-fill').style.width = threatPercents[level] + '%';
    document.getElementById('threat-status').textContent = threatLabels[level];

    // Update body class
    document.body.className = 'threat-' + level;

    // Animate matrix color transition
    animateMatrixColor();

    // Add activity
    if (prev !== level) {
        addActivity(`⚠ THREAT LEVEL CHANGED: ${threatLabels[level]}`, level === 'critical' || level === 'high' ? '🔴' : '🟡');
        
        // Flash effect
        const cc = document.getElementById('command-center');
        cc.classList.add('threat-pulse');
        setTimeout(() => cc.classList.remove('threat-pulse'), 1000);

        // If critical, add emergency breach
        if (level === 'critical') {
            addCriticalBreach();
        }
    }
}

function animateMatrixColor() {
    const start = { ...STATE.matrixColor };
    const target = STATE.targetColor;
    const duration = 1500;
    const startTime = performance.now();

    function step(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        STATE.matrixColor.r = Math.round(start.r + (target.r - start.r) * ease);
        STATE.matrixColor.g = Math.round(start.g + (target.g - start.g) * ease);
        STATE.matrixColor.b = Math.round(start.b + (target.b - start.b) * ease);

        if (progress < 1) {
            requestAnimationFrame(step);
        }
    }

    requestAnimationFrame(step);
}

// ======================== NODES ========================

const nodeData = [
    { name: 'ALPHA-01', ip: '192.168.1.10', status: 'online' },
    { name: 'BRAVO-02', ip: '192.168.1.20', status: 'online' },
    { name: 'CHARLIE-03', ip: '10.0.0.15', status: 'online' },
    { name: 'DELTA-04', ip: '10.0.0.25', status: 'warning' },
    { name: 'ECHO-05', ip: '172.16.0.10', status: 'online' },
    { name: 'FOXTROT-06', ip: '172.16.0.20', status: 'online' },
    { name: 'GOLF-07', ip: '192.168.2.30', status: 'offline' },
    { name: 'HOTEL-08', ip: '192.168.2.40', status: 'online' },
    { name: 'INDIA-09', ip: '10.0.1.50', status: 'online' },
    { name: 'JULIET-10', ip: '10.0.1.60', status: 'warning' },
];

function populateNodes() {
    const panel = document.getElementById('nodes-panel');
    panel.innerHTML = '';
    nodeData.forEach(node => {
        panel.innerHTML += `
            <div class="node-item">
                <span class="node-status ${node.status}"></span>
                <span class="node-name">${node.name}</span>
                <span class="node-ip">${node.ip}</span>
            </div>
        `;
    });
}

// ======================== BREACHES ========================

const breachTemplates = [
    { title: 'SQL Injection Attempt', origin: '185.234.XX.XX', target: 'WEB-SRV-01', severity: 'high' },
    { title: 'DDoS Attack Detected', origin: '91.108.XX.XX', target: 'CDN-EDGE-03', severity: 'critical' },
    { title: 'Brute Force SSH Login', origin: '45.155.XX.XX', target: 'BASTION-01', severity: 'medium' },
    { title: 'XSS Payload Detected', origin: '103.224.XX.XX', target: 'API-GW-02', severity: 'high' },
    { title: 'Port Scan Detected', origin: '198.51.XX.XX', target: 'FIREWALL-01', severity: 'medium' },
    { title: 'Phishing Campaign Active', origin: 'MULTIPLE', target: 'MAIL-SRV-01', severity: 'high' },
    { title: 'Ransomware Signature Match', origin: '77.88.XX.XX', target: 'FILE-SRV-04', severity: 'critical' },
    { title: 'Zero-Day Exploit Attempt', origin: 'UNKNOWN', target: 'APP-SRV-02', severity: 'critical' },
    { title: 'Credential Stuffing', origin: '52.16.XX.XX', target: 'AUTH-SRV-01', severity: 'high' },
    { title: 'DNS Tunneling Detected', origin: '208.76.XX.XX', target: 'DNS-RES-01', severity: 'medium' },
    { title: 'Malware C2 Beacon', origin: '185.220.XX.XX', target: 'ENDPOINT-12', severity: 'critical' },
    { title: 'API Abuse Detected', origin: '35.192.XX.XX', target: 'API-GW-01', severity: 'medium' },
    { title: 'Crypto Mining Activity', origin: 'INTERNAL', target: 'WORKSTATION-08', severity: 'high' },
    { title: 'Privilege Escalation', origin: '10.0.3.XX', target: 'DC-01', severity: 'critical' },
];

function populateBreaches() {
    // Start with 4 breaches
    for (let i = 0; i < 4; i++) {
        addBreach();
    }
}

function addBreach() {
    const template = breachTemplates[Math.floor(Math.random() * breachTemplates.length)];
    const breach = {
        ...template,
        time: getCurrentTime(),
        id: Date.now() + Math.random(),
    };
    STATE.breaches.unshift(breach);
    if (STATE.breaches.length > 15) STATE.breaches.pop();
    renderBreaches();
}

function addCriticalBreach() {
    const critTemplates = breachTemplates.filter(b => b.severity === 'critical');
    const template = critTemplates[Math.floor(Math.random() * critTemplates.length)];
    const breach = {
        ...template,
        time: getCurrentTime(),
        id: Date.now(),
    };
    STATE.breaches.unshift(breach);
    if (STATE.breaches.length > 15) STATE.breaches.pop();
    renderBreaches();
}

function renderBreaches() {
    const panel = document.getElementById('breaches-panel');
    document.getElementById('breach-count').textContent = STATE.breaches.length;
    panel.innerHTML = STATE.breaches.map(b => `
        <div class="breach-item ${b.severity}">
            <div class="breach-info">
                <span class="breach-severity ${b.severity}">${b.severity.toUpperCase()}</span>
                <div class="breach-title">${b.title}</div>
                <div class="breach-detail">${b.origin} → ${b.target}</div>
            </div>
            <span class="breach-time">${b.time}</span>
        </div>
    `).join('');
}

// ======================== SECURITY STREAM ========================

const streamTemplates = [
    { type: 'alert', text: 'Intrusion Detection System triggered on perimeter firewall — source IP blocked and logged' },
    { type: 'info', text: 'Security patch deployment completed across 47 endpoints — all systems updated successfully' },
    { type: 'warn', text: 'Anomalous traffic pattern detected from Eastern European IP range — monitoring active' },
    { type: 'threat', text: 'APT29 signature detected in network traffic — incident response team notified' },
    { type: 'alert', text: 'Multiple failed authentication attempts on VPN gateway — rate limiting engaged' },
    { type: 'info', text: 'Threat intelligence feed updated — 2,847 new IOCs ingested and correlated' },
    { type: 'warn', text: 'SSL certificate expiration warning for 3 internal services — renewal initiated' },
    { type: 'threat', text: 'Lateral movement attempt detected between VLAN 10 and VLAN 20 — isolation protocol active' },
    { type: 'info', text: 'Automated vulnerability scan completed — 12 new findings queued for triage' },
    { type: 'alert', text: 'Data exfiltration attempt blocked — 2.4GB transfer to external endpoint intercepted' },
    { type: 'warn', text: 'Memory utilization exceeding 90% on threat analysis engine — scaling compute resources' },
    { type: 'threat', text: 'Supply chain compromise alert — third-party vendor SDK contains malicious backdoor' },
    { type: 'info', text: 'Zero-day threat signature deployed to all endpoints — coverage now at 99.7%' },
    { type: 'alert', text: 'Unauthorized container deployment detected in Kubernetes cluster — sandboxed for analysis' },
    { type: 'threat', text: 'Nation-state actor fingerprint matched — coordinated attack pattern from APT41 cluster' },
    { type: 'warn', text: 'DNS resolution anomalies detected — potential DNS hijacking attempt under investigation' },
    { type: 'info', text: 'Honeypot interaction logged — attacker enumerated 3 decoy services before disconnecting' },
    { type: 'alert', text: 'Ransomware payload detonated in sandbox — signature extracted and distributed to endpoints' },
];

function populateStream() {
    for (let i = 0; i < 8; i++) {
        addStreamItem();
    }
}

function addStreamItem() {
    const template = streamTemplates[Math.floor(Math.random() * streamTemplates.length)];
    const item = {
        type: template.type,
        text: template.text,
        time: getCurrentTime(),
    };
    STATE.streamItems.unshift(item);
    if (STATE.streamItems.length > 50) STATE.streamItems.pop();
    renderStream();
}

function renderStream() {
    const panel = document.getElementById('security-stream');
    panel.innerHTML = STATE.streamItems.slice(0, 20).map(s => `
        <div class="stream-item">
            <span class="stream-type ${s.type}">${s.type.toUpperCase()}</span>
            <span class="stream-text">${s.text}</span>
            <span class="stream-time">${s.time}</span>
        </div>
    `).join('');
}

// ======================== ACTIVITY FEED ========================

function populateActivity() {
    const activities = [
        { icon: '🛡', text: 'Firewall rule #4721 updated' },
        { icon: '🔍', text: 'Threat scan completed on subnet 10.0.0.0/24' },
        { icon: '✅', text: 'Authentication token refreshed for OPERATIVE' },
        { icon: '📡', text: 'New intelligence feed connected' },
    ];
    activities.forEach(a => addActivity(a.text, a.icon, false));
}

function addActivity(text, icon = '◉', animate = true) {
    const item = { icon, text, time: getCurrentTime() };
    STATE.activities.unshift(item);
    if (STATE.activities.length > 30) STATE.activities.pop();
    renderActivity(animate);
}

function renderActivity(animate = true) {
    const panel = document.getElementById('activity-feed');
    panel.innerHTML = STATE.activities.slice(0, 15).map(a => `
        <div class="activity-item" ${animate ? '' : ''}>
            <span class="activity-icon">${a.icon}</span>
            <span class="activity-text">${a.text}</span>
            <span class="activity-time">${a.time}</span>
        </div>
    `).join('');
}

// ======================== TICKER ========================

function populateTicker() {
    const items = [
        'CVE-2024-8901: Critical RCE vulnerability discovered in popular web framework',
        'INTERPOL alert: Coordinated ransomware campaign targeting healthcare sector',
        'NIST NVD updated: 847 new vulnerabilities published this week',
        'CISA Advisory: Active exploitation of zero-day in enterprise VPN appliances',
        'Threat Intelligence: New phishing kit mimicking major banking portals detected',
        'Cyclone Diplomat: New APT group targeting government entities in Southeast Asia',
        'Ransomware landscape: LockBit 4.0 affiliate program emerges on dark web',
        'Supply chain alert: Malicious npm packages discovered with 500K+ downloads',
        'Geopolitical cyber: Elevated state-sponsored activity from APT29 and APT41 clusters',
        'Cloud security: Misconfigured S3 buckets exposing 2.3M records across 12 organizations',
    ];

    const content = document.getElementById('ticker-content');
    // Double the items for seamless scroll
    const allItems = [...items, ...items];
    content.innerHTML = allItems.map(t => `
        <span class="ticker-item"><span class="dot"></span>${t}</span>
    `).join('');
}

// ======================== LIVE UPDATES ========================

function startLiveUpdates() {
    // Add new breach every 8-15 seconds
    setInterval(() => {
        addBreach();
    }, 8000 + Math.random() * 7000);

    // Add new stream item every 5-10 seconds
    setInterval(() => {
        addStreamItem();
    }, 5000 + Math.random() * 5000);

    // Add activity every 6-12 seconds
    setInterval(() => {
        const acts = [
            { icon: '🛡', text: 'Perimeter scan completed — no anomalies' },
            { icon: '🔄', text: 'Threat signature database synchronized' },
            { icon: '📊', text: 'Network traffic analysis updated' },
            { icon: '🔐', text: 'Encryption key rotation completed' },
            { icon: '⚡', text: 'IDS rule set refreshed — 24 new rules active' },
            { icon: '🔍', text: 'Deep packet inspection cycle completed' },
            { icon: '📡', text: 'Satellite uplink integrity verified' },
            { icon: '🧬', text: 'Behavioral analysis engine recalibrated' },
            { icon: '✅', text: 'Compliance check passed — SOC2 Type II' },
            { icon: '🔒', text: 'Zero-trust policy enforcement updated' },
        ];
        const act = acts[Math.floor(Math.random() * acts.length)];
        addActivity(act.text, act.icon);
    }, 6000 + Math.random() * 6000);

    // Randomly toggle node statuses
    setInterval(() => {
        const idx = Math.floor(Math.random() * nodeData.length);
        const statuses = ['online', 'online', 'online', 'warning', 'offline'];
        nodeData[idx].status = statuses[Math.floor(Math.random() * statuses.length)];
        populateNodes();
    }, 10000);
}

// ======================== METRICS ========================

function updateMetrics() {
    const jitter = () => (Math.random() - 0.5) * 10;
    STATE.metrics.cpu = Math.max(10, Math.min(95, STATE.metrics.cpu + jitter()));
    STATE.metrics.mem = Math.max(20, Math.min(90, STATE.metrics.mem + jitter()));
    STATE.metrics.net = Math.max(5, Math.min(80, STATE.metrics.net + jitter()));
    STATE.metrics.disk = Math.max(10, Math.min(70, STATE.metrics.disk + jitter()));
    STATE.metrics.engine = Math.max(60, Math.min(99, STATE.metrics.engine + jitter() * 0.5));

    Object.entries(STATE.metrics).forEach(([key, val]) => {
        const rounded = Math.round(val);
        const fillEl = document.getElementById(`${key}-fill`);
        const valEl = document.getElementById(`${key}-val`);
        if (fillEl) fillEl.style.width = rounded + '%';
        if (valEl) valEl.textContent = rounded + '%';
    });
}

// ======================== FIREWALL ========================

function updateFirewall() {
    const fwFills = document.querySelectorAll('.fw-fill');
    fwFills.forEach(fill => {
        const current = parseInt(fill.style.width);
        const newVal = Math.max(40, Math.min(99, current + (Math.random() - 0.4) * 8));
        fill.style.width = Math.round(newVal) + '%';
        fill.parentElement.nextElementSibling.textContent = Math.round(newVal) + '%';
    });
}

// ======================== AI ORACLE ========================

function initOracle() {
    document.getElementById('oracle-input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') sendToOracle();
    });
}

function sendToOracle() {
    const input = document.getElementById('oracle-input');
    const text = input.value.trim();
    if (!text) return;

    // Add user message
    addOracleMessage(text, 'user', STATE.username);
    input.value = '';

    // Process with Oracle
    setTimeout(() => {
        const response = oracleProcess(text);
        addOracleMessage(response, 'system', 'ORACLE');
    }, 500 + Math.random() * 1000);
}

function addOracleMessage(text, type, sender) {
    const messages = document.getElementById('oracle-messages');
    const msg = document.createElement('div');
    msg.className = `oracle-msg ${type}`;
    msg.innerHTML = `
        <span class="msg-sender">${sender}</span>
        <span class="msg-text">${text}</span>
        <span class="msg-time">${getCurrentTime()}</span>
    `;
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
}

function oracleProcess(input) {
    const lower = input.toLowerCase();

    // Threat analysis
    if (lower.includes('threat') || lower.includes('danger') || lower.includes('risk')) {
        const responses = [
            `Current threat assessment: THREAT LEVEL is <strong>${threatLabels[STATE.threatLevel]}</strong>. We are tracking ${STATE.breaches.length} active breaches across ${STATE.stats.threats} threat vectors. The most critical active threat involves ${STATE.breaches[0]?.title || 'ongoing reconnaissance activity'}. I recommend maintaining heightened vigilance on perimeter defenses and ensuring all endpoint detection signatures are current.`,
            `Threat landscape analysis complete. Current state: ${STATE.threatLevel.toUpperCase()} risk posture. Our sensors have detected ${Math.floor(Math.random() * 50 + 10)} unique attacker IPs in the last hour. Primary attack vectors include credential stuffing, SQL injection, and DDoS amplification. Automated response protocols are engaged and countermeasures are active.`,
            `I've analyzed the current threat environment. Threat level stands at ${threatLabels[STATE.threatLevel]}. Notable patterns: increased port scanning from Eastern European IP ranges, phishing campaigns targeting executive accounts, and attempted lateral movement within the DMZ. All defensive systems are operational and responding.`,
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    // Breach info
    if (lower.includes('breach') || lower.includes('attack') || lower.includes('intrusion')) {
        const topBreaches = STATE.breaches.slice(0, 3).map(b => `<strong>${b.title}</strong> (${b.severity.toUpperCase()}) from ${b.origin}`).join('; ');
        return `Active breach summary: ${topBreaches || 'No active breaches at this time'}. Automated incident response protocols are engaged for all critical severity events. Forensic data is being collected and preserved for analysis. I recommend prioritizing the highest severity items for manual review.`;
    }

    // System status
    if (lower.includes('status') || lower.includes('system') || lower.includes('health')) {
        return `All systems operational. CPU: ${Math.round(STATE.metrics.cpu)}% | Memory: ${Math.round(STATE.metrics.mem)}% | Network I/O: ${Math.round(STATE.metrics.net)}% | Threat Engine: ${Math.round(STATE.metrics.engine)}%. All ${nodeData.length} network nodes are monitored — ${nodeData.filter(n => n.status === 'online').length} online, ${nodeData.filter(n => n.status === 'warning').length} warning, ${nodeData.filter(n => n.status === 'offline').length} offline. Firewall integrity is within acceptable parameters across all zones.`;
    }

    // Scan
    if (lower.includes('scan') || lower.includes('sweep') || lower.includes('check')) {
        return `Initiating comprehensive security scan across all monitored assets. Scanning ${nodeData.length * 4} endpoints, ${nodeData.length} network segments, and all perimeter defenses. Estimated completion: 45 seconds. Preliminary results show ${Math.floor(Math.random() * 5)} new findings requiring attention. Scan results will be correlated with threat intelligence feeds and prioritized by CVSS score. I'll flag any critical discoveries immediately.`;
    }

    // Network
    if (lower.includes('network') || lower.includes('traffic') || lower.includes('bandwidth')) {
        return `Network analysis: Current throughput is ${Math.floor(Math.random() * 800 + 200)} Mbps across primary links. ${Math.floor(Math.random() * 50 + 5)} active connections being monitored. Traffic patterns are ${STATE.threatLevel === 'critical' ? 'ANOMALOUS — potential DDoS indicators detected' : 'within normal baseline parameters'}. Deep packet inspection is active on all ingress/egress points. No unauthorized data exfiltration detected in the current analysis window.`;
    }

    // Vulnerability
    if (lower.includes('vulnerab') || lower.includes('cve') || lower.includes('patch')) {
        return `Vulnerability assessment: ${Math.floor(Math.random() * 20 + 5)} CVEs identified in the last scan cycle. ${Math.floor(Math.random() * 3)} are rated Critical (CVSS 9.0+), ${Math.floor(Math.random() * 6 + 2)} are High severity. Recommended action: prioritize patching of internet-facing services, especially those with known exploitation evidence in the wild. I can generate a detailed remediation plan on request.`;
    }

    // Forensics
    if (lower.includes('forensic') || lower.includes('investigate') || lower.includes('analyz')) {
        return `Forensic analysis module engaged. I've correlated ${Math.floor(Math.random() * 500 + 100)} log entries from the past 24 hours. Key findings: ${Math.floor(Math.random() * 3 + 1)} indicators of compromise (IOCs) matched known threat actor signatures. Attack timeline reconstruction shows initial access was likely achieved through ${['spear-phishing', 'supply chain compromise', 'zero-day exploitation', 'credential reuse'][Math.floor(Math.random() * 4)]}. Memory forensics and disk imaging are available for deep-dive analysis.`;
    }

    // Encrypt
    if (lower.includes('encrypt') || lower.includes('cipher') || lower.includes('crypto')) {
        return `Encryption status: All data at rest uses AES-256-GCM encryption. In-transit communications utilize TLS 1.3 with perfect forward secrecy. Key rotation is automated on a 90-day cycle. Current cryptographic posture is strong — no known vulnerabilities in active cipher suites. Quantum-resistant algorithms are available for classified data channels upon request.`;
    }

    // Help
    if (lower.includes('help') || lower.includes('what can you') || lower.includes('commands')) {
        return `I am the NEXUS-7 AI Oracle, your cyber operations intelligence assistant. I can help with: <strong>Threat Analysis</strong> — current threat landscape and risk assessment | <strong>Breach Intelligence</strong> — active breach details and response | <strong>System Status</strong> — infrastructure health and metrics | <strong>Network Analysis</strong> — traffic patterns and anomalies | <strong>Vulnerability Assessment</strong> — CVE tracking and patching guidance | <strong>Forensic Investigation</strong> — incident analysis and IOC correlation | <strong>Encryption Audit</strong> — cryptographic posture review | <strong>Scan Operations</strong> — security sweep coordination. Simply ask about any of these topics and I'll provide actionable intelligence.`;
    }

    // Greetings
    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('greet')) {
        return `Greetings, Operative ${STATE.username}. The NEXUS-7 systems are fully operational and standing by. Current threat level is ${threatLabels[STATE.threatLevel]}. I'm monitoring ${STATE.breaches.length} active security events. How may I assist with your cyber operations today?`;
    }

    // Who are you
    if (lower.includes('who are you') || lower.includes('what are you') || lower.includes('your name')) {
        return `I am ORACLE, the AI-driven intelligence analysis system of NEXUS-7 Command Center. I was designed to provide real-time threat assessment, incident response coordination, and strategic cyber operations support. I continuously monitor all network sensors, threat intelligence feeds, and security infrastructure to maintain situational awareness. My neural processing cores analyze over 10 million events per second to deliver actionable intelligence to operatives like you.`;
    }

    // Default intelligent response
    const defaults = [
        `Interesting query, Operative. Let me cross-reference that with our threat intelligence database. Based on current operational data, I can confirm that all monitored parameters related to your inquiry are within acceptable ranges. However, I recommend maintaining active surveillance. Would you like me to initiate a targeted analysis?`,
        `Processing your request against current threat intelligence. The data suggests we should maintain our current defensive posture while increasing monitoring frequency on the relevant vectors. I've logged this inquiry for pattern analysis — repeated queries on similar topics may indicate emerging concerns that warrant proactive countermeasures.`,
        `Acknowledged. I've analyzed your input in the context of current operations. While no immediate threats correlate directly with your query, the threat landscape is dynamic. I'm adjusting monitoring parameters to capture any related anomalies. My analysis engines will flag any developments that connect to this area of interest.`,
        `Query processed. Cross-referencing with ${Math.floor(Math.random() * 200 + 50)} active intelligence sources and ${Math.floor(Math.random() * 1000 + 500)} historical incident records. My assessment: the situation is stable but requires continued vigilance. I recommend periodic reassessment as new threat data becomes available.`,
    ];
    return defaults[Math.floor(Math.random() * defaults.length)];
}

// ======================== COMMAND TERMINAL ========================

function initTerminal() {
    const input = document.getElementById('terminal-input');
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            executeTerminalCommand(input.value.trim());
            STATE.terminalHistory.push(input.value.trim());
            STATE.historyIndex = STATE.terminalHistory.length;
            input.value = '';
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (STATE.historyIndex > 0) {
                STATE.historyIndex--;
                input.value = STATE.terminalHistory[STATE.historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (STATE.historyIndex < STATE.terminalHistory.length - 1) {
                STATE.historyIndex++;
                input.value = STATE.terminalHistory[STATE.historyIndex];
            } else {
                STATE.historyIndex = STATE.terminalHistory.length;
                input.value = '';
            }
        }
    });
}

function termOut(text, type = 'output') {
    const output = document.getElementById('terminal-output');
    const line = document.createElement('div');
    line.className = `term-line ${type}`;
    line.textContent = text;
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
}

function executeTerminalCommand(cmd) {
    if (!cmd) return;
    termOut(`nexus@ops:~$ ${cmd}`, 'system');

    const lower = cmd.toLowerCase();
    const parts = lower.split(/\s+/);
    const command = parts[0];
    const args = parts.slice(1);

    switch (command) {
        case 'help':
            termOut('═══════════════════════════════════════════', 'system');
            termOut('  NEXUS-7 COMMAND TERMINAL — AVAILABLE COMMANDS', 'system');
            termOut('═══════════════════════════════════════════', 'system');
            termOut('  help              — Display this help menu', 'info');
            termOut('  status            — System status overview', 'info');
            termOut('  threat [level]    — View/set threat level (low/elevated/high/critical)', 'info');
            termOut('  scan [target]     — Run security scan', 'info');
            termOut('  breaches          — List active breaches', 'info');
            termOut('  nodes             — List network nodes', 'info');
            termOut('  trace [ip]        — Trace IP address', 'info');
            termOut('  decrypt [data]    — Decrypt data payload', 'info');
            termOut('  encrypt [data]    — Encrypt data payload', 'info');
            termOut('  ping [host]       — Ping network host', 'info');
            termOut('  nmap [subnet]     — Network map scan', 'info');
            termOut('  whois [domain]    — Domain lookup', 'info');
            termOut('  logs [count]      — View recent logs', 'info');
            termOut('  firewall [action] — Firewall management (status/flush/lockdown)', 'info');
            termOut('  clear             — Clear terminal output', 'info');
            termOut('  about             — About NEXUS-7', 'info');
            termOut('  matrix [color]    — Change matrix color (green/red/orange/cyan)', 'info');
            termOut('═══════════════════════════════════════════', 'system');
            break;

        case 'status':
            termOut('┌─ SYSTEM STATUS ─────────────────────────┐', 'system');
            termOut(`│ Threat Level:  ${threatLabels[STATE.threatLevel].padEnd(26)}│`, STATE.threatLevel === 'critical' || STATE.threatLevel === 'high' ? 'error' : 'output');
            termOut(`│ Active Breaches: ${String(STATE.breaches.length).padEnd(24)}│`, 'output');
            termOut(`│ Online Nodes:   ${String(nodeData.filter(n => n.status === 'online').length + '/' + nodeData.length).padEnd(24)}│`, 'output');
            termOut(`│ CPU Load:       ${Math.round(STATE.metrics.cpu) + '%'.padEnd(25)}│`, 'output');
            termOut(`│ Memory Usage:   ${Math.round(STATE.metrics.mem) + '%'.padEnd(25)}│`, 'output');
            termOut(`│ Threat Engine:  ${Math.round(STATE.metrics.engine) + '%'.padEnd(25)}│`, 'output');
            termOut(`│ Attacks/min:    ${String(STATE.stats.attacks).padEnd(24)}│`, 'output');
            termOut(`│ Blocked Today:  ${String(STATE.stats.blocked).padEnd(24)}│`, 'output');
            termOut('└──────────────────────────────────────────┘', 'system');
            break;

        case 'threat':
            if (args[0] && threatLevels.includes(args[0])) {
                setThreatLevel(args[0]);
                termOut(`[+] Threat level set to ${args[0].toUpperCase()}`, 'warning');
            } else {
                termOut(`Current threat level: ${STATE.threatLevel.toUpperCase()}`, 'output');
                termOut(`Available levels: low, elevated, high, critical`, 'info');
            }
            break;

        case 'scan':
            const target = args[0] || 'all';
            termOut(`[*] Initiating security scan on target: ${target}`, 'system');
            setTimeout(() => termOut('[*] Scanning network interfaces...', 'output'), 300);
            setTimeout(() => termOut('[*] Enumerating open ports...', 'output'), 600);
            setTimeout(() => termOut('[*] Checking service versions...', 'output'), 900);
            setTimeout(() => termOut('[*] Running vulnerability checks...', 'output'), 1200);
            setTimeout(() => {
                const vulns = Math.floor(Math.random() * 8) + 1;
                const critical = Math.floor(Math.random() * 2);
                termOut(`[+] Scan complete. Found ${vulns} vulnerabilities (${critical} critical)`, critical > 0 ? 'warning' : 'info');
                termOut(`[+] Results logged to /var/nexus/scans/${Date.now()}.json`, 'output');
            }, 1500);
            break;

        case 'breaches':
            if (STATE.breaches.length === 0) {
                termOut('[+] No active breaches detected.', 'info');
            } else {
                termOut(`[!] ${STATE.breaches.length} ACTIVE BREACHES:`, 'warning');
                STATE.breaches.slice(0, 8).forEach((b, i) => {
                    termOut(`  ${i + 1}. [${b.severity.toUpperCase()}] ${b.title} — ${b.origin} → ${b.target}`, b.severity === 'critical' ? 'error' : b.severity === 'high' ? 'warning' : 'output');
                });
            }
            break;

        case 'nodes':
            termOut('┌─ NETWORK NODES ─────────────────────────┐', 'system');
            nodeData.forEach(n => {
                const statusIcon = n.status === 'online' ? '●' : n.status === 'warning' ? '◐' : '○';
                termOut(`│ ${statusIcon} ${n.name.padEnd(14)} ${n.ip.padEnd(16)} ${n.status.padEnd(8)}│`, n.status === 'offline' ? 'error' : n.status === 'warning' ? 'warning' : 'output');
            });
            termOut('└──────────────────────────────────────────┘', 'system');
            break;

        case 'trace':
            const ip = args[0] || '185.234.72.42';
            termOut(`[*] Tracing route to ${ip}...`, 'system');
            const hops = Math.floor(Math.random() * 8) + 5;
            for (let i = 1; i <= hops; i++) {
                const hopIp = `${Math.floor(Math.random() * 200 + 10)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
                const latency = (Math.random() * 50 + i * 5).toFixed(1);
                setTimeout(() => {
                    termOut(`  ${i.toString().padStart(2)}  ${hopIp.padEnd(18)} ${latency}ms`, 'output');
                    if (i === hops) {
                        termOut(`[+] Trace complete: ${hops} hops, ${ip} reached`, 'info');
                    }
                }, i * 200);
            }
            break;

        case 'decrypt':
            const data = args.join(' ') || 'encrypted_payload_0x4F2A';
            termOut(`[*] Initializing AES-256-GCM decryption...`, 'system');
            setTimeout(() => termOut('[*] Key derivation: PBKDF2-SHA512, 100000 iterations', 'output'), 300);
            setTimeout(() => termOut('[*] Cipher: AES-256-GCM, IV: 0xA3F2...8B1C', 'output'), 600);
            setTimeout(() => {
                const decrypted = btoa(Math.random().toString(36).substring(2, 15));
                termOut(`[+] Decrypted payload: ${decrypted}`, 'info');
                termOut(`[+] HMAC verified — integrity check passed`, 'info');
            }, 900);
            break;

        case 'encrypt':
            const plainData = args.join(' ') || 'classified_data';
            termOut(`[*] Encrypting: ${plainData}`, 'system');
            setTimeout(() => termOut('[*] Algorithm: AES-256-GCM', 'output'), 200);
            setTimeout(() => {
                const encrypted = btoa(plainData + Math.random().toString(36).substring(2));
                termOut(`[+] Encrypted: ${encrypted}`, 'info');
                termOut(`[+] Key ID: KEX-${Date.now().toString(36).toUpperCase()}`, 'output');
            }, 500);
            break;

        case 'ping':
            const host = args[0] || '10.0.0.1';
            termOut(`PING ${host}: 56 data bytes`, 'system');
            for (let i = 0; i < 4; i++) {
                setTimeout(() => {
                    const time = (Math.random() * 20 + 0.5).toFixed(3);
                    termOut(`64 bytes from ${host}: icmp_seq=${i} ttl=64 time=${time} ms`, 'output');
                    if (i === 3) {
                        termOut(`--- ${host} ping statistics ---`, 'system');
                        termOut(`4 packets transmitted, 4 received, 0% packet loss`, 'info');
                    }
                }, (i + 1) * 400);
            }
            break;

        case 'nmap':
            const subnet = args[0] || '10.0.0.0/24';
            termOut(`[*] Starting NEXUS-Nmap scan on ${subnet}`, 'system');
            setTimeout(() => termOut('[*] Host discovery: ARP ping sweep', 'output'), 300);
            setTimeout(() => {
                const hosts = Math.floor(Math.random() * 20) + 5;
                termOut(`[+] ${hosts} hosts discovered`, 'info');
                for (let i = 0; i < Math.min(hosts, 6); i++) {
                    const hIp = `10.0.0.${Math.floor(Math.random() * 254) + 1}`;
                    const ports = [22, 80, 443, 3389, 8080].filter(() => Math.random() > 0.4);
                    termOut(`  ${hIp} — Ports: ${ports.length > 0 ? ports.join(', ') : 'filtered'}`, 'output');
                }
                termOut(`[+] Full results: /var/nexus/scans/nmap_${Date.now()}.xml`, 'info');
            }, 1200);
            break;

        case 'whois':
            const domain = args[0] || 'suspicious-domain.xyz';
            termOut(`[*] Querying WHOIS for ${domain}...`, 'system');
            setTimeout(() => {
                termOut(`  Domain: ${domain}`, 'output');
                termOut(`  Registrar: Suspicious Networks LLC`, 'output');
                termOut(`  Created: 2024-0${Math.floor(Math.random() * 9 + 1)}-${Math.floor(Math.random() * 28 + 1)}`, 'output');
                termOut(`  Expires: 2025-0${Math.floor(Math.random() * 9 + 1)}-${Math.floor(Math.random() * 28 + 1)}`, 'output');
                termOut(`  Name Servers: ns1.shadow-dns.net, ns2.shadow-dns.net`, 'output');
                termOut(`  Country: ${['XX', 'XX', 'RU', 'CN', 'KP'][Math.floor(Math.random() * 5)]}`, 'warning');
                termOut(`  [!] FLAG: Domain registered in high-risk jurisdiction`, 'warning');
            }, 800);
            break;

        case 'logs':
            const count = parseInt(args[0]) || 5;
            termOut(`[*] Last ${count} log entries:`, 'system');
            const logTypes = ['INFO', 'WARN', 'ERROR', 'AUDIT', 'ALERT'];
            const logMsgs = [
                'Authentication attempt from 192.168.1.45 — SUCCESS',
                'Rate limit exceeded on API-GW-01 — THROTTLING',
                'SSL certificate validation failed for upstream proxy',
                'Firewall rule #2847 triggered — IP blocked',
                'Honeypot interaction on DECOY-03 — logging attacker tactics',
                'Threat signature updated — 847 new patterns loaded',
                'Anomalous DNS query pattern from endpoint WS-12',
                'Privilege escalation attempt detected — BLOCKED',
            ];
            for (let i = 0; i < count; i++) {
                const type = logTypes[Math.floor(Math.random() * logTypes.length)];
                const msg = logMsgs[Math.floor(Math.random() * logMsgs.length)];
                const color = type === 'ERROR' || type === 'ALERT' ? 'error' : type === 'WARN' ? 'warning' : 'output';
                termOut(`[${type}] ${msg}`, color);
            }
            break;

        case 'firewall':
            const action = args[0] || 'status';
            if (action === 'status') {
                termOut('[*] Firewall Status:', 'system');
                termOut('  PERIMETER: ACTIVE — 4,721 rules loaded', 'output');
                termOut('  INTERNAL:  ACTIVE — 2,340 rules loaded', 'output');
                termOut('  DMZ:       ACTIVE — 1,892 rules loaded', 'output');
                termOut('  CLOUD:     ACTIVE — 3,105 rules loaded', 'output');
                termOut(`  Total blocked: ${STATE.stats.blocked.toLocaleString()} today`, 'info');
            } else if (action === 'flush') {
                termOut('[!] WARNING: Flushing all non-essential firewall rules...', 'warning');
                setTimeout(() => termOut('[+] Stale rules flushed. Essential rules preserved.', 'info'), 500);
            } else if (action === 'lockdown') {
                termOut('[!!!] INITIATING FULL NETWORK LOCKDOWN', 'error');
                setTimeout(() => termOut('[+] All non-essential ports CLOSED', 'warning'), 300);
                setTimeout(() => termOut('[+] Inbound traffic restricted to authenticated sources only', 'warning'), 600);
                setTimeout(() => termOut('[+] Outbound traffic limited to threat intelligence feeds', 'warning'), 900);
                setTimeout(() => termOut('[+] LOCKDOWN ACTIVE — All systems in defensive posture', 'error'), 1200);
            } else {
                termOut(`[?] Unknown firewall action: ${action}. Use: status, flush, lockdown`, 'error');
            }
            break;

        case 'clear':
            document.getElementById('terminal-output').innerHTML = '';
            termOut('[Terminal cleared]', 'system');
            break;

        case 'about':
            termOut('╔═══════════════════════════════════════════╗', 'system');
            termOut('║     NEXUS-7 CYBER OPS COMMAND CENTER      ║', 'system');
            termOut('║     Version 4.2.1 | Build 20241215        ║', 'system');
            termOut('║     Classification: TOP SECRET // ORCON   ║', 'system');
            termOut('║                                           ║', 'system');
            termOut('║     AI Engine: ORACLE Neural Core v3.8    ║', 'system');
            termOut('║     Threat DB: 847,293 signatures         ║', 'system');
            termOut('║     Intel Feeds: 47 active sources        ║', 'system');
            termOut('║     Encryption: AES-256-GCM / TLS 1.3     ║', 'system');
            termOut('║                                           ║', 'system');
            termOut('║     Developed by Nexus Defense Systems     ║', 'system');
            termOut('╚═══════════════════════════════════════════╝', 'system');
            break;

        case 'matrix':
            const color = args[0] || 'green';
            const colorMap = {
                green: { r: 0, g: 255, b: 65 },
                red: { r: 255, g: 0, b: 64 },
                orange: { r: 255, g: 140, b: 0 },
                cyan: { r: 0, g: 229, b: 255 },
                purple: { r: 180, g: 0, b: 255 },
            };
            if (colorMap[color]) {
                STATE.targetColor = colorMap[color];
                animateMatrixColor();
                termOut(`[+] Matrix color changed to ${color.toUpperCase()}`, 'info');
            } else {
                termOut(`[?] Available colors: green, red, orange, cyan, purple`, 'warning');
            }
            break;

        default:
            termOut(`[?] Command not recognized: ${command}`, 'error');
            termOut(`[?] Type 'help' for available commands`, 'output');
            break;
    }
}

// ======================== KEYBOARD SHORTCUTS ========================

document.addEventListener('keydown', (e) => {
    if (!STATE.loggedIn) return;

    // Ctrl+` to focus terminal
    if (e.ctrlKey && e.key === '`') {
        e.preventDefault();
        document.getElementById('terminal-input').focus();
    }

    // Ctrl+/ to focus oracle
    if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        document.getElementById('oracle-input').focus();
    }
});
