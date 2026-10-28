# Imagem de produção do blog de postagens para professores
FROM node:18-alpine

WORKDIR /usr/src/app
ENV NODE_ENV=production

# Instala apenas dependências de produção
COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src

# Executa sem privilégios de root
USER node

EXPOSE 3000

CMD ["node", "src/index.js"]
