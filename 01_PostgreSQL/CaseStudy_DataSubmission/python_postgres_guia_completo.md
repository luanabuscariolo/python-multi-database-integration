# Python + PostgreSQL: guia completo de carga de dados

> Documento de referência cobrindo as 4 abordagens de envio de dados para PostgreSQL com Python, a arquitetura interna do psycopg2, o modelo de transações, type adapters e a diferença entre `copy_from` e `copy_expert`.

---

## Sumário

1. [Contexto do problema](#1-contexto-do-problema)
2. [Visão geral das 4 abordagens](#2-visão-geral-das-4-abordagens)
3. [Abordagem 1 — Inserção linha a linha](#3-abordagem-1--inserção-linha-a-linha)
4. [Abordagem 2 — Inserção em lote com execute_values](#4-abordagem-2--inserção-em-lote-com-execute_values)
5. [Abordagem 3 — pandas.to_sql + SQLAlchemy](#5-abordagem-3--pandasto_sql--sqlalchemy)
6. [Abordagem 4 — Carga em massa com COPY](#6-abordagem-4--carga-em-massa-com-copy)
7. [Comparação entre as 4 abordagens](#7-comparação-entre-as-4-abordagens)
8. [Arquitetura interna do psycopg2](#8-arquitetura-interna-do-psycopg2)
9. [Modelo de transações](#9-modelo-de-transações)
10. [Type adapters — Python ↔ PostgreSQL](#10-type-adapters--python--postgresql)
11. [copy_from vs copy_expert](#11-copy_from-vs-copy_expert)
12. [Casos de uso práticos](#12-casos-de-uso-práticos)
13. [Referência rápida de bibliotecas](#13-referência-rápida-de-bibliotecas)

---

## 1. Contexto do problema

O projeto consiste em ler o arquivo JSON da ANAC (`V_OCORRENCIA_AMPLA.json`), tratar as colunas necessárias e enviar os dados para uma tabela no PostgreSQL. O arquivo contém aproximadamente **13.000 registros** e as colunas principais usadas são:

- `Numero_da_Ocorrencia`
- `Classificacao_da_Ocorrência`
- `Data_da_Ocorrencia`
- `Municipio`
- `UF`
- `Regiao`
- `Nome_do_Fabricante`

### O problema observado

Com a abordagem mais simples (inserção linha a linha), o tempo de carga chegou a **~16 minutos** para 13.000 linhas em um servidor remoto.

A causa raiz não é o banco de dados sendo lento. É o **custo de round-trip de rede**: cada linha enviada individualmente obriga Python a fazer uma viagem completa até o servidor PostgreSQL e voltar antes de enviar a próxima.

```
Python → rede → PostgreSQL → rede → Python  (repetido 13.000 vezes)
```

Com ~70ms de latência por viagem: `70ms × 13.000 = ~910 segundos ≈ 15–16 minutos`.

---

## 2. Visão geral das 4 abordagens

| # | Método | Biblioteca principal | Velocidade estimada | Round-trips |
|---|--------|---------------------|---------------------|-------------|
| 1 | Linha a linha | `psycopg2` | ~16 min | 13.000 |
| 2 | `execute_values` | `psycopg2.extras` | ~30s | ~26 |
| 3 | `pandas.to_sql` | `pandas` + `SQLAlchemy` | ~1 min | ~130 |
| 4 | `COPY` bulk | `psycopg2` + `io` | ~5s | 1 |

### Analogias

| # | Analogia |
|---|----------|
| 1 | Moto entregando uma carta por viagem |
| 2 | Caminhão levando todas as cartas de uma vez |
| 3 | Transportadora terceirizada decidindo a logística |
| 4 | Esteira industrial direta para o depósito do banco |

---

## 3. Abordagem 1 — Inserção linha a linha

### Como funciona

1. Abre a conexão com `psycopg2.connect()`
2. Cria o cursor com `conn.cursor()`
3. Executa `DELETE FROM tabela` para limpar os dados existentes
4. Percorre o DataFrame com `df.iterrows()`
5. Para cada linha, executa um `INSERT` individual
6. Faz `conn.commit()` no final

### Código

```python
import psycopg2

conn = psycopg2.connect(
    host="localhost",
    database="meu_banco",
    user="user",
    password="senha"
)
cursor = conn.cursor()

cursor.execute("DELETE FROM public.anac")

for index, row in df.iterrows():
    cursor.execute("""
        INSERT INTO public.anac
        (numero, classificacao, data, municipio, uf)
        VALUES (%s, %s, %s, %s, %s)
    """, (
        row['Numero_da_Ocorrencia'],
        row['Classificacao_da_Ocorrência'],
        row['Data_da_Ocorrencia'],
        row['Municipio'],
        row['UF']
    ))

conn.commit()
cursor.close()
conn.close()
```

### Por que é lento

Cada `cursor.execute()` representa um round-trip completo: Python envia a query, o servidor recebe, processa, confirma, e só então Python pode enviar a próxima. Com 13.000 registros em servidor remoto, o tempo se acumula de forma linear.

### O que esta abordagem ensina

- O modelo mental de conexão, cursor, query e commit
- Como parâmetros `%s` são enviados separados da query (prevenção de SQL injection)
- A estrutura base de qualquer interação Python ↔ PostgreSQL

### Quando usar

- Aprender a lógica de conexão e fundamentos do psycopg2
- Volumes pequenos (até ~100 registros)
- Quando há lógica condicional diferente para cada linha individualmente

### Quando **não** usar

- Acima de ~1.000 linhas em servidor remoto — fica impraticável
- Qualquer pipeline de produção com volume mínimo de dados

---

## 4. Abordagem 2 — Inserção em lote com execute_values

### Como funciona

1. Abre a conexão com `psycopg2.connect()`
2. Importa `execute_values` do módulo `psycopg2.extras`
3. Converte o DataFrame em uma lista de tuplas
4. Chama `execute_values()` com todos os dados de uma vez — **uma única chamada ao banco**
5. Faz `conn.commit()`

### Código

```python
import psycopg2
from psycopg2.extras import execute_values

conn = psycopg2.connect(
    host="localhost",
    database="meu_banco",
    user="user",
    password="senha"
)
cursor = conn.cursor()

cursor.execute("DELETE FROM public.anac")

dados = list(df[['Numero_da_Ocorrencia', 'Classificacao_da_Ocorrência',
                  'Data_da_Ocorrencia', 'Municipio', 'UF']].itertuples(index=False, name=None))

execute_values(
    cursor,
    """INSERT INTO public.anac
       (numero, classificacao, data, municipio, uf)
       VALUES %s""",
    dados,
    page_size=500   # linhas por lote (padrão: 100)
)

conn.commit()
cursor.close()
conn.close()
```

### Por que é muito mais rápido

O `execute_values` monta internamente um único `INSERT` com múltiplos `VALUES`:

```sql
INSERT INTO public.anac (numero, classificacao, data, municipio, uf)
VALUES (%s, %s, %s, %s, %s), (%s, %s, %s, %s, %s), (%s, %s, %s, %s, %s), ...
```

Com `page_size=500`, são apenas 26 round-trips para 13.000 linhas (`13.000 ÷ 500 = 26`), em vez de 13.000. O PostgreSQL também otimiza melhor quando recebe muitos valores em um único statement.

### O parâmetro page_size

Controla quantas linhas são enviadas por lote. O padrão é 100.

| page_size | Round-trips (13k linhas) |
|-----------|--------------------------|
| 100 (padrão) | 130 |
| 500 | 26 |
| 1000 | 13 |

Para a maioria dos casos, `page_size=500` é um bom equilíbrio entre memória e velocidade.

### O que esta abordagem ensina

- Batch processing: agrupar operações para reduzir latência de rede
- Melhor uso do psycopg2 além do básico
- Como o módulo `extras` estende as capacidades do driver

### Quando usar

- Melhor relação entre controle e velocidade para a maioria dos casos práticos
- Pipelines ETL que rodam regularmente com volume médio (1k–500k registros)
- Quando você quer manter controle total sobre o SQL sem depender de abstrações
- Sem dependência de pandas — funciona com qualquer lista de tuplas em Python puro
- **Melhor escolha para o caso ANAC**

---

## 5. Abordagem 3 — pandas.to_sql + SQLAlchemy

### As duas bibliotecas e o que cada uma faz

**pandas** — manipula o DataFrame e expõe o método `to_sql()` que envia os dados direto para o banco. Você escreve praticamente zero SQL.

**SQLAlchemy** — cria a `engine` (objeto de conexão) que o pandas usa por baixo. Suporta PostgreSQL, MySQL, SQLite, Oracle, SQL Server e outros com a mesma API, apenas trocando a string de conexão.

A relação entre elas: SQLAlchemy não substitui psycopg2 — ele usa psycopg2 por baixo como *driver*. A string `"postgresql+psycopg2://..."` deixa isso explícito.

### Como funciona

1. Cria uma `engine` com `create_engine()`
2. Passa o DataFrame inteiro para `df.to_sql()`
3. pandas + SQLAlchemy montam e executam o SQL automaticamente
4. Fecha a engine com `engine.dispose()`

### Código

```python
import pandas as pd
from sqlalchemy import create_engine

engine = create_engine(
    "postgresql+psycopg2://user:senha@localhost/meu_banco"
)

df.to_sql(
    name="anac",
    con=engine,
    schema="public",
    if_exists="append",    # ver tabela abaixo
    index=False,
    chunksize=1000         # envia em lotes de 1000 linhas
)

engine.dispose()
```

### O parâmetro if_exists — diferença crítica

| Valor | O que faz | Perigo |
|-------|-----------|--------|
| `replace` | Dropa e recria a tabela | **Perde índices, constraints, triggers e metadados** |
| `append` | Adiciona os registros sem apagar | Risco de duplicatas |
| `fail` | Lança erro se a tabela já existir | Seguro para proteção |

> **Atenção:** `replace` é fundamentalmente diferente de `DELETE`. O DELETE apaga os dados e preserva a estrutura da tabela. O `replace` apaga e recria a tabela do zero — índices, foreign keys e constraints são perdidos.

### O que esta abordagem ensina

- Abstração com ORM: menos código, menos controle
- Como pandas e SQLAlchemy se integram
- O conceito de engine como objeto de conexão reutilizável

### Quando usar

- Prototipagem rápida e exploração de dados em notebooks Jupyter
- Quando você trabalha com múltiplos bancos (basta trocar a string de conexão)
- Quando produtividade importa mais que performance máxima
- Salvamento de resultados de análises exploratórias

### Quando **não** usar

- Produção com tabelas que têm índices ou constraints importantes (cuidado com `replace`)
- Quando performance é requisito — raramente supera `execute_values` em carga ajustada
- Pipelines ETL de alto volume

---

## 6. Abordagem 4 — Carga em massa com COPY

### Como funciona

1. Converte o DataFrame para um buffer CSV **em memória** com `io.StringIO` (sem gravar nada em disco)
2. Abre a conexão com psycopg2
3. Limpa a tabela com DELETE ou TRUNCATE
4. Chama `cursor.copy_expert()` com o comando COPY
5. O PostgreSQL recebe o stream diretamente — sem overhead de INSERT
6. Commit

### O papel do io.StringIO

`io.StringIO` cria um arquivo CSV que existe apenas na RAM. O PostgreSQL recebe esse stream como se fosse um arquivo real, mas nenhum byte vai ao disco. Isso elimina I/O de armazenamento e mantém tudo na memória, acelerando ainda mais a carga.

```python
buffer = io.StringIO()            # "arquivo" na memória
df[colunas].to_csv(buffer, ...)   # escreve CSV no buffer
buffer.seek(0)                    # volta ao início para leitura
cursor.copy_expert("COPY ... FROM STDIN ...", buffer)  # PostgreSQL lê
```

### Código completo

```python
import psycopg2
import io

conn = psycopg2.connect(
    host="localhost",
    database="meu_banco",
    user="user",
    password="senha"
)
cursor = conn.cursor()

cursor.execute("DELETE FROM public.anac")

colunas = ['Numero_da_Ocorrencia', 'Classificacao_da_Ocorrência',
           'Data_da_Ocorrencia', 'Municipio', 'UF']

buffer = io.StringIO()
df[colunas].to_csv(buffer, index=False, header=False)
buffer.seek(0)

cursor.copy_expert(
    sql="""
        COPY public.anac (numero, classificacao, data, municipio, uf)
        FROM STDIN
        WITH (
            FORMAT CSV,
            DELIMITER ',',
            NULL '',
            QUOTE '"',
            ESCAPE '\\',
            ENCODING 'UTF8'
        )
    """,
    file=buffer
)

conn.commit()
cursor.close()
conn.close()
```

### Por que é o método mais rápido

O comando `COPY` é o canal nativo de importação em massa do PostgreSQL. Ele foi projetado para ingestão de grandes volumes:

- Bypassa parte do processamento de INSERT (sem parser de query por linha)
- Lê o stream de dados de forma contínua, não instrução por instrução
- Menos overhead de protocolo por linha do que qualquer forma de INSERT
- O PostgreSQL consegue otimizar melhor a escrita em disco em batch

### O que esta abordagem ensina

- Como bancos de dados funcionam por dentro em termos de ingestão de dados
- O conceito de stream de dados como alternativa a queries individuais
- ETL profissional: o padrão usado em migrações e data warehouses

### Quando usar

- ETL de alto volume: migrações, carga inicial, arquivos grandes (100k+ registros)
- Pipelines de produção onde performance é requisito não-negociável
- Data warehouses e data lakes com carga periódica de grandes volumes
- Backups e restaurações de dados

### Cuidado com tipos de dados

Diferente de `execute()`, o COPY não usa type adapters automáticos. Você envia um stream de texto. Isso significa:

- **Datas** precisam estar no formato que o PostgreSQL espera (`YYYY-MM-DD`)
- **Nulos** precisam ser representados pela string configurada em `NULL ''`
- **Aspas e vírgulas** dentro de strings precisam ser tratadas pelo `QUOTE` e `ESCAPE`

---

## 7. Comparação entre as 4 abordagens

### Performance relativa (13.000 linhas, servidor remoto)

| Abordagem | Tempo estimado | Round-trips | Overhead por linha |
|-----------|----------------|-------------|-------------------|
| 1. Linha a linha | ~16 min | 13.000 | Alto (query + network) |
| 2. execute_values | ~30s | ~26 | Baixo (batch SQL) |
| 3. pandas to_sql | ~1 min | ~130 | Médio (abstração) |
| 4. COPY | ~5s | 1 | Mínimo (stream nativo) |

### Comparação de características

| Critério | Linha a linha | execute_values | pandas to_sql | COPY |
|----------|:---:|:---:|:---:|:---:|
| Velocidade | ★☆☆☆ | ★★★☆ | ★★☆☆ | ★★★★ |
| Simplicidade do código | ★★★★ | ★★★☆ | ★★★★ | ★★☆☆ |
| Controle sobre SQL | Total | Total | Parcial | Total |
| Suporte a tipos automático | Sim | Sim | Sim | Não |
| Dependências | psycopg2 | psycopg2 | pandas + SQLAlchemy | psycopg2 + io |
| Risco com tabelas existentes | Baixo | Baixo | Alto (replace) | Baixo |
| Ideal para | Aprendizado | Dia a dia | Prototipagem | Produção ETL |

### O que cada abordagem ensina de verdade

| # | Conceito central aprendido |
|---|---------------------------|
| 1 | Fundamentos: conexão, cursor, transação, commit |
| 2 | Batch processing e redução de latência de rede |
| 3 | Abstração com ORM — produtividade acima de controle |
| 4 | Como bancos de dados ingerem dados em volume nativamente |

---

## 8. Arquitetura interna do psycopg2

### O que é psycopg2 de verdade

psycopg2 **não é Python puro**. É uma extensão C do CPython, compilada como arquivo `.so` (Linux) ou `.pyd` (Windows). Toda a comunicação de rede acontece em código C compilado — não em Python interpretado.

```
seu código Python
       ↓ chama
psycopg2  (extensão C do CPython)
  ├── Connection  (socket + autenticação)
  ├── Cursor      (envio de SQL + resultados)
  └── TypeAdapters (conversão Python ↔ PostgreSQL)
       ↓ wraps
libpq  (biblioteca C oficial do PostgreSQL)
  └── protocolo de rede, auth, SSL, encoding
       ↓ TCP / socket
PostgreSQL server
  ├── parser → planner → executor
  └── storage (tabelas, WAL)
```

### O que acontece no psycopg2.connect()

1. **CPython carrega a extensão C** — o arquivo compilado é carregado em memória como módulo nativo
2. **libpq abre o socket TCP** — resolve o DNS, abre a conexão na porta 5432, negocia SSL e autentica o usuário via MD5 ou SCRAM-SHA-256
3. **Objeto Connection criado** — wraps o handle de conexão da libpq. Mantém estado: `autocommit`, `encoding`, `isolation_level`
4. **Cursors compartilham o socket** — múltiplos cursors na mesma conexão compartilham o mesmo socket TCP e a mesma transação. Não são conexões paralelas

### O que libpq faz que você nunca vê

**Protocolo de rede:** serializa cada query em mensagens do PostgreSQL Wire Protocol v3. Cada `execute()` manda uma mensagem `Query` e aguarda `CommandComplete` antes de continuar.

**Parametrização segura:** os `%s` no SQL nunca são interpolados em Python como strings. São enviados como parâmetros separados via Extended Query Protocol. Isso previne SQL injection por design — não é uma validação de string, é um canal de comunicação separado.

### Inspecionando o estado da conexão

```python
conn = psycopg2.connect("host=localhost dbname=db user=u password=p")

print(conn.status)           # 1 = CONNECTION_OK
print(conn.encoding)         # UTF8
print(conn.isolation_level)  # 1 = READ COMMITTED (padrão)
print(conn.autocommit)       # False

cur = conn.cursor()
cur.execute("SELECT count(*) FROM public.anac")
print(cur.statusmessage)     # 'SELECT 1'
print(cur.rowcount)          # 1
print(cur.fetchone())        # (13000,)
```

---

## 9. Modelo de transações

### O comportamento padrão

`autocommit = False` por padrão. Qualquer SQL — inclusive um SELECT — já está dentro de uma transação. O `BEGIN` é emitido automaticamente pela libpq na primeira query após a conexão ou após um commit/rollback.

```
primeira query → BEGIN implícito → ... queries ... → conn.commit() ou conn.rollback()
```

### Os três métodos de controle

**`conn.commit()`** — confirma tudo feito desde o último commit. O PostgreSQL grava no WAL e os dados ficam persistentes e visíveis para outras conexões.

**`conn.rollback()`** — desfaz tudo desde o último commit. Se uma exceção acontece e você não faz rollback, a conexão fica em estado de erro até o próximo rollback.

**`conn.autocommit = True`** — cada SQL é confirmado imediatamente, sem transação explícita. Necessário para `CREATE DATABASE`, `VACUUM` e para o comando `COPY`.

### Padrão recomendado com tratamento de erro

```python
conn = psycopg2.connect(...)
cur = conn.cursor()

try:
    cur.execute("DELETE FROM public.anac")
    cur.execute("INSERT INTO public.anac VALUES (%s, %s)", (1, 'dado'))
    conn.commit()           # tudo confirmado de uma vez
except Exception as e:
    conn.rollback()         # qualquer erro: desfaz tudo
    raise
finally:
    cur.close()
    conn.close()
```

### Uso do context manager (recomendado)

```python
with psycopg2.connect(...) as conn:
    with conn.cursor() as cur:
        cur.execute("DELETE FROM public.anac")
        # commit automático ao sair do bloco with
        # rollback automático se houver exceção
```

> **Armadilha comum:** se uma query levanta exceção e você não faz `conn.rollback()`, todas as queries seguintes nessa conexão falharão com `InFailedSqlTransaction` até você limpar o estado com rollback.

---

## 10. Type adapters — Python ↔ PostgreSQL

psycopg2 converte automaticamente tipos Python para tipos PostgreSQL na ida, e de volta na leitura.

### Tabela de conversões automáticas

| Tipo Python | Tipo PostgreSQL | Observação |
|-------------|-----------------|------------|
| `str` | `TEXT` / `VARCHAR` | Escapado automaticamente |
| `int` | `INTEGER` / `BIGINT` | Tamanho inferido pelo valor |
| `float` | `FLOAT8` | Use `Decimal` para precisão exata |
| `datetime.datetime` | `TIMESTAMP` | Atenção ao timezone |
| `datetime.date` | `DATE` | — |
| `bool` | `BOOLEAN` | `True/False` → `true/false` |
| `None` | `NULL` | Tratado automaticamente |
| `list` / `tuple` | `ARRAY` | Requer `psycopg2.extras` |
| `dict` | `JSONB` | Via wrapper `Json()` |
| `Decimal` | `NUMERIC` | Precisão exata garantida |

### Exemplo com tipos especiais

```python
from psycopg2.extras import Json
import datetime, decimal

cursor.execute("""
    INSERT INTO eventos (data, valor, tags, metadata)
    VALUES (%s, %s, %s, %s)
""", (
    datetime.datetime.now(),          # datetime → TIMESTAMP
    decimal.Decimal('1234.56'),       # Decimal → NUMERIC
    ['python', 'dados', 'anac'],      # list → ARRAY
    Json({'fonte': 'anac', 'v': 2})   # dict → JSONB
))
```

### Atenção com COPY e tipos

Diferente de `execute()`, o `COPY` não usa type adapters. Você envia texto puro. Cada tipo precisa ser formatado manualmente:

```python
from datetime import date

buffer = io.StringIO()
for _, row in df.iterrows():
    data = row['Data_da_Ocorrencia']
    if isinstance(data, date):
        data = data.strftime('%Y-%m-%d')  # formato esperado pelo PostgreSQL
    municipio = row['Municipio'].replace('"', '""')  # escape de aspas
    buffer.write(f'{row["Numero"]},{row["Classificacao"]},{data},"{municipio}"\n')
```

---

## 11. copy_from vs copy_expert

Ambos implementam o comando `COPY` do PostgreSQL, mas com níveis diferentes de controle.

### cursor.copy_from() — interface simplificada

API de alto nível do psycopg2 que abstrai a sintaxe COPY e expõe parâmetros nomeados.

**Assinatura:**
```python
cursor.copy_from(file, table, sep='\t', null='\\N', size=8192, columns=None)
```

**Parâmetros:**

| Parâmetro | Padrão | Descrição |
|-----------|--------|-----------|
| `file` | — | Objeto file-like com método `.read()` |
| `table` | — | Nome da tabela destino |
| `sep` | `'\t'` | Delimitador — padrão é **TAB**, não vírgula |
| `null` | `'\\N'` | String que representa NULL (formato PostgreSQL nativo) |
| `size` | `8192` | Tamanho do buffer de leitura em bytes |
| `columns` | `None` | Lista de colunas destino |

**Exemplo:**

```python
import psycopg2, io

conn = psycopg2.connect(...)
cur = conn.cursor()

buffer = io.StringIO()
df[['Numero_da_Ocorrencia', 'Classificacao_da_Ocorrência',
    'Data_da_Ocorrencia', 'Municipio', 'UF']].to_csv(
    buffer, index=False, header=False, sep='\t'
)
buffer.seek(0)

cur.execute("DELETE FROM public.anac")

cur.copy_from(
    file=buffer,
    table='anac',
    sep='\t',
    null='',              # string vazia representa NULL
    size=16384,           # buffer maior para datasets grandes
    columns=('numero', 'classificacao', 'data', 'municipio', 'uf')
)

conn.commit()
```

**Limitações importantes:**
- Não suporta `QUOTE`, `ESCAPE`, `ENCODING` ou `HEADER`
- Só importa dados (não exporta)
- Se dados têm vírgulas ou aspas, pode falhar silenciosamente

---

### cursor.copy_expert() — interface completa

Executa qualquer comando `COPY` do PostgreSQL diretamente. Você escreve o SQL completo — psycopg2 apenas gerencia o stream de dados.

**Assinatura:**
```python
cursor.copy_expert(sql, file, size=8192)
```

**Exemplo de importação:**

```python
import psycopg2, io

conn = psycopg2.connect(...)
cur = conn.cursor()

buffer = io.StringIO()
df[colunas].to_csv(buffer, index=False, header=False)
buffer.seek(0)

cur.execute("DELETE FROM public.anac")

cur.copy_expert(
    sql="""
        COPY public.anac (numero, classificacao, data, municipio, uf)
        FROM STDIN
        WITH (
            FORMAT CSV,
            DELIMITER ',',
            NULL '',
            QUOTE '"',
            ESCAPE '\\',
            ENCODING 'UTF8'
        )
    """,
    file=buffer
)

conn.commit()
```

**Exemplo de exportação (COPY TO):**

```python
export_buf = io.StringIO()

cur.copy_expert(
    sql="""
        COPY (SELECT * FROM public.anac WHERE uf = 'SP')
        TO STDOUT
        WITH (FORMAT CSV, HEADER TRUE)
    """,
    file=export_buf
)

export_buf.seek(0)
df_sp = pd.read_csv(export_buf)
```

**Vantagens:**
- Controle total sobre `FORMAT`, `DELIMITER`, `QUOTE`, `ESCAPE`, `NULL`, `ENCODING`
- Suporta `COPY` com subquery (`COPY (SELECT ...) TO STDOUT`)
- Funciona tanto para importar quanto para exportar
- Equivale ao que você usaria diretamente no psql

---

### Comparação direta

| Critério | copy_from | copy_expert |
|----------|:---------:|:-----------:|
| Simplicidade do código | Maior | Menor |
| Suporte a QUOTE/ESCAPE | Não | Sim |
| Suporte a ENCODING | Não | Sim |
| Suporte a HEADER | Não | Sim |
| Exportar dados (COPY TO) | Não | Sim |
| COPY com subquery | Não | Sim |
| Dados com vírgulas internas | Pode falhar | Seguro com QUOTE |
| Dados com aspas internas | Pode falhar | Seguro com ESCAPE |

### Regra prática de decisão

```
dados simples, tabulares, sem pontuação especial?
    → copy_from (código mais curto)

dados de fontes externas, textos livres, municipios como "São Paulo"?
    → copy_expert com QUOTE '"'  (caminho seguro)

precisa exportar dados ou usar subquery no COPY?
    → copy_expert (é o único que permite)
```

No caso dos dados da ANAC, `copy_expert` é o mais indicado: colunas como `Municipio` podem conter vírgulas (ex: "São Paulo, SP") e `Classificacao_da_Ocorrência` pode ter texto livre.

---

## 12. Casos de uso práticos

### Escolha rápida por contexto

| Contexto | Abordagem recomendada | Motivo |
|----------|----------------------|--------|
| Aprender a conectar Python ao banco | 1 — Linha a linha | Entender o modelo mental |
| Notebook Jupyter, análise exploratória | 3 — pandas.to_sql | Produtividade máxima |
| Script diário de atualização (~10k linhas) | 2 — execute_values | Melhor custo-benefício |
| ETL semanal (~500k linhas) | 4 — COPY | Performance máxima |
| Migração inicial de base (~5M linhas) | 4 — COPY | Canal nativo do banco |
| Salvar resultado de análise ad-hoc | 3 — pandas.to_sql | Zero SQL manual |
| Inserção com lógica condicional por linha | 1 ou 2 | Controle por registro |

### Padrão recomendado para produção

```python
import psycopg2
import io
import pandas as pd
from contextlib import contextmanager

@contextmanager
def get_connection():
    conn = psycopg2.connect(
        host="localhost",
        database="meu_banco",
        user="user",
        password="senha"
    )
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

def carregar_anac(df: pd.DataFrame) -> None:
    colunas = ['Numero_da_Ocorrencia', 'Classificacao_da_Ocorrência',
               'Data_da_Ocorrencia', 'Municipio', 'UF']

    buffer = io.StringIO()
    df[colunas].to_csv(buffer, index=False, header=False)
    buffer.seek(0)

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM public.anac")
            cur.copy_expert(
                sql="""
                    COPY public.anac (numero, classificacao, data, municipio, uf)
                    FROM STDIN WITH (FORMAT CSV, NULL '', QUOTE '"', ENCODING 'UTF8')
                """,
                file=buffer
            )

    print(f"{len(df)} registros carregados com sucesso.")
```

---

## 13. Referência rápida de bibliotecas

### psycopg2

Driver Python oficial para PostgreSQL. Implementado em C, usa a libpq internamente.

```bash
pip install psycopg2-binary   # versão pré-compilada (mais fácil)
pip install psycopg2          # versão que compila do fonte (produção)
```

**Módulos principais:**
- `psycopg2` — conexão, cursor, execute básico
- `psycopg2.extras` — `execute_values`, `execute_batch`, `RealDictCursor`, helpers para JSON e UUID
- `psycopg2.pool` — connection pooling para aplicações web

### pandas

Biblioteca de análise de dados. Expõe `to_sql()` para envio direto ao banco.

```bash
pip install pandas
```

**Método relevante:** `df.to_sql(name, con, schema, if_exists, index, chunksize)`

### SQLAlchemy

ORM e toolkit de SQL para Python. Abstrai a diferença entre bancos de dados.

```bash
pip install sqlalchemy
```

**String de conexão por banco:**
```python
# PostgreSQL
"postgresql+psycopg2://user:senha@host:5432/database"

# MySQL
"mysql+pymysql://user:senha@host/database"

# SQLite (sem servidor)
"sqlite:///caminho/arquivo.db"
```

### io (módulo padrão do Python)

Não precisa instalar. Fornece `io.StringIO` (CSV em memória) e `io.BytesIO` (binário em memória).

```python
import io

buffer = io.StringIO()   # "arquivo" texto na RAM
buffer = io.BytesIO()    # "arquivo" binário na RAM
```

---

*Documento gerado a partir das discussões sobre o projeto ANAC de carga de dados no PostgreSQL.*
