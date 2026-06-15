import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import { S, btnNav } from './comune'
import Dashboard from './schede/Dashboard'
import Avvisi from './schede/Avvisi'
import Clienti from './schede/Clienti'
import Funerali from './schede/Funerali'
import Fornitori from './schede/Fornitori'
import Inventario from './schede/Inventario'
import Veicoli from './schede/Veicoli'
import Statistiche from './schede/Statistiche'

export default function App() {
  // ─── AUTENTICAZIONE ───
  const [session, setSession] = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const [authEmail, setAuthEmail] = useState('')
  const [authPass, setAuthPass] = useState('')
  const [authErr, setAuthErr] = useState('')

  // ─── NAVIGAZIONE E DATI ───
  const [pagina, setPagina] = useState('dashboard')
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
    setPagina('dashboard'); setMsg('')
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

  // Cambio scheda azzerando il messaggio di conferma
  function naviga(p) {
    setPagina(p)
    setMsg('')
  }

  // "Apri" un funerale dalla Dashboard o dagli Avvisi: vai alla scheda Funerali e aprilo in modifica
  function apriFunerale(f) {
    setFuneraleDaAprire(f)
    setPagina('funerali')
    setMsg('')
  }

  if (!authReady) return null

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

  return (
    <div style={S.wrap}>
      <div style={S.topbar}>
        <span style={{ opacity: 0.7 }}>{session.user.email}</span>
        <button style={S.btnEsci} onClick={esci}>Esci</button>
      </div>

      <h1 style={S.h1}>OBSEQUIA</h1>

      <div style={S.nav}>
        <button style={btnNav(pagina === 'dashboard')} onClick={() => naviga('dashboard')}>🏠 Dashboard</button>
        <button style={btnNav(pagina === 'avvisi')} onClick={() => naviga('avvisi')}>🔔 Avvisi</button>
        <button style={btnNav(pagina === 'clienti')} onClick={() => naviga('clienti')}>👤 Clienti</button>
        <button style={btnNav(pagina === 'funerali')} onClick={() => naviga('funerali')}>⚰️ Funerali</button>
        <button style={btnNav(pagina === 'fornitori')} onClick={() => naviga('fornitori')}>🧾 Fornitori</button>
        <button style={btnNav(pagina === 'inventario')} onClick={() => naviga('inventario')}>📦 Inventario</button>
        <button style={btnNav(pagina === 'veicoli')} onClick={() => naviga('veicoli')}>🚐 Veicoli</button>
        <button style={btnNav(pagina === 'statistiche')} onClick={() => naviga('statistiche')}>📊 Statistiche</button>
      </div>

      {msg && <p style={S.ok}>{msg}</p>}

      {pagina === 'dashboard' && (
        <Dashboard funerali={funerali} veicoli={veicoli} naviga={naviga} apriFunerale={apriFunerale} />
      )}
      {pagina === 'avvisi' && (
        <Avvisi veicoli={veicoli} funerali={funerali} naviga={naviga} apriFunerale={apriFunerale} />
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
    </div>
  )
}