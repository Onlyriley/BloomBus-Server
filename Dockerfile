# This Dockerfile is not optimized, all node_modules and sourcefiles included

FROM node:lts

# Create ARG for credentials to bring in file path from build command. See README.
ARG app_creds
# Copy the credentials file into the image
COPY ${app_creds} /etc/serviceAccountKey.json
# Pass ARG to container
ENV GOOGLE_APPLICATION_CREDENTIALS=/etc/serviceAccountKey.json

# Create app directory
WORKDIR /usr/src/app

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

# Return to root and start
WORKDIR /usr/src/app
EXPOSE 8080
CMD [ "npm", "start" ]
