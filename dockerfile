# Dockerfile
FROM node:20-alpine

WORKDIR /usr/src/app
ENV NODE_ENV=production

# Dependencies first, so this layer is cached between builds.
COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force

COPY . .

# Do not run as root.
USER node

EXPOSE 3000

LABEL name="blog-de-professor-app" version="1.1" description="API de blog para professores."

CMD ["node", "src/index.js"]
