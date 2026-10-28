# ForumWP React Examples

Every runnable example from the course *React + WordPress REST API, from Zero*: <https://ingpress.github.io/forumwp-react-examples/>

Each example is one HTML page that runs as it is, in a browser, JSFiddle, CodePen or CodeSandbox. It loads React 18.3 and WordPress's own packages (`@wordpress/element`, `@wordpress/components`, `@wordpress/api-fetch`, ...) from esm.sh, and compiles the JSX in the browser with Babel. React's development build is used, so you see the same warnings the book quotes.

- `src/chNN/*.jsx`: the example code, as in the book. Lines added only so an example runs on its own are marked `// Added so this runs on its own`.
- `_template.html`: the page each example is wrapped in.
- `tools/fake-api.js`: a pretend ForumWP REST API (the routes from Chapter 14), used by examples marked "fake REST API". In the console: `fakeApi.delay = 2000`, `fakeApi.fail = true`.
- `ex/`: the built pages; `index.html`: the catalog.

Rebuild after editing an example: `python3 tools/site.py` (writes `site/`), or `python3 tools/make.py src out` for the pages alone. `NODE_PATH=$(npm root -g) node tools/check.js out` opens each page in Chromium (Playwright) and reports errors.
