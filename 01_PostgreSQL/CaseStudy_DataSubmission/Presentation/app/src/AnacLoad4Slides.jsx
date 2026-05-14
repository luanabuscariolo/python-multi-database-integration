import React, { useState, useEffect } from "react";

// ─── Palette (mesma da apresentação original) ────────────────────────────────
const P = {
  bg:           "#f4efe6",
  panel:        "#fffaf2",
  text:         "#1f2937",
  muted:        "#6b7280",
  accent:       "#9a3412",
  accentSoft:   "#ffedd5",
  accentAlt:    "#0f766e",
  accentAltSoft:"#dff7f2",
  border:       "#e7d8bf",
};

// ─── Constantes ───────────────────────────────────────────────────────────────
const SZ  = 1080; // tamanho fixo do slide (1080×1080)
const PAD = 52;   // padding interno

// Dados reais dos testes anotados no notebook
const TESTS = [
  { id:"t1", label:"Teste 01", net:"21.6 Mbps ↓ · 4.6 Mbps ↑",   times:{ m1:"11m 40s", m2:"10.1s", m3:"2.6s",  m4:"6.1s"   } },
  { id:"t2", label:"Teste 02", net:"267.6 Mbps ↓ · 98.0 Mbps ↑",  times:{ m1:"1m 22.1s",m2:"1.6s",  m3:"0.3s",  m4:"1s"     } },
];

const METHODS = [
  { key:"m1", num:"01", name:"Linha a linha",  sub:"cursor.execute",  color:"#9a3412", bg:"#ffedd5", concept:"Fundamentos de conexão, cursor e transação" },
  { key:"m2", num:"02", name:"Insert em lote", sub:"execute_values",  color:"#b45309", bg:"#fef3c7", concept:"Batch processing reduz round-trips de rede"  },
  { key:"m3", num:"03", name:"Stream nativo",  sub:"COPY",            color:"#0f766e", bg:"#dff7f2", concept:"Canal nativo de ingestão em massa do PostgreSQL" },
  { key:"m4", num:"04", name:"Abstração ORM",  sub:"pandas.to_sql",   color:"#1d4ed8", bg:"#eff6ff", concept:"Produtividade: zero SQL, múltiplos bancos"  },
];

// Converte "11m 40s" ou "10.1s" → segundos
const toSec = (str) => {
  const m = str.match(/(\d+)m\s*([\d.]+)s/);
  return m ? parseInt(m[1]) * 60 + parseFloat(m[2]) : parseFloat(str);
};

// ─── Estilos reutilizados ────────────────────────────────────────────────────
const thStyle = {
  padding:"14px 18px", textAlign:"left", fontWeight:700,
  borderBottom:`1px solid ${P.border}`, fontSize:15, background:"#f1e7d8",
};
const tdStyle = {
  padding:"12px 18px", borderBottom:`1px solid ${P.border}`,
  verticalAlign:"middle", fontSize:15, lineHeight:1.5,
};

// ─── Componentes auxiliares ──────────────────────────────────────────────────

function Slide({ children, between }) {
  return (
    <div style={{
      width:SZ, height:SZ, padding:PAD, boxSizing:"border-box",
      display:"flex", flexDirection:"column",
      justifyContent: between ? "space-between" : "flex-start",
      background:`linear-gradient(150deg, ${P.bg} 0%, #e8dcc8 100%)`,
      fontFamily:'Georgia, "Times New Roman", serif',
      color:P.text, overflow:"hidden", flexShrink:0,
    }}>
      {children}
    </div>
  );
}

function Badge({ children, alt, small }) {
  return (
    <span style={{
      display:"inline-block",
      background: alt ? P.accentAltSoft : P.accentSoft,
      color:      alt ? P.accentAlt     : P.accent,
      border:`1px solid ${P.border}`, borderRadius:999,
      padding: small ? "6px 14px" : "8px 22px",
      fontSize: small ? 12 : 13,
      fontWeight:700, letterSpacing:1.1, textTransform:"uppercase",
    }}>
      {children}
    </span>
  );
}

function Pill({ label, color, bg, w }) {
  return (
    <div style={{
      background:bg, color, border:`1px solid ${P.border}`,
      borderRadius:10, padding:"9px 20px", fontWeight:700, fontSize:15,
      width:w||"auto", textAlign:"center", flexShrink:0,
    }}>
      {label}
    </div>
  );
}

function FlowRow({ children }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, justifyContent:"center" }}>
      {children}
    </div>
  );
}

function RoundTripBadge({ label, color, bg }) {
  return (
    <div style={{
      padding:"8px 24px", borderRadius:20,
      background:bg, border:`1px solid ${color}30`,
      fontSize:15, fontWeight:700, color, textAlign:"center",
    }}>
      {label}
    </div>
  );
}

// ─── Diagramas visuais (sem código) ──────────────────────────────────────────

// M1: N round-trips individuais
function DiagramM1() {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12, alignItems:"center" }}>
      <p style={{ margin:"0 0 4px", fontSize:14, color:P.muted, fontStyle:"italic" }}>
        1 INSERT por viagem de rede
      </p>
      {[1,2,3].map(i => (
        <FlowRow key={i}>
          <Pill label="Python" color={P.accent} bg={P.accentSoft} w={110} />
          <span style={{ fontSize:22, color:P.accent }}> → </span>
          <Pill label="PostgreSQL" color="#166534" bg="#f0fdf4" w={130} />
        </FlowRow>
      ))}
      <div style={{ fontSize:18, color:P.muted, letterSpacing:2 }}>⋮</div>
      <RoundTripBadge label="× 13.000 viagens de rede" color="#dc2626" bg="#fef2f2" />
    </div>
  );
}

// M2: lote com execute_values
function DiagramM2() {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12, alignItems:"center" }}>
      <p style={{ margin:"0 0 4px", fontSize:14, color:P.muted, fontStyle:"italic" }}>
        500 linhas empacotadas por lote
      </p>
      <Pill label="500 linhas por pacote" color="#92400e" bg="#fef3c7" w={260} />
      <span style={{ fontSize:22, color:P.muted }}>↓</span>
      <FlowRow>
        <Pill label="Python" color={P.accent} bg={P.accentSoft} w={110} />
        <span style={{ fontSize:28, color:"#b45309" }}> ⟹ </span>
        <Pill label="PostgreSQL" color="#166534" bg="#f0fdf4" w={130} />
      </FlowRow>
      <RoundTripBadge label="26 viagens (vs 13.000)" color="#92400e" bg="#fef3c7" />
    </div>
  );
}

// M3: COPY — 1 stream contínuo
function DiagramM3() {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12, alignItems:"center" }}>
      <p style={{ margin:"0 0 4px", fontSize:14, color:P.muted, fontStyle:"italic" }}>
        1 stream contínuo (sem parse de INSERT)
      </p>
      <FlowRow>
        <Pill label="DataFrame" color={P.accentAlt} bg={P.accentAltSoft} w={126} />
        <span style={{ fontSize:20, color:P.accentAlt }}> → </span>
        <Pill label="CSV na RAM" color={P.accentAlt} bg={P.accentAltSoft} w={126} />
      </FlowRow>
      <span style={{ fontSize:22, color:P.muted }}>↓</span>
      <FlowRow>
        <Pill label="Python" color={P.accent} bg={P.accentSoft} w={110} />
        <span style={{ fontSize:26, color:P.accentAlt }}> ━━━▶ </span>
        <Pill label="PostgreSQL" color="#166534" bg="#f0fdf4" w={130} />
      </FlowRow>
      <RoundTripBadge label="1 único round-trip" color={P.accentAlt} bg={P.accentAltSoft} />
    </div>
  );
}

