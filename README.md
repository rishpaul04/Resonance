Here is the updated README.md with the project officially titled Resonance.

🔊 Resonance - Audio Visualization Interface
Resonance is a high-performance, interactive circular audio visualizer built with Vanilla JavaScript and the HTML5 Web Audio API.

This project demonstrates advanced frontend engineering concepts, including real-time media stream processing, complex canvas rendering, and physics-based animation loops.

<img width="1919" height="898" alt="image" src="https://github.com/user-attachments/assets/6ef2d8bb-3add-4f57-ba60-71f5988b248d" />
<img width="1919" height="913" alt="image" src="https://github.com/user-attachments/assets/696b8cbc-cee4-48a9-a7c0-e5d4e6056295" />




🔗 Live Demo
https://resonancee.netlify.app/

✨ Key Features
🎙️ Live Audio Analysis: Captures real-time audio via the MediaStream API (Microphone) with zero latency.

📂 Drag & Drop Support: Supports interactive file playback; simply drag any audio file (MP3, WAV, etc.) onto the interface.

💿 Circular Rendering Engine: Maps linear frequency data to a polar coordinate system for a symmetrical, circular display.

🖱️ 3D Parallax UI: The interface features a depth effect that tilts and shifts based on mouse position.

✨ Particle Physics: A custom particle system reacts dynamically to bass frequencies (low-end thumping).

⚡ 60 FPS Performance: Optimized rendering loop using requestAnimationFrame for buttery smooth visuals.

🛠️ Technical Implementation
1. The Audio Pipeline
The core logic relies on the Web Audio API's AnalyserNode.

Source: Audio is routed from navigator.mediaDevices.getUserMedia (Mic) or createMediaElementSource (File).

FFT Analysis: The AnalyserNode performs a Fast Fourier Transform to provide frequency data (0-255) for the visual spectrum.

2. The Math (Polar Coordinates)
To create the circular structure, Cartesian coordinates (x,y) are calculated from the audio data index using trigonometry:

x=centerx+cos(θ)×(radius+amplitude)
y=centery+sin(θ)×(radius+amplitude)
3. Beat Detection Algorithm
Instead of a static animation, Resonance pulses to the beat. This is achieved by calculating the average volume of the lowest 20 frequency bins (Sub-bass/Bass) and mapping that value to the circle's radius and particle speed.

📦 Project Structure
Plaintext

resonance/
│
├── index.html      
├── style.css       
└── script.js       


🚀 How to Run Locally
⚠️ Important: Because this project uses the Microphone and File APIs, modern browsers require it to be served via HTTPS or localhost. It will not work if you simply double-click index.html.

Clone the repository:

Bash

git clone https://github.com/rishpaul04/resonance.git
cd resonance
Start a local server (Choose one method):

VS Code (Recommended): Right-click index.html and select "Open with Live Server".

Python:

Bash

python -m http.server
Open http://localhost:8000
Node.js:

Bash

npx serve
Open http://localhost:3000
📄 License
This project is open source and available under the MIT License.
