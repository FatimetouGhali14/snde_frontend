import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [matricule, setMatricule] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(matricule, password);
      if (user.role === 'directeur' || user.role === 'admin') {
        navigate('/dashboard');
      } else {
        navigate('/incidents');
      }
    } catch (_) {}
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo" style={{ textAlign: 'center' }}>
          <img src="/logo.jpg" alt="SNDE Logo" style={{ width: 80, height: 80, objectFit: 'contain', marginBottom: 10 }} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
          <h1 style={{ display: 'none' }}>SNDE</h1>
          <p>Societe Nationale d'Eau</p>
          <p style={{ marginTop: 8, fontSize: 12, color: '#A0AEC0' }}>
            Plateforme de Suivi des Incidents
          </p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label>Matricule</label>
            <input
              type="text"
              required
              placeholder="Entrez votre matricule"
              value={matricule}
              onChange={(e) => setMatricule(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 24 }}>
            <label>Mot de passe</label>
            <input
              type="password"
              required
              placeholder="Entrez votre mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: 12 }}
            disabled={loading}
          >
            {loading ? <span className="spinner" /> : 'Se connecter'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: '#A0AEC0' }}>
          Direction de la Production — SNDE Mauritanie
        </p>
      </div>
    </div>
  );
}