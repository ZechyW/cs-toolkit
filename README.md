<h1 align="center">The Code Switching Toolkit</h1>

<p align="center">
A (Roughly) Minimalist framework for exploring code switching data.
</p>

<p align="center">
<a href="https://github.com/ambv/black"><img alt="Code style: black" src="https://img.shields.io/badge/code%20style-black-000000.svg"></a>
<a href="https://github.com/prettier/prettier"><img alt="Code style: prettier" src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg"></a>
</p>

## Project Structure
The project uses Django/Channels/Django REST Framework for its backend (in the `django` folder), and React/Babel/Webpack for its frontend (in the `react` folder).

- Frontend routing and server-side Channels operations are handled by a Django app named `frontend` (in `django/frontend`).
- The actual frontend views and client-side code are found in `react/django-templates` and `react/src` respectively.

Frontend dependencies and tasks are managed by `npm` (via `package.json` in the project root), and backend dependencies and tasks are managed by `poetry` (via `pyproject.toml` in the project root) and the Django management script (`django/manage.py`).

## Quickstart

### Python dependencies

Start by cloning this repository and ensuring that Poetry (https://poetry.eustace.io/docs/) is installed.

From the project root, install the backend dependencies:

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
docker run -p 6379:6379 -d redis
```

### Start the server

The shell script `start-server` will prepare and start the Django server on port `8080`.  You can Set the `PORT` environmental variable to use a non-default port:

```bash
PORT=<your port here> ./start-server
```

Then point your browser to http://localhost:8080 (replacing 8080 with your chosen port, if you set one) to view the main interface.

## Development

Start by cloning this repository and making sure that Node.js (https://nodejs.org/) is installed.

From the project root, install the frontend development dependencies:

```bash
npm install
```

After making any changes to the frontend sources, you will need to rebuild the frontend bundles:

```bash
npm run build
```

Alternatively, use `npm run dev` to build the bundles in development mode (https://webpack.js.org/concepts/mode/), or `npm run watch` to watch for changes to the sources and rebuild them automatically.

For convenience, the shell script `start-dev` will spin up the Django server in debug mode and start watching for changes to the frontend sources at the same time.  Set the `PORT` environment variable to use a non-default port: 

```bash
PORT=9000 ./start-dev
```

### Profiling

Use `npm run profile` to profile the contents/size of the main Webpack bundle.

### Documentation

Documentation for the project is built using Sphinx (http://www.sphinx-doc.org/) and Sphinx-js (https://github.com/erikrose/sphinx-js) from the sources in the `docs` folder.

To build the documentation, the `jsdoc` executable will need to be available on your path. An easy way to do this is by installing JSDoc globally:

```bash
npm install -g jsdoc
```
 
The documentation can then be built using the `build-docs` npm script:

```bash
npm run build-docs
```

Alternatively, the `watch-docs` npm script will watch for changes to the documentation sources and rebuild it automatically:

```bash
npm run watch-docs
```