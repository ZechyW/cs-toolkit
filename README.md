# cs-toolkit
A (Roughly) Minimalist framework for exploring code switching data.


## Project Structure
The project uses Django/Channels/Django REST Framework for its backend (in the `django` folder), and React/Babel/Webpack for its frontend (in the `react` folder).

- Frontend routing and server-side Channels operations are handled by a Django app named `frontend` (in `django/frontend`).
- The actual frontend views and client-side code are found in `react/django-templates` and `react/src` respectively.

Frontend dependencies and tasks are managed by `npm` (via `package.json` in the project root), and backend dependencies and tasks are managed by `poetry` (via `pyproject.toml` in the project root) and the Django management script (`django/manage.py`).

## Quickstart

### Python dependencies

Start by cloning this repository and ensuring that Poetry (https://poetry.eustace.io/docs/) is installed.

From the project root, install the backend dependencies:

```
poetry install
```

If you are running the server on a Windows machine, specify the `windows` extra option to pull in Windows-specific dependencies:

```
poetry install --extras "windows"
```

### Redis server

In order for the Channels portion of the backend to work properly, the project expects a Redis server to be accessible (on `127.0.0.1:6379` by default).  An easy way to do this is to install Docker, then run:

```
docker run -p 6379:6379 -d redis
```

### Start the development server

Navigate to the `django` folder and start the development server (it runs on port `8080` by default, but you can add a custom port number after `runserver` in the command below):

```
cd django
poetry run python manage.py runserver
```

Then point your browser to http://localhost:8080 to view the main interface.

## Development

Start by cloning this repository and installing the frontend development dependencies:

```
npm install
```

After making any changes to the frontend sources, you will need to rebuild the frontend bundles:

```
npm run build
```

Alternatively, use `npm run dev` to build the bundles in development mode (https://webpack.js.org/concepts/mode/), or `npm run watch` to watch for changes to the sources and rebuild them automatically.

For convenience, the shell script `start-dev` will spin up the Django development server and start watching for changes to the frontend sources at the same time.  Set the `PORT` environment variable to use a non-default port: 

```
PORT=9000 ./start-dev
```