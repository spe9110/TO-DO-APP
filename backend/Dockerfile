# ---------- Base ----------
FROM node:22.15.0-alpine AS base
WORKDIR /usr/src/app
COPY package*.json ./

# ---------- Development ----------
FROM base AS development
ENV NODE_ENV=development
# Install all dependencies including dev dependencies for development
RUN npm install
COPY . .  # Copy the rest of the app code after installing dependencies
EXPOSE 3000
CMD ["npm", "run", "dev"]

# ---------- Production ----------
FROM base AS production
ENV NODE_ENV=production

# Only install production dependencies
RUN if [ -f package-lock.json ]; then npm ci --only=production; else npm install --production; fi

# Copy the rest of the app code
COPY . .

EXPOSE 3000
CMD ["npm", "run", "start"]
