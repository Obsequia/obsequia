import { useState } from 'react'
import { supabase } from '../supabase'
import { S, norm, CATEGORIE_INV, INV_VUOTO } from '../comune'

export default function Inventario({ inventario, ricarica, setMsg }) {
  const [inv, setInv] = useState(INV_VUOTO)
  const [invEditId, setInvEditId] = useState(null)
  const [cercaInv, setCercaInv] = useState('')
  const [filtroCatInv, setFiltroCatInv] = useState('')

  const inventarioFiltrato = inventario.filter(it => {
    if (filtroCatInv && it.categoria !== filtroCatInv) return false
    const q = norm(cercaInv)
    if (!q) return true
    return norm(`${it.nome} ${it.categoria} ${it.note}`).includes(q)
  })

  const articoliSottoScorta = inventario.filter(it => it.soglia > 0 && it.quantita <= it.soglia).length

  async function salvaArticolo() {
    if (!inv.nome) return setMsg('Il nome dell\'articolo è obbligatorio')
    const payload = {
      ...inv,
      quantita: inv.quantita === '' ? 0 : Number(inv.quantita),
      soglia: inv.soglia === '' ? 0 : Number(inv.soglia),
    }
    let error
    if (invEditId) {
      ({ error } = await supabase.from('inventario').update(payload).eq('id', invEditId))
    } else {
      ({ error } = await supabase.from('inventario').insert([payload]))
    }
    if (error) return setMsg('Errore: ' + error.message)
    setMsg(invEditId ? 'Articolo aggiornato!' : 'Articolo salvato!')
    annullaModificaArticolo()
    ricarica()
  }

  function modificaArticolo(it) {
    setInv({
      nome: it.nome || '', categoria: it.categoria || 'Generico',
      quantita: it.quantita ?? '', soglia: it.soglia ?? '', unita: it.unita || 'pz', note: it.note || '',
    })
    setInvEditId(it.id)
    setMsg('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function annullaModificaArticolo() {
    setInv(INV_VUOTO)
    setInvEditId(null)
  }

  async function eliminaArticolo(id) {
    if (!window.confirm('Eliminare questo articolo? L\'azione è definitiva.')) return
    const { error } = await supabase.from('inventario').delete().eq('id', id)
    if (error) return setMsg('Errore: ' + error.message)
    setMsg('Articolo eliminato.')
    ricarica()
  }

  async function cambiaQuantita(it, delta) {
    const nuova = Math.max(0, (it.quantita || 0) + delta)
    const { error } = await supabase.from('inventario').update({ quantita: nuova }).eq('id', it.id)
    if (error) return setMsg('Errore: ' + error.message)
    ricarica()
  }

  return (
    <div>
      <h2>Inventario / Magazzino</h2>

      {articoliSottoScorta > 0 && (
        <div style={S.bannerAllerta}>
          ⚠ {articoliSottoScorta} {articoliSottoScorta === 1 ? 'articolo è' : 'articoli sono'} sotto la soglia di scorta.
        </div>
      )}

      {invEditId && (
        <div style={S.bannerMod}>
          <span>✏️ Stai modificando un articolo</span>
          <button style={S.btnMod} onClick={annullaModificaArticolo}>Annulla</button>
        </div>
      )}
      <div style={S.col}>
        <div style={S.row}>
          <input style={{ flex: 2 }} placeholder="Nome articolo *" value={inv.nome} onChange={e => setInv({ ...inv, nome: e.target.value })} />
          <select style={{ flex: 1 }} value={inv.categoria} onChange={e => setInv({ ...inv, categoria: e.target.value })}>
            {CATEGORIE_INV.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div style={S.row}>
          <input style={{ flex: 1 }} type="number" placeholder="Quantità" value={inv.quantita} onChange={e => setInv({ ...inv, quantita: e.target.value })} />
          <input style={{ flex: 1 }} type="number" placeholder="Soglia allerta" value={inv.soglia} onChange={e => setInv({ ...inv, soglia: e.target.value })} />
          <input style={{ flex: 1 }} placeholder="Unità (pz, m...)" value={inv.unita} onChange={e => setInv({ ...inv, unita: e.target.value })} />
        </div>
        <textarea rows={2} placeholder="Note" value={inv.note} onChange={e => setInv({ ...inv, note: e.target.value })} />
        <button onClick={salvaArticolo}>{invEditId ? 'Aggiorna Articolo' : 'Salva Articolo'}</button>
      </div>

      <div style={S.row}>
        <input style={{ ...S.cerca, flex: 2 }} placeholder="🔍 Cerca articolo..." value={cercaInv} onChange={e => setCercaInv(e.target.value)} />
        <select style={{ flex: 1, height: '42px' }} value={filtroCatInv} onChange={e => setFiltroCatInv(e.target.value)}>
          <option value="">Tutte le categorie</option>
          {CATEGORIE_INV.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div style={S.conta}>{inventarioFiltrato.length} di {inventario.length}</div>

      {inventarioFiltrato.map(it => {
        const sottoScorta = it.soglia > 0 && it.quantita <= it.soglia
        return (
          <div key={it.id} style={sottoScorta ? S.cardAllerta : S.card}>
            <strong>{it.nome}</strong>
            <span style={{ ...S.badgeNeutro, marginLeft: '0.5rem' }}>{it.categoria}</span>
            {sottoScorta && <span style={{ ...S.badgeAllerta, marginLeft: '0.5rem' }}>⚠ scorta bassa</span>}
            <div style={{ fontSize: '1rem', marginTop: '0.3rem' }}>
              Quantità: <strong>{it.quantita}</strong> {it.unita}
              {it.soglia > 0 && <span style={{ fontSize: '0.8rem', opacity: 0.6 }}> (soglia: {it.soglia})</span>}
            </div>
            {it.note && <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>{it.note}</div>}
            <div style={S.azioni}>
              <button style={S.btnQta} onClick={() => cambiaQuantita(it, -1)}>−</button>
              <button style={S.btnQta} onClick={() => cambiaQuantita(it, +1)}>+</button>
              <button style={S.btnMod} onClick={() => modificaArticolo(it)}>Modifica</button>
              <button style={S.btnDel} onClick={() => eliminaArticolo(it.id)}>Elimina</button>
            </div>
          </div>
        )
      })}
    </div>
  )
}