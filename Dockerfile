# # ====== Stage : Build ======
ARG SERVICE_NAME=csc302

FROM $SERVICE_NAME-base AS build

ARG SERVICE_NAME=csc302
ARG API_URL=127.0.0.1
ARG API_PORT=3001
ARG API_SCHEME=http
ARG ES_HOST=127.0.0.1
ARG ES_PORT=9200
ARG ES_SCHEME=http
ARG DB_PORT=27017
ARG DB_HOST
ARG DB_USER

# Heroku specification
ENV PORT=${API_PORT}

# Create app directory
WORKDIR /app

# Add project files to container
ADD . .

# Ensure dependencies are installed
RUN npm install

RUN echo "API_URL=${API_SCHEME}://${API_URL}:${API_PORT}\n" > /app/.env
RUN echo "DB_HOST=${DB_HOST}:${DB_PORT}\nDB_NAME=${SERVICE_NAME}\nES_HOST=${ES_SCHEME}://${ES_HOST}:${ES_PORT}\n" > /app/.env.server
RUN echo "DB_HOST=${DB_HOST}:${DB_PORT}\nDB_NAME=${SERVICE_NAME}\nES_HOST=${ES_SCHEME}://${ES_HOST}:${ES_PORT}\n" > /app/.env.server.test

# Bundle app source
RUN npm run build


# # ======= Stage : Deploy =======
FROM $SERVICE_NAME-base AS deploy

ARG DB_PORT=27017
ARG API_PORT=3001

# App files
COPY --from=build /app/dist /app/dist

WORKDIR /app/dist

ENTRYPOINT ["node", "server.js"]

EXPOSE ${API_PORT}