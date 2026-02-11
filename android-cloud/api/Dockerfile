FROM node:20-alpine

WORKDIR /app

# Copiar package.json
COPY package.json ./

# Instalar dependências
RUN npm install --production

# Copiar código
COPY . .

# Expor porta
EXPOSE 3011

# Comando para iniciar
CMD ["node", "server.js"]
