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
import ProfiloAgenzia from './schede/ProfiloAgenzia'

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
  { id: 'profilo', label: 'Profilo agenzia', icona: '⚙️' },
]

export default function App() {
  // ─── AUTENTICAZIONE ───
  const [session, setSession] = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const [authMode, setAuthMode] = useState('login') // 'login' | 'signup'
  const [authEmail, setAuthEmail] = useState('')
  const [authPass, setAuthPass] = useState('')
  const [authErr, setAuthErr] = useState('')
  const [authMsg, setAuthMsg] = useState('')

  // ─── NAVIGAZIONE E DATI ───
  const [pagina, setPagina] = useState('dashboard')
  const [menuAperto, setMenuAperto] = useState(false)
  const [msg, setMsg] = useState('')
  const [funeraleDaAprire, setFuneraleDaAprire] = useState(null)
  const [datiCaricati, setDatiCaricati] = useState(false)

  const [agenzia, setAgenzia] = useState(null)
  const [personale, setPersonale] = useState([])
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
    setAuthErr(''); setAuthMsg('')
    const { error } = await supabase.auth.signInWithPassword({ email: authEmail.trim(), password: authPass })
    if (error) setAuthErr('Accesso non riuscito: email o password errati (o account non ancora confermato).')
  }

  async function registrati() {
    setAuthErr(''); setAuthMsg('')
    if (!authEmail.trim() || authPass.length < 6) {
      setAuthErr('Inserisci un\'email valida e una password di almeno 6 caratteri.')
      return
    }
    const { error } = await supabase.auth.signUp({
      email: authEmail.trim(),
      password: authPass,
      options: { emailRedirectTo: window.location.origin },
    })
    if (error) { setAuthErr('Registrazione non riuscita: ' + error.message); return }
    setAuthMsg('Ti abbiamo inviato un\'email di conferma. Apri il link, poi torna qui e accedi.')
  }

  async function esci() {
    await supabase.auth.signOut()
    setAgenzia(null); setPersonale([])
    setClienti([]); setFunerali([]); setFornitori([]); setFatture([]); setInventario([]); setVeicoli([]); setManutenzioni([])
    setPagina('dashboard'); setMsg(''); setMenuAperto(false); setDatiCaricati(false)
    setAuthEmail(''); setAuthPass(''); setAuthMode('login'); setAuthErr(''); setAuthMsg('')
  }

  async function caricaTutto() {
    const [ag, pe, c, f, fo, fa, iv, ve, ma] = await Promise.all([
      supabase.from('agenzie').select('*').maybeSingle(),
      supabase.from('personale').select('*').order('cognome'),
      supabase.from('clienti').select('*').order('cognome'),
      supabase.from('funerali').select('*, clienti(nome, cognome)').order('creato_il', { ascending: false }),
      supabase.from('fornitori').select('*').order('nome'),
      supabase.from('fatture').select('*, fornitori(nome)').order('data_fattura', { ascending: false }),
      supabase.from('inventario').select('*').order('nome'),
      supabase.from('veicoli').select('*').order('targa'),
      supabase.from('manutenzioni').select('*, veicoli(targa)').order('data', { ascending: false }),
    ])
    setAgenzia(ag.data || null)
    setPersonale(pe.data || [])
    setClienti(c.data || [])
    setFunerali(f.data || [])
    setFornitori(fo.data || [])
    setFatture(fa.data || [])
    setInventario(iv.data || [])
    setVeicoli(ve.data || [])
    setManutenzioni(ma.data || [])
    setDatiCaricati(true)
  }

  function naviga(p) {
    setPagina(p)
    setMsg('')
    setMenuAperto(false)
  }

  function apriFunerale(f) {
    setFuneraleDaAprire(f)
    setPagina('funerali')
    setMsg('')
    setMenuAperto(false)
  }

  if (!authReady) return null

  // ─── Schermata di accesso / registrazione ───
  if (!session) {
    const onEnter = e => e.key === 'Enter' && (authMode === 'login' ? accedi() : registrati())
    return (
      <div style={S.wrap}>
        <h1 style={S.h1}>OBSEQUIA</h1>
        <div style={S.authWrap}>
          <h2 style={{ textAlign: 'center' }}>
            {authMode === 'login' ? 'Accesso agenzia' : 'Registra la tua agenzia'}
          </h2>
          <input style={S.authInput} type="email" placeholder="Email" value={authEmail}
            onChange={e => setAuthEmail(e.target.value)} />
          <input style={S.authInput} type="password" placeholder="Password" value={authPass}
            onChange={e => setAuthPass(e.target.value)} onKeyDown={onEnter} />
          {authErr && <p style={S.authErr}>{authErr}</p>}
          {authMsg && <p style={S.ok}>{authMsg}</p>}
          {authMode === 'login'
            ? <button style={S.authBtn} onClick={accedi}>Entra</button>
            : <button style={S.authBtn} onClick={registrati}>Registrati</button>}
          <button
            onClick={() => { setAuthMode(authMode === 'login' ? 'signup' : 'login'); setAuthErr(''); setAuthMsg('') }}
            style={{ background: 'none', border: 'none', color: '#5b6470', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline', padding: 0, marginTop: '0.25rem' }}
          >
            {authMode === 'login' ? 'Non hai un account? Registra la tua agenzia' : 'Hai già un account? Accedi'}
          </button>
        </div>
      </div>
    )
  }

  // Breve attesa mentre arrivano i dati (evita lampeggi)
  if (!datiCaricati) return null

  // ─── Primo accesso: profilo agenzia non ancora compilato ───
  if (!agenzia) {
    return (
      <div style={S.wrap}>
        <h1 style={S.h1}>OBSEQUIA</h1>
        {msg && <p style={S.ok}>{msg}</p>}
        <ProfiloAgenzia agenzia={null} personale={personale} ricarica={caricaTutto} setMsg={setMsg} obbligatorio onEsci={esci} />
      </div>
    )
  }

  // ─── App con menù laterale ───
  return (
    <div className="app">

      <div className="mobile-topbar">
        <span className="mobile-brand">OBSEQUIA</span>
        <button className="hamburger" onClick={() => setMenuAperto(a => !a)} aria-label="Menù">☰</button>
      </div>

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
        {pagina === 'profilo' && (
          <ProfiloAgenzia agenzia={agenzia} personale={personale} ricarica={caricaTutto} setMsg={setMsg} />
        )}
      </main>

    </div>
  )
}