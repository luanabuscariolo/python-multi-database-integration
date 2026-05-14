import React, { useState, useEffect } from "react";

const palette = {
  background: "#f4efe6",
  panel: "#fffaf2",
  text: "#1f2937",
  muted: "#6b7280",
  accent: "#9a3412",
  accentSoft: "#ffedd5",
  accentAlt: "#0f766e",
  accentAltSoft: "#dff7f2",
  border: "#e7d8bf",
  codeBg: "#2b2117",
  codeText: "#f8f5ef",
  warning: "#7c2d12"
};

// ─── Shared helpers ────────────────────────────────────────────────────────

function SlideWrapper({ children }) {
  return (
    <div
      style={{
        height: "100vh",
        overflowY: "auto",
        padding: "56px 48px 96px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start"
      }}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto", width: "100%" }}>
        {children}
      </div>
    </div>
  );
}

function Badge({ children, alt }) {
  return (
    <div
      style={{
        display: "inline-block",
        borderRadius: 999,
        padding: "6px 14px",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 1,
        textTransform: "uppercase",
        color: alt ? palette.accentAlt : palette.accent,
        background: alt ? palette.accentAltSoft : palette.accentSoft,
        border: `1px solid ${palette.border}`,
        marginBottom: 18
      }}
    >
      {children}
    </div>
  );
}

function SlideTitle({ children, alt, size }) {
  return (
    <h1
      style={{
        fontSize: size || 44,
        lineHeight: 1.08,
        margin: "0 0 14px",
        color: alt ? palette.accentAlt : palette.text
      }}
    >
      {children}
    </h1>
  );
}

function SectionHeading({ children, alt }) {
  return (
    <h2
      style={{
        margin: "0 0 12px",
        fontSize: 20,
        color: alt ? palette.accentAlt : palette.accent
      }}
    >
      {children}
    </h2>
  );
}

function BulletList({ items, alt }) {
  return (
    <ul style={{ margin: 0, paddingLeft: 22, lineHeight: 1.7 }}>
      {items.map((item) => (
        <li key={item} style={{ marginBottom: 6, color: alt ? palette.accentAlt : palette.text }}>
          {item}
        </li>
      ))}
    </ul>
  );
}

function CodeBlock({ lines, compact }) {
  return (
    <pre
      style={{
        margin: 0,
        padding: compact ? 14 : 18,
        borderRadius: 14,
        background: palette.codeBg,
        color: palette.codeText,
        overflowX: "auto",
        fontSize: compact ? 12 : 13,
        lineHeight: 1.65,
        fontFamily: '"Fira Code", "Cascadia Code", Consolas, monospace'
      }}
    >
      <code>{lines.join("\n")}</code>
    </pre>
  );
}

function Panel({ children, highlight, warn }) {
  return (
    <div
      style={{
        background: warn ? "#fff7ed" : highlight ? palette.accentAltSoft : palette.panel,
        border: `1px solid ${palette.border}`,
        borderRadius: 18,
        padding: 22,
        boxShadow: "0 10px 24px rgba(58,38,18,0.07)"
      }}
    >
      {children}
    </div>
  );
}

function TimingBox({ time, verdict, alt }) {
  return (
    <div
      style={{
        marginTop: 18,
        padding: 16,
        borderRadius: 14,
        background: alt ? palette.accentAltSoft : palette.accentSoft,
        border: `1px solid ${palette.border}`
      }}
    >
      <p style={{ margin: "0 0 6px", fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: 0.5, color: palette.muted }}>Tempo observado</p>
      <p style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 700, color: alt ? palette.accentAlt : palette.accent }}>{time}</p>
      <p style={{ margin: 0, fontSize: 14, color: palette.muted }}>{verdict}</p>
    </div>
  );
}

function Th({ children }) {
  return (
    <th style={{ textAlign: "left", padding: "10px 14px", background: "#f1e7d8", borderBottom: `1px solid ${palette.border}`, fontSize: 14, fontWeight: 700 }}>
      {children}
    </th>
  );
}

function Td({ children, bold, center }) {
  return (
    <td style={{ padding: "10px 14px", borderBottom: `1px solid ${palette.border}`, verticalAlign: "top", lineHeight: 1.55, fontWeight: bold ? 700 : 400, textAlign: center ? "center" : "left", fontSize: 14 }}>
      {children}
    </td>
  );
}

// ─── Slide 1: Title ─────────────────────────────────────────────────────────

