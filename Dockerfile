FROM node:14
RUN git clone https://github.com/darlsoul/Bot-Site /railway/Nora07
WORKDIR /railway/Nora07
COPY package*.json ./
COPY . .
RUN npm install @whiskeysockets/baileys qrcode awesome-phonenumber pino phone body-parser express path cors
EXPOSE 3000
CMD ["node", "index.js"]
