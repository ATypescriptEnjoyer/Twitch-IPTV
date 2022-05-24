FROM node:16

RUN apt-get update -qq
RUN apt-get install python3 ffmpeg -qq

# Create app directory
RUN mkdir -p /app
WORKDIR /app

# Install dependencies
COPY . .

RUN yarn install

# Exports
EXPOSE 3000
CMD [ "npm", "run", "start" ]