function TitleSlide() {
  const methods = [
    { num: "01", label: "Linha a linha", time: "~16 min", color: palette.accent },
    { num: "02", label: "execute_values", time: "~30s", color: "#b45309" },
    { num: "03", label: "pandas.to_sql", time: "~1 min", color: "#0f766e" },
    { num: "04", label: "COPY bulk", time: "~5s", color: "#065f46" }
  ];
  return (
    <SlideWrapper>
      <Badge>PostgreSQL · Python · ETL · Case Study ANAC</Badge>
      <SlideTitle size={52}>
        4 formas de enviar dados<br />para o PostgreSQL com Python
      </SlideTitle>
      <p style={{ fontSize: 20, lineHeight: 1.7, color: palette.muted, maxWidth: 820, margin: "0 0 40px" }}>
        Um estudo de caso com os dados da ANAC: ~13.000 registros, servidor remoto, e uma carga que
        levou 16 minutos na primeira tentativa. O que fizemos para chegar a 5 segundos?
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 40 }}>
        {methods.map((m) => (
          <div
            key={m.num}
            style={{
              background: palette.panel,
              border: `1px solid ${palette.border}`,
              borderRadius: 16,
              padding: "20px 18px",
              boxShadow: "0 8px 20px rgba(58,38,18,0.07)"
            }}
          >
            <p style={{ margin: "0 0 6px", fontWeight: 700, fontSize: 28, color: m.color }}>{m.num}</p>
            <p style={{ margin: "0 0 8px", fontWeight: 700, fontSize: 17 }}>{m.label}</p>
            <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: m.color }}>{m.time}</p>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        {[
          { label: "Arquivo", value: "V_OCORRENCIA_AMPLA.json" },
          { label: "Registros", value: "~13.000 linhas" },
          { label: "Destino", value: "PostgreSQL remoto" },
          { label: "Biblioteca base", value: "psycopg2" }
        ].map((item) => (
          <div key={item.label} style={{ background: palette.accentSoft, borderRadius: 10, padding: "10px 16px", border: `1px solid ${palette.border}` }}>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: palette.muted }}>{item.label}</p>
            <p style={{ margin: "2px 0 0", fontWeight: 700, color: palette.accent }}>{item.value}</p>
          </div>
        ))}
      </div>
    </SlideWrapper>
  );
}

// ─── Slide 2: The Problem ───────────────────────────────────────────────────

function ProblemSlide() {
  return (
    <SlideWrapper>
      <Badge>O Problema</Badge>
      <SlideTitle>Por que 13.000 linhas levaram 16 minutos?</SlideTitle>
      <p style={{ fontSize: 18, lineHeight: 1.7, color: palette.muted, maxWidth: 820, margin: "0 0 32px" }}>
        A causa raiz não é o banco lento. É o <strong style={{ color: palette.accent }}>custo de round-trip de rede</strong>: cada linha
        enviada individualmente obriga o Python a esperar a confirmação do servidor antes de enviar a próxima.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Panel>
          <SectionHeading>O ciclo por linha</SectionHeading>
          <div style={{ fontFamily: "monospace", fontSize: 14, lineHeight: 2, color: palette.text, background: palette.codeBg, color: palette.codeText, padding: 16, borderRadius: 12 }}>
            Python → rede → PostgreSQL<br />
            PostgreSQL → processa → confirma<br />
            PostgreSQL → rede → Python<br />
            <span style={{ color: "#f59e0b" }}>↑ repetido 13.000 vezes</span>
          </div>
          <div style={{ marginTop: 16, padding: 16, borderRadius: 12, background: palette.accentSoft, border: `1px solid ${palette.border}` }}>
            <p style={{ margin: "0 0 6px", fontWeight: 700, color: palette.accent }}>Cálculo simples</p>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6 }}>
              ~70ms de latência × 13.000 viagens<br />
              = 910.000ms = <strong>~910 segundos ≈ 15–16 minutos</strong>
            </p>
          </div>
        </Panel>
        <Panel>
          <SectionHeading alt>A analogia certa</SectionHeading>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 15 }}>
            <thead>
              <tr>
                <Th>#</Th>
                <Th>Analogia</Th>
              </tr>
            </thead>
            <tbody>
              {[
                ["01", "🏍  Moto entregando uma carta por viagem"],
                ["02", "🚚  Caminhão levando todas as cartas de uma vez"],
                ["03", "📦  Transportadora terceirizada decidindo a logística"],
                ["04", "🏭  Esteira industrial direta para o depósito do banco"]
              ].map(([n, a]) => (
                <tr key={n}>
                  <Td bold>{n}</Td>
                  <Td>{a}</Td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: 16, padding: 14, borderRadius: 12, background: palette.accentAltSoft, border: `1px solid ${palette.border}` }}>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: palette.accentAlt }}>
              <strong>A solução</strong> não é usar um banco mais rápido — é reduzir o número de viagens.
              As próximas 4 abordagens atacam exatamente isso.
            </p>
          </div>
        </Panel>
      </div>
    </SlideWrapper>
  );
}

// ─── Slide 3: Method 1 ──────────────────────────────────────────────────────

