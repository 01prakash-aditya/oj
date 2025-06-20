FROM --platform=linux/amd64 node:24

# Install g++, Python 3, and JDK 24
RUN apt-get update && \
    apt-get install -y g++ python3 python3-pip curl && \
    curl -fsSL https://download.oracle.com/java/24/latest/jdk-24_linux-x64_bin.deb -o jdk-24.deb && \
    apt-get install -y ./jdk-24.deb && \
    rm jdk-24.deb

# Set Java environment variables
ENV JAVA_HOME=/usr/lib/jvm/jdk-24
ENV PATH="$JAVA_HOME/bin:$PATH"

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install -g nodemon && npm install

COPY . .

EXPOSE 8000
CMD ["npx", "nodemon", "index.js"]
