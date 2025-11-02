import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const ShareView = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Récupérer le username depuis l'URL : /share?to=username
  const username = searchParams.get('to');

  const fetchUser = useCallback(async () => {
    try {
      console.log('🔍 Recherche utilisateur via ShareView:', username);
      
      if (!username || username.trim() === '') {
        setError('Nom d\'utilisateur manquant');
        setLoading(false);
        return;
      }

      const cleanUsername = username.toLowerCase().trim();
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', cleanUsername)
        .single();

      if (error) {
        console.error('❌ Erreur recherche utilisateur:', error);
        if (error.code === 'PGRST116') {
          setError(`L'utilisateur "@${username}" n'existe pas encore.`);
        } else {
          setError('Erreur de connexion. Réessayez.');
        }
        setUser(null);
      } else {
        setUser(data);
        setError(null);
      }
    } catch (error) {
      console.error('❌ Erreur fetchUser:', error);
      setError('Erreur lors de la recherche');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    if (username) {
      fetchUser();
    } else {
      setError('Lien invalide : aucun utilisateur spécifié');
      setLoading(false);
    }
  }, [username, fetchUser]);

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
      alert('✅ Message envoyé anonymement !');
      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      console.error('❌ Erreur envoi:', error);
      setError('Erreur lors de l\'envoi du message');
    } finally {
      setIsSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
          <p className="text-purple-600 font-semibold mt-2">@{username}</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Utilisateur non trouvé</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors w-full"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center py-8 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full">
        <div className="text-center mb-2">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl text-white">🕵️</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            Message secret pour
          </h1>
          <p className="text-purple-600 font-semibold text-xl">@{user.username}</p>
        </div>

        <form onSubmit={sendMessage}>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2 font-medium">
              Ton message anonyme :
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent h-32 resize-none"
              placeholder="Écris ton message secret ici..."
              required
              maxLength={500}
            />
            <p className="text-xs text-gray-500 text-right mt-1">
              {message.length}/500 caractères
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSending || !message.trim()}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {isSending ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Envoi en cours...</span>
              </div>
            ) : (
              '🕵️‍♀️ Envoyer anonymement'
            )}
          </button>
        </form>

        <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-100">
          <div className="flex items-center justify-center space-x-2 text-purple-800">
            <span>🔒</span>
            <p className="text-sm font-medium">Ton identité restera totalement secrète</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareView;