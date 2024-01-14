FROM node:20.10-alpine3.18
WORKDIR /var/www/api
COPY ./ /var/www/api/
# RUN npm i
ENTRYPOINT ["npm", "start:dev"]
EXPOSE 3000