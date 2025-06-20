FROM --platform=linux/amd64 node:24

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 5173

ENV IS_DOCKER=true

ENV NODE_ENV=development

CMD ["npm", "run", "dev"]
