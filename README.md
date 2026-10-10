# Portfolio — Priyanshu Singh, Senior UI Engineer

Apple-inspired single-page portfolio. Zero dependencies, zero build step —
plain HTML/CSS/JS. Motion follows ease-out entrances, transform/opacity only,
with `prefers-reduced-motion` respected.

## Preview

Open `index.html` in a browser, or serve the directory:

```sh
npx serve .
```

## Deploy

Any static host works. Publish directory: `.` (root).

Container (Heroku):

```sh
heroku container:push web --app <app-name>
heroku container:release web --app <app-name>
```

Heroku assigns `$PORT` at runtime — map it to the container's port 80
(e.g. via `heroku.yml` or the container run command).

## Live demo links

The UI Configurator "Live demo" link is wired via the `DEMO_URLS` map at the
bottom of `script.js`. Fill in the deployed URL after the ui-configurator
deploy lands.
