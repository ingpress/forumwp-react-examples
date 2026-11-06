// @id 30.2
// @title Remembering "not known yet" as the answer
// @section 30.3
// @click Run the request
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button, ToggleControl } from '@wordpress/components'; // Added so this runs on its own

// Added so this runs on its own: Page::current() written in JavaScript, both versions.
// One request: plugins load, then WordPress reads the address, then the head is printed.
const request = { parsed: false, path: '' };
const detect = () => {
  if ( ! request.parsed ) {
    return null; // Router::is_portal() can't know yet
  }
  return request.path.startsWith( 'p/' ) ? { type: 'post', title: 'How do I change my avatar?' } : null;
};

// The first version: remembered from the first call, whenever that was.
let firstCurrent = null;
const firstVersion = () => {
  if ( null === firstCurrent ) {
    firstCurrent = detect() ?? false;
  }
  return firstCurrent ? firstCurrent : null;
};

// The fix: before the address is read, nothing is known yet: don't remember that.
let fixedCurrent; // undefined: not worked out; false: worked out, not a public page
const fixedVersion = () => {
  if ( ! request.parsed ) {
    return null;
  }
  if ( fixedCurrent === undefined ) {
    fixedCurrent = detect() ?? false;
  }
  return fixedCurrent ? fixedCurrent : null;
};

const runRequest = ( early ) => {
  firstCurrent = null;
  fixedCurrent = undefined;
  request.parsed = false;
  request.path = '';
  const log = [];
  if ( early ) {
    // plugins_loaded: an SEO plugin reads an option, which asks "what page is this?"
    log.push( `plugins_loaded: first ${ JSON.stringify( firstVersion() ) }, fixed ${ JSON.stringify( fixedVersion() ) }` );
  }
  // parse_query: WordPress has read /community/p/412.
  request.parsed = true;
  request.path = 'p/412';
  // wp_head: the title tag asks again.
  log.push( `wp_head: first ${ JSON.stringify( firstVersion()?.title ?? null ) }, fixed ${ JSON.stringify( fixedVersion()?.title ?? null ) }` );
  return log;
};

const App = () => {
  const [ early, setEarly ] = useState( true );
  const [ log, setLog ] = useState( [] );

  return (
    <div style={ { display: 'grid', gap: 12, maxWidth: 560 } }>
      <ToggleControl
        __nextHasNoMarginBottom
        label="Something asks on plugins_loaded, before the address is read"
        checked={ early }
        onChange={ setEarly }
      />
      <Button variant="primary" onClick={ () => setLog( runRequest( early ) ) }>
        Run the request
      </Button>
      <ol>
        { log.map( ( line ) => (
          <li key={ line }>
            <code>{ line }</code>
          </li>
        ) ) }
      </ol>
      <p className="fwp-muted">With the early question, the first version gives the head no title at all.</p>
    </div>
  );
};

createRoot( document.getElementById( 'forumwp-root' ) ).render( <App /> );
