FROM --platform=linux/amd64 node:20

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 5173

ENV IS_DOCKER=true

ENV NODE_ENV=production

CMD ["npm", "run", "dev"]