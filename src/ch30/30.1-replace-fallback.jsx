// @id 30.1
// @title React replaces the plain-HTML copy
// @section 30.1
import { createRoot } from '@wordpress/element'; // Added so this runs on its own

// Added so this runs on its own: what Seo::fallback() prints inside #forumwp-root for a post page.
// Search engines and link previews read this (and the <head>); they don't wait for the app.
const root = document.getElementById( 'forumwp-root' );
root.innerHTML = `
  <div class="fwp-fallback">
    <article>
      <h1>How do I change my avatar?</h1>
      <p>Tunde · <a href="/community/s/help">Help</a> · <time datetime="2026-11-02T09:00:00+00:00">2 November 2026</time></p>
      <p>Open your profile, then click your photo.</p>
    </article>
  </div>`;
console.log( 'PHP printed:', root.querySelector( 'h1' ).textContent );

// Added so this runs on its own: the app, much smaller than ForumWP's.
const App = () => (
  <div className="fwp-post">
    <h2>How do I change my avatar?</h2>
    <p>
      <strong>Tunde</strong> in Help
    </p>
    <p>Open your profile, then click your photo.</p>
    <button type="button">Like</button> <button type="button">Reply</button>
  </div>
);

// Added so this runs on its own: wait a second so you can see the copy before the app replaces it.
setTimeout( () => {
  createRoot( root ).render( <App /> ); // the plain-HTML copy inside root is replaced
  setTimeout( () => console.log( 'Copy still there?', !! root.querySelector( '.fwp-fallback' ) ), 100 );
}, 1500 );
