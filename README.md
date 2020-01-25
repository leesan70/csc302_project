# Prerequisites
1. Install Node.js and NPM (https://nodejs.org/en/download/)

2.  Install webpack (https://webpack.js.org/guides/installation/)
```bash
#!/bin/bash
$ npm install --global webpack
```

3. Install Mongo (https://docs.mongodb.com/manual/administration/install-community/)

4. Start Mongo instance

5. Install Elastic Search (https://www.elastic.co/guide/en/elastic-stack-get-started/7.5/get-started-elastic-stack.html#install-elasticsearch)

6. Start Elastic Search instance

7. (Optional) Install Docker (https://docs.docker.com/v17.12/install/)
    - If you want to build and deploy in a container


# How to set up
1. Install dependencies
```bash
#!/bin/bash
$ npm install
```

2. In the root of the project, create `.env` file, save it in the root of the project and set your environment variables.
```bash
#!/bin/bash
# fill in the blanks
$ API_URL=<FILL IN THE BLANK>
$ echo -e 'API_URL='$API_URL'\n' > .env
```

3. In the root of the project, create `.env.server` file, save it in the root of the project and set your environment variables.
```bash
#!/bin/bash
# fill in the blanks
$ DB_HOST=<FILL IN THE BLANK>
$ DB_USER=<FILL IN THE BLANK>
$ DB_NAME=<FILL IN THE BLANK>
$ ES_HOST=<FILL IN THE BLANK>
$ echo -e 'DB_HOST='${DB_HOST}'\nDB_USER='${DB_USER}'\nDB_NAME='${DB_NAME}'\nES_HOST='${ES_HOST}'\n' > .env.server
```

4. For testing purposes, create `.env.test` and `.env.server.test` and fill in the test environment setup like above. 

# Deploying Service
1. Start service
```bash
#!/bin/bash
$ npm start
```

# Environment Variables


## .env (dotenv) file (UI)
| Environment Variable |         Example       |
| -------------------- | --------------------- |
| API_URL              | http://127.0.0.1:3001 |

## .env.server file (Server)
| Environment Variable |         Example       |
| -------------------- | --------------------- |
| DB_HOST              | 127.0.0.1:3000        |
| DB_USER              | usename:password      |
| DB_NAME              | csc302                |
| ES_HOST              | http://127.0.0.1:9200 |

## UI Env file example (.env)
```.env
# .env
API_URL=127.0.0.1:3001
```

## Server Env file example (.env.server)
```.env.server
# .env.server
DB_HOST=127.0.0.1:3000
DB_USER=admin:password
DB_NAME=csc302
ES_HOST=http://127.0.0.1:9200
```

# Using Docker
## Running Services with Docker
### Allows you to connect to your local database instance with correct envrionment configuration
1. From root of the project, run
```bash
#!/bin/bash
$ ./docker-run.sh {Optional: Name of image} {Optional: Database host} {Optional: ElasticSearch Host}
```

## Running docker-compose
```bash
#!/bin/bash
$ ./docker-compose.sh
```

## Running single elastic search instance
```bash
#!/bin/bash
$ ./docker-elastic-local.sh
```