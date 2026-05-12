import React from "react";

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

const scenarios = [
  {
    id: "scenario-1",
    title: "Cenario 1",
    subtitle: "insert linha a linha com cursor.execute",
    location: "Notebook 04, celula 7",
    logic: [
      "Abre a conexao e cria o cursor.",
      "Apaga os registros existentes com delete.",
      "Percorre o DataFrame usando iterrows().",
      "Monta um INSERT para uma unica linha.",
      "Envia esse INSERT para o servidor remoto.",
      "Repete o processo para cada linha.",
      "Executa commit apenas no final."
    ],
    execution: [
      "Ha uma chamada de banco para cada registro.",
      "A rede participa 13 mil vezes se houver 13 mil linhas.",
      "O SQL e parseado varias vezes.",
      "A latencia do servidor remoto pesa muito."
    ],
    timing: "Foi o pior caso observado: cerca de 16 minutos para 13 mil linhas.",
    verdict: "Mais didatico, menos eficiente."
  },
  {
    id: "scenario-2",
    title: "Cenario 2",
    subtitle: "insert em lote com execute_values",
    location: "Notebook 04, celula 8",
    logic: [
      "Abre a conexao e cria o cursor.",
      "Apaga os registros existentes com delete.",
      "Transforma o DataFrame em uma lista de tuplas.",
      "Monta um unico INSERT com VALUES %s.",
      "Usa execute_values para enviar varias linhas em lote.",
      "Executa commit no final."
    ],
    execution: [
      "Reduz drasticamente a quantidade de viagens pela rede.",
      "Agrupa o trabalho no lado cliente antes de enviar.",
      "Mantem SQL manual e controle das colunas.",
      "Costuma ser a melhor opcao quando se quer performance com psycopg2."
    ],
    timing: "Normalmente cai de minutos para segundos ou poucas dezenas de segundos.",
    verdict: "Melhor equilibrio entre controle e velocidade."
  },
  {
    id: "scenario-3",
    title: "Cenario 3",
    subtitle: "envio do DataFrame com pandas.to_sql e SQLAlchemy",
    location: "Notebook 07, celula 6",
    logic: [
      "Cria uma engine do SQLAlchemy.",
      "Passa o DataFrame para o pandas com to_sql().",
      "Delega a geracao do SQL para as bibliotecas.",
      "No notebook atual usa if_exists='replace'.",
      "Fecha a engine ao final."
    ],
    execution: [
      "Voce escreve menos codigo SQL.",
      "Ganha produtividade e perde parte do controle fino.",
      "Replace recria a tabela em vez de apenas limpar os dados.",
      "A performance depende mais da implementacao interna e da configuracao usada."
    ],
    timing: "Geralmente melhor que insert linha a linha, mas nem sempre supera execute_values.",
    verdict: "Mais produtivo, mas nao e o mais previsivel para tuning."
  },
  {
    id: "scenario-4",
    title: "Cenario 4",
    subtitle: "carga em massa com COPY",
    location: "Novo cenario recomendado para alto volume",
    logic: [
      "Converte o DataFrame para um formato tabular, como CSV em memoria.",
      "Abre a conexao e o cursor.",
      "Opcionalmente limpa a tabela ou carrega em tabela temporaria.",
      "Usa COPY FROM STDIN para empurrar o arquivo tabular para o PostgreSQL.",
      "O proprio PostgreSQL faz a leitura em massa.",
      "Executa commit ao final."
    ],
    execution: [
      "Foi feito para bulk load.",
      "Tem menos overhead que INSERT, inclusive em lote.",
      "Aproveita melhor o pipeline interno do PostgreSQL.",
      "Em geral e a opcao mais rapida para cargas grandes."
    ],
    timing: "Em volumes maiores, costuma superar execute_values e ficar na faixa de segundos.",
    verdict: "Melhor escolha quando a prioridade maxima e performance de carga."
  }
];

