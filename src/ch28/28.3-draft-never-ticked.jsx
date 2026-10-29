// @id 28.3
// @title A draft that never remembers "email everyone"
// @section 28.3
import { createRoot, useEffect, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button, CheckboxControl, TextareaControl } from '@wordpress/components'; // Added so this runs on its own

// Added so this runs on its own: a small version of the composer's draft helpers (Chapter 27.3),
// kept in memory instead of localStorage so the example works in any sandbox.
const storage = new Map();
const saveDraft = ( key, form ) => storage.set( key, JSON.stringify( { form, savedAt: Date.now() } ) );
const loadDraft = ( key ) => ( storage.has( key ) ? JSON.parse( storage.get( key ) ).form : null );
const EMPTY = { body: '', emailEveryone: false, extra: {} };
const storageKey = 'fwp-draft:/community:1:7';

const Composer = () => {
  const [ saved ] = useState( () => loadDraft( storageKey ) );
  const [ form, setForm ] = useState( () =>
    saved ? { ...EMPTY, ...saved, extra: {}, emailEveryone: false } : EMPTY
  );
  const set = ( key ) => ( value ) => setForm( { ...form, [ key ]: value } );

  useEffect( () => {
    saveDraft( storageKey, {
      ...form,
      extra: undefined,
      // Emailing everyone is ticked again each time, never restored from a draft.
      emailEveryone: undefined,
    } );
  }, [ form ] );

  return (
    <div style={ { display: 'grid', gap: 12, maxWidth: 420 } }>
      <TextareaControl __nextHasNoMarginBottom label="Post" value={ form.body } onChange={ set( 'body' ) } />
      <CheckboxControl
        __nextHasNoMarginBottom
        label="Also email this to everyone"
        checked={ !! form.emailEveryone }
        onChange={ set( 'emailEveryone' ) }
      />
      <p>
        What the draft stores:{ ' ' }
        <code>{ JSON.stringify( { ...form, extra: undefined, emailEveryone: undefined } ) }</code>
      </p>
    </div>
  );
};

// Added so this runs on its own: "Close and reopen" remounts the composer, like coming back later.
const App = () => {
  const [ n, setN ] = useState( 0 );
  return (
    <>
      <Composer key={ n } />
      <Button variant="secondary" onClick={ () => setN( n + 1 ) }>Close and reopen</Button>
    </>
  );
};

createRoot( document.getElementById( 'forumwp-root' ) ).render( <App /> );