function Method1Slide() {
  const code = [
    "import psycopg2",
    "",
    "conn = psycopg2.connect(host=..., database=..., user=..., password=...)",
    "cursor = conn.cursor()",
    "",
    'cursor.execute("DELETE FROM public.anac")',
    "",
    "for index, row in df.iterrows():",
    '    cursor.execute("""',
    '        INSERT INTO public.anac (numero, classificacao, data, municipio, uf)',
    '        VALUES (%s, %s, %s, %s, %s)',
    '    """, (',
    "        row['Numero_da_Ocorrencia'],",
    "        row['Classificacao_da_Ocorrência'],",
    "        row['Data_da_Ocorrencia'],",
    "        row['Municipio'],",
    "        row['UF']",
    "    ))",
    "",
    "conn.commit()   # commit único no final",
    "cursor.close()",
    "conn.close()"
  ];
  return (
    <SlideWrapper>
      <Badge>Método 1 · Notebook 04 · célula 7</Badge>
      <SlideTitle>Insert linha a linha com cursor.execute</SlideTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div>
          <SectionHeading>Como funciona</SectionHeading>
          <BulletList items={[
            "Abre a conexão e cria o cursor.",
            "Apaga os registros existentes com DELETE.",
            "Percorre o DataFrame usando iterrows().",
            "Monta um INSERT para uma única linha.",
            "Envia esse INSERT para o servidor remoto.",
            "Repete o processo para cada linha.",
            "Executa commit apenas no final."
          ]} />
          <div style={{ marginTop: 16 }}>
            <SectionHeading alt>O que ensina</SectionHeading>
            <BulletList items={[
              "Modelo mental de conexão, cursor e commit.",
              "Parâmetros %s enviados separados (previne SQL injection).",
              "Estrutura base de qualquer interação Python ↔ PostgreSQL."
            ]} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
            <div style={{ background: palette.accentAltSoft, padding: 14, borderRadius: 12, border: `1px solid ${palette.border}` }}>
              <p style={{ margin: "0 0 6px", fontWeight: 700, fontSize: 13, color: palette.accentAlt }}>✔ Usar quando</p>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5 }}>Aprender psycopg2. Até ~100 registros. Lógica condicional por linha.</p>
            </div>
            <div style={{ background: "#fef2f2", padding: 14, borderRadius: 12, border: `1px solid #fecaca` }}>
              <p style={{ margin: "0 0 6px", fontWeight: 700, fontSize: 13, color: "#dc2626" }}>✖ Evitar quando</p>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5 }}>Acima de ~1.000 linhas em servidor remoto. Qualquer pipeline de produção.</p>
            </div>
          </div>
          <TimingBox time="~16 minutos" verdict="Mais didático, menos eficiente. O round-trip multiplica pela quantidade de linhas." />
        </div>
        <div>
          <SectionHeading alt>Código</SectionHeading>
          <CodeBlock lines={code} />
          <div style={{ marginTop: 14, padding: 14, borderRadius: 12, background: "#fef9c3", border: `1px solid #fde68a` }}>
            <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: 13, color: "#92400e" }}>Por que é lento</p>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55 }}>
              Cada <code>cursor.execute()</code> é um round-trip completo. Python envia → servidor processa → confirma →
              Python envia o próximo. Com 13.000 linhas e ~70ms de latência, o tempo acumula de forma linear.
            </p>
          </div>
        </div>
      </div>
    </SlideWrapper>
  );
}

// ─── Slide 4: Method 2 ──────────────────────────────────────────────────────

