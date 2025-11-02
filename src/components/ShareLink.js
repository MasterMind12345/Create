import React, { useState } from 'react';

const ShareLink = ({ user }) => {
  // NOUVEAU FORMAT : /to/username au lieu de /send/username
  const shareUrl = `${window.location.origin}/#/to/${user.username}`;
  const [copied, setCopied] = useState(false);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnSocialMedia = (platform) => {
    const text = `Envoie-moi un message anonyme sur SecretStory ! 🕵️‍♀️`;
    
    const urls = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + shareUrl)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text + ' ' + shareUrl)}`,
    };
    
    window.open(urls[platform], '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          Partage ton lien
        </h2>
        <p className="text-white/70">
          Partage ce lien pour recevoir des messages anonymes
        </p>
      </div>

      {/* Lien partageable */}
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
        <label className="block text-white/70 text-sm font-medium mb-3">
          Ton lien SecretStory :
        </label>
        <div className="flex space-x-3">
          <input
            type="text"
            value={shareUrl}
            readOnly
            className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
          />
          <button
            onClick={copyToClipboard}
            className="bg-white text-purple-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200 flex items-center space-x-2 min-w-0"
          >
            {copied ? '✅ Copié!' : '📋 Copier'}
          </button>
        </div>
      </div>

      {/* Partage rapide */}
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
        <h3 className="text-white font-semibold mb-4">Partager rapidement</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { platform: 'whatsapp', name: 'WhatsApp', color: 'bg-green-500 hover:bg-green-600', icon: '📱' },
            { platform: 'telegram', name: 'Telegram', color: 'bg-blue-500 hover:bg-blue-600', icon: '✈️' },
            { platform: 'twitter', name: 'Twitter', color: 'bg-sky-500 hover:bg-sky-600', icon: '🐦' },
            { platform: 'copy', name: 'Copier', color: 'bg-purple-500 hover:bg-purple-600', icon: '📋', action: copyToClipboard },
          ].map(({ platform, name, color, icon, action }) => (
            <button
              key={platform}
              onClick={() => action ? action() : shareOnSocialMedia(platform)}
              className={`${color} text-white py-3 rounded-xl font-medium transition-all duration-200 flex flex-col items-center space-y-1`}
            >
              <span className="text-lg">{icon}</span>
              <span className="text-xs">{name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Aperçu du lien */}
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-2xl p-6 border border-purple-400/30">
        <div className="text-center">
          <h4 className="text-white font-semibold mb-3">✨ Nouveau lien optimisé</h4>
          <div className="bg-black/30 rounded-lg p-4 mb-4">
            <p className="text-white/80 text-sm font-mono break-all">
              {shareUrl}
            </p>
          </div>
          <p className="text-white/60 text-sm">
            Lien intégré à l'application - Plus d'erreurs 404 !
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShareLink;