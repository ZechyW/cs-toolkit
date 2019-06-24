# The Code Switching Toolkit

[![Code style: black](https://img.shields.io/badge/code%20style-black-000000.svg)](https://github.com/ambv/black)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Build Status](https://travis-ci.org/ZechyW/cs-toolkit.svg?branch=master)](https://travis-ci.org/ZechyW/cs-toolkit)

A Minimalist framework for exploring syntactic derivations, with built-in support for code switching data.

## Project Structure
The project is structured as a multi-package repository via Lerna (https://lernajs.io/) and Yarn (https://yarnpkg.com/) workspaces.

- The `django-backend` package manages the Django/Channels/Django REST Framework backend.
- The `react-frontend` package manages the React/Redux frontend.
- The `docs` package manages the project documentation.  

### Interaction

- Frontend routing and server-side Channels operations are handled by a Django app named `frontend`.
- The actual frontend views and bundles are built via `create-react-app` and end up in the `build` folder of the `react-frontend` package. The Django backend will either collect them as static files before serving them (in production mode) or proxy browser requests to the `create-react-app` dev server (in dev mode). 

### Dependencies and tasks

- Python dependencies are managed by `poetry` (via `pyproject.toml` in the project root).
- JS dependencies are managed by `yarn` (via the various `package.json` files).
- Tasks are defined as `npm` scripts and can also be managed by `yarn` (via the various `package.json` files).

## Quickstart

### Tools

Start by cloning this repository and ensuring that Poetry (https://poetry.eustace.io/docs/), Node.js (https://nodejs.org/) and Yarn (https://yarnpkg.com/) are installed.

### Install Python dependencies

From the project root, install the Python dependencies:

```bash
poetry install
```

If you are running the server on a Windows machine, specify the `windows` extra option to pull in Windows-specific dependencies:

```bash
poetry install --extras "windows"
```

### Start Redis server

In order for the Channels portion of the backend to work properly, the project expects a Redis server to be accessible (on `127.0.0.1:6379` by default).  An easy way to do this is to install Docker (https://www.docker.com/), then run:

```bash
docker run -p 6379:6379 --name redis -d redis
```

If the Docker container is stopped for any reason (e.g., if the system is restarted), it can then be restarted with:

```bash
docker container start redis
```

### Start Postgres

In addition, the backend uses a Postgres server for data storage (on `127.0.0.1:5432` by default).  If you have Docker installed, you can spin up a local Postgres instance with:

```bash
docker run -p 5432:5432 --name postgres -d postgres
```

You will also need to create a login role and database for the system.  By default, the database name, username, and password are all assumed to be `cs_toolkit`.  To specify different database connection parameters, use the `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, and `DB_PASSWORD` environmental variables.

### PgBouncer

```bash
docker run -d --name=pgbouncer -e DB_HOST=postgres -e DB_USER=cs_toolkit -e DB_PASSWORD=cs_toolkit -p 6432:6432 --link postgres:postgres brainsam/pgbouncer:latest
```

#### Optional: Load basic data fixtures

Once the Postgres server is up and running, use the following command to initialise the required tables and load the basic lexicon/grammar data into the database:

```bash
yarn workspace django-backend run load-basic
```

### Start Dramatiq task queue workers

The system uses a distributed task queue (https://dramatiq.io/) to process multiple syntactic computations in parallel, and the queue needs to have at least one worker thread up and running.

Use the `start-workers` shell script to start up a bunch of worker threads.  By default, one worker process is spawned for each CPU core on the machine, with 8 worker threads per process.  You can use the `NUM_PROCESSES` and `NUM_THREADS` environmental variables to change these if necessary.

For example, to only spawn 8 worker processes with 4 threads each:

```bash
NUM_PROCESSES=8 NUM_THREADS=4 ./start-workers
```

### Build the frontend assets and start the server

First, install the frontend production dependencies:

```bash
yarn --prod
```

Next, run the `build-prod` shell script to build the production frontend bundles and collect all production assets in the Django static files directory (`packages/django-backend/static`);

```bash
./build-prod
```

Finally, use the `serve-prod` shell script to start the Django production server (Daphne) on port `8080`.  You can set the `DJANGO_PORT` environmental variable to use a non-default port:

```bash
DJANGO_PORT=8080 ./serve-prod
```

Then point your browser to http://localhost:8000 (replacing 8000 with your chosen port, if you set one) to view the main interface.

## Development

From the project root, install the frontend development dependencies:

```bash
yarn
```

**N.B.:** If you are using WSL and getting timeout errors, try `yarn --network-timeout 100000`. (https://github.com/yarnpkg/yarn/issues/5259)

The shell script `start-dev` will spin up the Django server in debug mode and the React dev server at the same time, automatically monitoring both the frontend and backend sources for changes.

Set the `DJANGO_PORT` environment variable to use a non-default port for the main interface, or `REACT_HOST`/`REACT_PORT` to run the background React dev server on a different address/port: 

```bash
DJANGO_PORT=8080 REACT_HOST=127.0.0.1 REACT_PORT=3000 ./start-dev
```

### Profiling

From the project root, use the following command to rebuild and profile the contents/size of the main frontend bundle:

```bash
yarn workspace react-frontend run profile
```

Open `packages/react-frontend/build/bundle-stats.html` to view the results.

### Documentation

Documentation for the project is built using Sphinx (http://www.sphinx-doc.org/) and Sphinx-js (https://github.com/erikrose/sphinx-js) from the sources in the `docs` package.

To build the documentation, the `jsdoc` executable will need to be available on your path. An easy way to do this is by installing JSDoc globally:

```bash
yarn global add jsdoc
```
 
The documentation can then be built from the project root with the following command:

```bash
yarn workspace docs run build
```

Open `packages/docs/_build/index.html` to view the generated documentation.

Alternatively, the `docs-dev` npm script will watch for changes to the documentation sources and rebuild it automatically:

```bash
yarn workspace docs run docs-dev
```