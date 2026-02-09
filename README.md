# 🧠 TriviaGenius AI Host

Welcome to **TriviaGenius AI**, a high-stakes, personality-driven trivia experience where the host isn't just a script—it's a living, breathing (simulated) entity that reacts to your every win and fail.

<img width="1252" height="679" alt="image" src="https://github.com/user-attachments/assets/8919d6e4-8e2a-4670-a87f-9877c5155a42" />
<img width="1252" height="679" alt="image" src="https://github.com/user-attachments/assets/8919d6e4-8e2a-4670-a87f-9877c5155a42" />


## 🎭 Game Features
- **Dynamic AI Personalities**: Choose from Snarky, Cozy, Dramatic, Hype, Nerdy, or Mysterious hosts. Each one uses the Gemini API to generate unique commentary based on your performance.
- **AI-Generated Trivia**: Questions are dynamically generated across various categories like Internet Culture, Obscure Science, and Video Game History.
- **In-Game Context Menu**: Right-click anywhere to access the game-specific menu. Change your host, skip questions, or get a hint without leaving the flow.
- **Custom Interaction System**: A reactive custom cursor and animated host avatar that changes expressions based on the AI's "mood."
- **High Stakes HUD**: Track your score, streaks, and time with a sleek, neon-arcade inspired interface.

## ⚠️ Known Issues & Limitations
- **Voice Playback**: The AI voice synthesis is currently experimental. Due to the nature of the buffer-based playback, **voice lines cannot be stopped mid-speech** even if the question is skipped or the game is reset. If the host becomes too talkative, you may need to mute the browser tab manually.
- **Hints**: The "Hint" feature in the right-click menu provides a basic clue (usually the first letter). It works "good enough" for now but may occasionally be cryptic depending on the AI's mood.
- **Browser Compatibility**: The custom cursor is disabled on touch devices to ensure mobile playability.

## 🛠️ Technology
- **Engine**: React 19 + Tailwind CSS.
- **Intelligence**: Google Gemini (gemini-3-flash-preview) for logic and personality.
- **Speech**: Gemini TTS (gemini-2.5-flash-preview-tts).
- **Icons**: Lucide React.

Enjoy the challenge, and try not to let the Snarky host get under your skin!
