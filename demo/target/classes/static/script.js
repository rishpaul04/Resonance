const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('overlay');
const statusText = document.getElementById('statusText');
const hud = document.getElementById('hud');
const fileInput = document.getElementById('fileInput');
const transcriptionText = document.getElementById('transcriptionText');

let audioCtx, analyser, source;
let dataArray;
let particles = [];
let audioFileElement; 
let isMic = false;
let mouse = { x: 0, y: 0 };
let animationId;

// Variables for Backend Connection
let socket;
let mediaRecorder;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

window.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
});

// --- MICROPHONE BUTTON LISTENER ---
document.getElementById('micBtn').addEventListener('click', async () => {
    try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        setupAudioNodes(stream, 'mic');
        startVisualizer("Microphone Input Active");

        // Start Transcription (Send to Backend)
        connectTranscription(stream); 

    } catch (err) {
        console.error(err);
        alert("Microphone access denied or error starting audio.");
    }
});

document.getElementById('fileBtn').addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
    if (e.target.files[0]) handleFile(e.target.files[0]);
});

window.addEventListener('dragover', (e) => {
    e.preventDefault();
    overlay.classList.add('drag-active');
});
window.addEventListener('dragleave', () => overlay.classList.remove('drag-active'));
window.addEventListener('drop', (e) => {
    e.preventDefault();
    overlay.classList.remove('drag-active');
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
});

document.getElementById('resetBtn').addEventListener('click', () => location.reload());

function handleFile(file) {
    if (audioFileElement) audioFileElement.pause();
    
    audioFileElement = new Audio();
    audioFileElement.src = URL.createObjectURL(file);
    audioFileElement.play();

    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    setupAudioNodes(audioFileElement, 'file');
    startVisualizer(`Playing: ${file.name.substring(0, 20)}...`);
}

function setupAudioNodes(input, type) {
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 512; 
    
    if (type === 'mic') {
        source = audioCtx.createMediaStreamSource(input);
        isMic = true;
    } else {
        source = audioCtx.createMediaElementSource(input);
        source.connect(audioCtx.destination); 
        isMic = false;
    }
    
    source.connect(analyser);
    dataArray = new Uint8Array(analyser.frequencyBinCount);
}

function startVisualizer(statusMsg) {
    overlay.classList.add('hidden');
    hud.classList.add('visible');
    statusText.innerText = statusMsg;
    initParticles();
    animate();
}

// --- UPDATED BACKEND CONNECTION LOGIC ---
function connectTranscription(stream) {
    // 1. Dynamic Protocol Detection (ws for http, wss for https)
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    
    // 2. Connect to the SAME host/port serving the page
    const wsUrl = `${protocol}//${window.location.host}/transcribe`;
    
    console.log("Connecting to WebSocket:", wsUrl);
    socket = new WebSocket(wsUrl);

    socket.onopen = () => {
        console.log("Connected to Transcription Server");
        if (transcriptionText) transcriptionText.innerText = "Listening...";
        
        // Initialize MediaRecorder 
        // IMPORTANT: Backend GeminiService must match this mimeType ("audio/webm")
        mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0 && socket.readyState === WebSocket.OPEN) {
                socket.send(event.data);
            }
        };

        // Send audio chunks every 500ms
        mediaRecorder.start(500); 
    };

    socket.onmessage = (event) => {
        console.log("Transcription:", event.data);
        if (transcriptionText) {
            transcriptionText.innerText = event.data;
        }
    };

    socket.onerror = (error) => {
        console.error("WebSocket Error:", error);
        if (transcriptionText) transcriptionText.innerText = "Connection Error";
    };
    
    socket.onclose = () => {
        console.log("Connection Closed");
    };
}

class Particle {
    constructor() {
        this.reset();
    }
    reset() {
        this.angle = Math.random() * Math.PI * 2;
        this.radius = Math.random() * 300 + 100; 
        this.speed = Math.random() * 0.02 + 0.005;
        this.size = Math.random() * 2 + 0.5;
        this.color = `hsl(${Math.random() * 60 + 180}, 100%, 50%)`; 
    }
    update(bass) {
        this.angle += this.speed + (bass / 10000);
        this.radius -= 0.5; 
        if (this.radius < 50) this.reset(); 
    }
    draw(ctx, cx, cy) {
        const x = cx + Math.cos(this.angle) * this.radius;
        const y = cy + Math.sin(this.angle) * this.radius;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(x, y, this.size, 0, Math.PI*2);
        ctx.fill();
    }
}

function initParticles() {
    particles = [];
    for(let i=0; i<150; i++) particles.push(new Particle());
}

function animate() {
    animationId = requestAnimationFrame(animate);
    analyser.getByteFrequencyData(dataArray);

    ctx.fillStyle = 'rgba(5, 5, 5, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    let bass = 0;
    for (let i = 0; i < 20; i++) bass += dataArray[i];
    bass = bass / 20; 
    
    const shiftX = cx + (mouse.x * 30);
    const shiftY = cy + (mouse.y * 30);
    
    particles.forEach(p => {
        p.update(bass);
        p.draw(ctx, shiftX, shiftY);
    });

    const radius = 100 + (bass * 0.5); 
    const bars = 100;
    const step = (Math.PI * 2) / bars;

    ctx.lineWidth = 3;
    
    for (let i = 0; i < bars; i++) {
        const dataIndex = Math.floor((i / bars) * 100); 
        const value = dataArray[dataIndex];
        const barLen = (value / 255) * 150;

        const angle = i * step;
        const hue = 180 + (value / 255) * 120; 
        ctx.strokeStyle = `hsl(${hue}, 100%, 50%)`;
        ctx.shadowBlur = 15;
        ctx.shadowColor = `hsl(${hue}, 100%, 50%)`;
        
        const x1 = shiftX + Math.cos(angle) * radius;
        const y1 = shiftY + Math.sin(angle) * radius;
        
        const x2 = shiftX + Math.cos(angle) * (radius + barLen);
        const y2 = shiftY + Math.sin(angle) * (radius + barLen);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(shiftX, shiftY, radius - 10, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0, 243, 255, ${bass/500})`; 
    ctx.fill();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1;
    ctx.stroke();
}