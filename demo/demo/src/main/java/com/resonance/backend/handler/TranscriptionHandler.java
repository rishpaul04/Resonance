package com.resonance.backend.handler;

import com.resonance.backend.service.GeminiService;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.socket.WebSocketHandler;
import org.springframework.web.reactive.socket.WebSocketMessage;
import org.springframework.web.reactive.socket.WebSocketSession;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Component
public class TranscriptionHandler implements WebSocketHandler {

    private final GeminiService geminiService;

    public TranscriptionHandler(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    @Override
    public Mono<Void> handle(WebSocketSession session) {
        // Log connection
        System.out.println("New Client Connected: " + session.getId());

        // 1. Capture the incoming stream of messages
        Flux<WebSocketMessage> input = session.receive();

        // 2. Process the stream
        Flux<String> transcriptionStream = input
            // Filter: We only care about Binary messages (Audio data)
            .filter(message -> message.getType() == WebSocketMessage.Type.BINARY)
            
            // Transform: Handle each message concurrently
            .flatMap(message -> {
                // Extract bytes from the DataBuffer
                // FIX: Use .read() instead of .readBytes()
                byte[] audioBytes = new byte[message.getPayload().readableByteCount()];
                message.getPayload().read(audioBytes); 

                // Send to Gemini Service
                return geminiService.transcribe(audioBytes)
                        .onErrorResume(e -> {
                            System.err.println("Error processing chunk: " + e.getMessage());
                            return Flux.just("[Error]");
                        });
            });

        // 3. Send the output stream back to the client as Text
        return session.send(
            transcriptionStream.map(text -> session.textMessage(text))
        );
    }
}