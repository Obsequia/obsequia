import { useState } from 'react'
import { supabase } from '../supabase'
import { S, norm, fmtData, TIPI_DOC, CLI_VUOTO } from '../comune'

export default function Clienti({ clienti, ricarica, setMsg }) {
  const [cli, setCli] = useState(CLI_VUOTO)
  const [cliEditId, setCliEditId] = useState(null)
  const [cercaCli, setCercaCli] = useState('')

  const clientiFiltrati = clienti.filter(c => {
    const q = norm(cercaCli)
    if (!q) return true
    return norm(`${c.nome} ${c.cognome} ${c.telefono} ${c.codice_fiscale}`).includes(q)
  })

  async function salvaCliente() {
    if (!cli.nome || !cli.cognome) return setMsg('Nome e cognome obbligatori')
    const payload = { ...cli, data_nascita: cli.data_nascita || null, doc_rilascio: cli.doc_rilascio || null, doc_scadenza: cli.doc_scadenza || null }
    let error
    if (cliEditId) {
      ({ error } = await supabase.from('clienti').update(payload).eq('id', cliEditId))
    } else {
      ({ error } = await supabase.from('clienti').insert([payload]))
    }
    if (error) return setMsg('Errore: ' + error.message)
    setMsg(cliEditId ? 'Cliente aggiornato!' : 'Cliente salvato!')
    annullaModificaCliente()
    ricarica()
  }

  function modificaCliente(c) {
    setCli({
      nome: c.nome || '', cognome: c.cognome || '', luogo_nascita: c.luogo_nascita || '',
      data_nascita: c.data_nascita || '', indirizzo: c.indirizzo || '', telefono: c.telefono || '',
      email: c.email || '', codice_fiscale: c.codice_fiscale || '',
      doc_tipo: c.doc_tipo || '', doc_numero: c.doc_numero || '',
      doc_rilascio: c.doc_rilascio || '', doc_scadenza: c.doc_scadenza || '',
    })
    setCliEditId(c.id)
    setMsg('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function annullaModificaCliente() {
    setCli(CLI_VUOTO)
    setCliEditId(null)
  }

  async function eliminaCliente(id) {
    if (!window.confirm('Eliminare questo cliente? L\'azione è definitiva.')) return
    const { error } = await supabase.from('clienti').delete().eq('id', id)
    if (error) return setMsg('Errore: ' + error.message)
    setMsg('Cliente eliminato.')
    ricarica()
  }

  return (
    <div>
      <h2>Anagrafica Clienti (famiglia)</h2>
      {cliEditId && (
        <div style={S.bannerMod}>
          <span>✏️ Stai modificando un cliente</span>
          <button style={S.btnMod} onClick={annullaModificaCliente}>Annulla</button>
        </div>
      )}
      <div style={S.col}>
        <div style={S.row}>
          <input style={{ flex: 1 }} placeholder="Nome *" value={cli.nome} onChange={e => setCli({ ...cli, nome: e.target.value })} />
          <input style={{ flex: 1 }} placeholder="Cognome *" value={cli.cognome} onChange={e => setCli({ ...cli, cognome: e.target.value })} />
        </div>
        <div style={S.row}>
          <input style={{ flex: 1 }} placeholder="Luogo di nascita" value={cli.luogo_nascita} onChange={e => setCli({ ...cli, luogo_nascita: e.target.value })} />
          <input style={{ flex: 1 }} type="date" value={cli.data_nascita} onChange={e => setCli({ ...cli, data_nascita: e.target.value })} />
        </div>
        <input placeholder="Indirizzo" value={cli.indirizzo} onChange={e => setCli({ ...cli, indirizzo: e.target.value })} />
        <div style={S.row}>
          <input style={{ flex: 1 }} placeholder="Telefono" value={cli.telefono} onChange={e => setCli({ ...cli, telefono: e.target.value })} />
          <input style={{ flex: 1 }} placeholder="Email" value={cli.email} onChange={e => setCli({ ...cli, email: e.target.value })} />
        </div>
        <input placeholder="Codice Fiscale" value={cli.codice_fiscale} onChange={e => setCli({ ...cli, codice_fiscale: e.target.value })} />

        <label style={S.label}>Documento di riconoscimento</label>
        <div style={S.row}>
          <select style={{ flex: 1 }} value={cli.doc_tipo} onChange={e => setCli({ ...cli, doc_tipo: e.target.value })}>
            <option value="">— Tipo documento —</option>
            {TIPI_DOC.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <input style={{ flex: 1 }} placeholder="Numero documento" value={cli.doc_numero} onChange={e => setCli({ ...cli, doc_numero: e.target.value })} />
        </div>
        <label style={S.label}>Rilascio / Scadenza documento</label>
        <div style={S.row}>
          <input style={{ flex: 1 }} type="date" value={cli.doc_rilascio} onChange={e => setCli({ ...cli, doc_rilascio: e.target.value })} />
          <input style={{ flex: 1 }} type="date" value={cli.doc_scadenza} onChange={e => setCli({ ...cli, doc_scadenza: e.target.value })} />
        </div>

        <button onClick={salvaCliente}>{cliEditId ? 'Aggiorna Cliente' : 'Salva Cliente'}</button>
      </div>

      <input style={S.cerca} placeholder="🔍 Cerca cliente per nome, cognome, telefono..." value={cercaCli} onChange={e => setCercaCli(e.target.value)} />
      <div style={S.conta}>{clientiFiltrati.length} di {clienti.length}</div>

      {clientiFiltrati.map(c => (
        <div key={c.id} style={S.card}>
          <strong>{c.cognome} {c.nome}</strong>
          {c.telefono && <span> — {c.telefono}</span>}
          {c.codice_fiscale && <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>CF: {c.codice_fiscale}</div>}
          {c.doc_tipo && (
            <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
              {c.doc_tipo}{c.doc_numero ? ` n. ${c.doc_numero}` : ''}{c.doc_scadenza ? ` — scad. ${fmtData(c.doc_scadenza)}` : ''}
            </div>
          )}
          <div style={S.azioni}>
            <button style={S.btnMod} onClick={() => modificaCliente(c)}>Modifica</button>
            <button style={S.btnDel} onClick={() => eliminaCliente(c.id)}>Elimina</button>
          </div>
        </div>
      ))}
    </div>
  )
}