function Method2Slide() {
  const code = [
    "import psycopg2",
    "from psycopg2.extras import execute_values",
    "",
    "conn = psycopg2.connect(...)",
    "cursor = conn.cursor()",
    "",
    'cursor.execute("DELETE FROM public.anac")',
    "",
    "dados = list(df[['Numero_da_Ocorrencia', 'Classificacao_da_Ocorrência',",
    "                  'Data_da_Ocorrencia', 'Municipio', 'UF']]",
    "               .itertuples(index=False, name=None))",
    "",
    "execute_values(",
    "    cursor,",
    '    """INSERT INTO public.anac (numero, classificacao, data, municipio, uf)',
    '       VALUES %s""",',
    "    dados,",
    "    page_size=500   # linhas por lote — padrão é 100",
    ")",
    "",
    "conn.commit()"
  ];
  return (
    <SlideWrapper>
      <Badge>Método 2 · Notebook 04 · célula 8</Badge>
      <SlideTitle>Insert em lote com execute_values</SlideTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div>
          <SectionHeading>Como funciona</SectionHeading>
          <BulletList items={[
            "Importa execute_values do módulo psycopg2.extras.",
            "Converte o DataFrame em uma lista de tuplas.",
            "Chama execute_values() com todos os dados — uma única chamada ao banco.",
            "Internamente monta: INSERT ... VALUES (%s,...),(%s,...),...",
            "Executa commit no final."
          ]} />
          <div style={{ marginTop: 16 }}>
            <SectionHeading alt>O parâmetro page_size</SectionHeading>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr><Th>page_size</Th><Th>Round-trips (13k linhas)</Th></tr>
              </thead>
              <tbody>
                {[["100 (padrão)", "130"], ["500", "26"], ["1000", "13"]].map(([ps, rt]) => (
                  <tr key={ps}><Td bold>{ps}</Td><Td>{rt}</Td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 14 }}>
            <SectionHeading alt>O que ensina</SectionHeading>
            <BulletList items={[
              "Batch processing: agrupar operações reduz latência.",
              "Como o módulo extras estende as capacidades do driver.",
              "Funciona com qualquer lista de tuplas, sem depender de pandas."
            ]} />
          </div>
          <TimingBox time="~30 segundos" verdict="Melhor equilíbrio entre controle e velocidade. Recomendado para a maioria dos casos." />
        </div>
        <div>
          <SectionHeading alt>Código</SectionHeading>
          <CodeBlock lines={code} />
          <Panel highlight style={{ marginTop: 14 }}>
            <p style={{ margin: "0 0 6px", fontWeight: 700, fontSize: 13, color: palette.accentAlt }}>Por que é muito mais rápido</p>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55 }}>
              Com page_size=500, são apenas <strong>26 round-trips</strong> para 13.000 linhas (13.000 ÷ 500 = 26),
              em vez de 13.000. O PostgreSQL também otimiza melhor ao receber muitos valores em um único statement.
            </p>
          </Panel>
        </div>
      </div>
    </SlideWrapper>
  );
}

// ─── Slide 5: Method 3 ──────────────────────────────────────────────────────

