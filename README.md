# cs-toolkit
A (Roughly) Minimalist framework for exploring code switching data.


## Project Structure
The project uses Django/Channels/Django REST Framework for its backend (in the `django` folder), and React/Babel/Webpack for its frontend (in the `react` folder).

- Frontend routing and server-side Channels operations are handled by a Django app named `frontend` (in `django/frontend`).
- The actual frontend views and client-side code are found in `react/django-templates` and `react/src` respectively.

Frontend dependencies and tasks are managed by `npm` (via `package.json` in the project root), and backend dependencies and tasks are managed by `pipenv` (via `Pipfile` in the project root) and the Django management script (`django/manage.py`).

## Quickstart

Navigate to the `django` folder and start the development server (you can replace `8080` with any other valid port):

```
cd django
pipenv run python manage.py runserver 8080
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

For convenience, the shell script `start-dev` will spin up the Django development server and start watching for changes to the frontend sources at the same time.

```
./start-dev
```