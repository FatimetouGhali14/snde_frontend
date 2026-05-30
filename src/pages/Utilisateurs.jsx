import React, { useState, useEffect } from 'react';
import { listUsers, createUser, updateUser, deleteUser } from '../services/api';
import Layout from '../components/Layout';

const ROLES = ['employe', 'chef_brigade', 'directeur', 'admin'];
const ROLE_LABELS = {
  'employe': 'Employe',
  'chef_brigade': 'Chef de Brigade',
  'directeur': 'Directeur',
  'admin': 'Administrateur'
};
const BRIGADES = [
  "Brigade D'Aftout Echergui", "Brigade de Dhar", "Brigade du Nord",
  "Brigade de Boulenoir", "Brigade d'Idini", "Brigade du centre",
  "Brigade de dessalement", "Brigade du Hod Egharbi",
  "Brigade de Kiffa", "Departement Eaux de Surface"
];

export default function Utilisateurs() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalCreer, setModalCreer] = useState(false);
  const [modalModifier, setModalModifier] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const charger = async () => {
    setLoading(true);
    try {
      const res = await listUsers();
      setUsers(res.data);
    } catch (e) {
      setError('Erreur chargement utilisateurs');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSupprimer = async (id, nom) => {
    if (window.confirm(`Voulez-vous vraiment supprimer l'utilisateur "${nom}" ?`)) {
      try {
        await deleteUser(id);
        setSuccess('Utilisateur supprime');
        charger();
        setTimeout(() => setSuccess(''), 3000);
      } catch (e) {
        setError(e.response?.data?.error || 'Erreur suppression');
      }
    }
  };

  useEffect(() => { charger(); }, []);

  return (
    <Layout>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>Utilisateurs</h2>
          <p>{users.length} utilisateur(s) enregistre(s)</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalCreer(true)}>
          + Nouvel utilisateur
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div className="spinner" style={{ width: 36, height: 36, borderColor: '#1F4E79', borderTopColor: 'transparent', margin: '0 auto' }} />
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Matricule</th>
                  <th>Role</th>
                  <th>Brigade</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td style={{ fontWeight: 500 }}>{u.nom}</td>
                    <td style={{ fontSize: 12, color: '#718096' }}>{u.matricule || '-'}</td>
                    <td>
                      <span style={{
                        background: u.role === 'admin' ? '#FEE2E2' : u.role === 'directeur' ? '#DBEAFE' : u.role === 'chef_brigade' ? '#FEF3C7' : '#F3F4F6',
                        color: u.role === 'admin' ? '#991B1B' : u.role === 'directeur' ? '#1E40AF' : u.role === 'chef_brigade' ? '#92400E' : '#374151',
                        padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600
                      }}>
                        {ROLE_LABELS[u.role] || u.role}
                      </span>
                    </td>
                    <td style={{ fontSize: 12 }}>{u.brigade || '-'}</td>
                    <td>
                      <span style={{
                        background: u.actif !== false ? '#D1FAE5' : '#FEE2E2',
                        color: u.actif !== false ? '#065F46' : '#991B1B',
                        padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600
                      }}>
                        {u.actif !== false ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-outline btn-sm" onClick={() => setModalModifier(u)}>
                          Modifier
                        </button>
                        <button className="btn btn-outline btn-sm" 
                          style={{ color: '#E53E3E', borderColor: '#FED7D7' }}
                          onClick={() => handleSupprimer(u._id, u.nom)}>
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalCreer && (
        <ModalCreer
          onClose={() => setModalCreer(false)}
          onSuccess={() => { charger(); setSuccess('Utilisateur cree avec succes !'); setTimeout(() => setSuccess(''), 3000); }}
        />
      )}

      {modalModifier && (
        <ModalModifier
          user={modalModifier}
          onClose={() => setModalModifier(null)}
          onSuccess={() => { charger(); setSuccess('Utilisateur mis a jour !'); setTimeout(() => setSuccess(''), 3000); }}
        />
      )}
    </Layout>
  );
}

function ModalCreer({ onClose, onSuccess }) {
  const [form, setForm] = useState({ nom: '', matricule: '', password: '', role: 'employe', brigade: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!form.nom || !form.matricule || !form.password) {
      setError('Nom, matricule et mot de passe sont obligatoires');
      return;
    }
    setLoading(true);
    try {
      await createUser(form);
      onSuccess();
      onClose();
    } catch (e) {
      setError(e.response?.data?.error || 'Erreur creation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Nouvel utilisateur</h3>
          <button className="close-btn" onClick={onClose}>x</button>
        </div>
        {error && <div className="alert alert-error" style={{ marginBottom: 12 }}>{error}</div>}
        <div className="form-grid">
          <div className="form-group full">
            <label>Nom complet *</label>
            <input type="text" value={form.nom}
              onChange={e => setForm(p => ({ ...p, nom: e.target.value }))}
              placeholder="Ex: Mohamed Ahmed" />
          </div>
          <div className="form-group full">
            <label>Matricule *</label>
            <input type="text" value={form.matricule}
              onChange={e => setForm(p => ({ ...p, matricule: e.target.value }))}
              placeholder="Ex: SNDE-001" />
          </div>
          <div className="form-group full">
            <label>Mot de passe *</label>
            <input type="password" value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              placeholder="Minimum 6 caracteres" />
          </div>
          <div className="form-group">
            <label>Role *</label>
            <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
              {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Brigade</label>
            <select value={form.brigade} onChange={e => setForm(p => ({ ...p, brigade: e.target.value }))}>
              <option value="">-- Aucune --</option>
              {BRIGADES.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'flex-end' }}>
          <button className="btn btn-outline" onClick={onClose}>Annuler</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? <span className="spinner" /> : 'Creer'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalModifier({ user, onClose, onSuccess }) {
  const [form, setForm] = useState({
    role: user.role || 'employe',
    brigade: user.brigade || '',
    actif: user.actif !== false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await updateUser(user._id, { role: form.role, brigade: form.brigade, actif: form.actif });
      onSuccess();
      onClose();
    } catch (e) {
      setError(e.response?.data?.error || 'Erreur mise a jour');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Modifier — {user.nom}</h3>
          <button className="close-btn" onClick={onClose}>x</button>
        </div>
        <div style={{ background: '#F7FAFC', padding: '8px 12px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
          <strong>{user.nom}</strong> — Matricule : <strong>{user.matricule || '-'}</strong>
        </div>
        {error && <div className="alert alert-error" style={{ marginBottom: 12 }}>{error}</div>}
        <div className="form-grid">
          <div className="form-group">
            <label>Role</label>
            <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
              {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Statut</label>
            <select value={form.actif ? 'actif' : 'inactif'}
              onChange={e => setForm(p => ({ ...p, actif: e.target.value === 'actif' }))}>
              <option value="actif">Actif</option>
              <option value="inactif">Inactif</option>
            </select>
          </div>
          <div className="form-group full">
            <label>Brigade</label>
            <select value={form.brigade} onChange={e => setForm(p => ({ ...p, brigade: e.target.value }))}>
              <option value="">-- Aucune --</option>
              {BRIGADES.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'flex-end' }}>
          <button className="btn btn-outline" onClick={onClose}>Annuler</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? <span className="spinner" /> : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
}