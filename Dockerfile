FROM node:12

# Create app directory
WORKDIR /usr/src/app

ENTRYPOINT [ "npm", "start" ]

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# RUN npm install
# If you are building your code for production
RUN npm install

# Bundle app source
COPY . .

# Convert typescript file to vanilla JS
# RUN npm run build

# Build webapp
WORKDIR /usr/src/app/webapp/
RUN npm install
RUN npm run build

WORKDIR /usr/src/app

ENV GOOGLE_APPLICATION_CREDENTIALS="/etc/serviceAccountKey.json"

EXPOSE 8080
CMD [ "npm", "start" ]
