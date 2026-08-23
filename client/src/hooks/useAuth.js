import { useState, useEffect } from 'react';
import { api } from '../services/api';

function getStoredUser() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

/**
 * Hook que retorna o usuário atualmente logado (ou null).
 * Lê do localStorage e, se houver token, atualiza os dados via /auth/session
 * (garante nome/whatsapp sempre atualizados após o login).
 */
export function useAuth() {
  const [user, setUser] = useState(getStoredUser);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setUser(null);
      return;
    }

    let active = true;
    api
      .getSession()
      .then(({ user: fresh }) => {
        if (!active) return;
        setUser(fresh);
        localStorage.setItem('user', JSON.stringify(fresh));
      })
      .catch(() => {
        if (!active) return;
        setUser(null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
      });

    return () => {
      active = false;
    };
  }, []);

  return user;
}