// M4: abstração em camadas
function DiagramM4() {
  const layers = [
    { label:"DataFrame",         color:"#1e40af", bg:"#eff6ff" },
    { label:"pandas.to_sql()",   color:"#1e40af", bg:"#dbeafe" },
    { label:"SQLAlchemy engine", color:"#1e3a8a", bg:"#bfdbfe" },
    { label:"psycopg2 driver",   color:"#1e3a8a", bg:"#93c5fd" },
    { label:"PostgreSQL",        color:"#166534", bg:"#f0fdf4" },
  ];
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:6, alignItems:"center" }}>
      <p style={{ margin:"0 0 6px", fontSize:14, color:P.muted, fontStyle:"italic" }}>
        camadas de abstração
      </p>
      {layers.map((l,i) => (
        <React.Fragment key={l.label}>
          <Pill label={l.label} color={l.color} bg={l.bg} w={250} />
          {i < layers.length - 1 && (
            <span style={{ fontSize:16, color:P.muted, lineHeight:1 }}>↓</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Tabela de tempos para a coluna do método ────────────────────────────────
function TimingTable({ mKey }) {
  return (
    <div style={{ background:P.panel, border:`1px solid ${P.border}`, borderRadius:14, overflow:"hidden" }}>
      <table style={{ width:"100%", borderCollapse:"collapse" }}>
        <thead>
          <tr>
            <th style={{ ...thStyle, fontSize:14 }}>Cenário</th>
            <th style={{ ...thStyle, fontSize:12, color:P.muted }}>Internet</th>
            <th style={{ ...thStyle, textAlign:"center", color:P.accent, fontSize:14 }}>Tempo</th>
          </tr>
        </thead>
        <tbody>
          {TESTS.map(t => (
            <tr key={t.id}>
              <td style={{ ...tdStyle, fontSize:14 }}>{t.label}</td>
              <td style={{ ...tdStyle, fontSize:12, color:P.muted }}>{t.net}</td>
              <td style={{ ...tdStyle, textAlign:"center", fontWeight:700, color:P.accent, fontSize:16 }}>{t.times[mKey]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Bloco usar / evitar ─────────────────────────────────────────────────────
function UseCases({ usar, evitar }) {
  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
      <div style={{ background:P.accentAltSoft, borderRadius:12, padding:"14px 16px", border:`1px solid ${P.border}` }}>
        <p style={{ margin:"0 0 6px", fontWeight:700, fontSize:13, color:P.accentAlt }}>✔ USAR QUANDO</p>
        <p style={{ margin:0, fontSize:13, lineHeight:1.6, color:P.text }}>{usar}</p>
      </div>
      <div style={{ background:"#fef2f2", borderRadius:12, padding:"14px 16px", border:"1px solid #fecaca" }}>
        <p style={{ margin:"0 0 6px", fontWeight:700, fontSize:13, color:"#dc2626" }}>✖ EVITAR QUANDO</p>
        <p style={{ margin:0, fontSize:13, lineHeight:1.6, color:P.text }}>{evitar}</p>
      </div>
    </div>
  );
}

// ─── Coluna de método (Slides 2 e 3) ─────────────────────────────────────────
function MethodColumn({ method, diagram, usar, evitar, alt }) {
  return (
    <div style={{
      background:P.panel, border:`1px solid ${P.border}`, borderRadius:20,
      padding:28, display:"flex", flexDirection:"column", gap:18,
      boxShadow:"0 4px 20px rgba(58,38,18,0.08)", flex:1, overflow:"hidden",
    }}>
      {/* Cabeçalho */}
      <div style={{
        display:"flex", alignItems:"center", gap:16,
        paddingBottom:16, borderBottom:`1px solid ${P.border}`,
      }}>
        <div style={{
          fontSize:56, fontWeight:900, color:method.color,
          fontFamily:"Georgia, serif", lineHeight:1, minWidth:64,
        }}>
          {method.num}
        </div>
        <div>
          <p style={{ margin:"0 0 6px", fontWeight:700, fontSize:23, color:P.text }}>{method.name}</p>
          <Badge alt={alt} small>{method.sub}</Badge>
        </div>
      </div>

      {/* Diagrama visual */}
      <div style={{
        background:method.bg, borderRadius:16, padding:18,
        border:`1px solid ${P.border}`,
      }}>
        {diagram}
      </div>

      {/* Tempos dos dois testes */}
      <TimingTable mKey={method.key} />

      {/* Usar / evitar */}
      <UseCases usar={usar} evitar={evitar} />

      {/* Conceito-chave */}
      <div style={{
        background: alt ? P.accentAltSoft : P.accentSoft,
        borderRadius:12, padding:"14px 18px", border:`1px solid ${P.border}`,
        marginTop:"auto",
      }}>
        <p style={{ margin:0, fontSize:14, color: alt ? P.accentAlt : P.accent, fontWeight:600, lineHeight:1.5 }}>
          💡 {method.concept}
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 1A — Capa limpa
// ═══════════════════════════════════════════════════════════════════════════════
function Slide1A() {
  return (
    <Slide between>
      {/* Topo: badge */}
      <div>
        <Badge>PostgreSQL · Python · ETL · Case Study ANAC</Badge>
      </div>

      {/* Centro: título + tagline */}
      <div>
        <h1 style={{
          fontSize:80, lineHeight:1.04, margin:"0 0 28px",
          color:P.text, fontFamily:"Georgia, serif",
        }}>
          4 formas de enviar<br />dados ao PostgreSQL<br />com Python
        </h1>
        <p style={{ fontSize:26, color:P.muted, margin:0, lineHeight:1.6, maxWidth:750 }}>
          Da abordagem mais didática à mais rápida — um estudo de caso
          com dados reais de ocorrências da ANAC.
        </p>
      </div>

      {/* Cartões 2×2 com os 4 métodos (sem tempos) */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        {METHODS.map(m => (
          <div key={m.key} style={{
            background:m.bg, border:`1px solid ${P.border}`, borderRadius:18,
            padding:"26px 30px", display:"flex", alignItems:"center", gap:20,
            boxShadow:"0 4px 18px rgba(58,38,18,0.08)",
          }}>
            <div style={{
              fontSize:54, fontWeight:900, color:m.color,
              fontFamily:"Georgia, serif", minWidth:62, lineHeight:1,
            }}>
              {m.num}
            </div>
            <div>
              <p style={{ margin:"0 0 6px", fontWeight:700, fontSize:23, color:P.text }}>{m.name}</p>
              <p style={{ margin:0, fontSize:17, color:m.color, fontWeight:600 }}>{m.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Rodapé: contexto */}
      <div style={{ display:"flex", gap:40, borderTop:`1px solid ${P.border}`, paddingTop:26 }}>
        {[
          ["Fonte",    "ANAC · V_OCORRENCIA_AMPLA.json"],
          ["Volume",   "~13.000 registros"],
          ["Destino",  "PostgreSQL remoto"],
        ].map(([k,v]) => (
          <div key={k}>
            <p style={{ margin:0, fontSize:12, fontWeight:700, letterSpacing:1, color:P.muted, textTransform:"uppercase" }}>{k}</p>
            <p style={{ margin:"4px 0 0", fontWeight:700, color:P.accent, fontSize:18 }}>{v}</p>
          </div>
        ))}
      </div>
    </Slide>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 1B — Capa com poucos dados
// ═══════════════════════════════════════════════════════════════════════════════
function Slide1B() {
  return (
    <Slide between>
      {/* Topo */}
      <div>
        <Badge>PostgreSQL · Python · ETL · Case Study ANAC</Badge>
        <h1 style={{ fontSize:60, lineHeight:1.06, margin:"20px 0 12px", color:P.text }}>
          4 formas de enviar dados ao<br />PostgreSQL com Python
        </h1>
        <p style={{ fontSize:20, color:P.muted, margin:0, lineHeight:1.5 }}>
          ~13.000 registros · servidor remoto · 2 cenários de velocidade de rede
        </p>
      </div>

      {/* Cartões 2×2 com tempos dos dois testes */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        {METHODS.map(m => (
          <div key={m.key} style={{
            background:m.bg, border:`1px solid ${P.border}`, borderRadius:18,
            padding:"24px 26px", boxShadow:"0 4px 18px rgba(58,38,18,0.08)",
          }}>
            {/* Cabeçalho do cartão */}
            <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:14 }}>
              <div style={{
              fontSize:48, fontWeight:900, color:m.color,
                fontFamily:"Georgia, serif", lineHeight:1,
              }}>
                {m.num}
              </div>
              <div>
                <p style={{ margin:"0 0 4px", fontWeight:700, fontSize:21, color:P.text }}>{m.name}</p>
                <p style={{ margin:0, fontSize:15, color:m.color, fontWeight:600 }}>{m.sub}</p>
              </div>
            </div>

            {/* Tempos dos dois testes lado a lado */}
            <div style={{
              display:"grid", gridTemplateColumns:"1fr 1fr", gap:8,
              paddingTop:12, borderTop:`1px solid ${P.border}`,
            }}>
              {TESTS.map(t => (
                <div key={t.id} style={{
                  background:P.panel, borderRadius:8, padding:"8px 10px",
                  border:`1px solid ${P.border}`,
                }}>
                  <p style={{ margin:"0 0 2px", fontSize:10, fontWeight:700, letterSpacing:0.5, color:P.muted, textTransform:"uppercase" }}>
                    {t.label}
                  </p>
                  <p style={{ margin:"0 0 3px", fontWeight:700, color:m.color, fontSize:20 }}>
                    {t.times[m.key]}
                  </p>
                  <p style={{ margin:0, fontSize:10, color:P.muted }}>
                    {t.net.split(" · ")[0]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Rodapé */}
      <div style={{ display:"flex", gap:40, borderTop:`1px solid ${P.border}`, paddingTop:22 }}>
        {[
          ["Fonte",    "ANAC · V_OCORRENCIA_AMPLA.json"],
          ["Volume",   "~13.000 registros"],
          ["Destino",  "PostgreSQL remoto"],
        ].map(([k,v]) => (
          <div key={k}>
            <p style={{ margin:0, fontSize:12, fontWeight:700, letterSpacing:1, color:P.muted, textTransform:"uppercase" }}>{k}</p>
            <p style={{ margin:"4px 0 0", fontWeight:700, color:P.accent, fontSize:17 }}>{v}</p>
          </div>
        ))}
      </div>
    </Slide>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 2 — Métodos 01 e 02
// ═══════════════════════════════════════════════════════════════════════════════
function Slide2() {
  return (
    <Slide>
      <div style={{ marginBottom:18 }}>
        <Badge>Métodos 01 e 02 · psycopg2</Badge>
        <h1 style={{ fontSize:40, margin:"12px 0 0", lineHeight:1.1, color:P.text }}>
          INSERT linha a linha &nbsp;vs&nbsp; Insert em lote
        </h1>
      </div>

      <div style={{ display:"flex", gap:22, flex:1, minHeight:0 }}>
        <MethodColumn
          method={METHODS[0]}
          diagram={<DiagramM1/>}
          usar="Aprender psycopg2. Até ~100 registros. Lógica condicional por linha."
          evitar="Volumes acima de 1.000 linhas em servidor remoto ou em produção."
        />
        <MethodColumn
          method={METHODS[1]}
          diagram={<DiagramM2 />}
          usar="Maioria dos projetos práticos. Boa velocidade com controle total do SQL."
          evitar="Volumes acima de 1M de linhas — nesse caso COPY é mais adequado."
        />
      </div>
    </Slide>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 3 — Métodos 03 e 04
// ═══════════════════════════════════════════════════════════════════════════════
function Slide3() {
  return (
    <Slide>
      <div style={{ marginBottom:18 }}>
        <Badge alt>Métodos 03 e 04 · Carga em massa e ORM</Badge>
        <h1 style={{ fontSize:40, margin:"12px 0 0", lineHeight:1.1, color:P.text }}>
          Stream nativo COPY &nbsp;vs&nbsp; Abstração pandas.to_sql
        </h1>
      </div>

      <div style={{ display:"flex", gap:22, flex:1, minHeight:0 }}>
        <MethodColumn
          method={METHODS[2]}
          diagram={<DiagramM3 />}
          usar="ETL de alto volume em produção. Cargas regulares de grandes arquivos."
          evitar="Quando precisar de type adapters automáticos ou de lógica condicional por linha."
          alt
        />
        <MethodColumn
          method={METHODS[3]}
          diagram={<DiagramM4 />}
          usar="Prototipagem em Jupyter. Múltiplos bancos (troca só a string de conexão)."
          evitar="Tabelas com índices/constraints críticos ao usar if_exists='replace'."
        />
      </div>
    </Slide>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 4 — Comparação e conclusão
// ═══════════════════════════════════════════════════════════════════════════════
function Slide4() {
  const t1Base = toSec("11m 40s"); // 700s
  const t2Base = toSec("1m 22.1s"); // 82.1s

  const rows = METHODS.map(m => ({
    ...m,
    t1:   TESTS[0].times[m.key],
    t2:   TESTS[1].times[m.key],
    t1sp: m.key === "m1" ? "base" : Math.round(t1Base / toSec(TESTS[0].times[m.key])) + "×",
    t2sp: m.key === "m1" ? "base" : Math.round(t2Base / toSec(TESTS[1].times[m.key])) + "×",
  }));

  return (
    <Slide between>
      {/* Cabeçalho */}
      <div>
        <Badge>Comparação · 4 Métodos · 2 Cenários reais</Badge>
        <h1 style={{ fontSize:50, margin:"12px 0 6px", lineHeight:1.08, color:P.text }}>
          Resultados dos testes
        </h1>
        <p style={{ margin:0, fontSize:20, color:P.muted }}>
          ~13.000 registros enviados para PostgreSQL remoto em duas condições de rede
        </p>
      </div>

      {/* Tabela comparativa principal */}
      <div style={{
        background:P.panel, border:`1px solid ${P.border}`, borderRadius:16,
        overflow:"hidden", boxShadow:"0 4px 18px rgba(58,38,18,0.08)",
      }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr>
              <th style={thStyle}>Método</th>
              <th style={thStyle}>Abordagem</th>
              <th style={{ ...thStyle, textAlign:"center" }}>
                Teste 01<br/>
                <span style={{ fontWeight:400, fontSize:12, color:P.muted }}>21.6 / 4.6 Mbps</span>
              </th>
              <th style={{ ...thStyle, textAlign:"center", color:P.accent }}>Ganho T1</th>
              <th style={{ ...thStyle, textAlign:"center" }}>
                Teste 02<br/>
                <span style={{ fontWeight:400, fontSize:12, color:P.muted }}>267.6 / 98 Mbps</span>
              </th>
              <th style={{ ...thStyle, textAlign:"center", color:P.accentAlt }}>Ganho T2</th>
              <th style={thStyle}>Melhor para</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.key} style={{ background: i % 2 === 0 ? P.panel : P.bg }}>
                <td style={{ ...tdStyle, fontWeight:700, color:r.color, fontSize:16 }}>{r.num}</td>
                <td style={tdStyle}>{r.sub}</td>
                <td style={{ ...tdStyle, textAlign:"center", fontWeight:700 }}>{r.t1}</td>
                <td style={{ ...tdStyle, textAlign:"center", fontWeight:700, color:P.accent }}>
                  {r.t1sp}
                </td>
                <td style={{ ...tdStyle, textAlign:"center", fontWeight:700 }}>{r.t2}</td>
                <td style={{ ...tdStyle, textAlign:"center", fontWeight:700, color:P.accentAlt }}>
                  {r.t2sp}
                </td>
                <td style={{ ...tdStyle, fontSize:12, color:P.muted }}>
                  {r.concept.split(":")[0]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bloco inferior 2 colunas */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
        {/* Guia por volume */}
        <div style={{
          background:P.panel, border:`1px solid ${P.border}`,
          borderRadius:16, padding:24, boxShadow:"0 4px 18px rgba(58,38,18,0.08)",
        }}>
          <p style={{ margin:"0 0 14px", fontWeight:700, fontSize:17, color:P.accent }}>
            Quando usar cada método
          </p>
          {[
            ["Até 100 linhas",       "01 — cursor.execute"],
            ["1k – 100k linhas",     "02 — execute_values"],
            ["100k – 1M+ linhas",    "03 — COPY"],
            ["Prototipagem / Jupyter","04 — pandas.to_sql"],
          ].map(([vol, met]) => (
            <div key={vol} style={{
              display:"flex", justifyContent:"space-between", alignItems:"center",
              padding:"10px 0", borderBottom:`1px solid ${P.border}`,
            }}>
              <span style={{ fontSize:15, color:P.muted }}>{vol}</span>
              <span style={{ fontSize:15, fontWeight:700, color:P.text }}>{met}</span>
            </div>
          ))}
        </div>

        {/* Insight */}
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div style={{
            background:P.accentSoft, borderRadius:16, padding:22,
            border:`1px solid ${P.border}`, flex:1,
          }}>
            <p style={{ margin:"0 0 10px", fontWeight:700, fontSize:16, color:P.accent }}>
              O que os testes provam
            </p>
            <p style={{ margin:0, fontSize:15, lineHeight:1.65, color:P.text }}>
              O problema nunca foi o banco. Foi o número de viagens de rede.
              COPY reduziu de <strong>11 min para 2.6 s</strong> — mesma rede, mesmo banco,
              mesmo arquivo. A diferença está em <em>como</em> os dados chegam ao servidor.
            </p>
          </div>
          <div style={{
            background:P.accentAltSoft, borderRadius:16, padding:20,
            border:`1px solid ${P.border}`,
          }}>
            <p style={{ margin:"0 0 8px", fontWeight:700, fontSize:15, color:P.accentAlt }}>
              Internet mais rápida ajuda — mas o método faz mais diferença
            </p>
            <p style={{ margin:0, fontSize:14, lineHeight:1.65, color:P.text }}>
              A internet melhorou <strong>12×</strong> entre os testes. O COPY ficou <strong>274×</strong> mais
              rápido que o Método 01 no mesmo teste. Otimizar o método vale mais do que melhorar a rede.
            </p>
          </div>
        </div>
      </div>
    </Slide>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Registro dos slides
// ═══════════════════════════════════════════════════════════════════════════════
const SLIDES = [
  { id:"1a", label:"1A · Capa",          component:Slide1A },
  { id:"1b", label:"1B · Capa + Dados",  component:Slide1B },
  { id:"2",  label:"2 · Métodos 1 e 2",  component:Slide2  },
  { id:"3",  label:"3 · Métodos 3 e 4",  component:Slide3  },
  { id:"4",  label:"4 · Comparação",     component:Slide4  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Componente principal com navegação
// ═══════════════════════════════════════════════════════════════════════════════
export default function AnacLoad4Slides() {
  const [cur, setCur] = useState(0);

  useEffect(() => {
    const fn = (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown")
        setCur(c => Math.min(c + 1, SLIDES.length - 1));
      if (e.key === "ArrowLeft" || e.key === "ArrowUp")
        setCur(c => Math.max(c - 1, 0));
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  const SlideComponent = SLIDES[cur].component;

  return (
    <div style={{
      minHeight:"100vh", background:"#1a1a1a",
      display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"flex-start",
      padding:"20px 20px 32px", gap:16,
      fontFamily:"system-ui, sans-serif",
    }}>
      {/* Barra de navegação (fora do slide — não aparece no print) */}
      <div style={{
        display:"flex", alignItems:"center", gap:10,
        background:"#2d2d2d", borderRadius:12, padding:"10px 16px",
        width: SZ, boxSizing:"border-box", flexShrink:0,
      }}>
        <button
          onClick={() => setCur(c => Math.max(c - 1, 0))}
          disabled={cur === 0}
          style={{
            background: cur === 0 ? "#444" : P.accent, color:"#fff", border:"none",
            borderRadius:8, padding:"6px 16px", cursor: cur === 0 ? "default" : "pointer",
            fontWeight:700, fontSize:15,
          }}
        >←</button>

        <div style={{ display:"flex", gap:6, flex:1 }}>
          {SLIDES.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setCur(i)}
              style={{
                background: i === cur ? P.accent : "#3a3a3a",
                color: i === cur ? "#fff" : "#9ca3af",
                border:"none", borderRadius:6, padding:"4px 10px",
                cursor:"pointer", fontSize:11,
                fontWeight: i === cur ? 700 : 400,
                flex:1,
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setCur(c => Math.min(c + 1, SLIDES.length - 1))}
          disabled={cur === SLIDES.length - 1}
          style={{
            background: cur === SLIDES.length - 1 ? "#444" : P.accent, color:"#fff", border:"none",
            borderRadius:8, padding:"6px 16px",
            cursor: cur === SLIDES.length - 1 ? "default" : "pointer",
            fontWeight:700, fontSize:15,
          }}
        >→</button>
      </div>

      {/* ── Slide 1080×1080 ── tire o print só desta área ── */}
      <SlideComponent />

      <p style={{ color:"#555", fontSize:11, margin:0 }}>
        {cur + 1} / {SLIDES.length} · ← → para navegar · tire o print apenas do quadrado acima
      </p>
    </div>
  );
}
