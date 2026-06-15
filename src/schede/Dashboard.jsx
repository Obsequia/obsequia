import { S, coloreScad, fmtData, giorniA } from '../comune'

const PREAVVISO = 30

function testoGiorni(g) {
  if (g < 0) return `scaduta da ${Math.abs(g)} ${Math.abs(g) === 1 ? 'giorno' : 'giorni'}`
  if (g === 0) return 'oggi'
  return `tra ${g} ${g === 1 ? 'giorno' : 'giorni'}`
}

// ─── Stili specifici della Dashboard (colori della nostra palette) ───
const dash = {
  topRow: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'stretch', marginBottom: '1.5rem' },
  stats: { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '0.75rem', flex: '1 1 340px' },
  actions: { display: 'flex', flexDirection: 'column', gap: '0.5rem', justifyContent: 'center', flex: '1 1 200px' },
  btnPrim: { padding: '0.7rem 1rem', background: '#111827', color: '#fff', border: '1px solid #111827', borderRadius: '10px', cursor: 'pointer', fontSize: '0.95rem' },
  btnSec: { padding: '0.7rem 1rem', background: '#fff', color: '#374151', border: '1px solid #d1d5db', borderRadius: '10px', cursor: 'pointer', fontSize: '0.95rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' },
  panel: { border: '1px solid #e5e7eb', borderRadius: '12px', background: '#fff', padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column' },
  panelTit: { fontSize: '0.95rem', fontWeight: 600, color: '#1f2328', marginBottom: '0.5rem' },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 0', borderTop: '1px solid #f0f1f3', cursor: 'pointer' },
  rowTit: { fontSize: '0.9rem', fontWeight: 600, color: '#1f2328', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  rowSub: { fontSize: '0.78rem', color: '#6b7280', marginTop: '0.1rem' },
  rowRight: { display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 },
  chevron: { color: '#9ca3af', fontSize: '1.1rem' },
  vuoto: { fontSize: '0.85rem', color: '#9ca3af', fontStyle: 'italic', padding: '0.4rem 0' },
  vediTutto: { marginTop: 'auto', paddingTop: '0.7rem', textAlign: 'center', fontSize: '0.85rem', color: '#5b6470', cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'inherit' },
}

function Pannello({ titolo, onVediTutto, children }) {
  return (
    <div style={dash.panel}>
      <div style={dash.panelTit}>{titolo}</div>
      {children}
      {onVediTutto && <button style={dash.vediTutto} onClick={onVediTutto}>Vedi tutto ›</button>}
    </div>
  )
}

function Riga({ titolo, sottotitolo, destra, pallino, onClick, primo }) {
  return (
    <div style={{ ...dash.row, ...(primo ? { borderTop: 'none' } : null) }} onClick={onClick}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
        {pallino && <span style={{ ...S.scadPallino, background: pallino, flexShrink: 0 }}></span>}
        <div style={{ minWidth: 0 }}>
          <div style={dash.rowTit}>{titolo}</div>
          {sottotitolo && <div style={dash.rowSub}>{sottotitolo}</div>}
        </div>
      </div>
      <div style={dash.rowRight}>
        {destra}
        <span style={dash.chevron}>›</span>
      </div>
    </div>
  )
}

export default function Dashboard({ funerali, veicoli, naviga, apriFunerale }) {
  const oggi = new Date(); oggi.setHours(0, 0, 0, 0)

  // ─── Funerali in corso ───
  const funeraliInCorso = funerali.filter(f => (f.stato_pratica || 'In corso') === 'In corso')

  // ─── Prossimi funerali (oggi e futuri) ───
  const prossimiFunerali = funerali
    .filter(f => f.data_funerale)
    .map(f => ({ ...f, _d: new Date(f.data_funerale + 'T00:00:00') }))
    .filter(f => f._d >= oggi)
    .sort((a, b) => a._d - b._d)

  const funeraliOggi = prossimiFunerali.filter(f => f._d.getTime() === oggi.getTime()).length

  // ─── Anniversari del decesso (prossimi 30 giorni) ───
  const avvisiAnniv = []
  funerali.forEach(f => {
    if (!f.data_decesso) return
    const morte = new Date(f.data_decesso + 'T00:00:00')
    let anno = oggi.getFullYear()
    let ricorrenza = new Date(anno, morte.getMonth(), morte.getDate()); ricorrenza.setHours(0, 0, 0, 0)
    if (ricorrenza < oggi) {
      anno = anno + 1
      ricorrenza = new Date(anno, morte.getMonth(), morte.getDate()); ricorrenza.setHours(0, 0, 0, 0)
    }
    const giorni = Math.round((ricorrenza - oggi) / (1000 * 60 * 60 * 24))
    const anni = anno - morte.getFullYear()
    if (giorni <= PREAVVISO && anni >= 1) avvisiAnniv.push({ funerale: f, data: ricorrenza, giorni, anni })
  })
  avvisiAnniv.sort((a, b) => a.giorni - b.giorni)

  // ─── Promemoria: scadenze veicoli (entro 30 giorni o scadute) ───
  const avvisiVeicoli = []
  veicoli.forEach(v => {
    const scadenze = [
      { lbl: 'Assicurazione', d: v.scad_assicurazione },
      { lbl: 'Bollo', d: v.scad_bollo },
      { lbl: 'Revisione', d: v.scad_revisione },
      { lbl: 'Autorizzazione', d: v.scad_autorizzazione },
    ]
    scadenze.forEach(s => {
      const g = giorniA(s.d)
      if (g !== null && g <= PREAVVISO) avvisiVeicoli.push({ veicolo: v, tipo: s.lbl, data: s.d, giorni: g })
    })
  })
  avvisiVeicoli.sort((a, b) => a.giorni - b.giorni)

  return (
    <div>
      <h2>Dashboard</h2>

      {/* ─── Riga contatori + azioni ─── */}
      <div style={dash.topRow}>
        <div style={dash.stats}>
          <div style={S.statCard} onClick={() => naviga('funerali')}>
            <div style={S.statNum}>{funeraliOggi}</div>
            <div style={S.statLbl}>Funerali oggi</div>
          </div>
          <div style={S.statCard} onClick={() => naviga('funerali')}>
            <div style={S.statNum}>{prossimiFunerali.length}</div>
            <div style={S.statLbl}>Prossimi funerali</div>
          </div>
          <div style={S.statCard} onClick={() => naviga('avvisi')}>
            <div style={S.statNum}>{avvisiAnniv.length}</div>
            <div style={S.statLbl}>Anniversari in arrivo</div>
          </div>
        </div>
        <div style={dash.actions}>
          <button style={dash.btnPrim} onClick={() => naviga('funerali')}>+ Nuovo Funerale</button>
          <button style={dash.btnSec} onClick={() => naviga('clienti')}>+ Nuovo Cliente</button>
        </div>
      </div>

      {/* ─── Griglia 2×2 ─── */}
      <div style={dash.grid}>

        {/* Funerali in corso */}
        <Pannello titolo="Funerali in corso" onVediTutto={funeraliInCorso.length ? () => naviga('funerali') : null}>
          {funeraliInCorso.length === 0 && <div style={dash.vuoto}>Nessun funerale in corso.</div>}
          {funeraliInCorso.slice(0, 5).map((f, i) => {
            const luogo = f.comune || (f.clienti?.cognome ? `Fam. ${f.clienti.cognome}` : '')
            const sub = [luogo, f.data_funerale && fmtData(f.data_funerale)].filter(Boolean).join(' · ')
            return (
              <Riga key={f.id} primo={i === 0}
                titolo={`${f.defunto_cognome || ''} ${f.defunto_nome || ''}`.trim() || '—'}
                sottotitolo={sub}
                onClick={() => apriFunerale(f)} />
            )
          })}
        </Pannello>

        {/* Anniversari in arrivo */}
        <Pannello titolo="Anniversari in arrivo" onVediTutto={avvisiAnniv.length ? () => naviga('avvisi') : null}>
          {avvisiAnniv.length === 0 && <div style={dash.vuoto}>Nessun anniversario nei prossimi 30 giorni.</div>}
          {avvisiAnniv.slice(0, 5).map((a, i) => (
            <Riga key={`an${i}`} primo={i === 0}
              titolo={`${a.funerale.defunto_cognome || ''} ${a.funerale.defunto_nome || ''}`.trim() || '—'}
              sottotitolo={`${a.anni}° anniversario · ${fmtData(a.data)}`}
              onClick={() => apriFunerale(a.funerale)} />
          ))}
        </Pannello>

        {/* Prossimi funerali */}
        <Pannello titolo="Prossimi funerali" onVediTutto={prossimiFunerali.length ? () => naviga('funerali') : null}>
          {prossimiFunerali.length === 0 && <div style={dash.vuoto}>Nessun funerale in programma.</div>}
          {prossimiFunerali.slice(0, 5).map((f, i) => {
            const oggiStesso = f._d.getTime() === oggi.getTime()
            const sub = [f.comune, fmtData(f.data_funerale), f.ora_funerale && f.ora_funerale.slice(0, 5)].filter(Boolean).join(' · ')
            return (
              <Riga key={f.id} primo={i === 0}
                titolo={`${f.defunto_cognome || ''} ${f.defunto_nome || ''}`.trim() || '—'}
                sottotitolo={sub}
                destra={oggiStesso ? <span style={{ ...S.oggiBadge, marginLeft: 0 }}>OGGI</span> : null}
                onClick={() => apriFunerale(f)} />
            )
          })}
        </Pannello>

        {/* Promemoria (scadenze veicoli) */}
        <Pannello titolo="Promemoria" onVediTutto={avvisiVeicoli.length ? () => naviga('avvisi') : null}>
          {avvisiVeicoli.length === 0 && <div style={dash.vuoto}>Nessuna scadenza imminente.</div>}
          {avvisiVeicoli.slice(0, 5).map((a, i) => (
            <Riga key={`ve${i}`} primo={i === 0}
              pallino={coloreScad(a.data)}
              titolo={`${a.tipo} · ${a.veicolo.targa}`}
              sottotitolo={`${fmtData(a.data)} · ${testoGiorni(a.giorni)}`}
              onClick={() => naviga('veicoli')} />
          ))}
        </Pannello>

      </div>
    </div>
  )
}