FROM node:20

WORKDIR /usr/src/app

# Kopioi package.json ja package-lock.json
COPY package*.json ./

# Asenna riippuvuudet
RUN npm install --production

# Kopioidaan lähdekoodi (ml. src-kansio)
COPY . .

# Kerrotaan mille portille applikaatio kuuntelee
ENV PORT=3001
EXPOSE 3001

CMD ["npm", "start"]