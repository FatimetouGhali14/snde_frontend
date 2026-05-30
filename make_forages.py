# -*- coding: utf-8 -*-
code = """import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });
API.interceptors.request.use(cfg => {
  const t = localStorage.getItem('token');
  if (t) cfg.headers.Authorization = 'Bearer ' + t;
  return cfg;
});

const COULEUR_MAP = {
  rouge:  { bg: '#FEE2E2', text: '#991B1B', label: 'Incident majeur' },
  orange: { bg: '#FEF3C7', text: '#92400E', label: 'En attente' },
  vert:   { bg: '#D1FAE5', text: '#065F46', label: 'Operationnel' },
};

export default function Forages() {
  const [sites, setSites] = useState([]);
  const [forages, setForages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vue, setVue] = useState('liste');
  const [filtreBrigade, setFiltreBrigade] = useState('');
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([API.get('/forages/carte'), API.get('/forages')])
      .then(([carte, liste]) => {
        setSites(carte.data);
        setForages(liste.data);
      })
      .catch(e => setError('Erreur: ' + (e.response?.data?.error || e.message)))
      .finally(() => setLoading(false));
  }, []);

  const brigades = [...new Set(forages.map(f => f.brigade).filter(Boolean))];
  const foragesFiltres = filtreBrigade ? forages.filter(f => f.brigade === filtreBrigade) : forages;

  return (
    <Layout>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>Forages et Sites</h2>
          <p>{forages.length} forages - {sites.length} sites couverts</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className={'btn ' + (vue === 'liste' ? 'btn-primary' : 'btn-outline')} onClick={() => setVue('liste')}>Liste</button>
          <button className={'btn ' + (vue === 'carte' ? 'btn-primary' : 'btn-outline')} onClick={() => setVue('carte')}>Carte</button>
        </div>
      </div>

      <div className="filters-bar">
        <select value={filtreBrigade} onChange={e => setFiltreBrigade(e.target.value)}>
          <option value="">Toutes les brigades</option>
          {brigades.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div className="spinner" style={{ width: 36, height: 36, borderColor: '#1F4E79', borderTopColor: 'transparent', margin: '0 auto' }} />
        </div>
      ) : vue === 'carte' ? (
        <CarteForages sites={sites} onSelect={setSelected} />
      ) : (
        <ListeForages forages={foragesFiltres} onSelect={setSelected} />
      )}

      {selected && <DetailForage forage={selected} onClose={() => setSelected(null)} />}
    </Layout>
  );
}

function CarteForages({ sites, onSelect }) {
  if (!sites.length) return <div className="empty-state"><p>Aucun site disponible</p></div>;
  return (
    <div className="card">
      <div className="card-title">Sites SNDE - Mauritanie</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
        {sites.map((site, i) => {
          const c = COULEUR_MAP[site.couleur] || COULEUR_MAP.vert;
          return (
            <div key={i} style={{ background: c.bg, border: '1.5px solid ' + c.text, borderRadius: 10, padding: '10px 14px', cursor: 'pointer' }} onClick={() => onSelect(site)}>
              <div style={{ fontWeight: 600, fontSize: 13, color: c.text }}>{site.site}</div>
              <div style={{ fontSize: 11, color: c.text, opacity: 0.8, marginBottom: 6 }}>{site.brigade}</div>
              <div style={{ display: 'flex', gap: 8, fontSize: 11 }}>
                <span>{site.total_incidents} incidents</span>
                {site.en_attente > 0 && <span>{site.en_attente} en attente</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ListeForages({ forages, onSelect }) {
  if (!forages.length) return <div className="empty-state"><div className="icon">X</div><p>Aucun forage trouve</p></div>;
  return (
    <div className="card">
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Forage</th><th>Site</th><th>Brigade</th><th>Statut</th><th>Incidents</th><th>En attente</th><th>Action</th></tr>
          </thead>
          <tbody>
            {forages.map(f => (
              <tr key={f._id}>
                <td style={{ fontWeight: 500 }}>{f.nom}</td>
                <td>{f.site}</td>
                <td style={{ fontSize: 12, color: '#718096' }}>{f.brigade}</td>
                <td>
                  <span style={{ background: f.statut === 'En service' ? '#D1FAE5' : '#FEE2E2', color: f.statut === 'En service' ? '#065F46' : '#991B1B', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                    {f.statut || 'En service'}
                  </span>
                </td>
                <td>{f.total_incidents || 0}</td>
                <td>{f.incidents_en_attente > 0 ? <span className="badge badge-attente">{f.incidents_en_attente}</span> : <span style={{ color: '#A0AEC0' }}>-</span>}</td>
                <td><button className="btn btn-outline btn-sm" onClick={() => onSelect(f)}>Voir</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DetailForage({ forage, onClose }) {
  const [historique, setHistorique] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (forage._id) {
      setLoading(true);
      API.get('/forages/' + forage._id)
        .then(r => setHistorique(r.data.historique || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [forage]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 700 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{forage.nom || forage.site}</h3>
          <button className="close-btn" onClick={onClose}>x</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          {[['Site', forage.site], ['Brigade', forage.brigade], ['Total incidents', forage.total_incidents || 0], ['En attente', forage.incidents_en_attente || 0]].map(([k, v]) => (
            <div key={k} style={{ background: '#F7FAFC', padding: '10px 12px', borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: '#718096' }}>{k}</div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ marginBottom: 12, fontWeight: 600, fontSize: 14, color: '#1F4E79' }}>Derniers incidents sur ce site</div>
        {loading ? <div style={{ textAlign: 'center', padding: 20 }}>Chargement...</div> : historique.length === 0 ? (
          <div className="empty-state"><p>Aucun incident pour ce site</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Date</th><th>Description</th><th>Statut</th></tr></thead>
              <tbody>
                {historique.slice(0, 10).map((inc, i) => (
                  <tr key={i}>
                    <td style={{ whiteSpace: 'nowrap', fontSize: 12 }}>{inc.date_declaration ? new Date(inc.date_declaration).toLocaleDateString('fr-FR') : '-'}</td>
                    <td style={{ fontSize: 12 }}>{inc.description?.slice(0, 60)}...</td>
                    <td><span className={'badge ' + (inc.statut === 'En attente' ? 'badge-attente' : 'badge-acheve')}>{inc.statut}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
"""

with open('src/pages/Forages.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
print('OK - Forages.jsx cree!')