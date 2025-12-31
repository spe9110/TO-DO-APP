# ---------- Base ----------
FROM node:22.15.0-alpine AS base
WORKDIR /usr/src/app
COPY package*.json ./

# ---------- Development ----------
FROM base AS development
ENV NODE_ENV=development
RUN npm install 
COPY . .  
EXPOSE 3000
CMD ["npm", "run", "dev"]

# ---------- Production ----------
FROM base AS production
ENV NODE_ENV=production
# Check if package-lock.json exists, and if not, use npm install
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi
COPY . .
EXPOSE 3000
CMD ["npm", "run", "start"]