const comparisonRows = [
  {
    topic: "Nivel de controle",
    executeValues: "Alto. Voce define o SQL, a tabela e a ordem das colunas.",
    copy: "Medio a alto. Voce controla a tabela e o fluxo, mas trabalha com formato tabular em vez de varios INSERTs."
  },
  {
    topic: "Como os dados saem do Python",
    executeValues: "Lista de tuplas enviada como lote de VALUES.",
    copy: "Fluxo tabular, normalmente CSV em memoria ou arquivo temporario."
  },
  {
    topic: "Trabalho do PostgreSQL",
    executeValues: "Processa um INSERT com muitas linhas.",
    copy: "Usa o mecanismo nativo de importacao em massa do banco."
  },
  {
    topic: "Custo de rede",
    executeValues: "Baixo comparado ao insert linha a linha.",
    copy: "Ainda menor na maioria dos cenarios de alto volume."
  },
  {
    topic: "Curva de aprendizagem",
    executeValues: "Mais simples para quem ja entende INSERT parametrizado.",
    copy: "Exige entender fluxo de arquivo ou stream, delimitadores e formato tabular."
  },
  {
    topic: "Melhor uso",
    executeValues: "Projetos que precisam de boa velocidade com SQL explicito.",
    copy: "Cargas grandes, ETL, migracoes e rotinas de alto volume."
  }
];

const copyExample = [
  "import io",
  "import psycopg2",
  "",
  "buffer = io.StringIO()",
  "df.to_csv(buffer, index=False, header=False, sep='\\t')",
  "buffer.seek(0)",
  "",
  "with psycopg2.connect(...) as conexao:",
  "    with conexao.cursor() as cursor:",
  "        cursor.execute('delete from public.anac')",
  "        cursor.copy_from(buffer, 'anac', sep='\\t', columns=(",
  "            'Numero_da_Ocorrencia',",
  "            'Classificacao_da_Ocorrencia',",
  "            'Data_da_Ocorrencia',",
  "            'Municipio',",
  "            'UF',",
  "            'Regiao',",
  "            'Nome_do_Fabricante'",
  "        ))"
];

function SectionTitle(props) {
  return (
    <h2
      style={{
        margin: "0 0 14px",
        fontSize: 28,
        lineHeight: 1.1,
        color: props.alt ? palette.accentAlt : palette.accent
      }}
    >
      {props.children}
    </h2>
  );
}

function BulletList(props) {
  return (
    <ul style={{ margin: 0, paddingLeft: 22, lineHeight: 1.65 }}>
      {props.items.map((item) => (
        <li key={item} style={{ marginBottom: 8 }}>
          {item}
        </li>
      ))}
    </ul>
  );
}

function Card(props) {
  return (
    <article
      style={{
        background: palette.panel,
        border: `1px solid ${palette.border}`,
        borderRadius: 20,
        padding: 24,
        boxShadow: "0 14px 30px rgba(58, 38, 18, 0.08)"
      }}
    >
      {props.children}
    </article>
  );
}

