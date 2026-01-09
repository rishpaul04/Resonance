# Resonance: Real-Time Audio Visualizer & Transcription

**Resonance** is a full-stack web application that combines real-time audio visualization with AI-powered speech-to-text transcription. It captures microphone input, visualizes it using a circular frequency equalizer, and streams the audio data to a Spring Boot backend, which processes it using Google's Gemini Pro AI model.

🔴 **Live Site:** []  
*(If running locally: http://localhost:8080/index.html)*

## 🚀 Features

* **Interactive UI:** A circular audio equalizer built with the Web Audio API and HTML5 Canvas.
* **Real-Time Visualization:** Dynamic particle effects and frequency bars that react to audio input.
* **Live Streaming:** Streams raw audio data from the browser to the server via WebSockets.
* **AI Transcription:** Integrates with **Google Gemini Pro** to transcribe speech into text in real-time.
* **Reactive Backend:** Built with Spring Boot WebFlux for non-blocking, high-performance data handling.

## 🛠️ Tech Stack

* **Frontend:** HTML5, CSS3, Vanilla JavaScript, Web Audio API.
* **Backend:** Java 17, Spring Boot (WebFlux, WebSocket).
* **AI Service:** Google Gemini API (gemini-pro).
* **Build Tool:** Maven.

## 📋 Prerequisites

Before running the application, ensure you have the following installed:
* **Java 17** or higher.
* **Maven** (optional, as the wrapper `mvnw` is included).
* A **Google Gemini API Key** (from Google AI Studio).

## ⚙️ Setup & Installation

1.  **Clone the Repository**
    ```bash
    git clone [https://github.com/rishitapaul/resonance-audio-transcription.git](https://github.com/rishitapaul/resonance-audio-transcription.git)
    cd resonance-audio-transcription
    ```

2.  **Configure API Key**
    * Open `src/main/resources/application.properties`.
    * Add your Google Gemini API key:
        ```properties
        gemini.api.key=YOUR_ACTUAL_API_KEY_HERE
        ```
    * *Note: If pushing to a public repository, do not commit your real API key.*

3.  **Build and Run**
    Open a terminal in the project root and run:
    ```bash
    # Windows
    ./mvnw spring-boot:run

    # Mac/Linux
    ./mvnw spring-boot:run
    ```

4.  **Access the Application**
    * Once the terminal says `Started BackendApplication`, open your browser.
    * Go to: **http://localhost:8080/index.html**

## 🎤 How to Use

1.  Open the web interface in your browser.
2.  Click the **"Use Microphone"** button in the center.
3.  Allow microphone permissions when prompted.
4.  Speak clearly into your microphone.
5.  Watch the visualizer react to your voice and see the transcription appear at the bottom of the screen in real-time.

## 📂 Project Structure

```text
├── src
│   ├── main
│   │   ├── java/com/resonance/backend  # Backend Source Code
│   │   └── resources
│   │       ├── static                  # Frontend (HTML, CSS, JS)
│   │       └── application.properties  # Config
├── pom.xml                             # Maven Dependencies
└── README.md                           # Documentation
