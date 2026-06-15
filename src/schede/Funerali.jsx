import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { S, norm, coloreStato, fmtData, GENERI, TIPI, TIPI_DOC, STATI, FUN_VUOTO } from '../comune'

export default function Funerali({ funerali, clienti, ricarica, setMsg, funeraleDaAprire, setFuneraleDaAprire }) {
  const [fun, setFun] = useState(FUN_VUOTO)
  const [funEditId, setFunEditId] = useState(null)
  const [cercaFun, setCercaFun] = useState('')

  // Se arrivo qui cliccando "Apri" dalla Dashboard, apro subito quel funerale in modifica
  useEffect(() => {
    if (funeraleDaAprire) {
      modificaFunerale(funeraleDaAprire)
      setFuneraleDaAprire(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [funeraleDaAprire])

  const funeraliFiltrati = funerali.filter(f => {
    const q = norm(cercaFun)
    if (!q) return true
    return norm(`${f.defunto_nome} ${f.defunto_cognome} ${f.clienti?.nome} ${f.clienti?.cognome} ${f.chiesa} ${f.comune}`).includes(q)
  })

  async function salvaFunerale() {
    if (!fun.cliente_id || !fun.defunto_nome || !fun.defunto_cognome) return setMsg('Famiglia, nome e cognome defunto obbligatori')
    const payload = {
      ...fun,
      defunto_data_nascita: fun.defunto_data_nascita || null,
      defunto_doc_rilascio: fun.defunto_doc_rilascio || null,
      defunto_doc_scadenza: fun.defunto_doc_scadenza || null,
      data_decesso: fun.data_decesso || null,
      ora_decesso: fun.ora_decesso || null,
      data_funerale: fun.data_funerale || null,
      ora_funerale: fun.ora_funerale || null,
    }
    let error
    if (funEditId) {
      ({ error } = await supabase.from('funerali').update(payload).eq('id', funEditId))
    } else {
      ({ error } = await supabase.from('funerali').insert([payload]))
    }
    if (error) return setMsg('Errore: ' + error.message)
    setMsg(funEditId ? 'Funerale aggiornato!' : 'Funerale salvato!')
    annullaModificaFunerale()
    ricarica()
  }

  function modificaFunerale(f) {
    setFun({
      cliente_id: f.cliente_id || '', defunto_nome: f.defunto_nome || '', defunto_cognome: f.defunto_cognome || '',
      defunto_luogo_nascita: f.defunto_luogo_nascita || '', defunto_data_nascita: f.defunto_data_nascita || '',
      defunto_indirizzo: f.defunto_indirizzo || '', defunto_codice_fiscale: f.defunto_codice_fiscale || '',
      defunto_doc_tipo: f.defunto_doc_tipo || '', defunto_doc_numero: f.defunto_doc_numero || '',
      defunto_doc_rilascio: f.defunto_doc_rilascio || '', defunto_doc_scadenza: f.defunto_doc_scadenza || '',
      luogo_decesso: f.luogo_decesso || '', data_decesso: f.data_decesso || '', ora_decesso: f.ora_decesso || '',
      data_funerale: f.data_funerale || '', ora_funerale: f.ora_funerale || '', luogo_partenza: f.luogo_partenza || '',
      chiesa: f.chiesa || '', cimitero_crematorio: f.cimitero_crematorio || '',
      genere: f.genere || '', tipo: f.tipo || 'Sepoltura', comune: f.comune || '', stato_pratica: f.stato_pratica || 'In corso',
    })
    setFunEditId(f.id)
    setMsg('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function annullaModificaFunerale() {
    setFun(FUN_VUOTO)
    setFunEditId(null)
  }

  async function eliminaFunerale(id) {
    if (!window.confirm('Eliminare questo funerale? L\'azione è definitiva.')) return
    const { error } = await supabase.from('funerali').delete().eq('id', id)
    if (error) return setMsg('Errore: ' + error.message)
    setMsg('Funerale eliminato.')
    ricarica()
  }

  return (
    <div>
      <h2>Gestione Funerali (defunto + esequie)</h2>
      {funEditId && (
        <div style={S.bannerMod}>
          <span>✏️ Stai modificando un funerale</span>
          <button style={S.btnMod} onClick={annullaModificaFunerale}>Annulla</button>
        </div>
      )}
      <div style={S.col}>
        <label style={S.label}>Famiglia committente *</label>
        <select value={fun.cliente_id} onChange={e => setFun({ ...fun, cliente_id: e.target.value })}>
          <option value="">— Seleziona famiglia —</option>
          {clienti.map(c => <option key={c.id} value={c.id}>{c.cognome} {c.nome}</option>)}
        </select>

        <label style={S.label}>Dati del defunto</label>
        <div style={S.row}>
          <input style={{ flex: 1 }} placeholder="Nome defunto *" value={fun.defunto_nome} onChange={e => setFun({ ...fun, defunto_nome: e.target.value })} />
          <input style={{ flex: 1 }} placeholder="Cognome defunto *" value={fun.defunto_cognome} onChange={e => setFun({ ...fun, defunto_cognome: e.target.value })} />
        </div>
        <div style={S.row}>
          <select style={{ flex: 1 }} value={fun.genere} onChange={e => setFun({ ...fun, genere: e.target.value })}>
            <option value="">— Genere —</option>
            {GENERI.filter(g => g).map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <input style={{ flex: 1 }} placeholder="Luogo di nascita" value={fun.defunto_luogo_nascita} onChange={e => setFun({ ...fun, defunto_luogo_nascita: e.target.value })} />
        </div>
        <div style={S.row}>
          <input style={{ flex: 1 }} type="date" value={fun.defunto_data_nascita} onChange={e => setFun({ ...fun, defunto_data_nascita: e.target.value })} />
          <input style={{ flex: 1 }} placeholder="Codice Fiscale defunto" value={fun.defunto_codice_fiscale} onChange={e => setFun({ ...fun, defunto_codice_fiscale: e.target.value })} />
        </div>
        <input placeholder="Indirizzo defunto" value={fun.defunto_indirizzo} onChange={e => setFun({ ...fun, defunto_indirizzo: e.target.value })} />

        <label style={S.label}>Documento di riconoscimento del defunto</label>
        <div style={S.row}>
          <select style={{ flex: 1 }} value={fun.defunto_doc_tipo} onChange={e => setFun({ ...fun, defunto_doc_tipo: e.target.value })}>
            <option value="">— Tipo documento —</option>
            {TIPI_DOC.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <input style={{ flex: 1 }} placeholder="Numero documento" value={fun.defunto_doc_numero} onChange={e => setFun({ ...fun, defunto_doc_numero: e.target.value })} />
        </div>
        <label style={S.label}>Rilascio / Scadenza documento</label>
        <div style={S.row}>
          <input style={{ flex: 1 }} type="date" value={fun.defunto_doc_rilascio} onChange={e => setFun({ ...fun, defunto_doc_rilascio: e.target.value })} />
          <input style={{ flex: 1 }} type="date" value={fun.defunto_doc_scadenza} onChange={e => setFun({ ...fun, defunto_doc_scadenza: e.target.value })} />
        </div>

        <label style={S.label}>Decesso</label>
        <input placeholder="Luogo del decesso" value={fun.luogo_decesso} onChange={e => setFun({ ...fun, luogo_decesso: e.target.value })} />
        <div style={S.row}>
          <input style={{ flex: 1 }} type="date" value={fun.data_decesso} onChange={e => setFun({ ...fun, data_decesso: e.target.value })} />
          <input style={{ flex: 1 }} type="time" value={fun.ora_decesso} onChange={e => setFun({ ...fun, ora_decesso: e.target.value })} />
        </div>

        <label style={S.label}>Esequie</label>
        <div style={S.row}>
          <input style={{ flex: 1 }} type="date" value={fun.data_funerale} onChange={e => setFun({ ...fun, data_funerale: e.target.value })} />
          <input style={{ flex: 1 }} type="time" value={fun.ora_funerale} onChange={e => setFun({ ...fun, ora_funerale: e.target.value })} />
        </div>
        <input placeholder="Luogo di partenza" value={fun.luogo_partenza} onChange={e => setFun({ ...fun, luogo_partenza: e.target.value })} />
        <input placeholder="Chiesa" value={fun.chiesa} onChange={e => setFun({ ...fun, chiesa: e.target.value })} />
        <input placeholder="Cimitero / Crematorio" value={fun.cimitero_crematorio} onChange={e => setFun({ ...fun, cimitero_crematorio: e.target.value })} />

        <label style={S.label}>Classificazione</label>
        <div style={S.row}>
          <select style={{ flex: 1 }} value={fun.tipo} onChange={e => setFun({ ...fun, tipo: e.target.value })}>
            {TIPI.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <input style={{ flex: 1 }} placeholder="Comune" value={fun.comune} onChange={e => setFun({ ...fun, comune: e.target.value })} />
        </div>
        <label style={S.label}>Stato pratica</label>
        <select value={fun.stato_pratica} onChange={e => setFun({ ...fun, stato_pratica: e.target.value })}>
          {STATI.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <button onClick={salvaFunerale}>{funEditId ? 'Aggiorna Funerale' : 'Salva Funerale'}</button>
      </div>

      <input style={S.cerca} placeholder="🔍 Cerca per defunto, famiglia, chiesa, comune..." value={cercaFun} onChange={e => setCercaFun(e.target.value)} />
      <div style={S.conta}>{funeraliFiltrati.length} di {funerali.length}</div>

      {funeraliFiltrati.map(f => (
        <div key={f.id} style={S.card}>
          <strong>{f.defunto_cognome} {f.defunto_nome}</strong>
          <span style={{ ...S.badge, ...coloreStato(f.stato_pratica) }}>{f.stato_pratica}</span>
          <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>
            Famiglia: {f.clienti?.cognome} {f.clienti?.nome}
            {f.data_funerale && ` — Esequie: ${fmtData(f.data_funerale)}`}
            {f.tipo && ` — ${f.tipo}`}
            {f.comune && ` — ${f.comune}`}
          </div>
          <div style={S.azioni}>
            <button style={S.btnMod} onClick={() => modificaFunerale(f)}>Modifica</button>
            <button style={S.btnDel} onClick={() => eliminaFunerale(f.id)}>Elimina</button>
          </div>
        </div>
      ))}
    </div>
  )
}