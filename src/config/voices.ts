export const VOICES = {
  // ElevenLabs voices
  elevenlabs: {
    aria: {
      id: 'EXAVITQu4vr4xnSDxMaL',
      name: 'Aria',
      description: 'Soft & Academic',
      gender: 'female',
      accent: 'American',
      preview: 'Hi, I am Aria your BodhAI learning assistant.'
    },
    atlas: {
      id: 'VR6AewLTigWG4xSOukaG',
      name: 'Atlas',
      description: 'Deep & Authoritative',
      gender: 'male',
      accent: 'American',
      preview: 'Hello, I am Atlas. Let us explore this together.'
    },
    priya: {
      id: 'XB0fDUnXU5powFXDhCwa',
      name: 'Priya',
      description: 'Warm & Encouraging',
      gender: 'female',
      accent: 'Indian',
      preview: 'Namaste! I am Priya, ready to help you learn.'
    },
    rohan: {
      id: 'onwK4e9ZLuTAKqWW03F9',
      name: 'Rohan',
      description: 'Clear & Energetic',
      gender: 'male',
      accent: 'Indian',
      preview: 'Hi there! I am Rohan. Let us get started!'
    },
    nova: {
      id: 'pFZP5JQG7iQjIQuC4Bku',
      name: 'Nova',
      description: 'Precise & Analytical',
      gender: 'neutral',
      accent: 'Global',
      preview: 'Greetings. I am Nova. Processing your request.'
    },
    luna: {
      id: 'jsCqWAovK2LkecY7zXl4',
      name: 'Luna',
      description: 'Calm & Soothing',
      gender: 'female',
      accent: 'British',
      preview: 'Hello there. I am Luna. Shall we begin?'
    }
  },

  // Web Speech API fallback voices
  // (built-in browser, no API key needed)
  webSpeech: {
    defaultFemale: {
      name: 'System Female',
      description: 'Browser built-in female',
      gender: 'female',
      voiceURI: 'Google US English Female'
    },
    defaultMale: {
      name: 'System Male',
      description: 'Browser built-in male',
      gender: 'male',
      voiceURI: 'Google US English Male'
    }
  }
};
