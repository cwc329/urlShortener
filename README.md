# Full Stack URL Shortener Application

This project is a full stack URL shortener application built with Django for the backend and React for the frontend.

## Features

- **OAuth2 Third Party Login**: Uses `django-allauth` to enable OAuth2 third party login.
- **Asynchronous Task Processing**: Uses Celery to asynchronously store request records.
- **Caching**: Uses Django's cache framework to cache short URL and original URL pairs.

## Getting Started

### Environment Variables

Make sure to set the necessary environment variables in the `.env` file for the backend.

### Infra

To start infra, use following command:

```sh
docker compose -f docker-compose-dev.yml up -d
```

It will launch database, redis, and reverse proxy for development env.

### Backend

To get started with the backend, follow these steps:

1. Install dependencies using Poetry:

   ```sh
   poetry install
   ```

2. Apply database migrations:

   ```sh
   python manage.py migrate
   ```

3. Run the development server:

   ```sh
   python manage.py runserver
   ```

4. Run celery

   ```sh
   celery -A urlShortener worker --loglevel=debug

API doc refer to [schema.yml](./backend/schema.yml)

   ```

### Frontend

To get started with the frontend, follow these steps:

1. Install dependencies using Yarn:

   ```sh
   yarn install
   ```

2. Run the development server:

   ```sh
   yarn start
   ```

3. Visit frontend page at localhost:10000

## Docker

### Docker Compose Deployment

To deploy the application using Docker Compose, follow these steps:

1. Ensure you have Docker and Docker Compose installed on your machine.

2. Create a `.env` file in the root directory with the necessary environment variables for the backend and database.

3. Use the following command to build and start the infrastructure defined in the docker-compose.yml file:

   ```sh
   docker-compose up -d
   ```

This command will build and start the following services:

- **db**: The MySQL database.
- **redis**: The Redis for cache and mq
- **traefik**: reverse proxy for the app

4. Configure DB, create user and database for backend.

3. Use the following command to build and start the apps defined in the docker-compose.yml file:

   ```sh
   docker-compose --profile apps up -d
   ```

This command will build and start the following services:

- **frontend**: The React frontend application.
- **backend**: The Django backend application.
- **celery**: The Celery worker for asynchronous task processing.

### Stopping the Services

To stop the services, use the following command:

```sh
docker-compose --profiles apps down
```

This command will stop and remove the containers defined in the docker-compose.yml file.

## Troubleshooting

### mysqlclient dependencies issue

`poetry install` may encounter mysqlclient dependencies issue.
Please refer to [pypi mysqlclient](https://pypi.org/project/mysqlclient/) to install needed packages.

### CSRF cookie issue

To resolve csrf issue, I serve frontend and backend at the same domain using a reverse proxy.
Therefore even in development, need to visit local port that used by reverse proxy(default port 10000).
