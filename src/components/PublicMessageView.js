import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const PublicMessageView = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!username) {
          setError('Lien invalide');
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('username', username.toLowerCase().trim())
          .single();

        if (error) {
          setError(`L'utilisateur "@${username}" n'existe pas`);
          setUser(null);
        } else {
          setUser(data);
          setError(null);
        }
      } catch (error) {
        setError('Erreur de connexion');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [username]);

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!message.trim() || !user) return;

    setIsSending(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('anonymous_messages')
        .insert({
          user_id: user.id,
          message: message.trim()
        });

      if (error) throw error;

      setMessage('');
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        // Reste sur la page pour permettre d'autres messages
      }, 3000);
    } catch (error) {
      setError('Erreur lors de l\'envoi du message');
    } finally {
      setIsSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 text-center max-w-md w-full border border-white/20">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-white text-xl font-bold mb-2">Chargement</h2>
          <p className="text-white/70">Préparation de la messagerie secrète...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 text-center max-w-md w-full border border-white/20">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-white text-2xl font-bold mb-3">Utilisateur introuvable</h2>
          <p className="text-white/80 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 backdrop-blur-sm w-full"
          >
            Créer mon compte SecretStory
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                <span className="text-purple-600 font-bold text-xl">🕵️</span>
              </div>
              <div>
                <h1 className="text-white text-xl font-bold">SecretStory</h1>
                <p className="text-white/60 text-sm">Messages anonymes</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/')}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all duration-200 backdrop-blur-sm text-sm"
            >
              Créer mon compte
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left Column - Formulaire */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl text-white">💌</span>
              </div>
              <h2 className="text-white text-2xl font-bold mb-2">
                Message pour
              </h2>
              <p className="text-purple-300 font-semibold text-xl">@{user.username}</p>
              <p className="text-white/60 mt-2">Envoie un message 100% anonyme</p>
            </div>

            <form onSubmit={sendMessage}>
              <div className="mb-6">
                <label className="block text-white/80 text-sm font-medium mb-3">
                  Ton message secret :
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-4 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent h-40 resize-none backdrop-blur-sm"
                  placeholder="Dis ce que tu penses vraiment... Ton identité restera secrète 🤫"
                  required
                  maxLength={500}
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-white/50 text-xs">
                    🔒 Totalement anonyme
                  </p>
                  <p className="text-white/50 text-xs">
                    {message.length}/500
                  </p>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-500/20 border border-red-400/30 rounded-xl">
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              )}

              {success && (
                <div className="mb-4 p-4 bg-green-500/20 border border-green-400/30 rounded-xl">
                  <p className="text-green-200 text-sm flex items-center justify-center">
                    <span className="text-lg mr-2">✅</span>
                    Message envoyé ! Tu peux en envoyer un autre
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSending || !message.trim()}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-2xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transform hover:scale-105 active:scale-95"
              >
                {isSending ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Envoi en cours...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>🕵️‍♀️</span>
                    <span>Envoyer anonymement</span>
                  </div>
                )}
              </button>
            </form>
          </div>

          {/* Right Column - Informations */}
          <div className="space-y-6">
            {/* Carte Sécurité */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20">
              <div className="flex items-start space-x-4">
                <div className="text-2xl">🔒</div>
                <div>
                  <h3 className="text-white font-semibold mb-2">100% Anonyme</h3>
                  <p className="text-white/70 text-sm">
                    Personne ne saura jamais qui a envoyé ce message. Pas même nous.
                  </p>
                </div>
              </div>
            </div>

            {/* Carte Fonctionnement */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20">
              <div className="flex items-start space-x-4">
                <div className="text-2xl">💡</div>
                <div>
                  <h3 className="text-white font-semibold mb-2">Comment ça marche ?</h3>
                  <ul className="text-white/70 text-sm space-y-2">
                    <li>• Écris ton message</li>
                    <li>• Envoie anonymement</li>
                    <li>• @{user.username} le recevra dans sa boîte</li>
                    <li>• Ton identité reste secrète</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Carte Créer Compte */}
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-3xl p-6 border border-purple-400/30">
              <div className="text-center">
                <h3 className="text-white font-semibold mb-2">Toi aussi, reçois des messages secrets</h3>
                <p className="text-white/70 text-sm mb-4">
                  Crée ton compte en 30 secondes
                </p>
                <button
                  onClick={() => navigate('/')}
                  className="bg-white text-purple-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200 w-full"
                >
                  Créer mon compte gratuit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicMessageView;