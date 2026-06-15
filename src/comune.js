// ─── Costanti condivise ───
export const GENERI = ['', 'Maschile', 'Femminile']
export const TIPI = ['Sepoltura', 'Cremazione', 'Tumulazione']
export const STATI = ['In corso', 'Riscossione', 'Completata']
export const STATI_PAG = ['Da pagare', 'Pagata parziale', 'Pagata']
export const CATEGORIE_INV = ['Generico', 'Tumulazione', 'Cremazione', 'Inumazione']
export const TIPI_DOC = ['Carta d\'identità', 'Patente', 'Passaporto']
export const COLORI_GRAFICI = ['#4f46e5', '#0891b2', '#16a34a', '#d97706', '#db2777', '#9333ea', '#dc2626']
export const MESI = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic']

// Colori chiari per i grafici (assi e griglia) — tema chiaro
export const GRAFICO_TICK = '#9ca3af'
export const GRAFICO_GRIGLIA = '#e5e7eb'

// ─── Stili ───
export const S = {
  wrap: { padding: '2rem', maxWidth: '760px', margin: '0 auto' },
  h1: { textAlign: 'center', letterSpacing: '3px', fontSize: '26px', fontWeight: 500, color: '#111827', margin: '0.5rem 0 0.25rem' },
  nav: { display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '2rem', flexWrap: 'wrap' },
  col: { display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' },
  row: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
  label: { fontSize: '0.8rem', color: '#6b7280', marginTop: '0.5rem' },
  card: { border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '0.75rem', background: '#fff' },
  cardAllerta: { border: '1px solid #fca5a5', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '0.75rem', background: '#fff' },
  ok: { color: '#15803d' },
  azioni: { display: 'flex', gap: '0.5rem', marginTop: '0.75rem', alignItems: 'center', flexWrap: 'wrap' },
  btnMod: { padding: '0.4rem 0.85rem', background: '#fff', color: '#374151', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' },
  btnDel: { padding: '0.4rem 0.85rem', background: '#fff', color: '#b91c1c', border: '1px solid #fca5a5', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' },
  btnQta: { width: '34px', height: '34px', background: '#fff', color: '#374151', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', fontSize: '1.1rem', lineHeight: 1 },
  bannerMod: { background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe', padding: '0.6rem 1rem', borderRadius: '8px', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  bannerAllerta: { background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', padding: '0.6rem 1rem', borderRadius: '8px', marginBottom: '0.75rem' },
  cerca: { padding: '0.6rem 0.7rem', fontSize: '1rem', border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '1rem', width: '100%', boxSizing: 'border-box', background: '#fff', color: '#1f2328' },
  conta: { fontSize: '0.8rem', color: '#9ca3af', marginBottom: '0.5rem' },
  statGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem', marginBottom: '2rem' },
  statCard: { border: '1px solid #e5e7eb', borderRadius: '10px', padding: '1rem', textAlign: 'center', cursor: 'pointer', background: '#fff' },
  statNum: { fontSize: '2rem', fontWeight: 600, lineHeight: 1, color: '#111827' },
  statLbl: { fontSize: '0.8rem', color: '#6b7280', marginTop: '0.4rem' },
  oggiBadge: { background: '#dcfce7', color: '#166534', fontSize: '0.7rem', fontWeight: 600, padding: '0.15rem 0.55rem', borderRadius: '6px', marginLeft: '0.5rem' },
  vuoto: { color: '#9ca3af', fontStyle: 'italic' },
  authWrap: { maxWidth: '360px', margin: '3rem auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  authInput: { padding: '0.6rem 0.7rem', fontSize: '1rem', border: '1px solid #e5e7eb', borderRadius: '8px', width: '100%', boxSizing: 'border-box', background: '#fff' },
  authBtn: { padding: '0.6rem', fontSize: '1rem', background: '#111827', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  authErr: { color: '#dc2626', fontSize: '0.9rem' },
  topbar: { display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', marginBottom: '0.5rem', color: '#6b7280' },
  btnEsci: { padding: '0.35rem 0.85rem', background: '#fff', color: '#374151', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' },
  badge: { fontSize: '0.72rem', fontWeight: 600, padding: '0.15rem 0.55rem', borderRadius: '6px', marginLeft: '0.5rem' },
  badgeNeutro: { display: 'inline-block', fontSize: '0.72rem', fontWeight: 600, padding: '0.15rem 0.55rem', borderRadius: '6px', background: '#f3f4f6', color: '#4b5563' },
  badgeAllerta: { display: 'inline-block', fontSize: '0.72rem', fontWeight: 600, padding: '0.15rem 0.55rem', borderRadius: '6px', background: '#fee2e2', color: '#b91c1c' },
  graficoCard: { border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', background: '#fff' },
  graficoTit: { fontSize: '1rem', marginBottom: '1rem', color: '#374151' },
  graficoTooltip: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#1f2328', fontSize: '0.85rem' },
  subnav: { display: 'flex', gap: '0.5rem', marginBottom: '1rem' },
  scad: { display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '0.3rem 0', borderBottom: '1px solid #f0f1f3' },
  scadPallino: { display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', marginRight: '0.4rem' },
}
export const btnNav = (on) => ({ padding: '0.5rem 1rem', background: on ? '#111827' : '#fff', color: on ? '#fff' : '#374151', border: on ? '1px solid #111827' : '1px solid #e5e7eb', borderRadius: '9px', cursor: 'pointer', fontSize: '0.9rem' })
export const btnSub = (on) => ({ padding: '0.4rem 0.9rem', background: on ? '#111827' : '#fff', color: on ? '#fff' : '#374151', border: on ? '1px solid #111827' : '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem' })

// ─── Funzioni di supporto ───
export function coloreStato(stato) {
  if (stato === 'Completata') return { background: '#dcfce7', color: '#166534' }
  if (stato === 'Riscossione') return { background: '#e0edff', color: '#1e40af' }
  return { background: '#fef3e2', color: '#b45309' }
}

export function coloreStatoPag(stato) {
  if (stato === 'Pagata') return { background: '#dcfce7', color: '#166534' }
  if (stato === 'Pagata parziale') return { background: '#e0edff', color: '#1e40af' }
  return { background: '#fef3e2', color: '#b45309' }
}

export function giorniA(dataStr) {
  if (!dataStr) return null
  const oggi = new Date(); oggi.setHours(0, 0, 0, 0)
  const d = new Date(dataStr + 'T00:00:00')
  return Math.round((d - oggi) / (1000 * 60 * 60 * 24))
}

export function coloreScad(dataStr) {
  const g = giorniA(dataStr)
  if (g === null) return '#cbd5e1'
  if (g < 0) return '#dc2626'
  if (g <= 30) return '#d97706'
  return '#16a34a'
}

export function fmtData(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function fmtEuro(n) {
  return (Number(n) || 0).toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })
}

export function norm(s) {
  return (s || '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

// ─── Modelli "vuoti" per i form ───
export const CLI_VUOTO = { nome: '', cognome: '', luogo_nascita: '', data_nascita: '', indirizzo: '', telefono: '', email: '', codice_fiscale: '', doc_tipo: '', doc_numero: '', doc_rilascio: '', doc_scadenza: '' }
export const FUN_VUOTO = {
  cliente_id: '', defunto_nome: '', defunto_cognome: '',
  defunto_luogo_nascita: '', defunto_data_nascita: '', defunto_indirizzo: '', defunto_codice_fiscale: '',
  defunto_doc_tipo: '', defunto_doc_numero: '', defunto_doc_rilascio: '', defunto_doc_scadenza: '',
  luogo_decesso: '', data_decesso: '', ora_decesso: '',
  data_funerale: '', ora_funerale: '', luogo_partenza: '', chiesa: '', cimitero_crematorio: '',
  genere: '', tipo: 'Sepoltura', comune: '', stato_pratica: 'In corso',
}
export const FORN_VUOTO = { nome: '', categoria: '', telefono: '', email: '', partita_iva: '', note: '' }
export const FATT_VUOTA = { fornitore_id: '', numero: '', data_fattura: '', importo: '', stato_pagamento: 'Da pagare', descrizione: '' }
export const INV_VUOTO = { nome: '', categoria: 'Generico', quantita: '', soglia: '', unita: 'pz', note: '' }
export const VEIC_VUOTO = { targa: '', descrizione: '', scad_assicurazione: '', scad_bollo: '', scad_revisione: '', scad_autorizzazione: '', note: '' }
export const MANUT_VUOTA = { veicolo_id: '', data: '', descrizione: '', costo: '', officina: '' }