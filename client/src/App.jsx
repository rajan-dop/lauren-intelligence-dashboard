import React, { useState, useEffect, useCallback, Component, useRef } from 'react';
import { PRACTICES, PRODUCTS_BY_PRACTICE } from './dashboardData.js';
import { DataProvider, useData } from './context/DataContext.jsx';
import { SettingsProvider, useSettings } from './context/SettingsContext.jsx';
import { useSSE } from './hooks/useSSE.js';

// ── Error Boundary — catches render crashes and shows a recovery UI ───────────
class PageErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { console.error('Page render error:', error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 14, padding: 40 }}>
          <div style={{ fontSize: 32 }}>⚠️</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Something went wrong loading this page</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 420, textAlign: 'center' }}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </div>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{ padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'var(--blue)', color: '#fff', fontSize: 13, fontWeight: 700 }}
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
import AddProductPage from './pages/sections/AddProductPage.jsx';
import ManagePracticePage from './pages/sections/ManagePracticePage.jsx';
import ProductFormPage from './pages/sections/ProductFormPage.jsx';
import { verifyPin } from './api/products.js';
import OverviewPage from './pages/sections/OverviewPage.jsx';
import ProductDetailsPage from './pages/sections/ProductDetailsPage.jsx';
import CompetitiveAnalysisPage from './pages/sections/CompetitiveAnalysisPage.jsx';
import TcoComparisonPage from './pages/sections/TcoComparisonPage.jsx';
import CaseStudiesPage from './pages/sections/CaseStudiesPage.jsx';
import CustomersPage from './pages/sections/CustomersPage.jsx';
import ObjectionHandlingPage from './pages/sections/ObjectionHandlingPage.jsx';
import WinLossPage from './pages/sections/WinLossPage.jsx';
import AiSalesCoachPage from './pages/sections/AiSalesCoachPage.jsx';
import AwsDashboardPage from './pages/sections/AwsDashboardPage.jsx';

// ── Inline SVG icon components ────────────────────────────────────────────
const IC = {
  Overview:     <svg viewBox="0 0 20 20" fill="currentColor"><path d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z"/></svg>,
  Product:      <svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a1 1 0 01.894.553l7 14A1 1 0 0117 18H3a1 1 0 01-.894-1.447l7-14A1 1 0 0110 2zm0 3.236L4.618 16h10.764L10 5.236z"/></svg>,
  Competitive:  <svg viewBox="0 0 20 20" fill="currentColor"><path d="M2 10a8 8 0 1116 0A8 8 0 012 10zm8-6a1 1 0 100 2 1 1 0 000-2zm-1 4a1 1 0 012 0v4a1 1 0 01-2 0v-4zm1 8a1 1 0 100-2 1 1 0 000 2z"/></svg>,
  TCO:          <svg viewBox="0 0 20 20" fill="currentColor"><path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/></svg>,
  Cases:        <svg viewBox="0 0 20 20" fill="currentColor"><path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/></svg>,
  Customers:    <svg viewBox="0 0 20 20" fill="currentColor"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/></svg>,
  Objections:   <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>,
  WinLoss:      <svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/></svg>,
  Coach:        <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/></svg>,
  Sun:          <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd"/></svg>,
  Moon:         <svg viewBox="0 0 20 20" fill="currentColor"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/></svg>,
  Refresh:      <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/></svg>,
  Calendar:     <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/></svg>,
};

const AddIcon    = <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/></svg>;
const ManageIcon = <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/></svg>;
const LockIcon   = <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/></svg>;
const UnlockIcon = <svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z"/></svg>;

const NAV_ITEMS_IBM = [
  { id: 'overview',    icon: IC.Overview,    label: 'Overview' },
  { id: 'product',     icon: IC.Product,     label: 'Product Details' },
  { id: 'competitive', icon: IC.Competitive, label: 'Competitive Analysis' },
  { id: 'tco',         icon: IC.TCO,         label: 'TCO Comparison' },
  { id: 'cases',       icon: IC.Cases,       label: 'Case Studies' },
  { id: 'customers',   icon: IC.Customers,   label: 'Customers' },
  { id: 'objections',  icon: IC.Objections,  label: 'Objection Handling' },
  { id: 'winloss',     icon: IC.WinLoss,     label: 'Win / Loss' },
  { id: 'coach',       icon: IC.Coach,       label: 'AI Sales Coach', ai: true },
  { id: 'admin',       icon: null,           label: 'Admin', adminGate: true },
];

const NAV_ITEMS_AWS = [
  { id: 'aws-dashboard', icon: IC.Overview,    label: 'AWS Portfolio' },
  { id: 'competitive',   icon: IC.Competitive, label: 'Competitive Analysis' },
  { id: 'objections',    icon: IC.Objections,  label: 'Discovery Framework' },
  { id: 'customers',     icon: IC.Customers,   label: 'Customer Success' },
  { id: 'tco',           icon: IC.TCO,         label: 'TCO & Business Value' },
  { id: 'objections2',   icon: IC.Objections,  label: 'Objection Handling' },
  { id: 'coach',         icon: IC.Coach,       label: 'AI Sales Coach', ai: true },
  { id: 'winloss',       icon: IC.WinLoss,     label: 'Win/Loss Intelligence' },
  { id: 'aws-exec',      icon: IC.Product,     label: 'Executive Messaging' },
  { id: 'admin',         icon: null,           label: 'Admin', adminGate: true },
];

// ── Inline Admin PIN Gate (shown in main area when 'admin' nav is active) ────
function AdminGatePage({ onUnlock }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!pin.trim()) return;
    setChecking(true);
    setError('');
    try {
      await verifyPin(pin.trim());
      onUnlock(pin.trim());
    } catch {
      setError('Incorrect password. Please try again.');
      setPin('');
      inputRef.current?.focus();
    } finally {
      setChecking(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 420, gap: 20 }}>
      <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--card-bg2)', border: '1.5px solid var(--card-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 26, height: 26, color: 'var(--blue)' }}>
          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
        </svg>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', marginBottom: 6 }}>Admin Access</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 340 }}>
          Enter the admin password to unlock <strong>Add Product</strong> and <strong>Manage Practices</strong>.
        </div>
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10, width: 260 }}>
        <input
          ref={inputRef}
          type="password"
          maxLength={32}
          placeholder="Enter admin password"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          disabled={checking}
          style={{
            padding: '11px 16px', borderRadius: 8, fontSize: 15, letterSpacing: 4,
            border: `1.5px solid ${error ? '#ff5a5a' : 'var(--card-border)'}`,
            background: 'var(--card-bg2)', color: 'var(--text)', textAlign: 'center',
            outline: 'none', transition: 'border-color .15s',
          }}
        />
        {error && (
          <div style={{ fontSize: 12, color: '#ff5a5a', textAlign: 'center', marginTop: -4 }}>{error}</div>
        )}
        <button
          type="submit"
          disabled={checking || !pin.trim()}
          style={{
            padding: '11px', borderRadius: 8, border: 'none',
            cursor: (checking || !pin.trim()) ? 'not-allowed' : 'pointer',
            background: 'var(--blue)', color: '#fff', fontSize: 14, fontWeight: 700,
            opacity: (checking || !pin.trim()) ? 0.65 : 1, transition: 'opacity .15s',
          }}
        >
          {checking ? 'Verifying…' : 'Unlock Admin →'}
        </button>
      </form>
    </div>
  );
}

// Sparkline (SVG, no emoji)
function Sparkline() {
  const pts = [18,12,22,8,24,10,20,14,26,6,22,16,28,10,24];
  const w = 130, h = 36;
  const max = Math.max(...pts), min = Math.min(...pts);
  const sx = (i) => (i / (pts.length - 1)) * w;
  const sy = (v) => h - ((v - min) / (max - min || 1)) * (h - 4) - 2;
  const d = pts.map((v, i) => `${i === 0 ? 'M' : 'L'}${sx(i).toFixed(1)},${sy(v).toFixed(1)}`).join(' ');
  const area = d + ` L${w},${h} L0,${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="sparkline">
      <path d={area} fill="rgba(74,158,255,.12)" />
      <path d={d} fill="none" stroke="#4a9eff" strokeWidth="1.8" />
    </svg>
  );
}

// ── Practice accent colours ───────────────────────────────────────────────
const PRACTICE_ACCENT = {
  // ── Core practices (user-defined) ─────────────────────────────────────
  IBM:                  { color: '#1a56a8', light: 'rgba(26,86,168,.10)'   },
  'RED HAT':            { color: '#b30000', light: 'rgba(179,0,0,.09)'     },
  'CS-APP SECURITY':    { color: '#7c3aed', light: 'rgba(124,58,237,.10)'  },
  'CS-FIREWALL':        { color: '#c0392b', light: 'rgba(192,57,43,.10)'   },
  'CS-DATA SECURITY':   { color: '#0e7490', light: 'rgba(14,116,144,.10)'  },
  'DC SOLUTIONS':       { color: '#059669', light: 'rgba(5,150,105,.10)'   },
  SERVERS:              { color: '#d97706', light: 'rgba(217,119,6,.10)'   },
  DATABASE:             { color: '#4338ca', light: 'rgba(67,56,202,.10)'   },
  'IT OPERATIONS':      { color: '#0891b2', light: 'rgba(8,145,178,.10)'   },
  // ── Legacy / other practices ────────────────────────────────────────
  AWS:                  { color: '#e07b00', light: 'rgba(224,123,0,.10)'   },
  WIZ:                  { color: '#5b3fc4', light: 'rgba(91,63,196,.10)'   },
  GOOGLE:               { color: '#1967d2', light: 'rgba(25,103,210,.10)'  },
  Databricks:           { color: '#c0392b', light: 'rgba(192,57,43,.09)'   },
  EDB:                  { color: '#336791', light: 'rgba(51,103,145,.10)'  },
  Thales:               { color: '#003189', light: 'rgba(0,49,137,.09)'    },
  F5:                   { color: '#c0392b', light: 'rgba(192,57,43,.09)'   },
  Quest:                { color: '#2e7d32', light: 'rgba(46,125,50,.09)'   },
  Nutanix:              { color: '#024DA1', light: 'rgba(2,77,161,.09)'    },
  // ── OEM-level accents (used in OEM pills) ────────────────────────────
  'Red Hat':            { color: '#b30000', light: 'rgba(179,0,0,.09)'     },
  CrowdStrike:          { color: '#fc0000', light: 'rgba(252,0,0,.09)'     },
  'Palo Alto Networks': { color: '#e06c00', light: 'rgba(224,108,0,.10)'   },
  Fortinet:             { color: '#c0392b', light: 'rgba(192,57,43,.09)'   },
  'Check Point':        { color: '#cc0000', light: 'rgba(204,0,0,.09)'     },
  Zscaler:              { color: '#1565c0', light: 'rgba(21,101,192,.10)'  },
  Thales:               { color: '#003189', light: 'rgba(0,49,137,.09)'    },
  Varonis:              { color: '#e040fb', light: 'rgba(224,64,251,.09)'  },
  VMware:               { color: '#607196', light: 'rgba(96,113,150,.10)'  },
  HPE:                  { color: '#01a982', light: 'rgba(1,169,130,.10)'   },
  Dell:                 { color: '#007db8', light: 'rgba(0,125,184,.10)'   },
  Lenovo:               { color: '#e2231a', light: 'rgba(226,35,26,.09)'   },
  Oracle:               { color: '#f80000', light: 'rgba(248,0,0,.09)'     },
};

// ── Practice icon map ─────────────────────────────────────────────────────────
const PRACTICE_ICONS = {
  IBM:                '🔵',
  'RED HAT':          '🔴',
  'CS-APP SECURITY':  '🛡️',
  'CS-FIREWALL':      '🔥',
  'CS-DATA SECURITY': '🔒',
  'DC SOLUTIONS':     '🖥️',
  SERVERS:            '⚡',
  DATABASE:           '🗄️',
  'IT OPERATIONS':    '⚙️',
  AWS:                '☁️',
};

// Maps a practice name to its brand CSS theme value
const PRACTICE_THEME = {
  IBM:                'ibm',
  'RED HAT':          'redhat',
  Databricks:         'databricks',
  Nutanix:            'nutanix',
  // legacy spellings
  'Red Hat':          'redhat',
};

// All available themes in cycle order
const THEMES = [
  { id: 'light',      label: 'Light',      icon: '☀️' },
  { id: 'dark',       label: 'Dark',       icon: '🌙' },
  { id: 'ibm',        label: 'IBM Blue',   icon: '🔵' },
  { id: 'redhat',     label: 'Red Hat',    icon: '🔴' },
  { id: 'databricks', label: 'Databricks', icon: '🟠' },
  { id: 'nutanix',    label: 'Nutanix',    icon: '🟢' },
];
function practiceAccent(p) {
  return PRACTICE_ACCENT[p] || { color: '#1a56a8', light: 'rgba(26,86,168,.10)' };
}

// ── Welcome / Selection Screen ────────────────────────────────────────────
// ── Full-page 3-D particle-network background ─────────────────────────────
function ParticleBackground({ accent }) {
  const canvasRef = useRef(null);
  const mouseRef  = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;

    const COUNT = 120;
    const LINK  = 180;
    const SPEED = 0.45;
    const FL    = 500;

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Track mouse for parallax nudge
    function onMouse(e) {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    }
    window.addEventListener('mousemove', onMouse);

    // Parse hex accent to rgb
    const hex = (accent || '#1565d8').replace('#', '');
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);

    // Particles spread across a wide 3-D volume
    const particles = Array.from({ length: COUNT }, () => ({
      x:  (Math.random() - .5) * 1200,
      y:  (Math.random() - .5) * 1200,
      z:  (Math.random() - .5) * 900,
      vx: (Math.random() - .5) * SPEED,
      vy: (Math.random() - .5) * SPEED,
      vz: (Math.random() - .5) * SPEED,
      // pulse phase for glow
      phase: Math.random() * Math.PI * 2,
    }));

    let angle = 0;
    let tilt  = 0; // slow tilt around X from mouse

    function project(x, y, z) {
      // Y-axis rotation
      const cosY = Math.cos(angle), sinY = Math.sin(angle);
      let rx = x * cosY - z * sinY;
      let rz = x * sinY + z * cosY;
      // X-axis tilt
      const cosX = Math.cos(tilt), sinX = Math.sin(tilt);
      let ry = y * cosX - rz * sinX;
      rz     = y * sinX + rz * cosX;

      const scale = FL / (FL + rz + 600);
      return {
        sx: canvas.width  / 2 + rx * scale,
        sy: canvas.height / 2 + ry * scale,
        scale,
        depth: rz,
      };
    }

    let frame = 0;
    function draw() {
      frame++;
      // Fade trail — semi-transparent fill gives motion-blur feel
      ctx.fillStyle = 'rgba(10, 12, 24, 0.18)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      angle += 0.0022;
      // Gentle tilt toward mouse
      const mx = mouseRef.current.x / canvas.width  - 0.5;
      const my = mouseRef.current.y / canvas.height - 0.5;
      tilt += (my * 0.18 - tilt) * 0.02;

      // Move particles
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy; p.z += p.vz;
        p.phase += 0.018;
        if (p.x >  600 || p.x < -600) p.vx *= -1;
        if (p.y >  600 || p.y < -600) p.vy *= -1;
        if (p.z >  450 || p.z < -450) p.vz *= -1;
      }

      // Project + sort back-to-front
      const proj = particles
        .map((p, i) => ({ ...project(p.x, p.y, p.z), p, i }))
        .sort((a, b2) => b2.depth - a.depth);

      // Draw lines
      for (let i = 0; i < proj.length; i++) {
        for (let j = i + 1; j < proj.length; j++) {
          const a = proj[i], bP = proj[j];
          const dx = a.p.x - bP.p.x;
          const dy = a.p.y - bP.p.y;
          const dz = a.p.z - bP.p.z;
          const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
          if (dist < LINK) {
            const t     = 1 - dist / LINK;
            const alpha = t * t * 0.55 * Math.min(a.scale, bP.scale) * 2.2;
            const grd   = ctx.createLinearGradient(a.sx, a.sy, bP.sx, bP.sy);
            grd.addColorStop(0, `rgba(${r},${g},${b},${alpha})`);
            grd.addColorStop(1, `rgba(${r},${g},${b},${alpha * 0.4})`);
            ctx.strokeStyle = grd;
            ctx.lineWidth   = t * 1.4 * Math.min(a.scale, bP.scale) * 1.8;
            ctx.beginPath();
            ctx.moveTo(a.sx, a.sy);
            ctx.lineTo(bP.sx, bP.sy);
            ctx.stroke();
          }
        }
      }

      // Draw nodes with glow
      for (const { sx, sy, scale, p } of proj) {
        const pulse  = 0.7 + 0.3 * Math.sin(p.phase);
        const radius = Math.max(1.2, 4.5 * scale * pulse);
        const alpha  = Math.min(1, scale * 1.4 * pulse);

        // Outer glow
        const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, radius * 3.5);
        glow.addColorStop(0, `rgba(${r},${g},${b},${alpha * 0.35})`);
        glow.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.beginPath();
        ctx.arc(sx, sy, radius * 3.5, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(sx, sy, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${Math.min(255,r+80)},${Math.min(255,g+80)},${Math.min(255,b+120)},${alpha})`;
        ctx.fill();
      }

      // Subtle scanline overlay every 80 frames
      if (frame % 80 === 0) {
        ctx.fillStyle = `rgba(${r},${g},${b},0.03)`;
        for (let y = 0; y < canvas.height; y += 4) {
          ctx.fillRect(0, y, canvas.width, 1);
        }
      }

      raf = requestAnimationFrame(draw);
    }

    // Initial solid background fill
    ctx.fillStyle = 'rgb(10, 12, 24)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouse);
    };
  }, [accent]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', inset: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}

// ── Shared pill button ────────────────────────────────────────────────────────
function PillBtn({ label, icon, isActive, accent, onClick, disabled }) {
  const a = accent || { color: '#1a56a8' };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '7px 16px',
        borderRadius: 20,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: 12,
        fontWeight: isActive ? 700 : 500,
        letterSpacing: .3,
        border: isActive ? `1.5px solid ${a.color}` : '1.5px solid rgba(255,255,255,0.15)',
        background: isActive ? `${a.color}28` : 'rgba(255,255,255,0.06)',
        color: isActive ? a.color : disabled ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.65)',
        transition: 'all .15s',
        whiteSpace: 'nowrap',
        boxShadow: isActive ? `0 0 14px ${a.color}44` : 'none',
        display: 'flex', alignItems: 'center', gap: 5,
        opacity: disabled ? 0.45 : 1,
      }}
      onMouseEnter={e => {
        if (!isActive && !disabled) {
          e.currentTarget.style.borderColor = a.color + '88';
          e.currentTarget.style.color = '#fff';
          e.currentTarget.style.background = 'rgba(255,255,255,0.11)';
        }
      }}
      onMouseLeave={e => {
        if (!isActive && !disabled) {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
          e.currentTarget.style.color = 'rgba(255,255,255,0.65)';
          e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
        }
      }}
    >
      {icon && <span style={{ fontSize: 13 }}>{icon}</span>}
      {label}
    </button>
  );
}

// ── Step indicator ────────────────────────────────────────────────────────────
function StepIndicator({ step, accent }) {
  const steps = ['Practice', 'OEM', 'Product'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 22 }}>
      {steps.map((s, i) => {
        const num = i + 1;
        const done = step > num;
        const active = step === num;
        return (
          <React.Fragment key={s}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700,
                background: done ? accent.color : active ? `${accent.color}33` : 'rgba(255,255,255,0.08)',
                border: active ? `2px solid ${accent.color}` : done ? `2px solid ${accent.color}` : '2px solid rgba(255,255,255,0.15)',
                color: done ? '#fff' : active ? accent.color : 'rgba(255,255,255,0.4)',
                transition: 'all .25s',
              }}>
                {done ? '✓' : num}
              </div>
              <span style={{ fontSize: 10, fontWeight: active ? 700 : 400, color: active ? accent.color : done ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.3)', letterSpacing: .5 }}>
                {s}
              </span>
            </div>
            {i < 2 && (
              <div style={{
                width: 40, height: 2, marginBottom: 14,
                background: step > num + 1 ? accent.color : step > num ? `${accent.color}66` : 'rgba(255,255,255,0.1)',
                transition: 'background .25s',
              }}/>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── Section header row ────────────────────────────────────────────────────────
function SectionHeader({ label, count, badge, accent }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
      <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
        {label}
      </span>
      <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}/>
      {badge ? (
        <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 10px', borderRadius: 10, background: `${accent.color}28`, color: accent.color, border: `1px solid ${accent.color}55` }}>
          {badge}
        </span>
      ) : (
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>{count}</span>
      )}
    </div>
  );
}

/**
 * 3-step Welcome Screen: Practice → OEM → Product
 * practices shape: { practice: { oem: [products] } }
 */
function WelcomeScreen({ theme, setTheme, practice, oem, product, practicesMap, onPracticeChange, onOemChange, onProductChange, onLaunch, loading }) {
  const accentColor = practice ? practiceAccent(practice).color : '#1a56a8';
  const accent = practice ? practiceAccent(practice) : { color: '#1a56a8', light: 'rgba(26,86,168,.10)' };
  const [productSearch, setProductSearch] = useState('');

  // derive lists from 3-level map
  const practicesList = practicesMap ? Object.keys(practicesMap) : [];
  const oemMap = (practicesMap && practice && practicesMap[practice]) || {};
  const oemList = Object.keys(oemMap);
  const productList = (oem && oemMap[oem]) ? oemMap[oem] : (oemList.length === 1 ? oemMap[oemList[0]] || [] : []);

  // current step: 1=practice, 2=oem (skip if only 1 oem), 3=product
  const skipOem = oemList.length <= 1;
  const step = !practice ? 1 : (!oem && !skipOem) ? 2 : 3;

  // Reset search when oem/practice changes
  useEffect(() => { setProductSearch(''); }, [practice, oem]);

  const filteredProducts = productList.filter(p =>
    p.toLowerCase().includes(productSearch.toLowerCase())
  );

  // Show a minimal loading state while API data hasn't arrived yet
  if (loading || practicesList.length === 0) {
    return (
      <div style={{
        minHeight: '100vh', width: '100vw',
        background: '#080a14',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 16,
      }}>
        <div style={{ width: 38, height: 38, border: '3px solid rgba(255,255,255,0.15)', borderTopColor: accentColor, borderRadius: '50%', animation: 'wspin .7s linear infinite' }}/>
        <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, fontFamily: 'var(--font)' }}>Loading dashboard…</div>
        <style>{`@keyframes wspin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh', width: '100vw',
      background: 'transparent',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font)',
      padding: '32px 16px',
      boxSizing: 'border-box',
      position: 'relative',
    }}>
      <ParticleBackground accent={accent.color} />

      {/* Theme picker */}
      <select
        value={theme}
        onChange={e => setTheme(e.target.value)}
        style={{
          position: 'fixed', top: 14, right: 18,
          background: 'rgba(10,12,24,0.82)', color: '#fff',
          border: '1px solid rgba(255,255,255,0.18)',
          borderRadius: 8, padding: '5px 10px',
          fontSize: 12, fontWeight: 600, cursor: 'pointer', zIndex: 9999,
        }}
      >
        {THEMES.map(t => <option key={t.id} value={t.id}>{t.icon} {t.label}</option>)}
      </select>

      {/* ── Main card ── */}
      <div style={{
        background: 'rgba(10, 12, 24, 0.72)',
        backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
        border: `1px solid ${accent.color}44`,
        borderRadius: 18, width: '100%', maxWidth: 700,
        maxHeight: 'calc(100vh - 64px)',
        boxShadow: `0 0 0 1px ${accent.color}22, 0 24px 60px rgba(0,0,0,.55), 0 0 80px ${accent.color}18`,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        position: 'relative', zIndex: 1,
      }}>

        {/* ── Header ── */}
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '24px 36px 20px', textAlign: 'center', flexShrink: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 4, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', marginBottom: 6 }}>
            Lauren Group
          </div>
          <div style={{ fontSize: 26, fontWeight: 900, color: '#ffffff', letterSpacing: 1, lineHeight: 1.15 }}>
            Intelligence Dashboard
          </div>
          <div style={{ width: 40, height: 3, background: accent.color, borderRadius: 2, margin: '12px auto 0', transition: 'background .35s', boxShadow: `0 0 12px ${accent.color}99` }}/>
        </div>

        {/* ── Body ── */}
        <div style={{ padding: '24px 36px 0', overflowY: 'auto', flex: 1, minHeight: 0 }}>

          {/* Step indicator — only show if oem step is relevant */}
          {!skipOem && <StepIndicator step={step} accent={accent} />}

          {/* ══ STEP 1 — Practice ══ */}
          <div style={{ marginBottom: 22 }}>
            <SectionHeader
              label="Practice"
              count={`${practicesList.length} available`}
              badge={practice && step > 1 ? practice : null}
              accent={accent}
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {practicesList.map((p) => {
                const a = practiceAccent(p);
                const icon = PRACTICE_ICONS[p] || '';
                return (
                  <PillBtn
                    key={p}
                    label={p}
                    icon={icon}
                    isActive={practice === p}
                    accent={a}
                    onClick={() => onPracticeChange(p)}
                  />
                );
              })}
            </div>
          </div>

          {/* ── Divider ── */}
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', marginBottom: 20 }}/>

          {/* ══ STEP 2 — OEM (only shown if >1 OEM exists for this practice) ══ */}
          {!skipOem && (
            <>
              <div style={{ marginBottom: 22 }}>
                <SectionHeader
                  label="OEM / Vendor"
                  count={`${oemList.length} vendors`}
                  badge={oem && step > 2 ? oem : null}
                  accent={accent}
                />
                {!practice ? (
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', padding: '10px 0' }}>
                    ← Select a Practice first
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                    {oemList.map((o) => {
                      const a = practiceAccent(o);
                      return (
                        <PillBtn
                          key={o}
                          label={o}
                          isActive={oem === o}
                          accent={a}
                          onClick={() => onOemChange(o)}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', marginBottom: 20 }}/>
            </>
          )}

          {/* ══ STEP 3 — Product ══ */}
          <div style={{ marginBottom: 26 }}>
            <SectionHeader
              label="Product"
              count={`${productList.length} products`}
              badge={product || null}
              accent={accent}
            />

            {/* Guard: must have oem selected (or single-oem practice) */}
            {(!oem && !skipOem) ? (
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', padding: '10px 0' }}>
                ← Select an OEM / Vendor first
              </div>
            ) : (
              <>
                {/* Search box — only when >6 products */}
                {productList.length > 6 && (
                  <div style={{ position: 'relative', marginBottom: 10 }}>
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8"
                      style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: 'rgba(255,255,255,0.35)', pointerEvents: 'none' }}>
                      <circle cx="9" cy="9" r="6"/><path d="M15 15l-3.5-3.5"/>
                    </svg>
                    <input
                      type="text"
                      placeholder="Search products…"
                      value={productSearch}
                      onChange={e => setProductSearch(e.target.value)}
                      style={{
                        width: '100%', padding: '8px 12px 8px 32px', borderRadius: 8,
                        border: '1.5px solid rgba(255,255,255,0.14)', background: 'rgba(255,255,255,0.07)',
                        color: '#fff', fontSize: 12.5, outline: 'none', boxSizing: 'border-box',
                        transition: 'border-color .15s',
                      }}
                      onFocus={e => e.currentTarget.style.borderColor = accent.color + 'aa'}
                      onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'}
                    />
                    {productSearch && (
                      <button onClick={() => setProductSearch('')} style={{
                        position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 0, fontSize: 14,
                      }}>×</button>
                    )}
                  </div>
                )}

                {/* Product list */}
                <div style={{ border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 10, overflow: 'hidden', maxHeight: 190, overflowY: 'auto' }}>
                  {filteredProducts.length === 0 ? (
                    <div style={{ padding: '22px 16px', textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
                      {productList.length === 0 ? 'No products in this category yet.' : `No products match "${productSearch}"`}
                    </div>
                  ) : (
                    filteredProducts.map((p, idx) => {
                      const isActive = product === p;
                      return (
                        <button
                          key={p}
                          onClick={() => onProductChange(p)}
                          title={p}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            width: '100%', padding: '10px 16px', borderRadius: 0,
                            cursor: 'pointer', fontSize: 13,
                            fontWeight: isActive ? 700 : 400, textAlign: 'left',
                            borderTop: idx === 0 ? 'none' : '1px solid rgba(255,255,255,0.07)',
                            borderLeft: 'none', borderRight: 'none', borderBottom: 'none',
                            background: isActive ? `${accent.color}28` : 'transparent',
                            color: isActive ? accent.color : 'rgba(255,255,255,0.8)',
                            transition: 'background .12s', boxSizing: 'border-box',
                          }}
                          onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
                          onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                        >
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{p}</span>
                          {isActive && (
                            <svg viewBox="0 0 16 16" fill="currentColor" style={{ width: 14, height: 14, flexShrink: 0, marginLeft: 8 }}>
                              <path fillRule="evenodd" d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"/>
                            </svg>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </>
            )}
          </div>
        </div>{/* end scrollable body */}

        {/* ── Launch button ── */}
        <div style={{ padding: '14px 36px 22px', borderTop: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
          {/* Helper text — tells user what's still missing */}
          {(!practice || !oem || !product) && (
            <div style={{
              textAlign: 'center', fontSize: 11.5, marginBottom: 10,
              color: 'rgba(255,255,255,0.4)', letterSpacing: .2,
            }}>
              {!practice ? '← Select a Practice to continue'
                : !oem    ? '← Select an OEM / Vendor to continue'
                :            '← Select a Product to continue'}
            </div>
          )}
          <button
            onClick={onLaunch}
            disabled={!practice || !oem || !product}
            style={{
              width: '100%', padding: '13px 0', borderRadius: 10, border: 'none',
              cursor: (practice && oem && product) ? 'pointer' : 'not-allowed',
              background: (practice && oem && product) ? accent.color : 'rgba(255,255,255,0.08)',
              color: (practice && oem && product) ? '#fff' : 'rgba(255,255,255,0.25)',
              fontSize: 13.5, fontWeight: 700, letterSpacing: .6,
              transition: 'all .2s', opacity: (practice && oem && product) ? 1 : 0.5,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
            onMouseEnter={e => { if (practice && oem && product) e.currentTarget.style.opacity = '.82'; }}
            onMouseLeave={e => { if (practice && oem && product) e.currentTarget.style.opacity = '1'; }}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 15, height: 15, flexShrink: 0 }}>
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/>
            </svg>
            Open Dashboard
          </button>
          <div style={{ marginTop: 10, textAlign: 'center', fontSize: 10.5, color: 'rgba(255,255,255,0.25)', letterSpacing: .3 }}>
            For internal use only · © 2025 Lauren Group
          </div>
        </div>

      </div>
    </div>
  );
}

// ── Admin Dashboard — landing panel shown when admin is unlocked ──────────────
function AdminDashboard({ onAddProduct, onManagePractices, onLogout }) {
  const { settings, setSetting } = useSettings();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 420, gap: 20 }}>
      <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--card-bg2)', border: '1.5px solid #2dca6e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 26, height: 26, color: '#2dca6e' }}>
          <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z"/>
        </svg>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', marginBottom: 6 }}>Admin Unlocked</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Select an option below or from the sidebar to continue.</div>
      </div>
      <div style={{ display: 'flex', gap: 14 }}>
        <button onClick={onAddProduct} style={{ padding: '12px 24px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'var(--blue)', color: '#fff', fontSize: 14, fontWeight: 700 }}>
          ➕ Add Product
        </button>
        <button onClick={onManagePractices} style={{ padding: '12px 24px', borderRadius: 10, border: 'none', cursor: 'pointer', background: '#b47fff', color: '#fff', fontSize: 14, fontWeight: 700 }}>
          ⚙ Manage Practices
        </button>
      </div>

      {/* ── Dashboard Settings ── */}
      <div style={{ width: '100%', maxWidth: 420, background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 12, padding: '18px 22px' }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 0.7 }}>
          Dashboard Settings
        </div>
        {/* Win / Loss toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>Win / Loss Section</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Show Win/Loss in the Overview page and sidebar navigation.</div>
          </div>
          <button
            onClick={() => setSetting('winLossEnabled', !settings.winLossEnabled)}
            aria-pressed={settings.winLossEnabled}
            style={{ width: 46, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer', flexShrink: 0, background: settings.winLossEnabled ? '#2dca6e' : 'var(--card-border)', position: 'relative', transition: 'background .2s' }}
          >
            <span style={{ position: 'absolute', top: 3, left: settings.winLossEnabled ? 23 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.25)' }} />
          </button>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--card-border)', margin: '2px 0 14px' }} />

        {/* TCO Comparison toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>TCO Comparison Section</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Show TCO Comparison in the sidebar navigation and Overview page.</div>
          </div>
          <button
            onClick={() => setSetting('tcoEnabled', !settings.tcoEnabled)}
            aria-pressed={settings.tcoEnabled}
            style={{ width: 46, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer', flexShrink: 0, background: settings.tcoEnabled ? '#2dca6e' : 'var(--card-border)', position: 'relative', transition: 'background .2s' }}
          >
            <span style={{ position: 'absolute', top: 3, left: settings.tcoEnabled ? 23 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.25)' }} />
          </button>
        </div>
      </div>

      <button
        onClick={onLogout}
        style={{ marginTop: 4, padding: '9px 22px', borderRadius: 8, border: '1px solid var(--card-border)', cursor: 'pointer', background: 'transparent', color: 'var(--text-muted)', fontSize: 13, fontWeight: 600 }}
      >
        🔒 Logout Admin
      </button>
    </div>
  );
}

// ── Inner app — has access to DataContext ──────────────────────────────────
function AppInner() {
  const [activeNav, setActiveNav]   = useState('overview');
  const [theme, setTheme]           = useState('light');

  // ── Confirmed selection (drives the dashboard data) ──────────────────
  const [practice, setPractice]     = useState('');
  const [oem, setOem]               = useState('');
  const [product, setProduct]       = useState('');

  // ── Pending selection (filter bar dropdowns — not applied until all 3 set) ──
  const [pendingPractice, setPendingPractice] = useState('');
  const [pendingOem, setPendingOem]           = useState('');
  const [pendingProduct, setPendingProduct]   = useState('');

  const [launched, setLaunched]     = useState(false);
  const [data, setData]             = useState(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [adminPin, setAdminPin]     = useState(null);   // unlocked once, reused
  const [formArgs, setFormArgs]     = useState({});     // { editDoc } for product-form
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile sidebar toggle

  const { practices, loading, getProductData, invalidateProduct, addProductToList, addPracticeToList, removeProductFromList } = useData();

  // SSE — listen for real-time product additions/updates
  useSSE({
    product_added: ({ practice: p, product: prod, oem: o }) => {
      addProductToList(p, prod, o);
      invalidateProduct(p, prod);
      // If the currently displayed product was just updated, reload its data
      if (p === practice && prod === product) {
        setData(null); // triggers the loading effect which re-fetches fresh data
        setDataLoading(true);
        getProductData(p, prod).then(d => {
          if (d) setData(d);
          setDataLoading(false);
        });
      }
    },
  });

  // Theme effect
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme === 'light' ? '' : theme);
  }, [theme]);

  // Auto-apply brand theme when practice changes (only if user hasn't manually picked a non-default theme)
  const prevPracticeRef = useRef(null);
  useEffect(() => {
    if (prevPracticeRef.current === practice) return;
    prevPracticeRef.current = practice;
    const brandTheme = PRACTICE_THEME[practice];
    if (brandTheme) {
      setTheme(brandTheme);
    } else {
      // For practices without a brand theme, fall back to light
      setTheme(t => (t === 'dark' ? 'dark' : 'light'));
    }
  }, [practice]);

  // Auto-select first practice+oem+product once practices load from API
  useEffect(() => {
    if (!Object.keys(practices).length) return;
    if (practice) return; // already selected
    const pracList = Object.keys(practices).filter(p => {
      const om = practices[p] || {};
      return Object.values(om).some(arr => arr.length > 0);
    });
    if (!pracList.length) return;
    const firstPrac = pracList[0];
    const firstOemMap = practices[firstPrac] || {};
    const firstOemList = Object.keys(firstOemMap);
    const firstOem = firstOemList[0] || firstPrac;
    const firstProduct = (firstOemMap[firstOem] || [])[0] || '';
    // Set both confirmed + pending to first available
    setPractice(firstPrac); setOem(firstOem); setProduct(firstProduct);
    setPendingPractice(firstPrac); setPendingOem(firstOem); setPendingProduct(firstProduct);
  }, [practices]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep pending dropdowns in sync with confirmed state
  useEffect(() => { setPendingPractice(practice); }, [practice]);
  useEffect(() => { setPendingOem(oem); }, [oem]);
  useEffect(() => { setPendingProduct(product); }, [product]);

  // Load product data whenever practice/product changes.
  // NOTE: getProductData is intentionally excluded from deps — it is a stable
  // async helper; including it causes re-fetch loops when productCache updates.
  useEffect(() => {
    if (!practice) return;
    let cancelled = false;
    // Clear data immediately so the loading state shows instead of stale data
    // from a different practice/product rendering inside page components.
    setData(null);
    setDataLoading(true);
    getProductData(practice, product || '').then((d) => {
      if (!cancelled) {
        setData(d || {
          practice, product,
          overview: { name: product || practice, description: 'No data found.' },
          keyFeatures: [], discoveryQuestions: [], recommendedResponses: [],
          strengths: [], weaknesses: [], caseStudies: [], keyCustomers: [],
          competitorSummary: [], objectionHandling: [], featureMatrix: { labels: {}, rows: [] },
          tcoData: { labels: {}, rows: [], totals: {} },
          winLoss: { total: 0, won: 0, lost: 0, winRate: 0, competitors: [] },
          aiCoach: {}, pricingTiers: [],
        });
        setDataLoading(false);
      }
    }).catch(() => {
      if (!cancelled) {
        setData({
          practice, product,
          overview: { name: product || practice, description: 'Could not load data.' },
          keyFeatures: [], discoveryQuestions: [], recommendedResponses: [],
          strengths: [], weaknesses: [], caseStudies: [], keyCustomers: [],
          competitorSummary: [], objectionHandling: [], featureMatrix: { labels: {}, rows: [] },
          tcoData: { labels: {}, rows: [], totals: {} },
          winLoss: { total: 0, won: 0, lost: 0, winRate: 0, competitors: [] },
          aiCoach: {}, pricingTiers: [],
        });
        setDataLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [practice, product]); // eslint-disable-line react-hooks/exhaustive-deps

  // Derive flat product list for the currently selected practice+oem
  const oemMap = practices[practice] || {};
  const oemList = Object.keys(oemMap);
  const activeOem = oem || (oemList.length === 1 ? oemList[0] : '');
  const products = (activeOem && oemMap[activeOem]) ? oemMap[activeOem]
    : oemList.flatMap(o => oemMap[o] || []); // fallback: all products in practice

  // Only pass practices that have at least one product — no empty slots shown
  const practicesWithData = Object.fromEntries(
    Object.entries(practices).filter(([, oemObj]) =>
      Object.values(oemObj || {}).some(arr => Array.isArray(arr) && arr.length > 0)
    )
  );

  // Flat practice list for the dashboard filter bar (header dropdown)
  const practicesList = Object.keys(practicesWithData).length
    ? Object.keys(practicesWithData)
    : Object.keys(practices);

  // ── Welcome screen handlers — update confirmed state directly ────────────
  const handlePracticeChange = useCallback((p) => {
    setPractice(p); setPendingPractice(p);
    setOem(''); setPendingOem('');
    setProduct(''); setPendingProduct('');
    // Auto-select if only one OEM
    const newOemMap = practices[p] || {};
    const newOemList = Object.keys(newOemMap);
    if (newOemList.length === 1) {
      setOem(newOemList[0]); setPendingOem(newOemList[0]);
      const prods = newOemMap[newOemList[0]] || [];
      setProduct(prods[0] || ''); setPendingProduct(prods[0] || '');
    }
  }, [practices]);

  const handleOemChange = useCallback((o) => {
    setOem(o); setPendingOem(o);
    const oemProds = (practices[practice] || {})[o] || [];
    setProduct(oemProds[0] || ''); setPendingProduct(oemProds[0] || '');
  }, [practices, practice]);

  const handleProductChange = useCallback((p) => {
    setProduct(p); setPendingProduct(p);
  }, []);

  // ── Filter bar handlers — directly update confirmed state immediately ─────
  const handlePendingPracticeChange = useCallback((p) => {
    setPendingPractice(p); setPractice(p);
    const newOemMap = practices[p] || {};
    const newOemList = Object.keys(newOemMap);
    const firstOem = newOemList[0] || '';
    const firstProd = (newOemMap[firstOem] || [])[0] || '';
    setPendingOem(firstOem);   setOem(firstOem);
    setPendingProduct(firstProd); setProduct(firstProd);
  }, [practices]);

  const handlePendingOemChange = useCallback((o) => {
    setPendingOem(o); setOem(o);
    const oemProds = (practices[pendingPractice] || {})[o] || [];
    const firstProd = oemProds[0] || '';
    setPendingProduct(firstProd); setProduct(firstProd);
  }, [practices, pendingPractice]);

  const handlePendingProductChange = useCallback((p) => {
    setPendingProduct(p); setProduct(p);
  }, []);

  const handleApplySelection = useCallback(() => {}, []);

  // Never pending — auto-applies immediately
  const selectionPending = false;
  const pendingComplete  = !!(pendingPractice && pendingOem && pendingProduct);

  const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const isAws = practice === 'AWS';
  const { settings } = useSettings();
  const NAV_ITEMS = (isAws ? NAV_ITEMS_AWS : NAV_ITEMS_IBM).filter(item => {
    if (item.id === 'winloss' && !settings.winLossEnabled) return false;
    if (item.id === 'tco'     && !settings.tcoEnabled)     return false;
    return true;
  });

  // ── Welcome / Selection screen ────────────────────────────────────────
  if (!launched) {
    return (
      <WelcomeScreen
        theme={theme}
        setTheme={setTheme}
        practice={practice}
        oem={activeOem}
        product={product}
        practicesMap={practicesWithData}
        onPracticeChange={handlePracticeChange}
        onOemChange={handleOemChange}
        onProductChange={handleProductChange}
        onLaunch={() => setLaunched(true)}
        loading={loading}
      />
    );
  }

  // Show loading skeleton only on very first load (no data at all yet)
  if (!data) {
    return (
      <div className="dashboard-layout">
        <aside className="sidebar" style={{ background: '#0d1526' }}>
          <div className="sidebar-logo"><div className="brand-name">LAUREN</div></div>
        </aside>
        <div className="main-area" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, border: '3px solid var(--card-border)', borderTopColor: 'var(--blue)', borderRadius: '50%', animation: 'spin .7s linear infinite' }}/>
            <span>Loading product data…</span>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        </div>
      </div>
    );
  }

  // Navigate to product-form with optional editDoc, optionally propagating a freshly-entered PIN
  function navToForm(targetPractice, editDoc, resolvedPin) {
    if (resolvedPin) setAdminPin(resolvedPin);
    setFormArgs({ editDoc, defaultPractice: targetPractice || practice });
    setActiveNav('product-form');
  }

  function renderPage() {
    const ADMIN_PAGES = ['admin', 'add-product', 'manage-practice', 'product-form'];
    const isAdminPage = ADMIN_PAGES.includes(activeNav);

    // Admin gate — show PIN form if not yet unlocked, otherwise show welcome panel
    if (activeNav === 'admin') {
      if (!adminPin) {
        return <AdminGatePage onUnlock={(p) => { setAdminPin(p); }} />;
      }
      // Already unlocked: show a simple landing with links to sub-pages
      return (
        <AdminDashboard
          onAddProduct={() => navToForm(practice, null, adminPin)}
          onManagePractices={() => setActiveNav('manage-practice')}
          onLogout={() => { setAdminPin(null); setActiveNav('overview'); }}
        />
      );
    }

    if (activeNav === 'add-product') {
      return (
        <AddProductPage
          practice={practice}
          pin={adminPin}
          onPinSet={setAdminPin}
          onProductAdded={(p, prod) => { addProductToList(p, prod); setProduct(prod); setPractice(p); setActiveNav('overview'); }}
        />
      );
    }

    if (activeNav === 'manage-practice') {
      return (
        <ManagePracticePage
          pin={adminPin || null}
          onPinSet={setAdminPin}
          onAddProduct={(targetPractice, resolvedPin) => navToForm(targetPractice, null, resolvedPin)}
          onNavigate={(page, args) => { setFormArgs(args || {}); setActiveNav(page); }}
        />
      );
    }

    if (activeNav === 'product-form') {
      return (
        <ProductFormPage
          pin={adminPin || null}
          onPinSet={setAdminPin}
          editDoc={formArgs?.editDoc || null}
          defaultPractice={formArgs?.defaultPractice || practice}
          practices={practices}
          onSaved={(p, prod) => {
            if (p && prod) {
              // Always invalidate cache so the dashboard re-fetches fresh data
              invalidateProduct(p, prod);
              // Add to list only if it's a new product (won't duplicate existing)
              addProductToList(p, prod);
              // Switch the dashboard to show the saved/edited product immediately
              setPractice(p);
              setProduct(prod);
            }
            // Go back to the dashboard overview showing the updated product
            setActiveNav('overview');
          }}
        />
      );
    }

    switch (activeNav) {
      // ── AWS-specific nav IDs ──────────────────────────────────────────
      case 'aws-dashboard': return <AwsDashboardPage data={data} />;
      case 'objections2':   return <ObjectionHandlingPage data={data} />;
      case 'aws-exec':      return <OverviewPage data={data} />;
      // ── Shared nav IDs (IBM + AWS) ────────────────────────────────────
      case 'overview':    return <OverviewPage data={data} tcoEnabled={settings.tcoEnabled} />;
      case 'product':     return <ProductDetailsPage data={data} />;
      case 'competitive': return <CompetitiveAnalysisPage data={data} />;
      case 'tco':         return <TcoComparisonPage data={data} />;
      case 'cases':       return <CaseStudiesPage data={data} />;
      case 'customers':   return <CustomersPage data={data} />;
      case 'objections':  return <ObjectionHandlingPage data={data} />;
      case 'winloss':     return <WinLossPage data={data} />;
      case 'coach':       return <AiSalesCoachPage data={data} onNavigate={setActiveNav} />;
      default:            return isAws ? <AwsDashboardPage data={data} /> : <OverviewPage data={data} tcoEnabled={settings.tcoEnabled} />;
    }
  }

  return (
    <div className="dashboard-layout">

      {/* ── Mobile sidebar overlay ── */}
      <div
        className={`sidebar-overlay${sidebarOpen ? ' open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* ── Sidebar ── */}
    <aside className={`sidebar${sidebarOpen ? ' open' : ''}`}>
      {/* Mobile close button */}
      <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)} aria-label="Close menu">×</button>
      <div className="sidebar-logo">
        {isAws ? (
          <>
            <div className="brand-name">LAUREN</div>
            <div className="brand-sub" style={{ color: '#ff9900', letterSpacing: 2 }}>AWS PRACTICE</div>
          </>
        ) : (
          <>
            <div className="brand-name">LAUREN</div>
            <div className="brand-sub">GROUP</div>
          </>
        )}
      </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => {
            // ── Admin gate item ─────────────────────────────────────────────
            if (item.adminGate) {
              return (
                <div key="admin-group">
                  {/* Admin header row */}
                  <div
                    className={`nav-item${activeNav === 'admin' ? ' active' : ''}`}
                    onClick={() => { setActiveNav('admin'); setSidebarOpen(false); }}
                    style={{ borderTop: '1px solid rgba(255,255,255,.08)', marginTop: 6, paddingTop: 6 }}
                  >
                    <span className="nav-icon">
                      {adminPin ? UnlockIcon : LockIcon}
                    </span>
                    <span className="nav-label">Admin</span>
                    {adminPin
                      ? <span className="ai-badge" style={{ background: '#2dca6e', color: '#fff', fontSize: 9 }}>ON</span>
                      : <span className="ai-badge" style={{ background: 'rgba(255,255,255,.15)', color: 'rgba(255,255,255,.6)', fontSize: 9 }}>🔒</span>
                    }
                  </div>
                  {/* Sub-items — only visible when admin is unlocked */}
                  {adminPin && (
                    <div style={{ background: 'rgba(0,0,0,.15)', borderLeft: '2px solid rgba(74,158,255,.3)', marginLeft: 14, borderRadius: '0 0 6px 6px' }}>
                      <div
                        className={`nav-item${activeNav === 'product-form' ? ' active' : ''}`}
                        onClick={() => { navToForm(practice, null, adminPin); setSidebarOpen(false); }}
                        style={{ paddingLeft: 14, paddingRight: 10, fontSize: 12 }}
                      >
                        <span className="nav-icon" style={{ width: 14, height: 14 }}>{AddIcon}</span>
                        <span className="nav-label" style={{ color: '#2dca6e' }}>Add Product</span>
                        <span className="ai-badge" style={{ background: '#2dca6e', color: '#fff', fontSize: 8 }}>NEW</span>
                      </div>
                      <div
                        className={`nav-item${activeNav === 'manage-practice' ? ' active' : ''}`}
                        onClick={() => { setActiveNav('manage-practice'); setSidebarOpen(false); }}
                        style={{ paddingLeft: 14, paddingRight: 10, fontSize: 12 }}
                      >
                        <span className="nav-icon" style={{ width: 14, height: 14 }}>{ManageIcon}</span>
                        <span className="nav-label" style={{ color: '#b47fff' }}>Manage Practices</span>
                      </div>
                      <div
                        className="nav-item"
                        onClick={() => { setAdminPin(null); setActiveNav('overview'); setSidebarOpen(false); }}
                        style={{ paddingLeft: 14, paddingRight: 10, fontSize: 12 }}
                      >
                        <span className="nav-icon" style={{ width: 14, height: 14, color: '#ff7a7a' }}>
                          <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h6a1 1 0 100-2H4V5h5a1 1 0 100-2H3zm10.293 4.293a1 1 0 011.414 0L17 9.586V9a1 1 0 112 0v4a1 1 0 01-1 1h-4a1 1 0 110-2h1.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
                        </span>
                        <span className="nav-label" style={{ color: '#ff7a7a' }}>Logout</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            }
            // ── Regular nav item ────────────────────────────────────────────
            return (
              <div
                key={item.id}
                className={`nav-item${activeNav === item.id ? ' active' : ''}`}
                onClick={() => { setActiveNav(item.id); setSidebarOpen(false); }}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
                {item.ai && <span className="ai-badge">AI</span>}
              </div>
            );
          })}
        </nav>

      </aside>

      {/* ── Main Area ── */}
      <div className="main-area">

        {/* Header */}
        <header className="top-header">
          {/* Hamburger — visible on tablet/mobile only via CSS */}
          <button
            className="hamburger-btn"
            onClick={() => setSidebarOpen(o => !o)}
            aria-label="Toggle menu"
          >
            <span/><span/><span/>
          </button>
          <div className="header-title">
            {isAws
              ? <><span style={{ color: '#ff9900', fontWeight: 900 }}>AWS</span> SALES INTELLIGENCE &amp; COMPETITIVE DASHBOARD</>
              : 'PRODUCT INTELLIGENCE & COMPETITIVE DASHBOARD'
            }
          </div>
          <div className="header-meta">
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 14, height: 14, display: 'flex' }}>{IC.Calendar}</span>
              Data as of:
            </span>
            <span className="header-date">{data.dataAsOf || dateStr}</span>
            <select
              className="theme-btn"
              value={theme}
              onChange={e => setTheme(e.target.value)}
              style={{ cursor: 'pointer', paddingRight: 8 }}
            >
              {THEMES.map(t => (
                <option key={t.id} value={t.id}>{t.icon} {t.label}</option>
              ))}
            </select>
            <button className="refresh-btn">
              <span style={{ width: 13, height: 13, display: 'flex' }}>{IC.Refresh}</span>
              Refresh
            </button>
          </div>
        </header>

        {/* Filter Bar */}
        <div className="filter-bar">
          {/* Practice */}
          <div className="filter-group">
            <span className="filter-label">Practice</span>
            <select className="filter-select" value={practice} onChange={(e) => handlePendingPracticeChange(e.target.value)}>
              {practicesList.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div className="filter-divider" />
          {/* OEM */}
          <div className="filter-group">
            <span className="filter-label">OEM</span>
            <select className="filter-select" value={oem} onChange={(e) => handlePendingOemChange(e.target.value)}>
              <option value="">— select OEM —</option>
              {Object.keys((practicesWithData[practice] || practices[practice]) || {}).map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="filter-divider" />
          {/* Product */}
          <div className="filter-group">
            <span className="filter-label">Product</span>
            <select className="filter-select" value={product} onChange={(e) => handlePendingProductChange(e.target.value)}>
              <option value="">— select product —</option>
              {((practicesWithData[practice] || practices[practice] || {})[oem] || []).map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div className="filter-divider" />
          {/* vs Competitors — only shown when confirmed selection active */}
          {!selectionPending && (
            <div className="filter-group">
              <span className="filter-label">vs. Competitors</span>
              <div className="competitors-display">{data.competitors}</div>
            </div>
          )}
          <div style={{ marginLeft: 'auto' }}>
            <button
              className="refresh-btn"
              onClick={() => { setPendingOem(''); setPendingProduct(''); setOem(''); setProduct(''); setLaunched(false); }}
              style={{ gap: 5 }}
            >
              <svg viewBox="0 0 16 16" fill="currentColor" style={{ width: 12, height: 12 }}>
                <path fillRule="evenodd" d="M15 8a.5.5 0 00-.5-.5H2.707l3.147-3.146a.5.5 0 10-.708-.708l-4 4a.5.5 0 000 .708l4 4a.5.5 0 00.708-.708L2.707 8.5H14.5A.5.5 0 0015 8z"/>
              </svg>
              Change Selection
            </button>
          </div>
        </div>

        {/* Page Content */}
        <div className="page-content" style={{ position: 'relative' }}>
          {/* Loading overlay — shown while fetching data */}
          {!selectionPending && dataLoading && (
            <div style={{
              position: 'absolute', inset: 0, zIndex: 50,
              background: 'var(--bg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column', gap: 12,
            }}>
              <div style={{ width: 38, height: 38, border: '3px solid var(--card-border)', borderTopColor: 'var(--blue)', borderRadius: '50%', animation: 'spin .7s linear infinite' }}/>
              <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
                Loading {product || practice}…
              </span>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}
          <PageErrorBoundary key={`${practice}/${product}`}>
            {renderPage()}
          </PageErrorBoundary>
          <div style={{ marginTop: 22, paddingTop: 12, borderTop: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)' }}>
            <span>All data is indicative and for internal use only. Source: Internal CRM, Market Intelligence, Gartner, Public Sources.</span>
            <span style={{ whiteSpace: 'nowrap', marginLeft: 24 }}>© 2025 Lauren Group. All rights reserved.</span>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <DataProvider>
        <AppInner />
      </DataProvider>
    </SettingsProvider>
  );
}
