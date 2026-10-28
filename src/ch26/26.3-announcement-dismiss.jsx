// @id 26.3
// @title Remembering a closed banner in localStorage
// @section 26.3
// @click Close
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button, Notice } from '@wordpress/components'; // Added so this runs on its own

const KEY = 'fwp-dismissed-announcement';

// Storage can be blocked (private windows, strict settings): then the banner just shows again.
const dismissedId = () => {
  try {
    return window.localStorage.getItem( KEY );
  } catch {
    return null;
  }
};

// Added so this runs on its own: the parts of app/portal/components/Announcement.js around the state.
const Announcement = ( { announcement } ) => {
  const [ hidden, setHidden ] = useState(
    () => !! announcement && dismissedId() === announcement.id
  );

  const dismiss = () => {
    setHidden( true );
    try {
      window.localStorage.setItem( KEY, announcement.id );
    } catch {}
  };

  if ( ! announcement || hidden ) {
    return null;
  }
  return (
    <Notice status="info" onRemove={ dismiss }>
      { announcement.text }
    </Notice>
  );
};

// Added so this runs on its own: the server makes the id from the text (md5 in PHP); a tiny hash
// stands in for it. "Reload the page" mounts the banner again, as a new page would; "The admin
// writes a new message" changes the text, so the id changes and the banner comes back.
const idOf = ( text ) => [ ...text ].reduce( ( h, c ) => ( h * 31 + c.charCodeAt( 0 ) ) >>> 0, 7 ).toString( 16 ).padStart( 10, '0' ).slice( 0, 10 );
const MESSAGES = [ 'Office hours are on Friday at 3pm.', 'New: dark mode is here. Try it from the top bar.' ];
const Page = () => {
  const [ message, setMessage ] = useState( 0 );
  const [ loads, setLoads ] = useState( 0 );
  const text = MESSAGES[ message ];
  return (
    <>
      <Announcement key={ `${ message }-${ loads }` } announcement={ { id: idOf( text ), text } } />
      <p>Stored id: <code>{ dismissedId() ?? 'nothing yet' }</code> · This banner's id: <code>{ idOf( text ) }</code></p>
      <Button variant="secondary" onClick={ () => setLoads( loads + 1 ) }>Reload the page</Button>{ ' ' }
      <Button variant="secondary" onClick={ () => setMessage( ( message + 1 ) % MESSAGES.length ) }>The admin writes a new message</Button>
    </>
  );
};

createRoot( document.getElementById( 'forumwp-root' ) ).render( <Page /> ); // Added so this runs on its own
