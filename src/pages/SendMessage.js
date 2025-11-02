import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const SendMessage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Debug initial
  useEffect(() => {
    console.log('🔧 DEBUG SendMessage Component:');
    console.log('📍 URL:', window.location.href);
    console.log('👤 Username param:', username);
    console.log('🌐 Environment:', process.env.NODE_ENV);
    console.log('🔑 Supabase URL present:', !!process.env.REACT_APP_SUPABASE_URL);
    console.log('🔑 Supabase Key present:', !!process.env.REACT_APP_SUPABASE_ANON_KEY);
  }, [username]);

  const fetchUser = useCallback(async () => {
    try {
      console.log('🔍 Début recherche utilisateur:', username);
      
      if (!username || username.trim() === '') {
        setError('Nom d\'utilisateur invalide');
        setLoading(false);
        return;
      }

      const cleanUsername = username.toLowerCase().trim();
      console.log('👤 Username nettoyé:', cleanUsername);

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', cleanUsername)
        .single();

      console.log('📦 Résultat Supabase:', { data, error });

      if (error) {
        console.error('❌ Erreur Supabase détaillée:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        
        if (error.code === 'PGRST116') {
          setError(`L'utilisateur "@${username}" n'existe pas.`);
        } else {
          setError('Problème de connexion. Réessayez.');
        }
        setUser(null);
      } else if (data) {
        console.log('✅ Utilisateur trouvé:', data);
        setUser(data);
        setError(null);
      } else {
        setError('Utilisateur non trouvé');
        setUser(null);
      }
    } catch (error) {
      console.error('💥 Erreur fatale fetchUser:', error);
      setError('Erreur inattendue. Réessayez.');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!message.trim() || !user) return;

    setIsSending(true);
    setError(null);

    try {
      console.log('📤 Début envoi message pour user:', user.id);
      
      const { data, error } = await supabase
        .from('anonymous_messages')
        .insert({
          user_id: user.id,
          message: message.trim()
        })
        .select();

      console.log('📨 Résultat insertion:', { data, error });

      if (error) {
        console.error('❌ Erreur insertion:', error);
        throw error;
      }

      setMessage('');
      alert('✅ Message envoyé anonymement !');
      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      console.error('💥 Erreur envoi:', error);
      setError('Erreur lors de l\'envoi. Réessayez.');
    } finally {
      setIsSending(false);
    }
  };

  // Écran de chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Recherche de</h2>
          <p className="text-purple-600 font-bold text-xl">@{username}</p>
          <p className="text-gray-500 text-sm mt-2">Vérification en cours...</p>
        </div>
      </div>
    );
  }

  // Écran d'erreur
  if (error || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Utilisateur introuvable</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500">
              L'utilisateur doit d'abord créer un compte sur SecretStory pour recevoir des messages.
            </p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors w-full font-semibold"
          >
            Créer mon compte
          </button>
        </div>
      </div>
    );
  }

  // Formulaire d'envoi
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center py-8 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full">
        {/* En-tête */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl text-white">🕵️</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">
            Message secret
          </h1>
          <p className="text-gray-600">pour</p>
          <p className="text-purple-600 font-bold text-xl mt-1">@{user.username}</p>
        </div>

        {/* Formulaire */}
        <form onSubmit={sendMessage}>
          <div className="mb-6">
            <label className="block text-gray-700 mb-3 font-semibold">
              Ton message anonyme :
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent h-32 resize-none text-gray-800 placeholder-gray-400"
              placeholder="Dis ce que tu penses vraiment... 😉"
              required
              maxLength={500}
            />
            <p className="text-xs text-gray-500 text-right mt-2">
              {message.length}/500 caractères
            </p>
          </div>

          {/* Erreur */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Bouton d'envoi */}
          <button
            type="submit"
            disabled={isSending || !message.trim()}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transform hover:scale-105 duration-200"
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

        {/* Information de confidentialité */}
        <div className="mt-6 p-4 bg-purple-50 rounded-xl border border-purple-100">
          <div className="flex items-center justify-center space-x-2 text-purple-800">
            <span className="text-lg">🔒</span>
            <div>
              <p className="text-sm font-semibold">100% anonyme</p>
              <p className="text-xs opacity-75">Personne ne saura qui a envoyé ce message</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendMessage;