import { useState } from 'react';

const DOT_COLOR = { green: '#22c55e', yellow: '#f59e0b', red: '#ef4444' };
const DOT_BG    = { green: '#dcfce7', yellow: '#fef9c3', red: '#fee2e2' };

function initial(name) {
  const w = (name || '').trim().split(' ').filter(Boolean);
  return w.length >= 2 ? (w[0][0] + w[1][0]).toUpperCase() : (name || '--').slice(0, 2).toUpperCase();
}

// ─── Section 1: Why We Win ────────────────────────────────────────────────────
function WhyWeWin({ data }) {
  const productName = data?.overview?.name || 'Our Product';
  const competitors = data?.competitorSummary || [];
  const features    = data?.featureMatrix?.rows || [];
  if (!competitors.length) return null;

  const winCount = features.filter(r => r.product === 'green').length;
  const total    = features.length;
  const winPct   = total ? Math.round((winCount / total) * 100) : 0;

  return (
    <div style={{ marginBottom: 36 }}>
      <div style={{ marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: 1 }}>
          WHY {productName} WINS
        </span>
      </div>
      <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 20 }}>
        Head-to-head comparison showing where <span style={{ color: 'var(--blue)', fontWeight: 600 }}>{productName}</span> outperforms each competitor.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {competitors.map((c, i) => (
          <div key={i} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 18px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                background: c.color || '#6b7280', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 14,
              }}>{initial(c.name)}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{c.name}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{c.marketPosition}</div>
              </div>
            </div>

            {/* Competitor Strengths */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#ef4444', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>
                {c.name} STRENGTHS
              </div>
              {(c.strengths || []).slice(0, 3).map((s, si) => (
                <div key={si} style={{ display: 'flex', gap: 6, fontSize: 12, marginBottom: 5, color: 'var(--text)', alignItems: 'flex-start' }}>
                  <span style={{ color: '#ef4444', flexShrink: 0 }}>+</span>{s}
                </div>
              ))}
            </div>

            {/* Their Weaknesses */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#22c55e', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>
                THEIR WEAKNESSES
              </div>
              {(c.weaknesses || []).slice(0, 3).map((w, wi) => (
                <div key={wi} style={{ display: 'flex', gap: 6, fontSize: 12, marginBottom: 5, color: 'var(--text)', alignItems: 'flex-start' }}>
                  <span style={{ color: '#22c55e', flexShrink: 0 }}>✓</span>{w}
                </div>
              ))}
            </div>

            {/* Why We Win — our edge over this competitor */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>
                WHY {productName} WINS
              </div>
              {(c.ourEdge || []).slice(0, 3).map((e, ei) => (
                <div key={ei} style={{ display: 'flex', gap: 6, fontSize: 12, marginBottom: 5, color: 'var(--text)', alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--blue)', flexShrink: 0 }}>★</span>{e}
                </div>
              ))}
            </div>

            {/* We Lead On tags */}
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>WE LEAD ON</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {features.filter(r => r.product === 'green').slice(0, 4).map((f, fi) => (
                  <span key={fi} style={{ fontSize: 10, padding: '3px 9px', borderRadius: 20, background: 'var(--blue-lt)', color: 'var(--blue)', fontWeight: 600, border: '1px solid var(--blue)' }}>
                    {f.feature}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Section 2: Feature-by-Feature Comparison ────────────────────────────────
function FeatureComparison({ data }) {
  const matrix = data?.featureMatrix;
  if (!matrix?.rows?.length) return null;
  const { labels, rows } = matrix;
  const competitors = data?.competitorSummary || [];
  const allCols = ['product', 'comp1', 'comp2'];

  return (
    <div style={{ marginBottom: 36 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: 1 }}>
          FEATURE-BY-FEATURE COMPARISON
        </span>
        <div style={{ display: 'flex', gap: 14, fontSize: 11, alignItems: 'center' }}>
          {[['#22c55e','Better'],['#f59e0b','Similar'],['#ef4444','Weaker']].map(([c,l]) => (
            <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--muted)' }}>
              <svg viewBox="0 0 8 8" style={{ width: 9, height: 9 }}><circle cx="4" cy="4" r="4" fill={c}/></svg>{l}
            </span>
          ))}
        </div>
      </div>
      <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16 }}>
        Rows highlighted in <span style={{ color: '#22c55e', fontWeight: 600 }}>green</span> are areas where <span style={{ color: 'var(--blue)', fontWeight: 600 }}>{labels?.product}</span> has a clear advantage.
      </p>
      <div style={{ overflowX: 'auto', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)', background: 'var(--surface)' }}>
              <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', color: 'var(--muted)', minWidth: 180 }}>Feature</th>
              <th style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', color: 'var(--blue)' }}>{labels?.product}</th>
              <th style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', color: 'var(--muted)' }}>{labels?.comp1}</th>
              <th style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', color: 'var(--muted)' }}>{labels?.comp2}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const isWin = r.product === 'green';
              return (
                <tr key={i} style={{
                  borderBottom: '1px solid var(--border)',
                  background: isWin ? 'rgba(34,197,94,0.04)' : 'transparent',
                }}>
                  <td style={{ padding: '10px 16px', fontWeight: isWin ? 600 : 400, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    {isWin && <span style={{ color: '#22c55e', fontSize: 11 }}>★</span>}
                    {r.feature}
                  </td>
                  {allCols.map(k => (
                    <td key={k} style={{ textAlign: 'center', padding: '10px' }}>
                      <svg viewBox="0 0 10 10" style={{ width: 12, height: 12 }}>
                        <circle cx="5" cy="5" r="5" fill={DOT_COLOR[r[k]] || '#9ca3af'} />
                      </svg>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Section 3: Competitor Overview Table ────────────────────────────────────
function CompetitorOverview({ data }) {
  const productName = data?.overview?.name || 'Our Product';
  const competitors = data?.competitorSummary || [];
  const features    = data?.featureMatrix?.rows || [];
  if (!competitors.length) return null;

  return (
    <div style={{ marginBottom: 36 }}>
      <div style={{ marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: 1 }}>
          COMPETITOR OVERVIEW
        </span>
      </div>
      <div style={{ overflowX: 'auto', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)', background: 'var(--surface)' }}>
              {[
                { label: 'COMPETITOR',       color: 'var(--muted)' },
                { label: 'OVERVIEW',         color: 'var(--muted)' },
                { label: 'THEIR STRENGTHS',  color: '#22c55e' },
                { label: 'THEIR WEAKNESSES', color: '#ef4444' },
                { label: `WHY ${productName} WINS`, color: 'var(--blue)' },
                { label: 'POSITION',         color: 'var(--muted)' },
              ].map(h => (
                <th key={h.label} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.6, color: h.color, whiteSpace: 'nowrap' }}>{h.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {competitors.map((c, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border)', verticalAlign: 'top' }}>
                <td style={{ padding: '16px 14px', minWidth: 130 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: c.color || '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
                      {initial(c.name)}
                    </div>
                    <span style={{ fontWeight: 700, color: 'var(--text)', fontSize: 13 }}>{c.name}</span>
                  </div>
                </td>
                <td style={{ padding: '16px 14px', maxWidth: 200, fontSize: 11, color: 'var(--muted)', lineHeight: 1.6 }}>{c.overview}</td>
                <td style={{ padding: '16px 14px', minWidth: 180 }}>
                  {(c.strengths || []).map((s, si) => (
                    <div key={si} style={{ display: 'flex', gap: 5, marginBottom: 5, fontSize: 11, color: 'var(--text)', alignItems: 'flex-start' }}>
                      <span style={{ color: '#22c55e', flexShrink: 0 }}>+</span>{s}
                    </div>
                  ))}
                </td>
                <td style={{ padding: '16px 14px', minWidth: 180 }}>
                  {(c.weaknesses || []).map((w, wi) => (
                    <div key={wi} style={{ display: 'flex', gap: 5, marginBottom: 5, fontSize: 11, color: 'var(--text)', alignItems: 'flex-start' }}>
                      <span style={{ color: '#ef4444', flexShrink: 0 }}>–</span>{w}
                    </div>
                  ))}
                </td>
                <td style={{ padding: '16px 14px', minWidth: 200 }}>
                  {(c.ourEdge || []).slice(0, 4).map((e, ei) => (
                    <div key={ei} style={{ display: 'flex', gap: 5, marginBottom: 5, fontSize: 11, color: 'var(--text)', alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--blue)', flexShrink: 0 }}>★</span>{e}
                    </div>
                  ))}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
                    {features.filter(r => r.product === 'green').slice(0, 3).map((f, fi) => (
                      <span key={fi} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: 'var(--blue-lt)', color: 'var(--blue)', fontWeight: 600, border: '1px solid var(--blue)' }}>{f.feature}</span>
                    ))}
                  </div>
                </td>
                <td style={{ padding: '16px 14px', textAlign: 'center' }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20,
                    background: c.marketPosition === 'Leader' ? '#dcfce7' : c.marketPosition === 'Challenger' ? '#fef9c3' : '#f3f4f6',
                    color: c.marketPosition === 'Leader' ? '#16a34a' : c.marketPosition === 'Challenger' ? '#d97706' : '#6b7280',
                  }}>{c.marketPosition || 'Challenger'}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Section 4: Battle Cards ──────────────────────────────────────────────────
function BattleCards({ data }) {
  const productName = data?.overview?.name || 'Our Product';
  const competitors = data?.competitorSummary || [];
  const features    = data?.featureMatrix?.rows || [];
  if (!features.length) return null;

  return (
    <div style={{ marginBottom: 36 }}>
      <div style={{ marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: 1 }}>
          BATTLECARD: {(data?.overview?.name || 'OUR PRODUCT').toUpperCase()} ADVANTAGES
        </span>
      </div>
      <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 20 }}>
        Use these talking points in competitive conversations to position <span style={{ color: 'var(--blue)', fontWeight: 600 }}>{productName}</span> above the competition.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 14 }}>
        {features.map((row, i) => {
          const weWin = row.product === 'green';
          return (
            <div key={i} style={{
              background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10,
              padding: '14px 16px', borderLeft: `3px solid ${weWin ? '#22c55e' : '#f59e0b'}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: '#f59e0b' }}>★</span>{row.feature}
                </span>
                {weWin && <span style={{ fontSize: 10, color: '#22c55e', fontWeight: 700, background: '#dcfce7', padding: '2px 8px', borderRadius: 20 }}>✓ Better</span>}
              </div>
              <p style={{ fontSize: 11, color: 'var(--blue)', marginBottom: 10, fontStyle: 'italic', lineHeight: 1.5 }}>
                {productName} leads over {competitors.map(c => c.name).join(', ')} on this dimension.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {competitors.map((c, ci) => {
                  const status = ci === 0 ? row.comp1 : row.comp2;
                  const label  = status === 'green' ? 'better' : status === 'red' ? 'weaker' : 'similar';
                  return (
                    <span key={ci} style={{
                      fontSize: 10, padding: '2px 9px', borderRadius: 20,
                      background: DOT_BG[status] || '#f3f4f6',
                      color: DOT_COLOR[status] || '#6b7280',
                      border: `1px solid ${DOT_COLOR[status] || '#d1d5db'}`,
                      fontWeight: 500,
                    }}>{c.name}: {label}</span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CompetitiveAnalysisPage({ data }) {
  if (!data) return (
    <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted)' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
      <div style={{ fontSize: 15, fontWeight: 600 }}>No competitive data available.</div>
      <div style={{ fontSize: 12, marginTop: 6 }}>Generate a product with AI to see competitive analysis.</div>
    </div>
  );

  return (
    <div style={{ padding: '24px 28px' }}>
      <WhyWeWin data={data} />
      <FeatureComparison data={data} />
      <CompetitorOverview data={data} />
      <BattleCards data={data} />
    </div>
  );
}
