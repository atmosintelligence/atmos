'use client';

import { useEffect, useState } from 'react';
import Icon from './Icon';

export default function InstallButton() {
  const [prompt, setPrompt] = useState(null);

  useEffect(() => {
    const onPrompt = e => { e.preventDefault(); setPrompt(e); };
    const onInstalled = () => setPrompt(null);
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  async function install() {
    prompt.prompt();
    await prompt.userChoice;
    setPrompt(null);
  }

  if (!prompt) return null;

  return (
    <button type="button" onClick={install} className="inline-flex items-center gap-1.5 text-[#a3a3a3] hover:text-white transition-colors cursor-pointer">
      <Icon name="download" size={14} /> Install app
    </button>
  );
}
