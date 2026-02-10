FROM node:20-alpine

# Instalar dependências do sistema
RUN apk add --no-cache \
    wget \
    python3 \
    make \
    g++ \
    sqlite

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependências
RUN npm install --production

# Copiar código fonte
COPY . .

# Criar diretórios necessários
RUN mkdir -p data sessions uploads

# Expor porta
EXPOSE 3010

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3010/health || exit 1

# Iniciar aplicação
CMD ["node", "src/server.js"]
