# api/Dockerfile
FROM --platform=linux/amd64 node:24-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
RUN npm install redux
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]
