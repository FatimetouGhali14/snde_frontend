import React, { useEffect, useState } from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  ArcElement, LineElement, PointElement, Tooltip, Legend, Title
} from 'chart.js';
import { getDashboard, exportExcel } from '../services/api';
import Layout from '../components/Layout';

ChartJS.register(
  CategoryScale, LinearScale, BarElement,
  ArcElement, LineElement, PointElement, Tooltip, Legend, Title
);

const COULEURS = ['#1F4E79','#2E75B6','#4BAAD3','#27AE60','#E67E22','#E74C3C','#8E44AD','#2C3E50','#16A085','#F39C12'];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filtreBrigade, setFiltreBrigade] = useState('');
  const [filtreAnnee, setFiltreAnnee] = useState('');
  const [exportLoading, setExportLoading] = useState(false);

  const chargerStats = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filtreBrigade) params.brigade = filtreBrigade;
      if (filtreAnnee) params.annee = filtreAnnee;
      const res = await getDashboard(params);
      setStats(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { chargerStats(); }, [filtreBrigade, filtreAnnee]);

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const params = {};
      if (filtreBrigade) params.brigade = filtreBrigade;
      const res = await exportExcel(params);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `SNDE_Incidents_${new Date().toISOString().slice(0,10)}.xlsx`;
      a.click();
    } catch (e) {
      alert('Erreur lors de l\'export');
    } finally {
      setExportLoading(false);
    }
  };

  if (loading) return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
        <div className="spinner" style={{ width: 40, height: 40, borderColor: '#1F4E79', borderTopColor: 'transparent' }} />
      </div>
    </Layout>
  );

  if (!stats) return <Layout><div>Erreur de chargement</div></Layout>;

  const { totaux, par_statut, par_brigade, par_site, par_impact, evolution_mensuelle, alertes_critiques } = stats;

  // Graphique camembert — statuts
  const pieStatut = {
    labels: Object.keys(par_statut),
    datasets: [{
      data: Object.values(par_statut),
      backgroundColor: ['#FEF3C7','#DBEAFE','#D1FAE5','#FEE2E2','#EDE9FE'],
      borderColor: ['#92400E','#1E40AF','#065F46','#991B1B','#5B21B6'],
      borderWidth: 2,
    }]
  };

  // Graphique barres — incidents par brigade
  const barBrigade = {
    labels: par_brigade.map(b => b.brigade?.replace('Brigade ', '').replace('Département ', '') || 'N/A'),
    datasets: [
      { label: 'Total', data: par_brigade.map(b => b.total), backgroundColor: '#2E75B6' },
      { label: 'En attente', data: par_brigade.map(b => b.en_attente), backgroundColor: '#E67E22' },
    ]
  };

  // Graphique ligne — évolution mensuelle
  const lineData = {
    labels: evolution_mensuelle.map(m => m.mois),
    datasets: [
      { label: 'Total déclarés', data: evolution_mensuelle.map(m => m.total), borderColor: '#2E75B6', backgroundColor: 'rgba(46,117,182,0.1)', tension: 0.4, fill: true },
      { label: 'Achevés', data: evolution_mensuelle.map(m => m.acheves), borderColor: '#27AE60', backgroundColor: 'rgba(39,174,96,0.1)', tension: 0.4, fill: true },
    ]
  };

  // Top 10 sites
  const barSites = {
    labels: par_site.slice(0,10).map(s => s.site),
    datasets: [{ label: 'Incidents', data: par_site.slice(0,10).map(s => s.count), backgroundColor: COULEURS }]
  };

  const chartOptions = { responsive: true, plugins: { legend: { position: 'top' } } };

  return (
    <Layout>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>Tableau de bord</h2>
          <p>Suivi des incidents — Direction de la Production</p>
        </div>
        <button className="btn btn-success" onClick={handleExport} disabled={exportLoading}>
          {exportLoading ? <span className="spinner" /> : '⬇️'} Exporter Excel
        </button>
      </div>

      {/* Alertes critiques */}
      {alertes_critiques?.length > 0 && (
        <div className="alert-critique">
          <span style={{ fontSize: 20 }}>🚨</span>
          <div>
            <strong>{alertes_critiques.length} incident(s) MAJEUR(S)</strong> en attente depuis plus de 24h — intervention urgente requise
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="filters-bar">
        <select value={filtreBrigade} onChange={e => setFiltreBrigade(e.target.value)}>
          <option value="">Toutes les brigades</option>
          {par_brigade.map(b => (
            <option key={b.brigade} value={b.brigade}>{b.brigade}</option>
          ))}
        </select>
        <select value={filtreAnnee} onChange={e => setFiltreAnnee(e.target.value)}>
          <option value="">Toutes les années</option>
          <option value="2026">2026</option>
          <option value="2025">2025</option>
          <option value="2024">2024</option>
          <option value="2023">2023</option>
        </select>
        <button className="btn btn-outline btn-sm" onClick={chargerStats}>🔄 Actualiser</button>
      </div>

      {/* KPIs */}
      <div className="kpi-grid">
        <div className="kpi-card blue">
          <div className="kpi-label">Total incidents</div>
          <div className="kpi-value">{totaux.total.toLocaleString()}</div>
          <div className="kpi-sub">Tous statuts confondus</div>
        </div>
        <div className="kpi-card orange">
          <div className="kpi-label">En attente</div>
          <div className="kpi-value">{totaux.en_attente}</div>
          <div className="kpi-sub">À traiter en priorité</div>
        </div>
        <div className="kpi-card green">
          <div className="kpi-label">Achevés</div>
          <div className="kpi-value">{totaux.acheves.toLocaleString()}</div>
          <div className="kpi-sub">Taux : {totaux.taux_resolution}%</div>
        </div>
        <div className="kpi-card red">
          <div className="kpi-label">Impact Majeur</div>
          <div className="kpi-value">{totaux.majeurs}</div>
          <div className="kpi-sub">Incidents critiques</div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="charts-grid">
        <div className="card">
          <div className="card-title">Répartition par statut</div>
          <Pie data={pieStatut} options={{ ...chartOptions, plugins: { legend: { position: 'bottom' } } }} />
        </div>
        <div className="card">
          <div className="card-title">Incidents par brigade</div>
          <Bar data={barBrigade} options={chartOptions} />
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-title">Évolution mensuelle</div>
        <Line data={lineData} options={chartOptions} />
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-title">Top 10 sites les plus touchés</div>
        <Bar data={barSites} options={{ ...chartOptions, indexAxis: 'y' }} />
      </div>

      {/* Alertes détail */}
      {alertes_critiques?.length > 0 && (
        <div className="card">
          <div className="card-title">🚨 Incidents critiques — intervention urgente</div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Site</th><th>Brigade</th><th>Description</th><th>Date déclaration</th>
                </tr>
              </thead>
              <tbody>
                {alertes_critiques.map((inc, i) => (
                  <tr key={i}>
                    <td>{inc.site}</td>
                    <td>{inc.brigade}</td>
                    <td>{inc.description?.slice(0, 60)}...</td>
                    <td>{new Date(inc.date_declaration).toLocaleDateString('fr-FR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Layout>
  );
}