function Method3Slide() {
  const code = [
    "import pandas as pd",
    "from sqlalchemy import create_engine",
    "",
    'engine = create_engine(',
    '    "postgresql+psycopg2://user:senha@host/meu_banco"',
    ")",
    "",
    "df.to_sql(",
    '    name="anac",',
    "    con=engine,",
    '    schema="public",',
    '    if_exists="append",   # ver tabela abaixo!',
    "    index=False,",
    "    chunksize=1000         # envia em lotes de 1000",
    ")",
    "",
    "engine.dispose()"
  ];
  return (
    <SlideWrapper>
      <Badge>Método 3 · Notebook 07 · célula 6</Badge>
      <SlideTitle>pandas.to_sql + SQLAlchemy</SlideTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div>
          <SectionHeading>As duas bibliotecas</SectionHeading>
          <div style={{ marginBottom: 16 }}>
            <p style={{ margin: "0 0 6px", fontWeight: 700, color: palette.accent }}>pandas</p>
            <p style={{ margin: "0 0 12px", fontSize: 14, lineHeight: 1.6 }}>Manipula o DataFrame e expõe <code>to_sql()</code> — você escreve praticamente zero SQL.</p>
            <p style={{ margin: "0 0 6px", fontWeight: 700, color: palette.accentAlt }}>SQLAlchemy</p>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>Cria a <code>engine</code> usada pelo pandas. <strong>Não substitui</strong> psycopg2 — usa-o como driver. A string <code>"postgresql+psycopg2://..."</code> torna isso explícito.</p>
          </div>
          <SectionHeading>O parâmetro if_exists — atenção crítica</SectionHeading>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead><tr><Th>Valor</Th><Th>O que faz</Th></tr></thead>
            <tbody>
              {[
                ["replace", "Dropa e RECRIA a tabela — perde índices, constraints e triggers"],
                ["append", "Adiciona registros sem apagar — risco de duplicatas"],
                ["fail", "Lança erro se a tabela existir — seguro para proteção"]
              ].map(([v, desc]) => (
                <tr key={v}><Td bold>{v}</Td><Td>{desc}</Td></tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: 12, padding: 12, borderRadius: 10, background: "#fef2f2", border: `1px solid #fecaca`, fontSize: 13, lineHeight: 1.55 }}>
            <strong>⚠ replace ≠ DELETE.</strong> O DELETE preserva a estrutura da tabela.
            O replace apaga e recria a tabela — índices, foreign keys e constraints são perdidos.
          </div>
          <TimingBox time="~1 minuto" verdict="Mais produtivo, mas menos previsível para tuning. Raramente supera execute_values em carga ajustada." />
        </div>
        <div>
          <SectionHeading alt>Código</SectionHeading>
          <CodeBlock lines={code} />
          <div style={{ marginTop: 14 }}>
            <SectionHeading>Quando usar / evitar</SectionHeading>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={{ background: palette.accentAltSoft, padding: 12, borderRadius: 10, border: `1px solid ${palette.border}`, fontSize: 13 }}>
                <p style={{ margin: "0 0 5px", fontWeight: 700, color: palette.accentAlt }}>✔ Usar quando</p>
                <p style={{ margin: 0, lineHeight: 1.5 }}>Prototipagem em Jupyter. Múltiplos bancos (só troca a string). Salvar resultados de análises.</p>
              </div>
              <div style={{ background: "#fef2f2", padding: 12, borderRadius: 10, border: `1px solid #fecaca`, fontSize: 13 }}>
                <p style={{ margin: "0 0 5px", fontWeight: 700, color: "#dc2626" }}>✖ Evitar quando</p>
                <p style={{ margin: 0, lineHeight: 1.5 }}>Tabelas com índices importantes (cuidado com replace). ETL de alto volume.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SlideWrapper>
  );
}

// ─── Slide 6: Method 4 ──────────────────────────────────────────────────────

function Method4Slide() {
  const code = [
    "import psycopg2, io",
    "",
    "conn = psycopg2.connect(...)",
    "cursor = conn.cursor()",
    "",
    'cursor.execute("DELETE FROM public.anac")',
    "",
    "colunas = ['Numero_da_Ocorrencia', 'Classificacao_da_Ocorrência',",
    "           'Data_da_Ocorrencia', 'Municipio', 'UF']",
    "",
    "buffer = io.StringIO()                        # arquivo na RAM",
    "df[colunas].to_csv(buffer, index=False, header=False)",
    "buffer.seek(0)                                # volta ao início",
    "",
    "cursor.copy_expert(",
    '    sql="""',
    "        COPY public.anac (numero, classificacao, data, municipio, uf)",
    "        FROM STDIN",
    "        WITH (FORMAT CSV, DELIMITER ',', NULL '', QUOTE '\"', ENCODING 'UTF8')",
    '    """,',
    "    file=buffer",
    ")",
    "",
    "conn.commit()"
  ];
  return (
    <SlideWrapper>
      <Badge alt>Método 4 · Recomendado para alto volume</Badge>
      <SlideTitle alt>Carga em massa com COPY</SlideTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div>
          <SectionHeading alt>Como funciona</SectionHeading>
          <BulletList items={[
            "Converte o DataFrame para um buffer CSV em memória (io.StringIO).",
            "Abre a conexão com psycopg2.",
            "Limpa a tabela com DELETE.",
            "Usa copy_expert() com COPY FROM STDIN.",
            "O PostgreSQL lê o stream diretamente — sem overhead de INSERT.",
            "Commit no final."
          ]} />
          <div style={{ marginTop: 14 }}>
            <SectionHeading>O papel do io.StringIO</SectionHeading>
            <p style={{ fontSize: 14, lineHeight: 1.65, color: palette.muted, margin: "0 0 12px" }}>
              Cria um "arquivo" que existe apenas na RAM. Nenhum byte vai ao disco.
              O PostgreSQL recebe o stream como se fosse um arquivo real.
            </p>
            <CodeBlock compact lines={[
              "buffer = io.StringIO()         # arquivo na memória",
              "df[cols].to_csv(buffer, ...)   # escreve CSV no buffer",
              "buffer.seek(0)                 # volta ao início",
              "cursor.copy_expert(sql, buffer) # PostgreSQL lê"
            ]} />
          </div>
          <div style={{ marginTop: 14, padding: 14, borderRadius: 12, background: "#fff7ed", border: `1px solid ${palette.border}`, fontSize: 13 }}>
            <p style={{ margin: "0 0 5px", fontWeight: 700, color: palette.warning }}>⚠ Atenção com tipos</p>
            <p style={{ margin: 0, lineHeight: 1.55 }}>
              COPY não usa type adapters automáticos. Datas precisam estar em YYYY-MM-DD.
              Nulos representados pela string configurada em NULL ''. Aspas tratadas por QUOTE e ESCAPE.
            </p>
          </div>
          <TimingBox time="~5 segundos" verdict="Canal nativo de importação do PostgreSQL. Melhor escolha para ETL de alto volume." alt />
        </div>
        <div>
          <SectionHeading alt>Código</SectionHeading>
          <CodeBlock lines={code} compact />
          <Panel highlight style={{ marginTop: 14 }}>
            <SectionHeading alt>Por que é o mais rápido</SectionHeading>
            <BulletList items={[
              "Bypassa o parser de INSERT por linha.",
              "Lê o stream de forma contínua — não instrução por instrução.",
              "Menos overhead de protocolo por linha que qualquer INSERT.",
              "PostgreSQL otimiza melhor a escrita em disco em batch.",
              "Apenas 1 round-trip para qualquer volume de dados."
            ]} />
          </Panel>
        </div>
      </div>
    </SlideWrapper>
  );
}

// ─── Slide 7: Comparison ────────────────────────────────────────────────────

function ComparisonSlide() {
  return (
    <SlideWrapper>
      <Badge>Comparação · 4 Métodos</Badge>
      <SlideTitle>Performance e características</SlideTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <Panel>
          <SectionHeading>Performance relativa (13.000 linhas, servidor remoto)</SectionHeading>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr><Th>Abordagem</Th><Th>Tempo</Th><Th>Round-trips</Th><Th>Overhead</Th></tr>
            </thead>
            <tbody>
              {[
                ["1. Linha a linha", "~16 min", "13.000", "Alto"],
                ["2. execute_values", "~30s", "~26", "Baixo"],
                ["3. pandas to_sql", "~1 min", "~130", "Médio"],
                ["4. COPY", "~5s", "1", "Mínimo"]
              ].map(([a, t, r, o]) => (
                <tr key={a}><Td bold>{a}</Td><Td>{t}</Td><Td>{r}</Td><Td>{o}</Td></tr>
              ))}
            </tbody>
          </table>
        </Panel>
        <Panel>
          <SectionHeading alt>O que cada abordagem ensina</SectionHeading>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr><Th>#</Th><Th>Conceito central aprendido</Th></tr>
            </thead>
            <tbody>
              {[
                ["1", "Fundamentos: conexão, cursor, transação, commit"],
                ["2", "Batch processing e redução de latência de rede"],
                ["3", "Abstração com ORM — produtividade acima de controle"],
                ["4", "Como bancos ingerem dados em volume nativamente"]
              ].map(([n, c]) => (
                <tr key={n}><Td bold>{n}</Td><Td>{c}</Td></tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </div>
      <Panel>
        <SectionHeading>Comparação de características</SectionHeading>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr><Th>Critério</Th><Th>Linha a linha</Th><Th>execute_values</Th><Th>pandas to_sql</Th><Th>COPY</Th></tr>
          </thead>
          <tbody>
            {[
              ["Velocidade", "★☆☆☆", "★★★☆", "★★☆☆", "★★★★"],
              ["Simplicidade do código", "★★★★", "★★★☆", "★★★★", "★★☆☆"],
              ["Controle sobre SQL", "Total", "Total", "Parcial", "Total"],
              ["Type adapters automáticos", "Sim", "Sim", "Sim", "Não"],
              ["Risco com tabelas existentes", "Baixo", "Baixo", "Alto (replace)", "Baixo"],
              ["Ideal para", "Aprendizado", "Dia a dia", "Prototipagem", "ETL produção"]
            ].map(([crit, ...vals]) => (
              <tr key={crit}>
                <Td bold>{crit}</Td>
                {vals.map((v, i) => <Td key={i} center={v.includes("★")}>{v}</Td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </SlideWrapper>
  );
}

// ─── Slide 8: execute_values vs COPY ────────────────────────────────────────

function DeepDiveSlide() {
  const rows = [
    ["Nível de controle", "Alto — você define SQL, tabela e colunas.", "Médio a alto — você controla tabela e fluxo, mas trabalha com formato tabular."],
    ["Como os dados saem do Python", "Lista de tuplas enviada como lote de VALUES.", "Fluxo tabular (CSV em memória ou arquivo temporário)."],
    ["Trabalho do PostgreSQL", "Processa um INSERT com muitas linhas.", "Usa o mecanismo nativo de importação em massa do banco."],
    ["Custo de rede", "Baixo comparado ao insert linha a linha.", "Ainda menor na maioria dos cenários de alto volume."],
    ["Curva de aprendizagem", "Mais simples para quem já entende INSERT parametrizado.", "Exige entender fluxo de arquivo, delimitadores e formato tabular."],
    ["Melhor uso", "Projetos que precisam de boa velocidade com SQL explícito.", "Cargas grandes, ETL, migrações e rotinas de alto volume."],
    ["copy_from vs copy_expert", "—", "copy_from: API simples, sem suporte a QUOTE/ESCAPE.\ncopy_expert: SQL completo, seguro para textos livres, suporta exportação."]
  ];
  return (
    <SlideWrapper>
      <Badge alt>Deep Dive · execute_values vs COPY</Badge>
      <SlideTitle>Os dois resolvem o problema — mas de formas diferentes</SlideTitle>
      <p style={{ fontSize: 17, lineHeight: 1.7, color: palette.muted, maxWidth: 820, margin: "0 0 24px" }}>
        Se você vem do Java: <strong>execute_values</strong> ainda é uma chamada SQL grande com múltiplos VALUES.
        <strong> COPY</strong> é um canal de importação nativo do banco — ele foi projetado para ingerir dados em massa,
        não para processar SQL linha a linha.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 20 }}>
        <Panel>
          <SectionHeading>Comparação direta</SectionHeading>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr><Th>Ponto</Th><Th>execute_values</Th><Th>COPY</Th></tr>
            </thead>
            <tbody>
              {rows.map(([topic, ev, cp]) => (
                <tr key={topic}>
                  <Td bold>{topic}</Td>
                  <Td>{ev}</Td>
                  <Td>{cp}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Panel highlight>
            <SectionHeading alt>Regra prática</SectionHeading>
            <BulletList items={[
              "Dados simples e tabulares → execute_values (código mais curto)",
              "Textos livres com vírgulas ou aspas → copy_expert (seguro com QUOTE)",
              "Precisa exportar dados ou usar subquery → copy_expert (único que permite)",
              "ETL de alto volume em produção → COPY é a escolha"
            ]} />
          </Panel>
          <Panel warn>
            <SectionHeading>Para os dados da ANAC</SectionHeading>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65 }}>
              <code>copy_expert</code> é o mais indicado: a coluna <code>Municipio</code> pode conter
              vírgulas (ex: "São Paulo, SP") e <code>Classificacao_da_Ocorrência</code> pode ter texto livre.
              O parâmetro <code>QUOTE '"'</code> garante segurança no parsing do CSV.
            </p>
          </Panel>
        </div>
      </div>
    </SlideWrapper>
  );
}

// ─── Slide 9: Takeaway ──────────────────────────────────────────────────────

function TakeawaySlide() {
  return (
    <SlideWrapper>
      <Badge>Conclusão · LinkedIn Post</Badge>
      <SlideTitle>O que aprendemos — e o que vale compartilhar</SlideTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div>
          <Panel>
            <SectionHeading>Ordem de recomendação</SectionHeading>
            <ol style={{ margin: 0, paddingLeft: 22, lineHeight: 2, fontSize: 16 }}>
              <li><strong>Para aprender SQL e psycopg2:</strong> Método 1 — linha a linha.</li>
              <li><strong>Para melhorar muito sem complicar:</strong> Método 2 — execute_values.</li>
              <li><strong>Para escrever menos código:</strong> Método 3 — pandas.to_sql.</li>
              <li><strong>Para alto volume e ETL:</strong> Método 4 — COPY.</li>
            </ol>
            <div style={{ marginTop: 18, padding: 16, borderRadius: 12, background: "#fff7ed", border: `1px solid ${palette.border}` }}>
              <p style={{ margin: "0 0 6px", fontWeight: 700, color: palette.warning }}>Leitura prática</p>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65 }}>
                Se a sua carga levou 16 minutos no servidor remoto, o próximo experimento mais valioso
                é medir execute_values contra COPY com o mesmo conjunto de dados. A diferença costuma
                ser de 30 segundos vs 5 segundos — com o mesmo banco e a mesma rede.
              </p>
            </div>
          </Panel>
          <div style={{ marginTop: 16 }}>
            <Panel highlight>
              <SectionHeading alt>Contexto por volume</SectionHeading>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead><tr><Th>Volume</Th><Th>Método ideal</Th></tr></thead>
                <tbody>
                  {[
                    ["Até ~100 linhas", "Qualquer um — aproveite para aprender"],
                    ["1k–100k linhas", "execute_values (page_size=500)"],
                    ["100k–1M linhas", "COPY com copy_expert"],
                    ["Acima de 1M linhas", "COPY + TRUNCATE + transação explícita"]
                  ].map(([v, m]) => (
                    <tr key={v}><Td bold>{v}</Td><Td>{m}</Td></tr>
                  ))}
                </tbody>
              </table>
            </Panel>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Panel>
            <SectionHeading>3 insights para um post no LinkedIn</SectionHeading>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                {
                  num: "01",
                  title: "O problema não era o banco",
                  text: "13.000 linhas levaram 16 minutos. O banco não estava lento — era o custo de 13.000 round-trips de rede. Trocar o método de INSERT para COPY reduziu para 5 segundos. Mesma rede, mesmo banco."
                },
                {
                  num: "02",
                  title: "Aprender a forma lenta tem valor",
                  text: "Começar com linha a linha é a forma correta de aprender. Você entende conexão, cursor, transação e commit antes de pular para abstrações. A performance vem depois — o modelo mental vem primeiro."
                },
                {
                  num: "03",
                  title: "COPY não é avançado — é nativo",
                  text: "O comando COPY não é uma otimização obscura. É o canal de importação em massa que o PostgreSQL oferece nativamente. Se você trabalha com ETL, conhecer isso não é opcional."
                }
              ].map((item) => (
                <div key={item.num} style={{ padding: 14, borderRadius: 12, background: palette.accentSoft, border: `1px solid ${palette.border}` }}>
                  <p style={{ margin: "0 0 4px", fontWeight: 700, color: palette.accent, fontSize: 13 }}>
                    {item.num} · {item.title}
                  </p>
                  <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: palette.text }}>{item.text}</p>
                </div>
              ))}
            </div>
          </Panel>
          <div style={{ padding: 16, borderRadius: 14, background: palette.accentAltSoft, border: `1px solid ${palette.border}` }}>
            <p style={{ margin: "0 0 6px", fontWeight: 700, color: palette.accentAlt }}>Próximos experimentos</p>
            <BulletList items={[
              "Medir execute_values vs COPY com os mesmos 13.000 registros.",
              "Testar COPY com TRUNCATE no lugar de DELETE (mais rápido para limpeza).",
              "Implementar carga incremental com COPY para apenas registros novos.",
              "Explorar psycopg3 (psycopg) com suporte a COPY assíncrono."
            ]} />
          </div>
        </div>
      </div>
    </SlideWrapper>
  );
}

// ─── Slide registry ─────────────────────────────────────────────────────────

const SLIDES = [
  { id: "title",      label: "Título",                component: TitleSlide },
  { id: "problem",    label: "O Problema",             component: ProblemSlide },
  { id: "method1",    label: "Método 1 — linha a linha", component: Method1Slide },
  { id: "method2",    label: "Método 2 — execute_values", component: Method2Slide },
  { id: "method3",    label: "Método 3 — pandas.to_sql", component: Method3Slide },
  { id: "method4",    label: "Método 4 — COPY",        component: Method4Slide },
  { id: "comparison", label: "Comparação",             component: ComparisonSlide },
  { id: "deepdive",   label: "execute_values vs COPY", component: DeepDiveSlide },
  { id: "takeaway",   label: "Conclusão",              component: TakeawaySlide }
];

// ─── Navigation styles ──────────────────────────────────────────────────────

const navBtnStyle = (disabled) => ({
  background: disabled ? "#e5e7eb" : palette.accent,
  color: disabled ? "#9ca3af" : "#fff",
  border: "none",
  borderRadius: 10,
  padding: "10px 22px",
  fontSize: 18,
  fontWeight: 700,
  cursor: disabled ? "default" : "pointer",
  transition: "background 0.2s, transform 0.1s",
  boxShadow: disabled ? "none" : "0 4px 12px rgba(154,52,18,0.25)"
});

// ─── Main export ─────────────────────────────────────────────────────────────

export default function AnacLoadMethodsPresentation() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown")
        setCurrent((c) => Math.min(c + 1, SLIDES.length - 1));
      if (e.key === "ArrowLeft" || e.key === "ArrowUp")
        setCurrent((c) => Math.max(c - 1, 0));
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const SlideComponent = SLIDES[current].component;
  const progress = (current / (SLIDES.length - 1)) * 100;

  return (
    <div
      style={{
        height: "100vh",
        overflow: "hidden",
        position: "relative",
        background: `linear-gradient(180deg, ${palette.background} 0%, #eadfcd 100%)`,
        fontFamily: 'Georgia, "Times New Roman", serif',
        color: palette.text
      }}
    >
      {/* Progress bar */}
      <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: 4, background: palette.border, zIndex: 100 }}>
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: palette.accent,
            transition: "width 0.35s ease"
          }}
        />
      </div>

      {/* Slide label */}
      <div style={{ position: "fixed", top: 14, right: 18, fontSize: 12, color: palette.muted, fontWeight: 700, letterSpacing: 0.5, zIndex: 100 }}>
        {SLIDES[current].label}
      </div>

      {/* Slide content */}
      <SlideComponent />

      {/* Navigation buttons */}
      <div
        style={{
          position: "fixed",
          bottom: 24,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          gap: 16,
          zIndex: 100
        }}
      >
        <button
          onClick={() => setCurrent((c) => Math.max(c - 1, 0))}
          disabled={current === 0}
          style={navBtnStyle(current === 0)}
        >
          ←
        </button>
        <span style={{ fontSize: 14, color: palette.muted, minWidth: 56, textAlign: "center" }}>
          {current + 1} / {SLIDES.length}
        </span>
        <button
          onClick={() => setCurrent((c) => Math.min(c + 1, SLIDES.length - 1))}
          disabled={current === SLIDES.length - 1}
          style={navBtnStyle(current === SLIDES.length - 1)}
        >
          →
        </button>
      </div>

      {/* Dot navigation */}
      <div
        style={{
          position: "fixed",
          bottom: 30,
          right: 24,
          display: "flex",
          gap: 6,
          zIndex: 100
        }}
      >
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setCurrent(i)}
            title={s.label}
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              border: "none",
              cursor: "pointer",
              padding: 0,
              background: i === current ? palette.accent : palette.border,
              transition: "background 0.2s, transform 0.15s",
              transform: i === current ? "scale(1.3)" : "scale(1)"
            }}
          />
        ))}
      </div>
    </div>
  );
}