export default function AnacLoadMethodsPresentation() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(180deg, ${palette.background} 0%, #eadfcd 100%)`,
        color: palette.text,
        fontFamily: 'Georgia, "Times New Roman", serif',
        padding: 32
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <header style={{ marginBottom: 24 }}>
          <div
            style={{
              display: "inline-block",
              borderRadius: 999,
              padding: "8px 14px",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 0.8,
              textTransform: "uppercase",
              color: palette.accent,
              background: palette.accentSoft,
              border: `1px solid ${palette.border}`
            }}
          >
            PostgreSQL load presentation
          </div>
          <h1 style={{ fontSize: 50, lineHeight: 1.05, margin: "18px 0 10px" }}>
            4 cenarios para popular a base de dados da ANAC
          </h1>
          <p style={{ fontSize: 20, lineHeight: 1.7, color: palette.muted, maxWidth: 980 }}>
            Esta apresentacao compara a logica, a forma de execucao e o tempo esperado entre o
            insert linha a linha, o insert em lote com execute_values, o envio com to_sql e o
            cenario 4 recomendado para alto volume: COPY.
          </p>
        </header>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18, marginBottom: 24 }}>
          {scenarios.map((scenario) => (
            <Card key={scenario.id}>
              <p style={{ margin: 0, color: palette.muted, fontWeight: 700 }}>{scenario.location}</p>
              <h3 style={{ fontSize: 30, lineHeight: 1.1, margin: "8px 0 8px" }}>{scenario.title}</h3>
              <p style={{ margin: "0 0 16px", color: palette.accentAlt, fontSize: 18 }}>{scenario.subtitle}</p>

              <SectionTitle>Logica usada</SectionTitle>
              <BulletList items={scenario.logic} />

              <div style={{ height: 18 }} />
              <SectionTitle alt>Forma de execucao</SectionTitle>
              <BulletList items={scenario.execution} />

              <div
                style={{
                  marginTop: 18,
                  padding: 16,
                  borderRadius: 14,
                  background: scenario.id === "scenario-4" ? palette.accentAltSoft : palette.accentSoft,
                  border: `1px solid ${palette.border}`
                }}
              >
                <p style={{ margin: "0 0 8px", fontWeight: 700 }}>Tempo de execucao</p>
                <p style={{ margin: "0 0 8px", lineHeight: 1.6 }}>{scenario.timing}</p>
                <p style={{ margin: 0, fontWeight: 700 }}>{scenario.verdict}</p>
              </div>
            </Card>
          ))}
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 18, marginBottom: 24 }}>
          <Card>
            <SectionTitle>execute_values vs COPY</SectionTitle>
            <p style={{ marginTop: 0, lineHeight: 1.7, color: palette.muted }}>
              Os dois resolvem o problema do cenario 1, mas trabalham de formas diferentes. Se voce
              vem do Java, pense assim: execute_values ainda e uma chamada SQL grande; COPY e um canal
              de importacao nativo do banco para despejar dados em massa.
            </p>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 16 }}>
                <thead>
                  <tr>
                    <th style={tableHeaderStyle}>Ponto</th>
                    <th style={tableHeaderStyle}>execute_values</th>
                    <th style={tableHeaderStyle}>COPY</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row) => (
                    <tr key={row.topic}>
                      <td style={tableCellTitleStyle}>{row.topic}</td>
                      <td style={tableCellStyle}>{row.executeValues}</td>
                      <td style={tableCellStyle}>{row.copy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card>
            <SectionTitle alt>Ordem de recomendacao</SectionTitle>
            <ol style={{ margin: 0, paddingLeft: 22, lineHeight: 1.8 }}>
              <li>Para aprender SQL: cenario 1.</li>
              <li>Para melhorar muito sem complicar demais: cenario 2.</li>
              <li>Para escrever menos codigo: cenario 3.</li>
              <li>Para alto volume e ETL: cenario 4.</li>
            </ol>
            <div
              style={{
                marginTop: 18,
                padding: 16,
                borderRadius: 14,
                background: "#fff7ed",
                border: `1px solid ${palette.border}`
              }}
            >
              <p style={{ margin: "0 0 8px", fontWeight: 700, color: palette.warning }}>Leitura pratica</p>
              <p style={{ margin: 0, lineHeight: 1.65 }}>
                Se a sua carga atual levou 16 minutos no servidor remoto, o proximo experimento tecnico
                mais valioso e medir execute_values contra COPY com o mesmo conjunto de dados.
              </p>
            </div>
          </Card>
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "0.95fr 1.05fr", gap: 18 }}>
          <Card>
            <SectionTitle>Step by step do COPY</SectionTitle>
            <ol style={{ margin: 0, paddingLeft: 22, lineHeight: 1.75 }}>
              <li>Selecionar e ordenar as colunas do DataFrame na mesma ordem da tabela.</li>
              <li>Converter o DataFrame para um formato tabular sem header.</li>
              <li>Criar um buffer em memoria para evitar arquivo fisico.</li>
              <li>Apontar o cursor para a tabela destino.</li>
              <li>Usar copy_from ou copy_expert para transferir os dados.</li>
              <li>Executar commit no final.</li>
            </ol>
            <p style={{ margin: "16px 0 0", lineHeight: 1.7, color: palette.muted }}>
              A principal ideia e esta: em vez de dizer ao banco "insira esta linha" varias vezes,
              voce diz "aqui esta um bloco grande de dados, importe tudo".
            </p>
          </Card>

          <Card>
            <SectionTitle alt>Exemplo base de COPY com psycopg2</SectionTitle>
            <pre
              style={{
                margin: 0,
                padding: 18,
                borderRadius: 16,
                background: palette.codeBg,
                color: palette.codeText,
                overflowX: "auto",
                fontSize: 14,
                lineHeight: 1.6
              }}
            >
              <code>{copyExample.join("\n")}</code>
            </pre>
          </Card>
        </section>
      </div>
    </div>
  );
}

const tableHeaderStyle = {
  textAlign: "left",
  padding: "12px 14px",
  background: "#f1e7d8",
  borderBottom: `1px solid ${palette.border}`,
  verticalAlign: "top"
};

const tableCellStyle = {
  padding: "14px",
  borderBottom: `1px solid ${palette.border}`,
  verticalAlign: "top",
  lineHeight: 1.6
};

const tableCellTitleStyle = {
  ...tableCellStyle,
  fontWeight: 700,
  width: "22%"
};