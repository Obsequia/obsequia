import { useState } from 'react'
import { supabase } from '../supabase'
import { S, btnSub, norm, coloreStatoPag, fmtData, fmtEuro, STATI_PAG, FORN_VUOTO, FATT_VUOTA } from '../comune'

export default function Fornitori({ fornitori, fatture, ricarica, setMsg }) {
  const [sottoPagina, setSottoPagina] = useState('fornitori')

  const [forn, setForn] = useState(FORN_VUOTO)
  const [fornEditId, setFornEditId] = useState(null)
  const [cercaForn, setCercaForn] = useState('')

  const [fatt, setFatt] = useState(FATT_VUOTA)
  const [fattEditId, setFattEditId] = useState(null)
  const [cercaFatt, setCercaFatt] = useState('')

  const fornitoriFiltrati = fornitori.filter(fo => {
    const q = norm(cercaForn)
    if (!q) return true
    return norm(`${fo.nome} ${fo.categoria} ${fo.telefono} ${fo.partita_iva}`).includes(q)
  })

  const fattureFiltrate = fatture.filter(fa => {
    const q = norm(cercaFatt)
    if (!q) return true
    return norm(`${fa.numero} ${fa.descrizione} ${fa.fornitori?.nome}`).includes(q)
  })

  const totaleDaIncassare = fatture
    .filter(fa => fa.stato_pagamento !== 'Pagata')
    .reduce((s, fa) => s + (Number(fa.importo) || 0), 0)
  const totaleFatture = fatture.reduce((s, fa) => s + (Number(fa.importo) || 0), 0)

  // ─── FORNITORI ───
  async function salvaFornitore() {
    if (!forn.nome) return setMsg('Il nome del fornitore è obbligatorio')
    let error
    if (fornEditId) {
      ({ error } = await supabase.from('fornitori').update(forn).eq('id', fornEditId))
    } else {
      ({ error } = await supabase.from('fornitori').insert([forn]))
    }
    if (error) return setMsg('Errore: ' + error.message)
    setMsg(fornEditId ? 'Fornitore aggiornato!' : 'Fornitore salvato!')
    annullaModificaFornitore()
    ricarica()
  }

  function modificaFornitore(fo) {
    setForn({
      nome: fo.nome || '', categoria: fo.categoria || '', telefono: fo.telefono || '',
      email: fo.email || '', partita_iva: fo.partita_iva || '', note: fo.note || '',
    })
    setFornEditId(fo.id)
    setMsg('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function annullaModificaFornitore() {
    setForn(FORN_VUOTO)
    setFornEditId(null)
  }

  async function eliminaFornitore(id) {
    if (!window.confirm('Eliminare questo fornitore? L\'azione è definitiva.')) return
    const { error } = await supabase.from('fornitori').delete().eq('id', id)
    if (error) return setMsg('Errore: ' + error.message)
    setMsg('Fornitore eliminato.')
    ricarica()
  }

  // ─── FATTURE ───
  async function salvaFattura() {
    if (!fatt.fornitore_id) return setMsg('Seleziona un fornitore')
    const payload = {
      ...fatt,
      fornitore_id: Number(fatt.fornitore_id),
      data_fattura: fatt.data_fattura || null,
      importo: fatt.importo === '' ? 0 : Number(fatt.importo),
    }
    let error
    if (fattEditId) {
      ({ error } = await supabase.from('fatture').update(payload).eq('id', fattEditId))
    } else {
      ({ error } = await supabase.from('fatture').insert([payload]))
    }
    if (error) return setMsg('Errore: ' + error.message)
    setMsg(fattEditId ? 'Fattura aggiornata!' : 'Fattura salvata!')
    annullaModificaFattura()
    ricarica()
  }

  function modificaFattura(fa) {
    setFatt({
      fornitore_id: fa.fornitore_id || '', numero: fa.numero || '', data_fattura: fa.data_fattura || '',
      importo: fa.importo ?? '', stato_pagamento: fa.stato_pagamento || 'Da pagare', descrizione: fa.descrizione || '',
    })
    setFattEditId(fa.id)
    setMsg('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function annullaModificaFattura() {
    setFatt(FATT_VUOTA)
    setFattEditId(null)
  }

  async function eliminaFattura(id) {
    if (!window.confirm('Eliminare questa fattura? L\'azione è definitiva.')) return
    const { error } = await supabase.from('fatture').delete().eq('id', id)
    if (error) return setMsg('Errore: ' + error.message)
    setMsg('Fattura eliminata.')
    ricarica()
  }

  return (
    <div>
      <h2>Fornitori e Fatture</h2>
      <div style={S.subnav}>
        <button style={btnSub(sottoPagina === 'fornitori')} onClick={() => { setSottoPagina('fornitori'); setMsg('') }}>Fornitori</button>
        <button style={btnSub(sottoPagina === 'fatture')} onClick={() => { setSottoPagina('fatture'); setMsg('') }}>Fatture</button>
      </div>

      {sottoPagina === 'fornitori' && (
        <div>
          {fornEditId && (
            <div style={S.bannerMod}>
              <span>✏️ Stai modificando un fornitore</span>
              <button style={S.btnMod} onClick={annullaModificaFornitore}>Annulla</button>
            </div>
          )}
          <div style={S.col}>
            <div style={S.row}>
              <input style={{ flex: 2 }} placeholder="Nome / ragione sociale *" value={forn.nome} onChange={e => setForn({ ...forn, nome: e.target.value })} />
              <input style={{ flex: 1 }} placeholder="Categoria (es. Fioraio)" value={forn.categoria} onChange={e => setForn({ ...forn, categoria: e.target.value })} />
            </div>
            <div style={S.row}>
              <input style={{ flex: 1 }} placeholder="Telefono" value={forn.telefono} onChange={e => setForn({ ...forn, telefono: e.target.value })} />
              <input style={{ flex: 1 }} placeholder="Email" value={forn.email} onChange={e => setForn({ ...forn, email: e.target.value })} />
            </div>
            <input placeholder="Partita IVA" value={forn.partita_iva} onChange={e => setForn({ ...forn, partita_iva: e.target.value })} />
            <textarea rows={2} placeholder="Note" value={forn.note} onChange={e => setForn({ ...forn, note: e.target.value })} />
            <button onClick={salvaFornitore}>{fornEditId ? 'Aggiorna Fornitore' : 'Salva Fornitore'}</button>
          </div>

          <input style={S.cerca} placeholder="🔍 Cerca fornitore per nome, categoria..." value={cercaForn} onChange={e => setCercaForn(e.target.value)} />
          <div style={S.conta}>{fornitoriFiltrati.length} di {fornitori.length}</div>

          {fornitoriFiltrati.map(fo => (
            <div key={fo.id} style={S.card}>
              <strong>{fo.nome}</strong>
              {fo.categoria && <span style={{ ...S.badgeNeutro, marginLeft: '0.5rem' }}>{fo.categoria}</span>}
              <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>
                {fo.telefono && `${fo.telefono}`}
                {fo.email && ` — ${fo.email}`}
                {fo.partita_iva && ` — P.IVA ${fo.partita_iva}`}
              </div>
              {fo.note && <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>{fo.note}</div>}
              <div style={S.azioni}>
                <button style={S.btnMod} onClick={() => modificaFornitore(fo)}>Modifica</button>
                <button style={S.btnDel} onClick={() => eliminaFornitore(fo.id)}>Elimina</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {sottoPagina === 'fatture' && (
        <div>
          <div style={S.statGrid}>
            <div style={S.statCard}>
              <div style={{ ...S.statNum, fontSize: '1.4rem' }}>{fmtEuro(totaleDaIncassare)}</div>
              <div style={S.statLbl}>Da pagare</div>
            </div>
            <div style={S.statCard}>
              <div style={{ ...S.statNum, fontSize: '1.4rem' }}>{fmtEuro(totaleFatture)}</div>
              <div style={S.statLbl}>Totale fatture</div>
            </div>
          </div>

          {fattEditId && (
            <div style={S.bannerMod}>
              <span>✏️ Stai modificando una fattura</span>
              <button style={S.btnMod} onClick={annullaModificaFattura}>Annulla</button>
            </div>
          )}
          {fornitori.length === 0 ? (
            <p style={S.vuoto}>Per registrare una fattura, aggiungi prima almeno un fornitore.</p>
          ) : (
            <div style={S.col}>
              <label style={S.label}>Fornitore *</label>
              <select value={fatt.fornitore_id} onChange={e => setFatt({ ...fatt, fornitore_id: e.target.value })}>
                <option value="">— Seleziona fornitore —</option>
                {fornitori.map(fo => <option key={fo.id} value={fo.id}>{fo.nome}</option>)}
              </select>
              <div style={S.row}>
                <input style={{ flex: 1 }} placeholder="N° fattura" value={fatt.numero} onChange={e => setFatt({ ...fatt, numero: e.target.value })} />
                <input style={{ flex: 1 }} type="date" value={fatt.data_fattura} onChange={e => setFatt({ ...fatt, data_fattura: e.target.value })} />
              </div>
              <div style={S.row}>
                <input style={{ flex: 1 }} type="number" step="0.01" placeholder="Importo €" value={fatt.importo} onChange={e => setFatt({ ...fatt, importo: e.target.value })} />
                <select style={{ flex: 1 }} value={fatt.stato_pagamento} onChange={e => setFatt({ ...fatt, stato_pagamento: e.target.value })}>
                  {STATI_PAG.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <textarea rows={2} placeholder="Descrizione" value={fatt.descrizione} onChange={e => setFatt({ ...fatt, descrizione: e.target.value })} />
              <button onClick={salvaFattura}>{fattEditId ? 'Aggiorna Fattura' : 'Salva Fattura'}</button>
            </div>
          )}

          <input style={S.cerca} placeholder="🔍 Cerca fattura per numero, fornitore..." value={cercaFatt} onChange={e => setCercaFatt(e.target.value)} />
          <div style={S.conta}>{fattureFiltrate.length} di {fatture.length}</div>

          {fattureFiltrate.map(fa => (
            <div key={fa.id} style={S.card}>
              <strong>{fa.fornitori?.nome || 'Fornitore eliminato'}</strong>
              {fa.numero && <span> — N° {fa.numero}</span>}
              <span style={{ ...S.badge, ...coloreStatoPag(fa.stato_pagamento) }}>{fa.stato_pagamento}</span>
              <div style={{ fontSize: '0.95rem', marginTop: '0.3rem' }}><strong>{fmtEuro(fa.importo)}</strong></div>
              <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>
                {fa.data_fattura && fmtData(fa.data_fattura)}
                {fa.descrizione && ` — ${fa.descrizione}`}
              </div>
              <div style={S.azioni}>
                <button style={S.btnMod} onClick={() => modificaFattura(fa)}>Modifica</button>
                <button style={S.btnDel} onClick={() => eliminaFattura(fa.id)}>Elimina</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}