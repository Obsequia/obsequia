import { S, coloreScad, fmtData, giorniA } from '../comune'

// Preavviso usato per veicoli e anniversari
const PREAVVISO = 30

function testoGiorni(g) {
  if (g < 0) return `scaduta da ${Math.abs(g)} ${Math.abs(g) === 1 ? 'giorno' : 'giorni'}`
  if (g === 0) return 'oggi'
  return `tra ${g} ${g === 1 ? 'giorno' : 'giorni'}`
}

export default function Avvisi({ veicoli, funerali, naviga, apriFunerale }) {
  // ─── Scadenze veicoli (entro 30 giorni o gia' scadute) ───
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
      if (g !== null && g <= PREAVVISO) {
        avvisiVeicoli.push({ veicolo: v, tipo: s.lbl, data: s.d, giorni: g })
      }
    })
  })
  avvisiVeicoli.sort((a, b) => a.giorni - b.giorni)

  // ─── Anniversari annuali del decesso (prossimi 30 giorni) ───
  const oggi = new Date(); oggi.setHours(0, 0, 0, 0)
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
    if (giorni <= PREAVVISO && anni >= 1) {
      avvisiAnniv.push({ funerale: f, data: ricorrenza, giorni, anni })
    }
  })
  avvisiAnniv.sort((a, b) => a.giorni - b.giorni)

  const totale = avvisiVeicoli.length + avvisiAnniv.length

  return (
    <div>
      <h2>Avvisi</h2>
      <div style={S.conta}>
        {totale === 0
          ? 'Nessuna scadenza o ricorrenza nei prossimi 30 giorni.'
          : `${totale} ${totale === 1 ? 'avviso' : 'avvisi'} nei prossimi 30 giorni`}
      </div>

      {/* ─── SCADENZE VEICOLI ─── */}
      <h3>🚐 Scadenze veicoli</h3>
      {avvisiVeicoli.length === 0 && <p style={S.vuoto}>Nessuna scadenza imminente o scaduta.</p>}
      {avvisiVeicoli.map((a, i) => (
        <div key={`v${i}`} style={a.giorni < 0 ? S.cardAllerta : S.card}>
          <span style={{ ...S.scadPallino, background: coloreScad(a.data) }}></span>
          <strong>{a.veicolo.targa}</strong>
          {a.veicolo.descrizione && <span style={{ opacity: 0.8 }}> — {a.veicolo.descrizione}</span>}
          <div style={{ fontSize: '0.9rem', marginTop: '0.3rem' }}>
            {a.tipo}: <strong>{fmtData(a.data)}</strong>
            <span style={{ opacity: 0.75 }}> ({testoGiorni(a.giorni)})</span>
          </div>
          <div style={S.azioni}>
            <button style={S.btnMod} onClick={() => naviga('veicoli')}>Vai ai veicoli</button>
          </div>
        </div>
      ))}

      {/* ─── ANNIVERSARI ─── */}
      <h3 style={{ marginTop: '2rem' }}>🕯️ Anniversari del decesso</h3>
      {avvisiAnniv.length === 0 && <p style={S.vuoto}>Nessun anniversario nei prossimi 30 giorni.</p>}
      {avvisiAnniv.map((a, i) => (
        <div key={`a${i}`} style={S.card}>
          <strong>{a.funerale.defunto_cognome} {a.funerale.defunto_nome}</strong>
          <span style={{ ...S.badgeNeutro, marginLeft: '0.5rem' }}>{a.anni}° anniversario</span>
          <div style={{ fontSize: '0.9rem', marginTop: '0.3rem' }}>
            {fmtData(a.data)}
            <span style={{ opacity: 0.75 }}> ({testoGiorni(a.giorni)})</span>
          </div>
          {(a.funerale.clienti?.cognome || a.funerale.clienti?.nome) && (
            <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>
              Famiglia: {a.funerale.clienti?.cognome} {a.funerale.clienti?.nome}
            </div>
          )}
          <div style={S.azioni}>
            <button style={S.btnMod} onClick={() => apriFunerale(a.funerale)}>Apri</button>
          </div>
        </div>
      ))}
    </div>
  )
}