import { useState } from 'react'
import { supabase } from '../supabase'
import { S, btnSub, norm, giorniA, coloreScad, fmtData, fmtEuro, VEIC_VUOTO, MANUT_VUOTA } from '../comune'

export default function Veicoli({ veicoli, manutenzioni, ricarica, setMsg }) {
  const [sottoPaginaV, setSottoPaginaV] = useState('veicoli')

  const [veic, setVeic] = useState(VEIC_VUOTO)
  const [veicEditId, setVeicEditId] = useState(null)
  const [cercaVeic, setCercaVeic] = useState('')

  const [manut, setManut] = useState(MANUT_VUOTA)
  const [manutEditId, setManutEditId] = useState(null)
  const [filtroVeicManut, setFiltroVeicManut] = useState('')

  const veicoliFiltrati = veicoli.filter(v => {
    const q = norm(cercaVeic)
    if (!q) return true
    return norm(`${v.targa} ${v.descrizione}`).includes(q)
  })

  const manutenzioniFiltrate = manutenzioni.filter(m => {
    if (!filtroVeicManut) return true
    return String(m.veicolo_id) === String(filtroVeicManut)
  })

  const scadenzeImminenti = veicoli.reduce((acc, v) => {
    [v.scad_assicurazione, v.scad_bollo, v.scad_revisione, v.scad_autorizzazione].forEach(d => {
      const g = giorniA(d)
      if (g !== null && g <= 30) acc++
    })
    return acc
  }, 0)

  // ─── VEICOLI ───
  async function salvaVeicolo() {
    if (!veic.targa) return setMsg('La targa è obbligatoria')
    const payload = {
      ...veic,
      scad_assicurazione: veic.scad_assicurazione || null,
      scad_bollo: veic.scad_bollo || null,
      scad_revisione: veic.scad_revisione || null,
      scad_autorizzazione: veic.scad_autorizzazione || null,
    }
    let error
    if (veicEditId) {
      ({ error } = await supabase.from('veicoli').update(payload).eq('id', veicEditId))
    } else {
      ({ error } = await supabase.from('veicoli').insert([payload]))
    }
    if (error) return setMsg('Errore: ' + error.message)
    setMsg(veicEditId ? 'Veicolo aggiornato!' : 'Veicolo salvato!')
    annullaModificaVeicolo()
    ricarica()
  }

  function modificaVeicolo(v) {
    setVeic({
      targa: v.targa || '', descrizione: v.descrizione || '',
      scad_assicurazione: v.scad_assicurazione || '', scad_bollo: v.scad_bollo || '',
      scad_revisione: v.scad_revisione || '', scad_autorizzazione: v.scad_autorizzazione || '',
      note: v.note || '',
    })
    setVeicEditId(v.id)
    setMsg('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function annullaModificaVeicolo() {
    setVeic(VEIC_VUOTO)
    setVeicEditId(null)
  }

  async function eliminaVeicolo(id) {
    if (!window.confirm('Eliminare questo veicolo? Verranno eliminate anche le sue manutenzioni. L\'azione è definitiva.')) return
    const { error } = await supabase.from('veicoli').delete().eq('id', id)
    if (error) return setMsg('Errore: ' + error.message)
    setMsg('Veicolo eliminato.')
    ricarica()
  }

  // ─── MANUTENZIONI ───
  async function salvaManutenzione() {
    if (!manut.veicolo_id) return setMsg('Seleziona un veicolo')
    const payload = {
      ...manut,
      veicolo_id: Number(manut.veicolo_id),
      data: manut.data || null,
      costo: manut.costo === '' ? 0 : Number(manut.costo),
    }
    let error
    if (manutEditId) {
      ({ error } = await supabase.from('manutenzioni').update(payload).eq('id', manutEditId))
    } else {
      ({ error } = await supabase.from('manutenzioni').insert([payload]))
    }
    if (error) return setMsg('Errore: ' + error.message)
    setMsg(manutEditId ? 'Manutenzione aggiornata!' : 'Manutenzione salvata!')
    annullaModificaManutenzione()
    ricarica()
  }

  function modificaManutenzione(m) {
    setManut({
      veicolo_id: m.veicolo_id || '', data: m.data || '', descrizione: m.descrizione || '',
      costo: m.costo ?? '', officina: m.officina || '',
    })
    setManutEditId(m.id)
    setMsg('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function annullaModificaManutenzione() {
    setManut(MANUT_VUOTA)
    setManutEditId(null)
  }

  async function eliminaManutenzione(id) {
    if (!window.confirm('Eliminare questa manutenzione? L\'azione è definitiva.')) return
    const { error } = await supabase.from('manutenzioni').delete().eq('id', id)
    if (error) return setMsg('Errore: ' + error.message)
    setMsg('Manutenzione eliminata.')
    ricarica()
  }

  return (
    <div>
      <h2>Veicoli e Manutenzioni</h2>

      {scadenzeImminenti > 0 && (
        <div style={S.bannerAllerta}>
          ⚠ {scadenzeImminenti} {scadenzeImminenti === 1 ? 'scadenza è imminente o scaduta' : 'scadenze sono imminenti o scadute'} (entro 30 giorni).
        </div>
      )}

      <div style={S.subnav}>
        <button style={btnSub(sottoPaginaV === 'veicoli')} onClick={() => { setSottoPaginaV('veicoli'); setMsg('') }}>Veicoli</button>
        <button style={btnSub(sottoPaginaV === 'manutenzioni')} onClick={() => { setSottoPaginaV('manutenzioni'); setMsg('') }}>Manutenzioni</button>
      </div>

      {sottoPaginaV === 'veicoli' && (
        <div>
          {veicEditId && (
            <div style={S.bannerMod}>
              <span>✏️ Stai modificando un veicolo</span>
              <button style={S.btnMod} onClick={annullaModificaVeicolo}>Annulla</button>
            </div>
          )}
          <div style={S.col}>
            <div style={S.row}>
              <input style={{ flex: 1 }} placeholder="Targa *" value={veic.targa} onChange={e => setVeic({ ...veic, targa: e.target.value })} />
              <input style={{ flex: 2 }} placeholder="Descrizione (es. Mercedes carro funebre)" value={veic.descrizione} onChange={e => setVeic({ ...veic, descrizione: e.target.value })} />
            </div>
            <label style={S.label}>Scadenza assicurazione</label>
            <input type="date" value={veic.scad_assicurazione} onChange={e => setVeic({ ...veic, scad_assicurazione: e.target.value })} />
            <label style={S.label}>Scadenza bollo</label>
            <input type="date" value={veic.scad_bollo} onChange={e => setVeic({ ...veic, scad_bollo: e.target.value })} />
            <label style={S.label}>Scadenza revisione</label>
            <input type="date" value={veic.scad_revisione} onChange={e => setVeic({ ...veic, scad_revisione: e.target.value })} />
            <label style={S.label}>Scadenza autorizzazione sanitaria (se presente)</label>
            <input type="date" value={veic.scad_autorizzazione} onChange={e => setVeic({ ...veic, scad_autorizzazione: e.target.value })} />
            <textarea rows={2} placeholder="Note" value={veic.note} onChange={e => setVeic({ ...veic, note: e.target.value })} />
            <button onClick={salvaVeicolo}>{veicEditId ? 'Aggiorna Veicolo' : 'Salva Veicolo'}</button>
          </div>

          <input style={S.cerca} placeholder="🔍 Cerca veicolo per targa, descrizione..." value={cercaVeic} onChange={e => setCercaVeic(e.target.value)} />
          <div style={S.conta}>{veicoliFiltrati.length} di {veicoli.length}</div>

          {veicoliFiltrati.map(v => {
            const scadenze = [
              { lbl: 'Assicurazione', d: v.scad_assicurazione },
              { lbl: 'Bollo', d: v.scad_bollo },
              { lbl: 'Revisione', d: v.scad_revisione },
              { lbl: 'Autorizzazione', d: v.scad_autorizzazione },
            ]
            return (
              <div key={v.id} style={S.card}>
                <strong>{v.targa}</strong>
                {v.descrizione && <span> — {v.descrizione}</span>}
                <div style={{ marginTop: '0.5rem' }}>
                  {scadenze.map(s => (
                    <div key={s.lbl} style={S.scad}>
                      <span>
                        <span style={{ ...S.scadPallino, background: coloreScad(s.d) }}></span>
                        {s.lbl}
                      </span>
                      <span style={{ opacity: 0.85 }}>{s.d ? fmtData(s.d) : '—'}</span>
                    </div>
                  ))}
                </div>
                {v.note && <div style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '0.4rem' }}>{v.note}</div>}
                <div style={S.azioni}>
                  <button style={S.btnMod} onClick={() => modificaVeicolo(v)}>Modifica</button>
                  <button style={S.btnDel} onClick={() => eliminaVeicolo(v.id)}>Elimina</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {sottoPaginaV === 'manutenzioni' && (
        <div>
          {manutEditId && (
            <div style={S.bannerMod}>
              <span>✏️ Stai modificando una manutenzione</span>
              <button style={S.btnMod} onClick={annullaModificaManutenzione}>Annulla</button>
            </div>
          )}
          {veicoli.length === 0 ? (
            <p style={S.vuoto}>Per registrare una manutenzione, aggiungi prima almeno un veicolo.</p>
          ) : (
            <div style={S.col}>
              <label style={S.label}>Veicolo *</label>
              <select value={manut.veicolo_id} onChange={e => setManut({ ...manut, veicolo_id: e.target.value })}>
                <option value="">— Seleziona veicolo —</option>
                {veicoli.map(v => <option key={v.id} value={v.id}>{v.targa}{v.descrizione ? ` — ${v.descrizione}` : ''}</option>)}
              </select>
              <div style={S.row}>
                <input style={{ flex: 1 }} type="date" value={manut.data} onChange={e => setManut({ ...manut, data: e.target.value })} />
                <input style={{ flex: 1 }} type="number" step="0.01" placeholder="Costo €" value={manut.costo} onChange={e => setManut({ ...manut, costo: e.target.value })} />
              </div>
              <input placeholder="Officina" value={manut.officina} onChange={e => setManut({ ...manut, officina: e.target.value })} />
              <textarea rows={2} placeholder="Descrizione intervento" value={manut.descrizione} onChange={e => setManut({ ...manut, descrizione: e.target.value })} />
              <button onClick={salvaManutenzione}>{manutEditId ? 'Aggiorna Manutenzione' : 'Salva Manutenzione'}</button>
            </div>
          )}

          {veicoli.length > 0 && (
            <div style={S.row}>
              <select style={{ ...S.cerca, flex: 1 }} value={filtroVeicManut} onChange={e => setFiltroVeicManut(e.target.value)}>
                <option value="">Tutti i veicoli</option>
                {veicoli.map(v => <option key={v.id} value={v.id}>{v.targa}{v.descrizione ? ` — ${v.descrizione}` : ''}</option>)}
              </select>
            </div>
          )}

          <div style={S.conta}>{manutenzioniFiltrate.length} manutenzioni {filtroVeicManut ? 'per il veicolo selezionato' : 'totali'}</div>

          {manutenzioniFiltrate.map(m => (
            <div key={m.id} style={S.card}>
              <strong>{m.veicoli?.targa || 'Veicolo eliminato'}</strong>
              {m.data && <span> — {fmtData(m.data)}</span>}
              {m.costo > 0 && <span style={{ ...S.badgeNeutro, marginLeft: '0.5rem' }}>{fmtEuro(m.costo)}</span>}
              {m.descrizione && <div style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '0.3rem' }}>{m.descrizione}</div>}
              {m.officina && <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>Officina: {m.officina}</div>}
              <div style={S.azioni}>
                <button style={S.btnMod} onClick={() => modificaManutenzione(m)}>Modifica</button>
                <button style={S.btnDel} onClick={() => eliminaManutenzione(m.id)}>Elimina</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}