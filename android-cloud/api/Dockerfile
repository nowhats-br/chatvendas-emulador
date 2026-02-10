FROM node:20-alpine

# Instalar wget para healthcheck
RUN apk add --no-cache wget

WORKDIR /app

# Copiar package.json
COPY package*.json ./

# Instalar dependências
RUN npm install --production

# Copiar código
COPY . .

# Expor porta
EXPOSE 3011

# Iniciar
CMD ["node", "server.js"]
