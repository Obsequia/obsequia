import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import { S } from './comune'
import Dashboard from './schede/Dashboard'
import Avvisi from './schede/Avvisi'
import Clienti from './schede/Clienti'
import Funerali from './schede/Funerali'
import Fornitori from './schede/Fornitori'
import Inventario from './schede/Inventario'
import Veicoli from './schede/Veicoli'
import Statistiche from './schede/Statistiche'

// Voci del menù (ordine = come compaiono nella barra)
const VOCI = [
  { id: 'dashboard', label: 'Dashboard', icona: '🏠' },
  { id: 'avvisi', label: 'Avvisi', icona: '🔔' },
  { id: 'clienti', label: 'Clienti', icona: '👤' },
  { id: 'funerali', label: 'Funerali', icona: '⚰️' },
  { id: 'fornitori', label: 'Fornitori', icona: '🧾' },
  { id: 'inventario', label: 'Inventario', icona: '📦' },
  { id: 'veicoli', label: 'Veicoli', icona: '🚐' },
  { id: 'statistiche', label: 'Statistiche', icona: '📊' },
]

export default function App() {
  // ─── AUTENTICAZIONE ───
  const [session, setSession] = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const [authEmail, setAuthEmail] = useState('')
  const [authPass, setAuthPass] = useState('')
  const [authErr, setAuthErr] = useState('')

  // ─── NAVIGAZIONE E DATI ───
  const [pagina, setPagina] = useState('dashboard')
  const [menuAperto, setMenuAperto] = useState(false)
  const [msg, setMsg] = useState('')
  const [funeraleDaAprire, setFuneraleDaAprire] = useState(null)

  const [clienti, setClienti] = useState([])
  const [funerali, setFunerali] = useState([])
  const [fornitori, setFornitori] = useState([])
  const [fatture, setFatture] = useState([])
  const [inventario, setInventario] = useState([])
  const [veicoli, setVeicoli] = useState([])
  const [manutenzioni, setManutenzioni] = useState([])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setAuthReady(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_evento, s) => {
      setSession(s)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => { if (session) caricaTutto() }, [session])

  async function accedi() {
    setAuthErr('')
    const { error } = await supabase.auth.signInWithPassword({ email: authEmail.trim(), password: authPass })
    if (error) setAuthErr('Accesso non riuscito: email o password errati.')
  }

  async function esci() {
    await supabase.auth.signOut()
    setClienti([]); setFunerali([]); setFornitori([]); setFatture([]); setInventario([]); setVeicoli([]); setManutenzioni([])
    setPagina('dashboard'); setMsg(''); setMenuAperto(false)
    setAuthEmail(''); setAuthPass('')
  }

  async function caricaTutto() {
    const [c, f, fo, fa, iv, ve, ma] = await Promise.all([
      supabase.from('clienti').select('*').order('cognome'),
      supabase.from('funerali').select('*, clienti(nome, cognome)').order('creato_il', { ascending: false }),
      supabase.from('fornitori').select('*').order('nome'),
      supabase.from('fatture').select('*, fornitori(nome)').order('data_fattura', { ascending: false }),
      supabase.from('inventario').select('*').order('nome'),
      supabase.from('veicoli').select('*').order('targa'),
      supabase.from('manutenzioni').select('*, veicoli(targa)').order('data', { ascending: false }),
    ])
    setClienti(c.data || [])
    setFunerali(f.data || [])
    setFornitori(fo.data || [])
    setFatture(fa.data || [])
    setInventario(iv.data || [])
    setVeicoli(ve.data || [])
    setManutenzioni(ma.data || [])
  }

  // Cambio scheda: azzera il messaggio e chiude il menù (utile su mobile)
  function naviga(p) {
    setPagina(p)
    setMsg('')
    setMenuAperto(false)
  }

  // "Apri" un funerale dalla Dashboard o dagli Avvisi
  function apriFunerale(f) {
    setFuneraleDaAprire(f)
    setPagina('funerali')
    setMsg('')
    setMenuAperto(false)
  }

  if (!authReady) return null

  // ─── Schermata di accesso ───
  if (!session) {
    return (
      <div style={S.wrap}>
        <h1 style={S.h1}>OBSEQUIA</h1>
        <div style={S.authWrap}>
          <h2 style={{ textAlign: 'center' }}>Accesso agenzia</h2>
          <input style={S.authInput} type="email" placeholder="Email" value={authEmail}
            onChange={e => setAuthEmail(e.target.value)} />
          <input style={S.authInput} type="password" placeholder="Password" value={authPass}
            onChange={e => setAuthPass(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && accedi()} />
          {authErr && <p style={S.authErr}>{authErr}</p>}
          <button style={S.authBtn} onClick={accedi}>Entra</button>
        </div>
      </div>
    )
  }

  // ─── App con menù laterale ───
  return (
    <div className="app">

      {/* Barra in alto: solo su mobile */}
      <div className="mobile-topbar">
        <span className="mobile-brand">OBSEQUIA</span>
        <button className="hamburger" onClick={() => setMenuAperto(a => !a)} aria-label="Menù">☰</button>
      </div>

      {/* Menù laterale (desktop) / a tendina (mobile) */}
      <aside className={menuAperto ? 'sidebar open' : 'sidebar'}>
        <div className="sidebar-brand">OBSEQUIA</div>
        <nav className="nav-list">
          {VOCI.map(v => (
            <button
              key={v.id}
              className={pagina === v.id ? 'nav-item active' : 'nav-item'}
              onClick={() => naviga(v.id)}
            >
              <span>{v.icona}</span> {v.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-foot">
          <div className="sidebar-email">{session.user.email}</div>
          <button className="sidebar-esci" onClick={esci}>Esci</button>
        </div>
      </aside>

      {/* Contenuto */}
      <main className="content">
        {msg && <p style={S.ok}>{msg}</p>}

        {pagina === 'dashboard' && (
          <Dashboard funerali={funerali} veicoli={veicoli} naviga={naviga} apriFunerale={apriFunerale} />
        )}
        {pagina === 'avvisi' && (
          <Avvisi veicoli={veicoli} funerali={funerali} naviga={naviga} apriFunerale={apriFunerale} ricarica={caricaTutto} setMsg={setMsg} />
        )}
        {pagina === 'clienti' && (
          <Clienti clienti={clienti} ricarica={caricaTutto} setMsg={setMsg} />
        )}
        {pagina === 'funerali' && (
          <Funerali funerali={funerali} clienti={clienti} ricarica={caricaTutto} setMsg={setMsg}
            funeraleDaAprire={funeraleDaAprire} setFuneraleDaAprire={setFuneraleDaAprire} />
        )}
        {pagina === 'fornitori' && (
          <Fornitori fornitori={fornitori} fatture={fatture} ricarica={caricaTutto} setMsg={setMsg} />
        )}
        {pagina === 'inventario' && (
          <Inventario inventario={inventario} ricarica={caricaTutto} setMsg={setMsg} />
        )}
        {pagina === 'veicoli' && (
          <Veicoli veicoli={veicoli} manutenzioni={manutenzioni} ricarica={caricaTutto} setMsg={setMsg} />
        )}
        {pagina === 'statistiche' && (
          <Statistiche funerali={funerali} />
        )}
      </main>

    </div>
  )
}