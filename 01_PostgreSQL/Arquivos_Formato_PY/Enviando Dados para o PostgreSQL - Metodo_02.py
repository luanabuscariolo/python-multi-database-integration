# %%
import pandas as pd
import psycopg2
from psycopg2.extras import execute_values
import chardet
from chardet import UniversalDetector

path = r"..\..\Data\V_OCORRENCIA_AMPLA.json"
detector = UniversalDetector()

with open(path, "rb") as f:
    for line in f:
        detector.feed(line)
        if detector.done:
            break
detector.close()

encodingJson = detector.result['encoding']
print(encodingJson)
print(type(encodingJson))

df = pd.read_json(path, encoding= encodingJson)
df.head()
df.columns

# %%
columns = ["Numero_da_Ocorrencia","Classificacao_da_Ocorrência","Data_da_Ocorrencia","Municipio", "UF", "Regiao", "Numero_de_Assentos", "Nome_do_Fabricante"]
df = df[columns]
df.rename(columns={'Classificacao_da_Ocorrência':'Classificacao_da_Ocorrencia'}, inplace=True)
df.head()

# %%
conn_string = "host='immich-server.tailab6cca.ts.net' dbname='postgres-anac' user='postgres' password='432931' port='5432'"
conn = psycopg2.connect(conn_string)
cursor = conn.cursor()

cursor.execute("DROP TABLE IF EXISTS anac_method2")
cursor.execute("""
    CREATE TABLE anac_method2 (
        numero_da_ocorrencia        BIGINT,
        classificacao_da_ocorrencia VARCHAR(50),
        data_da_ocorrencia          DATE,
        municipio                   VARCHAR(50),
        uf                          VARCHAR(30),
        regiao                      VARCHAR(30),
        numero_de_assentos          BIGINT,
        nome_do_fabricante          VARCHAR(100)
    )
""")

values = [(
    row["Numero_da_Ocorrencia"],
    row["Classificacao_da_Ocorrencia"],
    row["Data_da_Ocorrencia"],
    row["Municipio"],
    row["UF"],
    row["Regiao"],
    int(row["Numero_de_Assentos"]) if pd.notna(row["Numero_de_Assentos"]) else None,
    row["Nome_do_Fabricante"]
    ) for index, row in df.iterrows()
]

print("Type of values:", type(values))

insert_query = """
    INSERT INTO anac_method2 (
        numero_da_ocorrencia,
        classificacao_da_ocorrencia,
        data_da_ocorrencia,
        municipio,
        uf,
        regiao,
        numero_de_assentos,
        nome_do_fabricante
    ) VALUES %s
"""

print("Type of insert_query:", type(insert_query))

execute_values(cursor, insert_query, values)

# %%
conn.commit()
cursor.close()
conn.close()

# %%
