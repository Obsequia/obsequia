import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { S, STATI, MESI, COLORI_GRAFICI, GRAFICO_TICK, GRAFICO_GRIGLIA } from '../comune'

export default function Statistiche({ funerali }) {
  function contaPer(funzione) {
    const conta = {}
    funerali.forEach(f => {
      const chiave = funzione(f)
      conta[chiave] = (conta[chiave] || 0) + 1
    })
    return conta
  }

  const perStato = contaPer(f => f.stato_pratica || 'In corso')
  const perGenereObj = contaPer(f => f.genere || 'Non specificato')
  const datiGenere = Object.entries(perGenereObj).map(([name, value]) => ({ name, value }))
  const perTipoObj = contaPer(f => f.tipo || 'Non specificato')
  const datiTipo = Object.entries(perTipoObj).map(([name, value]) => ({ name, value }))
  const perComuneObj = contaPer(f => f.comune || 'Non specificato')
  const datiComune = Object.entries(perComuneObj)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  const datiMese = (() => {
    const ora = new Date()
    const buckets = []
    for (let i = 11; i >= 0; i--) {
      const d = new Date(ora.getFullYear(), ora.getMonth() - i, 1)
      buckets.push({ chiave: `${d.getFullYear()}-${d.getMonth()}`, name: `${MESI[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`, value: 0 })
    }
    funerali.forEach(f => {
      if (!f.data_funerale) return
      const d = new Date(f.data_funerale + 'T00:00:00')
      const chiave = `${d.getFullYear()}-${d.getMonth()}`
      const b = buckets.find(x => x.chiave === chiave)
      if (b) b.value++
    })
    return buckets
  })()

  return (
    <div>
      <h2>Statistiche</h2>

      {funerali.length === 0 ? (
        <p style={S.vuoto}>Ancora nessun funerale registrato: le statistiche compariranno appena inserisci i primi dati.</p>
      ) : (
        <>
          <div style={S.statGrid}>
            {STATI.map(s => (
              <div key={s} style={S.statCard}>
                <div style={S.statNum}>{perStato[s] || 0}</div>
                <div style={S.statLbl}>{s}</div>
              </div>
            ))}
          </div>

          <div style={S.graficoCard}>
            <div style={S.graficoTit}>Funerali per mese (ultimi 12 mesi)</div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={datiMese}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRAFICO_GRIGLIA} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: GRAFICO_TICK }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: GRAFICO_TICK }} />
                <Tooltip contentStyle={S.graficoTooltip} />
                <Bar dataKey="value" name="Funerali" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={S.graficoCard}>
            <div style={S.graficoTit}>Maschi / Femmine</div>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={datiGenere} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {datiGenere.map((entry, i) => <Cell key={i} fill={COLORI_GRAFICI[i % COLORI_GRAFICI.length]} />)}
                </Pie>
                <Tooltip contentStyle={S.graficoTooltip} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div style={S.graficoCard}>
            <div style={S.graficoTit}>Tipo di funerale</div>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={datiTipo} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {datiTipo.map((entry, i) => <Cell key={i} fill={COLORI_GRAFICI[i % COLORI_GRAFICI.length]} />)}
                </Pie>
                <Tooltip contentStyle={S.graficoTooltip} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div style={S.graficoCard}>
            <div style={S.graficoTit}>Funerali per comune</div>
            <ResponsiveContainer width="100%" height={Math.max(200, datiComune.length * 40)}>
              <BarChart data={datiComune} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRAFICO_GRIGLIA} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: GRAFICO_TICK }} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11, fill: GRAFICO_TICK }} />
                <Tooltip contentStyle={S.graficoTooltip} />
                <Bar dataKey="value" name="Funerali" fill="#22c55e" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  )
}