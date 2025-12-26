import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// --- CONSTANTES CAMPUS ---
// --- CONSTANTES CAMPUS ---
// Zones: chargées dynamiquement depuis l'API


const INCIDENT_TYPES = [
  "Problème Technique",
  "Urgence Médicale",
  "Incident Sécurité",
  "Infrastructure",
  "Événement Étudiant",
  "Panne Électrique"
];

const GATEWAY_URL = "http://localhost:8080/api/orchestrator";

// --- ICONS (ajout icônes campus) ---
const Icons = {
  Map: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>,
  Alert: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
  Bus: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 6v6" /><path d="M15 6v6" /><path d="M2 12h19.6" /><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3" /><circle cx="7" cy="18" r="2" /><path d="M9 18h5" /><circle cx="16" cy="18" r="2" /></svg>,
  Bike: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18.5" cy="17.5" r="3.5" /><circle cx="5.5" cy="17.5" r="3.5" /><circle cx="15" cy="5" r="1" /><path d="M12 17.5V14l-3-3 4-3 2 3h2" /></svg>,
  Shield: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /></svg>,
  CheckCircle: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" /></svg>,
  LogOut: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>,
  Info: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>,
  User: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
  Wind: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2" /><path d="M9.6 4.6A2 2 0 1 1 11 8H2" /><path d="M12.6 19.4A2 2 0 1 0 14 16H2" /></svg>,
  Phone: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>,
  Activity: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>,
  Book: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" /></svg>,
  GraduationCap: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>,
  Users: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
};

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [emailInput, setEmailInput] = useState("ahmed.ben@campus.tn");
  const [passwordInput, setPasswordInput] = useState("123456");
  const [loginError, setLoginError] = useState(null);

  const [activeTab, setActiveTab] = useState('navigate'); // 'plan' devient 'navigate'
  const [destination, setDestination] = useState(""); // Default empty, populated by API
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [reportLocation, setReportLocation] = useState(""); // Default empty, populated by API
  const [reportType, setReportType] = useState(INCIDENT_TYPES[0]); // Changé
  const [reportSeverity, setReportSeverity] = useState("HIGH");
  const [reportDescription, setReportDescription] = useState("");
  const [reportPhone, setReportPhone] = useState("");
  const [reportInjuries, setReportInjuries] = useState("Aucun");
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportStatus, setReportStatus] = useState(null);

  const [compZone1, setCompZone1] = useState("");
  const [compZone2, setCompZone2] = useState("");
  const [compData, setCompData] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null); // 'Transport' devient 'Service'
  const [selectedAlert, setSelectedAlert] = useState(null);

  // --- NOUVEAU: ETAT DYNAMIQUE ---
  const [zones, setZones] = useState([]);
  const [trafficData, setTrafficData] = useState([]);

  // Chargement initial des zones
  useEffect(() => {
    const fetchZones = async () => {
      try {
        const res = await axios.get(`${GATEWAY_URL}/campus-zones`);
        if (res.data && res.data.length > 0) {
          setZones(res.data);
          setDestination(res.data[0]);
          setCompZone1(res.data[0]);
          setCompZone2(res.data[1] || res.data[0]);
          setReportLocation(res.data[0]);
        }
      } catch (e) {
        console.error("Erreur chargement zones:", e);
        // Fallback si API down ?
        setZones(["Campus (Défaut)"]);
      }
    };
    fetchZones();
  }, []);

  // Chargement Traffic
  const fetchTraffic = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${GATEWAY_URL}/campus-transports`);
      setTrafficData(res.data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  // Auto-refresh traffic si tab actif
  useEffect(() => {
    if (activeTab === 'traffic') {
      fetchTraffic();
      const interval = setInterval(fetchTraffic, 10000); // Poll toutes les 10s
      return () => clearInterval(interval);
    }
  }, [activeTab]);
  // --- LOGIN AMÉLIORÉ ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError(null);
    setLoading(true);
    try {
      const res = await axios.post(`${GATEWAY_URL}/login`, {
        email: emailInput,
        password: passwordInput
      });
      setCurrentUser(res.data);
    } catch (err) {
      // 1. Récupérer le message d'erreur du backend ou défaut
      const errorMsg = err.response?.data?.error || "Identifiants incorrects.";

      // 2. Afficher dans le formulaire (texte rouge)
      setLoginError(errorMsg);

      // 3. Afficher aussi une notification "Toast" en haut
      setReportStatus({ type: 'error', text: `Erreur : ${errorMsg}` });
      setTimeout(() => setReportStatus(null), 4000);

      console.error(err);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setData(null);
    setActiveTab('navigate');
    setPasswordInput("");
  };

  // --- NAVIGATION CAMPUS ---
  const navigateCampus = async () => {
    if (!currentUser) return;
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await axios.post(`${GATEWAY_URL}/plan-trip`, {
        citizenId: currentUser.id,
        destination
      });
      setData(res.data);
    } catch {
      setError("Impossible de récupérer les informations.");
    }
    setLoading(false);
  };

  // --- COMPARAISON ENVIRONNEMENTALE ---
  const compareEnvironment = async () => {
    setLoading(true);
    setCompData(null);
    try {
      const res = await axios.post(`${GATEWAY_URL}/compare-people`, {
        city1: compZone1,
        city2: compZone2
      });
      setCompData(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  // --- SIGNALEMENT INCIDENT ---
  const openReportForm = () => {
    setReportDescription("");
    setReportPhone("");
    setReportInjuries("Aucun");
    setShowReportForm(true);
  };

  const submitIncident = async (e) => {
    e.preventDefault();
    setShowReportForm(false);
    setReportStatus({ type: 'info', text: "Transmission en cours..." });
    try {
      await axios.post(`${GATEWAY_URL}/report-emergency`, {
        location: reportLocation,
        type: reportType,
        severity: reportSeverity,
        description: reportDescription,
        reporter: currentUser.name,
        phone: reportPhone,
        injuries: reportInjuries
      });
      setReportStatus({ type: 'success', text: "✅ Incident signalé. Équipe notifiée." });
      setTimeout(() => setReportStatus(null), 4000);
    } catch {
      setReportStatus({ type: 'error', text: "❌ Erreur serveur." });
      setTimeout(() => setReportStatus(null), 4000);
    }
  };

  // --- GESTION MODALES ---
  const handleServiceClick = s => {
    setSelectedService(s);
    setIsModalOpen(true);
  };

  const handleAlertClick = a => setSelectedAlert(a);
  // --- LOGIC ALERTES CAMPUS ---
  const securityAlert = data?.environment?.alerts?.find(a => a.severity === 'HIGH');
  const healthAlert = data?.citizen?.isAsthmatic && data?.environment?.people_count?.peopleCount > 100;
  const activeAlerts = [];

  if (securityAlert) {
    activeAlerts.push({
      id: 'sec',
      title: `⚠️ ${securityAlert.type.toUpperCase()}`,
      text: "Incident signalé dans cette zone. Restez vigilant.",
      icon: <Icons.Alert />
    });
  }

  if (healthAlert) {
    activeAlerts.push({
      id: 'health',
      title: "� ALERTE CALME",
      text: `Zone très fréquentée (${data.environment.people_count.peopleCount} pers). Déconseillée si vous cherchez le calme.`,
      icon: <Icons.Users />
    });
  }
  // --- LOGIN VIEW ---
  if (!currentUser) return (
    <div className="login-container">
      {/* Notification Toast pour l'erreur de login */}
      {reportStatus && (
        <div className={`toast-notification ${reportStatus.type === 'error' ? 'error' : ''}`}>
          <div className="toast-icon-svg">{reportStatus.type === 'error' ? <Icons.Alert /> : <Icons.CheckCircle />}</div>
          <span>{reportStatus.text}</span>
        </div>
      )}

      <div className="login-card glass-modal">
        <div className="brand" style={{ textAlign: 'center', marginBottom: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <div style={{ color: 'var(--primary)', transform: 'scale(1.5)' }}><Icons.GraduationCap /></div>
          <div><h1>SMART CAMPUS</h1><p>Espace Étudiant</p></div>
        </div>
        <form onSubmit={handleLogin}>
          <div className="form-group"><label>Email</label><input type="email" className="login-input" value={emailInput} onChange={e => setEmailInput(e.target.value)} /></div>
          <div className="form-group" style={{ marginTop: '15px' }}><label>Mot de passe</label><input type="password" className="login-input" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} /></div>
          <button type="submit" className="btn-primary" style={{ marginTop: '25px' }} disabled={loading}>{loading ? '...' : 'SE CONNECTER'}</button>

          {/* Message d'erreur visible en rouge dans la carte */}
          {loginError && (
            <div className="error-msg" style={{
              marginTop: '15px',
              color: '#ef4444',
              textAlign: 'center',
              background: 'rgba(239, 68, 68, 0.1)',
              padding: '10px',
              borderRadius: '5px',
              fontSize: '0.9rem'
            }}>
              ⚠️ {loginError}
            </div>
          )}
        </form>
      </div>
    </div>
  );

  // --- MAIN VIEW COMPLET ---
  return (
    <div className="app-container">
      {/* Notifications */}
      {reportStatus && (
        <div className={`toast-notification ${reportStatus.type === 'error' ? 'error' : ''}`}>
          <div className="toast-icon-svg">{reportStatus.type === 'error' ? <Icons.Alert /> : <Icons.CheckCircle />}</div>
          <span>{reportStatus.text}</span>
        </div>
      )}

      <aside className="sidebar">
        <div className="brand"><h1>🎓 CAMPUS</h1><p>Navigation Étudiante</p></div>

        <div className="user-mini-profile">
          <div className="avatar-circle">{currentUser.name.charAt(0)}</div>
          <div className="user-details">
            <span className="user-name">{currentUser.name.split(' ').slice(0, 2).join(' ')}</span>
            <span className="user-role" style={{ color: 'var(--info)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Icons.GraduationCap /> {currentUser.department || 'Étudiant'}
            </span>
          </div>
        </div>

        <div className="tab-switcher">
          <button className={activeTab === 'navigate' ? 'active' : ''} onClick={() => setActiveTab('navigate')}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Icons.Map /> Navigation
            </div>
          </button>
          <button className={activeTab === 'compare' ? 'active' : ''} onClick={() => setActiveTab('compare')}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Icons.Users /> Comparer
            </div>
          </button>
          <button className={activeTab === 'report' ? 'active alert-mode' : 'alert-mode'} onClick={() => setActiveTab('report')}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Icons.Alert /> Signaler
            </div>
          </button>
          <button className={activeTab === 'traffic' ? 'active' : ''} onClick={() => setActiveTab('traffic')}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Icons.Bus /> Trafic
            </div>
          </button>
        </div>



        <button className="logout-btn" onClick={handleLogout}>
          <div className="icon-sm"><Icons.LogOut /></div> Déconnexion
        </button>
      </aside >

      {/* --- ACTION BAR (NOUVEAU) --- */}
      {/* --- ACTION BAR (NOUVEAU) --- */}
      <div className="action-bar">
        {activeTab === 'navigate' && (
          <div className="fade-in action-group">
            <div className="form-group-row">
              <label>Zone de Destination :</label>
              <select value={destination} onChange={e => setDestination(e.target.value)}>
                {zones.map(z => <option key={z} value={z}>{z}</option>)}
              </select>
            </div>
            <button className="btn-primary" onClick={navigateCampus} disabled={loading}>
              {loading ? 'Chargement...' : '🔍 VOIR LES OPTIONS'}
            </button>
            {error && <span className="error-msg-inline">{error}</span>}
          </div>
        )}

        {activeTab === 'compare' && (
          <div className="fade-in action-group">
            <div className="warning-badge">COMPARATEUR</div>
            <div className="form-group-row">
              <select value={compZone1} onChange={e => setCompZone1(e.target.value)}>
                {zones.map(z => <option key={z} value={z}>{z}</option>)}
              </select>
              <span>VS</span>
              <select value={compZone2} onChange={e => setCompZone2(e.target.value)}>
                {zones.map(z => <option key={z} value={z}>{z}</option>)}
              </select>
            </div>
            <button className="btn-primary" onClick={compareEnvironment} disabled={loading}>
              {loading ? '...' : 'COMPARER'}
            </button>
          </div>
        )}

        {activeTab === 'report' && (
          <div className="fade-in action-group report-mode">
            <div className="warning-badge-red">SIGNALEMENT</div>
            <div className="form-group-row">
              <select value={reportLocation} onChange={e => setReportLocation(e.target.value)}>
                {zones.map(z => <option key={z} value={z}>{z}</option>)}
              </select>
              <select value={reportType} onChange={e => setReportType(e.target.value)}>
                {INCIDENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <select value={reportSeverity} onChange={e => setReportSeverity(e.target.value)}>
                <option value="LOW">Faible</option>
                <option value="MEDIUM">Moyenne</option>
                <option value="HIGH">Importante</option>
              </select>
            </div>
            <button className="btn-danger" onClick={openReportForm}>CONTINUER...</button>
          </div>
        )}

        {activeTab === 'traffic' && (
          <div className="fade-in action-group">
            <div className="warning-badge" style={{ background: '#3b82f6' }}>INFO TRAFIC</div>
            <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>
              {trafficData.length} véhicules actifs sur le réseau campus.
            </p>
            <button className="btn-primary" onClick={fetchTraffic} disabled={loading}>
              ACTUALISER
            </button>
          </div>
        )}
      </div>

      <main className="main-content">
        {!data && !compData && !loading && (
          <div className="empty-state">
            <h2 style={{ fontWeight: '300' }}>Bonjour, {currentUser.name.split(' ')[0]} 👋</h2>
            <p style={{ opacity: 0.6 }}>Sélectionnez une option dans le menu pour commencer.</p>
          </div>
        )}
        {loading && <div className="empty-state"><div className="spinner"></div></div>}

        {/* --- VUE COMPARATEUR --- */}
        {compData && activeTab === 'compare' && (
          <div className="results-grid fade-in">
            <div className="header-card" style={{ gridColumn: '1 / -1' }}>
              <div className="user-info"><h3>Comparatif</h3></div>
              <div className="trip-status">
                <span className="label">Zone plus peuplés</span>
                <span className="value" style={{ color: '#10b981' }}>{compData.winner.toUpperCase()}</span>
              </div>
            </div>

            <div className="card env-card">
              <div className="card-header">{compData.city1.name}</div>
              <div className="card-body">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '2rem', fontWeight: 'bold' }}>
                  <div style={{ color: compData.city1.peopleCount > 100 ? '#ef4444' : '#10b981' }}><Icons.Users /></div>
                  {compData.city1.peopleCount}
                </div>
                <div className={`aqi-status ${compData.city1.peopleCount > 100 ? 'text-bad' : 'text-good'}`}>
                  {compData.city1.status.toUpperCase()}
                </div>
              </div>
            </div>

            <div className="card env-card">
              <div className="card-header">{compData.city2.name}</div>
              <div className="card-body">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '2rem', fontWeight: 'bold' }}>
                  <div style={{ color: compData.city2.peopleCount > 100 ? '#ef4444' : '#10b981' }}><Icons.Users /></div>
                  {compData.city2.peopleCount}
                </div>
                <div className={`aqi-status ${compData.city2.peopleCount > 100 ? 'text-bad' : 'text-good'}`}>
                  {compData.city2.status.toUpperCase()}
                </div>
              </div>
            </div>

            <div className="card decision-card" style={{ gridColumn: '1 / -1' }}>
              <div className="card-header">ANALYSE</div>
              <div className="card-body">
                <p className="reco-text" style={{ whiteSpace: 'pre-line' }}>
                  Différence approximative : <strong>{compData.diff}</strong> personnes.<br />
                  {compData.diff > 50
                    ? `La différence est significative. ${compData.winner} est plus peuplés.`
                    : ` Ces deux zones ont presque le même nombre de personnes. .`}
                </p>
              </div>
            </div>
          </div>
        )
        }

        {/* --- VUE TRAFIC TEMPS RÉEL (NOUVEAU) --- */}
        {
          activeTab === 'traffic' && (
            <div className="results-grid fade-in">
              <div className="header-card" style={{ gridColumn: '1 / -1' }}>
                <div className="user-info"><h3>État du Trafic Campus</h3></div>
                <div className="trip-status">
                  <span className="label">Mise à jour</span>
                  <span className="value" style={{ color: '#10b981' }}>LIVE</span>
                </div>
              </div>

              <div className="card transport-card" style={{ gridColumn: '1 / -1' }}>
                <div className="card-header">NAVETTES & VÉLOS</div>
                <div className="transport-grid">
                  {trafficData.length === 0 ? <p className="no-data">Aucune donnée de trafic.</p> :
                    trafficData.map(s => (
                      <div key={s.id} className="transport-ticket clickable-ticket" onClick={() => handleServiceClick(s)}>
                        <div className="t-icon">
                          {s.type.includes('Navette') ? <Icons.Bus /> : <Icons.Bike />}
                        </div>
                        <div className="t-info">
                          <div className="t-title">{s.line}</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginTop: '5px' }}>
                            <span style={{ opacity: 0.7 }}>Vers: {s.destination}</span>
                            <span className={`t-status ${s.status.includes('Retard') || s.status.includes('Surchargé') ? 'text-bad' : 'status-good'}`}>
                              {s.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
          )
        }

        {/* --- VUE NAVIGATION CAMPUS --- */}
        {
          data && activeTab === 'navigate' && (
            <div className="results-grid fade-in">
              {activeAlerts.length > 0 && (
                <div className="critical-banner" style={{ flexDirection: 'row', alignItems: 'center', padding: '10px 0', width: '100%', gap: '0' }}>
                  {activeAlerts.map((alert, index) => (
                    <div key={alert.id} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', borderLeft: index > 0 ? '1px solid rgba(255,255,255,0.4)' : 'none' }}>
                      <div className="critical-icon" style={{ fontSize: '1.5rem' }}>{alert.icon}</div>
                      <div className="critical-content" style={{ textAlign: 'left', maxWidth: '70%' }}>
                        <h2 style={{ margin: 0, fontSize: '1.1rem', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{alert.title}</h2>
                        <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.9, lineHeight: '1.2' }}>{alert.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="header-card">
                <div className="user-info"><h3>{data.citizen.name}</h3></div>
                <div className="trip-status">
                  <span className="label">Destination</span>
                  <span className="value">{data.environment.target_city.toUpperCase()}</span>
                </div>
              </div>

              <div className="card env-card">
                <div className="card-header">Nombre de personnes </div>
                <div className="card-body">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '2rem', fontWeight: 'bold' }}>
                    <div style={{ color: data.environment.people_count.peopleCount > 100 ? '#ef4444' : '#10b981' }}><Icons.Users /></div>
                    {data.environment.people_count.peopleCount}
                  </div>
                  <div className={`aqi-status ${data.environment.people_count.peopleCount > 100 ? 'text-bad' : 'text-good'}`}>
                    {data.environment.people_count.status.toUpperCase()}
                  </div>
                </div>
              </div>

              <div className="card alert-card">
                <div className="card-header">INCIDENTS SIGNALÉS</div>
                <div className="card-body">
                  {data.environment.alerts.length === 0 ? (
                    <div className="safe-state">
                      <Icons.Shield />
                      <div>Aucun incident.<br /><small style={{ opacity: 0.7, fontWeight: '400' }}>Zone sécurisée.</small></div>
                    </div>
                  ) : (
                    <ul className="alert-list">
                      {data.environment.alerts.map((a, idx) => (
                        <li key={idx} className={`alert-item clickable-ticket ${a.severity === 'HIGH' ? 'critique' : ''}`} onClick={() => handleAlertClick(a)} style={{ cursor: 'pointer' }}>
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <div className="icon-sm" style={{ color: a.severity === 'HIGH' ? '#ef4444' : '#f59e0b' }}>
                              <Icons.Alert />
                            </div>
                            <strong>{a.type}</strong>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {a.severity === 'HIGH' && <div className="badge-danger">DÉTAILS &gt;</div>}
                            <div style={{ opacity: 0.5 }}><Icons.Info /></div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>



              <div className="card transport-card">
                <div className="card-header">SERVICES DISPONIBLES</div>
                <div className="transport-grid">
                  {data.available_transports.length === 0 ? <p className="no-data">Aucun service disponible.</p> :
                    data.available_transports.map(s => (
                      <div key={s.id} className="transport-ticket clickable-ticket" onClick={() => handleServiceClick(s)}>
                        <div className="t-icon">
                          {s.type.includes('Navette') ? <Icons.Bus /> : <Icons.Bike />}
                        </div>
                        <div className="t-info">
                          <div className="t-title">{s.type} | {s.line}</div>
                          <span className="t-status status-good">{s.status}</span>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
          )
        }
      </main >
      {/* --- MODAL DETAILS SERVICE --- */}
      {
        isModalOpen && selectedService && (
          <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
            <div className="modal-content glass-modal fade-in-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-glass">
                <h3>Service : <strong>{selectedService.line}</strong></h3>
                <button onClick={() => setIsModalOpen(false)} className="close-btn">×</button>
              </div>
              <div className="modal-body-glass">
                <div className="stops-list-container">
                  {selectedService.stops && selectedService.stops.length > 0 ? (
                    <ol className="stops-list">
                      {selectedService.stops.map((stop, index) => (
                        <li key={index} className="stop-item">{stop}</li>
                      ))}
                      <li className="stop-item stop-destination">🏁 {selectedService.destination}</li>
                    </ol>
                  ) : (
                    <p style={{ padding: '20px', textAlign: 'center' }}>
                      Service direct vers {selectedService.destination}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* --- MODAL FORMULAIRE SIGNALEMENT --- */}
      {
        showReportForm && (
          <div className="modal-backdrop" onClick={() => setShowReportForm(false)}>
            <div className="modal-content glass-modal fade-in-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-glass" style={{ background: 'linear-gradient(90deg, rgba(239,68,68,0.2), transparent)' }}>
                <h3 style={{ color: '#fca5a5' }}>SIGNALER : {reportType.toUpperCase()}</h3>
                <button onClick={() => setShowReportForm(false)} className="close-btn">×</button>
              </div>
              <div className="modal-body-glass">
                <p style={{ color: '#e2e8f0', fontSize: '0.9rem', marginBottom: '15px' }}>
                  Aidez la sécurité du campus en précisant la situation à <strong>{reportLocation}</strong>.
                </p>
                <form onSubmit={submitIncident}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div className="form-group">
                      <label>Contact (Tél)</label>
                      <input
                        type="tel"
                        className="login-input"
                        placeholder="98 123 456"
                        value={reportPhone}
                        onChange={e => setReportPhone(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Personnes concernées ?</label>
                      <select
                        className="login-input"
                        value={reportInjuries}
                        onChange={e => setReportInjuries(e.target.value)}
                      >
                        <option value="Aucun">Non</option>
                        <option value="Blessés Légers">Oui, blessés légers</option>
                        <option value="Besoin Ambulance">Grave (Ambulance)</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group" style={{ marginTop: '15px' }}>
                    <label>Description</label>
                    <textarea
                      className="login-input"
                      style={{ height: '80px', resize: 'none' }}
                      placeholder="Détails de l'incident (ex: projecteur défectueux, fuite d'eau, bagarre...)"
                      value={reportDescription}
                      onChange={e => setReportDescription(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn-danger" style={{ marginTop: '20px', width: '100%' }}>
                    ENVOYER SIGNALEMENT
                  </button>
                </form>
              </div>
            </div>
          </div>
        )
      }

      {/* --- MODAL DETAILS ALERTE --- */}
      {
        selectedAlert && (
          <div className="modal-backdrop" onClick={() => setSelectedAlert(null)}>
            <div className="modal-content glass-modal fade-in-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-glass" style={{
                background: selectedAlert.severity === 'HIGH'
                  ? 'linear-gradient(90deg, rgba(239,68,68,0.3), transparent)'
                  : 'linear-gradient(90deg, rgba(245,158,11,0.3), transparent)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="icon-sm" style={{
                    color: selectedAlert.severity === 'HIGH' ? '#fca5a5' : '#fcd34d'
                  }}>
                    <Icons.Alert />
                  </div>
                  <h3 style={{ color: '#fff' }}>DÉTAILS INCIDENT</h3>
                </div>
                <button onClick={() => setSelectedAlert(null)} className="close-btn">×</button>
              </div>

              <div className="modal-body-glass">
                {/* Titre et Lieu */}
                <div style={{
                  marginBottom: '20px',
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  paddingBottom: '10px'
                }}>
                  <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#e0f2fe' }}>
                    {selectedAlert.type}
                  </h2>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#94a3b8',
                    marginTop: '5px'
                  }}>
                    <Icons.Map /> <span>{selectedAlert.location}</span>
                  </div>
                </div>

                {/* Grille des infos */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '15px',
                  marginBottom: '20px'
                }}>
                  {/* Gravité */}
                  <div style={{
                    background: 'rgba(0,0,0,0.2)',
                    padding: '10px',
                    borderRadius: '8px'
                  }}>
                    <small style={{
                      color: '#64748b',
                      textTransform: 'uppercase',
                      fontSize: '0.7rem'
                    }}>
                      Gravité
                    </small>
                    <div style={{
                      color: selectedAlert.severity === 'HIGH' ? '#ef4444' : '#f59e0b',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}>
                      <Icons.Activity />
                      {selectedAlert.severity === 'HIGH' ? 'CRITIQUE' : 'Modérée'}
                    </div>
                  </div>

                  {/* Personnes concernées */}
                  <div style={{
                    background: 'rgba(0,0,0,0.2)',
                    padding: '10px',
                    borderRadius: '8px'
                  }}>
                    <small style={{
                      color: '#64748b',
                      textTransform: 'uppercase',
                      fontSize: '0.7rem'
                    }}>
                      Personnes concernées
                    </small>
                    <div style={{
                      color: '#e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}>
                      <Icons.User /> {selectedAlert.injuries || "Non précisé"}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div style={{ marginBottom: '20px' }}>
                  <small style={{
                    color: '#64748b',
                    textTransform: 'uppercase',
                    fontSize: '0.7rem'
                  }}>
                    Description
                  </small>
                  <p style={{
                    background: 'rgba(255,255,255,0.05)',
                    padding: '12px',
                    borderRadius: '8px',
                    marginTop: '5px',
                    color: '#cbd5e1',
                    lineHeight: '1.5',
                    fontStyle: 'italic'
                  }}>
                    "{selectedAlert.description || "Aucun détail supplémentaire."}"
                  </p>
                </div>

                {/* Bloc Contact */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(16, 185, 129, 0.1)',
                  padding: '10px 15px',
                  borderRadius: '8px',
                  border: '1px solid rgba(16, 185, 129, 0.2)'
                }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{
                      background: 'rgba(16, 185, 129, 0.2)',
                      padding: '8px',
                      borderRadius: '50%',
                      color: '#6ee7b7'
                    }}>
                      <Icons.User />
                    </div>
                    <div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: '#6ee7b7',
                        textTransform: 'uppercase'
                      }}>
                        Signalé par
                      </div>
                      <strong style={{ color: '#ecfdf5' }}>
                        {selectedAlert.reporter || "Anonyme"}
                      </strong>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#6ee7b7',
                      textTransform: 'uppercase',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: '5px'
                    }}>
                      <Icons.Phone /> Contact
                    </div>
                    <strong style={{ color: '#ecfdf5', fontSize: '1.1rem' }}>
                      {selectedAlert.phone || "Non renseigné"}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      }
      {/* --- NOUVEAU : MODAL DETAILS ALERTE (CORRIGÉE & COMPLÈTE) --- */}
      {
        selectedAlert && (
          <div className="modal-backdrop" onClick={() => setSelectedAlert(null)}>
            <div className="modal-content glass-modal fade-in-modal" onClick={(e) => e.stopPropagation()}>

              {/* En-tête avec couleur selon gravité */}
              <div className="modal-header-glass" style={{
                background: selectedAlert.severity === 'HIGH'
                  ? 'linear-gradient(90deg, rgba(239,68,68,0.3), transparent)'
                  : 'linear-gradient(90deg, rgba(245,158,11,0.3), transparent)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="icon-sm" style={{ color: selectedAlert.severity === 'HIGH' ? '#fca5a5' : '#fcd34d' }}>
                    <Icons.Alert />
                  </div>
                  <h3 style={{ color: '#fff' }}>DÉTAILS INCIDENT CAMPUS</h3>
                </div>
                <button onClick={() => setSelectedAlert(null)} className="close-btn">×</button>
              </div>

              <div className="modal-body-glass">
                {/* Titre et Zone */}
                <div style={{ marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                  <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#e0f2fe' }}>{selectedAlert.type}</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', marginTop: '5px' }}>
                    <Icons.Map /> <span>{selectedAlert.location}</span>
                  </div>
                </div>

                {/* Grille des infos */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                  {/* Gravité */}
                  <div className="info-box" style={{ background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px' }}>
                    <small style={{ color: '#64748b', textTransform: 'uppercase', fontSize: '0.7rem' }}>Gravité</small>
                    <div style={{ color: selectedAlert.severity === 'HIGH' ? '#ef4444' : '#f59e0b', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Icons.Activity />
                      {selectedAlert.severity === 'HIGH' ? 'CRITIQUE' : 'Modérée'}
                    </div>
                  </div>

                  {/* Personnes concernées */}
                  <div className="info-box" style={{ background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px' }}>
                    <small style={{ color: '#64748b', textTransform: 'uppercase', fontSize: '0.7rem' }}>Personnes concernées</small>
                    <div style={{ color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Icons.User /> {selectedAlert.injuries || "Non précisé"}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div style={{ marginBottom: '20px' }}>
                  <small style={{ color: '#64748b', textTransform: 'uppercase', fontSize: '0.7rem' }}>Description</small>
                  <p style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', marginTop: '5px', color: '#cbd5e1', lineHeight: '1.5', fontStyle: 'italic' }}>
                    "{selectedAlert.description || "Aucun détail supplémentaire."}"
                  </p>
                </div>

                {/* Bloc Contact (Signalé par + Téléphone) */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(16, 185, 129, 0.1)', padding: '10px 15px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '8px', borderRadius: '50%', color: '#6ee7b7' }}>
                      <Icons.User />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#6ee7b7', textTransform: 'uppercase' }}>Signalé par</div>
                      <strong style={{ color: '#ecfdf5' }}>{selectedAlert.reporter || "Étudiant Anonyme"}</strong>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: '#6ee7b7', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '5px' }}>
                      <Icons.Phone /> Contact
                    </div>
                    <strong style={{ color: '#ecfdf5', fontSize: '1.1rem' }}>
                      {selectedAlert.phone || "Non renseigné"}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}

export default App;
