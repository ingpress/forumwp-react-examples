// @id 52.3
// @title Two dirty forms: remember-and-restore against a count
// @section 52.4
// @click Type in form A
import { createRoot, useEffect, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button, RadioControl } from '@wordpress/components'; // Added so this runs on its own

// Added so this runs on its own: a pretend router. Every link in the app ends in push().
const log = [];
let tell = () => {};
const say = ( line ) => {
  log.push( line );
  console.log( line );
  tell();
};
const navigator = {
  push( to ) {
    say( `Went to ${ to }` );
  },
};
const originalPush = navigator.push;
// Added so this runs on its own: window.confirm() would stop the example, so "asking" is logged.
const ask = () => {
  say( 'ASKED: "You have unsaved changes. Leave without saving them?"' );

  return true;
};

// The first version (the bug): each dirty form wraps push() itself, and puts back what it found.
const useGuardFirst = ( dirty ) => {
  useEffect( () => {
    if ( ! dirty ) {
      return;
    }
    const { push } = navigator;
    navigator.push = ( to, ...rest ) => {
      if ( ask() ) {
        push.call( navigator, to, ...rest );
      }
    };

    return () => {
      navigator.push = push;
    };
  }, [ dirty ] );
};

// As shipped (app/portal/hooks/useUnsavedGuard.js): one patch, and a count.
// How many forms on the screen have unsaved work right now, and what undoes watch().
let dirtyGuards = 0;
let unwatch = null;

const watch = () => {
  const { push } = navigator;
  navigator.push = ( to, ...rest ) => {
    if ( ask() ) {
      push.call( navigator, to, ...rest );
    }
  };

  return () => {
    navigator.push = push;
  };
};

const useGuardCounted = ( dirty ) => {
  useEffect( () => {
    if ( ! dirty ) {
      return;
    }
    // The first dirty form starts the watch; the last one to be saved ends it.
    dirtyGuards++;
    if ( dirtyGuards === 1 ) {
      unwatch = watch();
    }

    return () => {
      dirtyGuards--;
      if ( dirtyGuards === 0 ) {
        unwatch();
        unwatch = null;
      }
    };
  }, [ dirty ] );
};

const Form = ( { name, useGuard } ) => {
  const [ dirty, setDirty ] = useState( false );
  useGuard( dirty );
  // Added so this runs on its own: redraw the page's "push() is …" line after the guard has run.
  useEffect( () => tell(), [ dirty ] );

  return (
    <div className="fwp-card">
      <strong>Form { name }</strong>: { dirty ? 'unsaved changes' : 'saved' }{ ' ' }
      <Button variant="secondary" disabled={ dirty } onClick={ () => setDirty( true ) }>Type in form { name }</Button>{ ' ' }
      <Button variant="secondary" disabled={ ! dirty } onClick={ () => setDirty( false ) }>Save form { name }</Button>
    </div>
  );
};

const App = () => {
  const [ version, setVersion ] = useState( 'first' );
  const [ , redraw ] = useState( 0 );
  tell = () => redraw( ( n ) => n + 1 );
  const useGuard = version === 'first' ? useGuardFirst : useGuardCounted;
  // Added so this runs on its own: start clean when the version changes (this runs
  // after the old forms' clean-ups).
  useEffect( () => {
    navigator.push = originalPush;
    dirtyGuards = 0;
    unwatch = null;
    log.length = 0;
    tell();
  }, [ version ] );

  return (
    <div style={ { maxWidth: 640 } }>
      <RadioControl
        label="The guard"
        selected={ version }
        options={ [
          { label: 'First version: each form wraps push() and restores what it found (the bug)', value: 'first' },
          { label: 'As shipped: one patch and a count of dirty forms', value: 'counted' },
        ] }
        onChange={ setVersion }
      />
      { /* key: new forms (and a new hook) when the version changes. */ }
      <div key={ version }>
        <Form name="A" useGuard={ useGuard } />
        <Form name="B" useGuard={ useGuard } />
      </div>
      <p>
        <Button variant="primary" onClick={ () => navigator.push( '/members' ) }>Follow a link to Members</Button>{ ' ' }
        push() is { navigator.push === originalPush ? 'the router’s own' : 'wrapped' }.
      </p>
      <ol className="fwp-log">{ log.map( ( line, i ) => <li key={ i }>{ line }</li> ) }</ol>
      <p className="fwp-muted">Try, with the first version: type in A, type in B, save A, then save B. Both forms are saved, but push() is still wrapped: follow the link and you are asked about changes that don't exist, for ever. (After "save A" alone, B's changes weren't protected at all.) Do the same with the shipped version: the question comes while either form is dirty and stops when both are saved.</p>
    </div>
  );
};

document.head.insertAdjacentHTML( 'beforeend', '<style>.fwp-card{border:1px solid #ddd;border-radius:8px;padding:12px;margin:12px 0}.fwp-muted{color:#757575}.fwp-log{font-family:monospace;font-size:13px}</style>' ); // Added so this runs on its own
createRoot( document.getElementById( 'forumwp-root' ) ).render( <App /> );
