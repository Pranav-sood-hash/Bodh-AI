import React, { createContext, useContext, useState, useEffect } from 'react';

interface SettingsState {
  selectedVoice: string;
  pitch: number;
  speed: number;
  selectedLanguage: string;
  accent: string;
  groqApiKey: string;
}

interface SettingsContextType {
  settings: SettingsState;
  setVoice: (voice: string) => void;
  setPitch: (pitch: number) => void;
  setSpeed: (speed: number) => void;
  setLanguage: (lang: string) => void;
  setAccent: (accent: string) => void;
  setApiKey: (key: string) => void;
}

const defaultSettings: SettingsState = {
  selectedVoice: 'Atlas',
  pitch: 1.0,
  speed: 1.0,
  selectedLanguage: 'Hindi',
  accent: 'Neutral',
  groqApiKey: '',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SettingsState>(() => {
    const saved = localStorage.getItem('bodhaiSettings');
    const savedApiKey = localStorage.getItem('groqApiKey') || '';
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...defaultSettings, ...parsed, groqApiKey: savedApiKey };
      } catch (e) {
        return { ...defaultSettings, groqApiKey: savedApiKey };
      }
    }
    return { ...defaultSettings, groqApiKey: savedApiKey };
  });

  useEffect(() => {
    const { groqApiKey, ...rest } = settings;
    localStorage.setItem('bodhaiSettings', JSON.stringify(rest));
    localStorage.setItem('groqApiKey', groqApiKey);
  }, [settings]);

  const setVoice = (selectedVoice: string) => setSettings((s) => ({ ...s, selectedVoice }));
  const setPitch = (pitch: number) => setSettings((s) => ({ ...s, pitch }));
  const setSpeed = (speed: number) => setSettings((s) => ({ ...s, speed }));
  const setLanguage = (selectedLanguage: string) => setSettings((s) => ({ ...s, selectedLanguage }));
  const setAccent = (accent: string) => setSettings((s) => ({ ...s, accent }));
  const setApiKey = (groqApiKey: string) => setSettings((s) => ({ ...s, groqApiKey }));

  return (
    <SettingsContext.Provider
      value={{
        settings,
        setVoice,
        setPitch,
        setSpeed,
        setLanguage,
        setAccent,
        setApiKey,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
