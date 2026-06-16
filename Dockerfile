FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
COPY api/package.json api/package-lock.json ./api/
RUN cd api && npm ci --omit=dev
COPY api/ ./api/
WORKDIR /app/api
ENV PORT=3001
EXPOSE 3001
CMD ["node", "server.js"]
