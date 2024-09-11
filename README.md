```CREATE DATABASE reconhecimento_facial;```

```\c reconhecimento_facial;```

```
CREATE TABLE pessoas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    caminho_imagem VARCHAR(255),
    descriptor_facial TEXT
);
```
