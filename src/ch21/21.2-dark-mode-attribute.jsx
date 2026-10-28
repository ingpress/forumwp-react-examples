// @id 21.2
// @title Tokens, and dark mode with one attribute
// @section 21.5
// @click Switch
import { createRoot } from '@wordpress/element'; // Added so this runs on its own
import { Button } from '@wordpress/components'; // Added so this runs on its own

// Added so this runs on its own: the tokens from _tokens.scss and the .fwp-post rule, as the CSS the build
// would produce, the accent PHP prints (21.4), and the class the portal template puts on <body>.
document.head.insertAdjacentHTML('beforeend', `<style>
  .forumwp-portal {
    --fwp-accent: #4f46e5;
    --fwp-bg: #f6f7f9;
    --fwp-surface: #fff;
    --fwp-border: #e4e6eb;
    --fwp-text: #111318;
    --fwp-muted: #545a66;
    --fwp-accent-text: var(--fwp-accent);
    --fwp-radius: 12px;
    background: var(--fwp-bg);
    color: var(--fwp-text);
  }
  .forumwp-portal[data-theme="dark"] {
    --fwp-bg: #0e1014;
    --fwp-surface: #161920;
    --fwp-border: #2a2f39;
    --fwp-text: #eceef2;
    --fwp-muted: #a3a9b6;
    --fwp-accent-text: color-mix(in srgb, var(--fwp-accent) 45%, #fff);
  }
  .forumwp-portal .fwp-post {
    padding: 16px;
    border: 1px solid var(--fwp-border);
    border-radius: var(--fwp-radius);
    background: var(--fwp-surface);
    color: var(--fwp-text);
  }
  .forumwp-portal a { color: var(--fwp-accent-text); }
  .forumwp-portal #console { color: var(--fwp-muted); }
</style>`);
document.body.classList.add('forumwp-portal');

// Added so this runs on its own: a post card that logs each render, so you can see React draws it only once.
const PostCard = () => {
  console.log('PostCard rendered');
  return (
    <article className="fwp-post">
      <h3>Welcome to the community</h3>
      <p>Posted in <a href="#general">General</a></p>
    </article>
  );
};

const toggle = () => {
  if (document.body.dataset.theme === 'dark') {
    document.body.dataset.theme = 'light'; // Added so this runs on its own: switching back
  } else {
    document.body.dataset.theme = 'dark';
  }
  console.log('<body data-theme> is now', document.body.dataset.theme);
};

createRoot(document.getElementById('forumwp-root')).render(
  <>
    <PostCard />
    <Button variant="primary" onClick={toggle}>Switch light/dark</Button>
  </>
);
