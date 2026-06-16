import { useState } from 'react'
import { supabase } from '../supabase'
import { S } from '../comune'

const RUOLI = ['Operatore funebre', 'Direttore tecnico']

const AG_VUOTA = {
  ragione_sociale: '', partita_iva: '', codice_fiscale: '', amministratore: '',
  titolo_abilitativo: '', indirizzo: '', telefono: '', email: '',
}

export default function ProfiloAgenzia({ agenzia, personale, ricarica, setMsg, obbligatorio, onEsci }) {
  const [form, setForm] = useState(agenzia ? { ...AG_VUOTA, ...agenzia } : AG_VUOTA)
  const [pNome, setPNome] = useState('')
  const [pCognome, setPCognome] = useState('')
  const [pRuolo, setPRuolo] = useState(RUOLI[0])

  function set(campo, val) { setForm(f => ({ ...f, [campo]: val })) }

  async function salva() {
    if (!form.ragione_sociale.trim()) { setMsg('Inserisci almeno la ragione sociale.'); return }
    const dati = {
      ragione_sociale: form.ragione_sociale.trim(),
      partita_iva: form.partita_iva.trim(),
      codice_fiscale: form.codice_fiscale.trim(),
      amministratore: form.amministratore.trim(),
      titolo_abilitativo: form.titolo_abilitativo.trim(),
      indirizzo: form.indirizzo.trim(),
      telefono: form.telefono.trim(),
      email: form.email.trim(),
    }
    let res
    if (agenzia?.id) {
      res = await supabase.from('agenzie').update(dati).eq('id', agenzia.id)
    } else {
      res = await supabase.from('agenzie').insert(dati)
    }
    if (res.error) { setMsg('Errore: ' + res.error.message); return }
    setMsg('Dati agenzia salvati.')
    ricarica()
  }

  async function aggiungiPersona() {
    if (!pNome.trim() && !pCognome.trim()) { setMsg('Inserisci nome o cognome.'); return }
    const { error } = await supabase.from('personale').insert({
      nome: pNome.trim(), cognome: pCognome.trim(), ruolo: pRuolo,
    })
    if (error) { setMsg('Errore: ' + error.message); return }
    setPNome(''); setPCognome(''); setPRuolo(RUOLI[0])
    setMsg('Persona aggiunta.')
    ricarica()
  }

  async function eliminaPersona(id) {
    if (!confirm('Eliminare questa persona?')) return
    const { error } = await supabase.from('personale').delete().eq('id', id)
    if (error) { setMsg('Errore: ' + error.message); return }
    setMsg('Persona eliminata.')
    ricarica()
  }

  const operatori = (personale || []).filter(p => p.ruolo === 'Operatore funebre')
  const direttori = (personale || []).filter(p => p.ruolo === 'Direttore tecnico')

  return (
    <div>
      <h2>Profilo agenzia</h2>

      {obbligatorio && (
        <div style={S.bannerMod}>
          <span>Completa i dati della tua agenzia per iniziare a usare OBSEQUIA.</span>
          {onEsci && <button style={S.btnMod} onClick={onEsci}>Esci</button>}
        </div>
      )}

      {/* ─── Dati agenzia ─── */}
      <div style={S.card}>
        <div style={S.col}>
          <label style={S.label}>Ragione sociale *</label>
          <input value={form.ragione_sociale} onChange={e => set('ragione_sociale', e.target.value)} />

          <div style={S.row}>
            <div style={{ flex: 1 }}>
              <label style={S.label}>Partita IVA</label>
              <input style={{ width: '100%' }} value={form.partita_iva} onChange={e => set('partita_iva', e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={S.label}>Codice fiscale</label>
              <input style={{ width: '100%' }} value={form.codice_fiscale} onChange={e => set('codice_fiscale', e.target.value)} />
            </div>
          </div>

          <label style={S.label}>Amministratore</label>
          <input value={form.amministratore} onChange={e => set('amministratore', e.target.value)} />

          <label style={S.label}>Titolo abilitativo</label>
          <input value={form.titolo_abilitativo} onChange={e => set('titolo_abilitativo', e.target.value)} />

          <label style={S.label}>Indirizzo</label>
          <input value={form.indirizzo} onChange={e => set('indirizzo', e.target.value)} />

          <div style={S.row}>
            <div style={{ flex: 1 }}>
              <label style={S.label}>Telefono</label>
              <input style={{ width: '100%' }} value={form.telefono} onChange={e => set('telefono', e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={S.label}>Email</label>
              <input style={{ width: '100%' }} value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
          </div>

          <div style={S.azioni}>
            <button style={S.authBtn} onClick={salva}>Salva dati agenzia</button>
          </div>
        </div>
      </div>

      {/* ─── Personale: solo dopo che il profilo esiste ─── */}
      {agenzia && (
        <>
          <h3 style={{ marginTop: '2rem' }}>Personale</h3>

          <div style={S.card}>
            <div style={S.row}>
              <input placeholder="Nome" value={pNome} onChange={e => setPNome(e.target.value)} />
              <input placeholder="Cognome" value={pCognome} onChange={e => setPCognome(e.target.value)} />
              <select value={pRuolo} onChange={e => setPRuolo(e.target.value)}>
                {RUOLI.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <button style={S.btnMod} onClick={aggiungiPersona}>+ Aggiungi</button>
            </div>
          </div>

          <h4 style={{ color: '#6b7280' }}>Operatori funebri</h4>
          {operatori.length === 0 && <p style={S.vuoto}>Nessun operatore.</p>}
          {operatori.map(p => (
            <div key={p.id} style={S.card}>
              <strong>{p.cognome} {p.nome}</strong>
              <div style={S.azioni}>
                <button style={S.btnDel} onClick={() => eliminaPersona(p.id)}>Elimina</button>
              </div>
            </div>
          ))}

          <h4 style={{ color: '#6b7280', marginTop: '1.5rem' }}>Direttori tecnici</h4>
          {direttori.length === 0 && <p style={S.vuoto}>Nessun direttore tecnico.</p>}
          {direttori.map(p => (
            <div key={p.id} style={S.card}>
              <strong>{p.cognome} {p.nome}</strong>
              <div style={S.azioni}>
                <button style={S.btnDel} onClick={() => eliminaPersona(p.id)}>Elimina</button>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}