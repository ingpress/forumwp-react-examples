// @id 31.3
// @title Fifty keystrokes, a handful of requests
// @section 31.3
import { createRoot, useEffect, useRef, useState } from '@wordpress/element'; // Added so this runs on its own
import { TextareaControl } from '@wordpress/components'; // Added so this runs on its own

// Added so this runs on its own: a pretend server. Like Messages::typing(), it keeps the time of
// each member's last report, and shows them as typing for SHOW_FOR seconds after it.
const SHOW_FOR = 6;
const server = { typingAt: {}, requests: 0 };
const post = ( path ) => {
  server.requests++;
  console.log( 'POST', path );
  server.typingAt.Ada = Date.now();
  return Promise.resolve( {} );
};
const typingNames = () =>
  Object.keys( server.typingAt ).filter( ( name ) => server.typingAt[ name ] > Date.now() - SHOW_FOR * 1000 );

/**
 * Tells the others you're typing, at most every few seconds.
 */
const useTyping = ( id ) => {
  const last = useRef( 0 );

  return () => {
    if ( Date.now() - last.current > 3000 ) {
      last.current = Date.now();
      post( `/conversations/${ id }/typing` ).catch( () => {} );
    }
  };
};

const Reply = () => {
  const [ body, setBody ] = useState( '' );
  const [ keys, setKeys ] = useState( 0 ); // Added so this runs on its own
  const typing = useTyping( 5 );

  return (
    <>
      <TextareaControl
        __nextHasNoMarginBottom
        label="Ada writes"
        value={ body }
        onChange={ ( value ) => {
          setBody( value );
          setKeys( ( n ) => n + 1 );
          if ( value.trim() ) {
            typing();
          }
        } }
      />
      <p>
        Keystrokes: { keys } · requests: { server.requests }
      </p>
    </>
  );
};

// Added so this runs on its own: what Tunde sees, asking the server once a second.
const OtherSide = () => {
  const [ names, setNames ] = useState( [] );
  useEffect( () => {
    const timer = setInterval( () => setNames( typingNames() ), 1000 );
    return () => clearInterval( timer );
  }, [] );

  return (
    <p className="fwp-card" aria-live="polite">
      Tunde sees: { names.length === 1 ? `${ names[ 0 ] } is typing…` : '(nothing)' }
    </p>
  );
};

createRoot( document.getElementById( 'forumwp-root' ) ).render(
  <div style={ { display: 'grid', gap: 12, maxWidth: 480 } }>
    <Reply />
    <OtherSide />
  </div>
);
