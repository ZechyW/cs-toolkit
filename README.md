<h1 align="center">The Code Switching Toolkit</h1>

<p align="center">
A (Roughly) Minimalist framework for exploring code switching data.
</p>

<p align="center">
<a href="https://lernajs.io/"><img alt="<Maintained with: lerna" src="https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg"></a>
<a href="https://github.com/ambv/black"><img alt="Code style: black" src="https://img.shields.io/badge/code%20style-black-000000.svg"></a>
<a href="https://github.com/prettier/prettier"><img alt="Code style: prettier" src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg"></a>
<img alt="Travis CI" src="https://travis-ci.org/ZechyW/cs-toolkit.svg?branch=master">
</p>

## Project Structure
The project is structured as a multi-package repository via Lerna (https://lernajs.io/).

- The `django-backend` package manages the Django/Channels/Django REST Framework backend.
- The `react-frontend` package manages the React/Redux frontend.
- The `docs` package manages the project documentation.  

#### Interaction

- Frontend routing and server-side Channels operations are handled by a Django app named `frontend`.
- The actual frontend views and bundles are built via `create-react-app` and end up in the `build` folder of the `react-frontend` package. The Django backend will either collect them as static files before serving them (in production mode) or proxy browser requests to the `create-react-app` dev server (in dev mode). 

#### Dependencies and tasks

- Python dependencies are managed by `poetry` (via `pyproject.toml` in the project root).
- JS dependencies are managed by `yarn` (via the various `package.json` files).
- Tasks are defined as `npm` scripts and can also be managed by `yarn` (via the various `package.json` files).

## Quickstart

### Tools

Start by cloning this repository and ensuring that Poetry (https://poetry.eustace.io/docs/), Node.js (https://nodejs.org/) and Yarn (https://yarnpkg.com/) are installed.

### Python dependencies

From the project root, install the Python dependencies:

```bash
poetry install
```

If you are running the server on a Windows machine, specify the `windows` extra option to pull in Windows-specific dependencies:

```bash
poetry install --extras "windows"
```

### Redis server

In order for the Channels portion of the backend to work properly, the project expects a Redis server to be accessible (on `127.0.0.1:6379` by default).  An easy way to do this is to install Docker (https://www.docker.com/), then run:

```bash
docker run -p 6379:6379 --name redis -d redis
```

If the Docker container is stopped for any reason (e.g., if the system is restarted), it can then be restarted with:

```bash
docker container start redis
```

### Build the production files and start the server

Start by installing the frontend production dependencies:

```bash
yarn --prod
```

Next, run the `build-prod` shell script to build the production frontend bundles and collect all production assets in the Django static files directory (`packages/django-backend/static`);

```bash
./build-prod
```

Finally, use the `serve-prod` shell script to start the Django production server (Daphne) on port `8000`.  You can set the `DJANGO_PORT` environmental variable to use a non-default port:

```bash
DJANGO_PORT=8000 ./start-server
```

Then point your browser to http://localhost:8000 (replacing 8000 with your chosen port, if you set one) to view the main interface.

## Development

From the project root, install the frontend development dependencies:

```bash
yarn
```

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