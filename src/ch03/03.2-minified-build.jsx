// @id 3.2
// @title What npm run build produces
// @section 3.8
import { createElement } from '@wordpress/element'; // Added so this runs on its own
import * as element from '@wordpress/element'; // Added so this runs on its own

// Added so this runs on its own: on a WordPress page, WordPress itself sets up
// window.wp.element (the 'wp-element' script) and window.ReactJSXRuntime (the
// 'react-jsx-runtime' script) before your file runs. Here we set them up by hand.
window.wp = { element };
window.ReactJSXRuntime = { jsx: (type, props) => createElement(type, props) };

// The built file from the book, unchanged:
(()=>{"use strict";const e=window.wp.element,o=window.ReactJSXRuntime,t=()=>(0,o.jsx)("h1",{children:"Hello from ForumWP"}),n=document.getElementById("forumwp-root");(0,e.createRoot)(n).render((0,o.jsx)(t,{}))})();
