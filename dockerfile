# Dockerfile
FROM node:18

# Definir o diretório de trabalho
WORKDIR /usr/src/app

# Copiar os arquivos de package.json e package-lock.json
COPY package*.json ./

# Instalar as dependências
RUN npm install

# Copiar o restante dos arquivos do projeto
COPY . .

# Expor a porta que a aplicação irá rodar
EXPOSE 3000

# Adicionar labels recomendadas
LABEL \
  name="blog-de-professor-app" \
  version="1.0" \
  description="Aplicação de blogging dinâmico para professores." \
  maintainer="Seu Nome <seu.email@dominio.com>"

# Comando para iniciar a aplicação
CMD ["node", "src/index.js"]
