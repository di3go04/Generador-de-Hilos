FROM node:20-alpine

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

# Disable Type Checking and Linting on build since we are likely testing the container or CI covers it
ENV NEXT_IGNORE_ESLINT 1
ENV NEXT_IGNORE_TYPECHECK 1

RUN npm run build

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["npm", "run", "start"]
