// @id 52.5
// @title An autosave that makes two drafts, and the one-word fix
// @section 52.7
// @click Type during the first save
import { createRoot, startTransition, useEffect, useRef, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button, CheckboxControl, TextControl } from '@wordpress/components'; // Added so this runs on its own

// Added so this runs on its own: a pretend server that takes 1.5 seconds to save.
// id 0 means "make a new broadcast"; any other id updates that one.
const drafts = [];
let tell = () => {};
const saveBroadcast = ( { id, subject } ) => new Promise( ( resolve ) => setTimeout( () => {
  let draft = drafts.find( ( d ) => d.id === id );
  if ( draft ) {
    draft.subject = subject;
    console.log( `POST /broadcasts/${ id } → updated` );
  } else {
    draft = { id: 57 + drafts.length, subject };
    drafts.push( draft );
    console.log( `POST /broadcasts (id 0) → made broadcast ${ draft.id }` );
  }
  tell();
  resolve( { ...draft } );
}, 1500 ) );

// The real editor waits 4 seconds; shorter here so you don't.
const AUTOSAVE_AFTER = 1000;

// The broadcast editor's autosave, shortened (app/portal/broadcasts/Editor.js).
// `id` comes from the address: /broadcasts/new is 0, /broadcasts/57 is 57.
const Editor = ( { id, navigate, fixed } ) => {
  const [ subject, setSubject ] = useState( '' );
  const [ savedSubject, setSavedSubject ] = useState( '' );
  const [ isPending, setPending ] = useState( false );
  const dirty = subject !== savedSubject;

  const persist = () => {
    const sending = subject;
    setPending( true );
    saveBroadcast( { id, subject } ).then( ( saved ) => {
      setPending( false );
      // Saved is what was sent, not what the form holds by now.
      setSavedSubject( sending );
      if ( ! id ) {
        navigate( saved.id );
      }
    } );
  };

  const text = subject;
  const autosaves = dirty && !! subject.trim() && ! isPending;
  useEffect( () => {
    if ( ! autosaves ) {
      return;
    }
    const timer = window.setTimeout( () => persist(), AUTOSAVE_AFTER );

    return () => window.clearTimeout( timer );
    // `id` is here so that the timer starts again when a new broadcast gets its id:
    // a timer started before that would still save "a new broadcast" (id 0), and
    // make a second draft.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, fixed ? [ autosaves, text, id ] : [ autosaves, text ] );

  // Added so this runs on its own: types for you, at the moments that matter.
  const script = useRef( [] );
  const play = () => {
    script.current.forEach( clearTimeout );
    setSubject( 'Welcome' );
    // The first autosave starts at 1 second and is answered at 2.5: type in between.
    script.current = [ setTimeout( () => setSubject( 'Welcome to March' ), 1800 ) ];
  };

  return (
    <div style={ { display: 'grid', gap: 8 } }>
      <p style={ { margin: 0 } }>Address: <code>/broadcasts/{ id || 'new' }</code> { isPending ? '· saving…' : dirty ? '· unsaved' : '· saved' }</p>
      <TextControl __nextHasNoMarginBottom label="Subject" value={ subject } onChange={ setSubject } />
      <div><Button variant="primary" onClick={ play }>Type during the first save</Button></div>
    </div>
  );
};

const App = () => {
  const [ fixed, setFixed ] = useState( false );
  const [ id, setId ] = useState( 0 );
  const [ run, setRun ] = useState( 0 );
  const [ , redraw ] = useState( 0 );
  tell = () => redraw( ( n ) => n + 1 );

  return (
    <div style={ { maxWidth: 560, display: 'grid', gap: 12 } }>
      <CheckboxControl
        label="`id` is in the effect's dependency array (the fix)"
        checked={ fixed }
        onChange={ ( value ) => {
          // Added so this runs on its own: start again with a new broadcast.
          drafts.length = 0;
          setId( 0 );
          setRun( run + 1 );
          setFixed( value );
        } }
      />
      <Editor
        key={ run }
        id={ id }
        // Added so this runs on its own: like React Router, the new address is applied
        // in a transition, so it arrives one render after the save's own state.
        navigate={ ( to ) => startTransition( () => setId( to ) ) }
        fixed={ fixed }
      />
      <div>
        <strong>Drafts on the server: { drafts.length }</strong>
        <ul>{ drafts.map( ( d ) => <li key={ d.id }>Broadcast { d.id }: "{ d.subject }"</li> ) }</ul>
      </div>
      <p style={ { color: '#757575' } }>Try: press the button with the box unticked and wait five seconds. The first save makes broadcast 57; the words typed while it was on its way are saved by a timer that still believes the broadcast is new, and make broadcast 58. Tick the box and press it again: one draft, updated.</p>
    </div>
  );
};

createRoot( document.getElementById( 'forumwp-root' ) ).render( <App /> );
