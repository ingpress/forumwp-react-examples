// @id 48.2
// @title A file copy the clean-up deleted is copied again, notifications stay quiet during a batch, and members-only content waits for a decision
// @section 48.9
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button, CheckboxControl, SelectControl } from '@wordpress/components'; // Added so this runs on its own

// Added so this runs on its own: pretend attachments, an import_map, a daily clean-up of
// uploads no post uses, a notifications outbox and a pretend POST /forumwp/v1/import/buddyboss.
const site = { attachments: new Set(), posts: [], map: new Map(), nextId: 900, outbox: [] };

// ---- 1. Files: Media::mapped() ----
const copyPhoto = () => {
  const id = site.nextId++;
  site.attachments.add( id );
  site.map.set( 'bp/media/33', id );
  return id;
};
const mapped = ( key, useFix ) => {
  const id = site.map.get( key ) ?? 0;
  if ( useFix && id && ! site.attachments.has( id ) ) {
    site.map.delete( key ); // Gone: forget it, so the file is copied again.
    return 0;
  }
  return id;
};
const FilesPanel = ( { say } ) => {
  const [ fix, setFix ] = useState( true );
  return (
    <section>
      <h3>1. A copy that's gone is copied again</h3>
      <CheckboxControl __nextHasNoMarginBottom label="Check the copy still exists (Media::mapped(), 0.25.0)" checked={ fix } onChange={ setFix } />
      <Button variant="secondary" onClick={ () => say( 'Run 1', () => `copied photo 33 as attachment ${ copyPhoto() }, then stopped before saving its post.` ) }>Run 1 stops part-way</Button>{ ' ' }
      <Button variant="secondary" onClick={ () => say( 'Overnight clean-up', () => {
        const used = new Set( site.posts.flatMap( ( p ) => p.attachments ) );
        const gone = [ ...site.attachments ].filter( ( id ) => ! used.has( id ) );
        gone.forEach( ( id ) => site.attachments.delete( id ) );
        return gone.length ? `deleted unused attachment ${ gone.join( ', ' ) }.` : 'nothing unused.';
      } ) }>Overnight clean-up</Button>{ ' ' }
      <Button variant="secondary" onClick={ () => say( 'Run 2', () => {
        const copy = mapped( 'bp/media/33', fix ) || copyPhoto();
        site.posts.push( { id: 'post from update 12', attachments: [ copy ] } );
        return site.attachments.has( copy ) ? `the post uses attachment ${ copy }: the photo shows.` : `the post uses attachment ${ copy }, which doesn't exist: a broken image.`;
      } ) }>Run 2 imports the post</Button>
    </section>
  );
};

// ---- 2. Quiet mode: Import::running() ----
let running = false;
const notify = ( text ) => {
  if ( running ) {
    return; // Notifications::add() returns early during an import.
  }
  site.outbox.push( text );
};
const QuietPanel = ( { say } ) => {
  const [ noFinally, setNoFinally ] = useState( false );
  const [ throws, setThrows ] = useState( false );
  const batch = () => {
    const work = () => {
      [ 'reply 1 from 2019', 'reply 2 from 2019', 'reply 3 from 2019' ].forEach( ( r ) => notify( `New reply: ${ r }` ) );
      if ( throws ) {
        throw new Error( 'A database error in the middle of the batch' );
      }
    };
    running = true;
    if ( noFinally ) {
      work();
      running = false; // Never reached when work() throws.
      return;
    }
    try {
      work();
    } finally {
      running = false;
    }
  };
  return (
    <section>
      <h3>2. Quiet while importing</h3>
      <CheckboxControl __nextHasNoMarginBottom label="The batch throws" checked={ throws } onChange={ setThrows } />
      <CheckboxControl __nextHasNoMarginBottom label="Reset the flag without finally (the mistake)" checked={ noFinally } onChange={ setNoFinally } />
      <Button variant="secondary" onClick={ () => say( 'Import batch', () => {
        try {
          batch();
          return '3 old replies imported.';
        } catch ( e ) {
          return `failed: ${ e.message }. Import::running() is now ${ running }.`;
        }
      } ) }>Run an import batch</Button>{ ' ' }
      <Button variant="secondary" onClick={ () => say( 'Later in the same request, Ada replies', () => {
        const before = site.outbox.length;
        notify( 'New reply from Ada' );
        return site.outbox.length > before ? 'Tunde is notified.' : 'nobody is notified: the flag was still on.';
      } ) }>Ada replies for real</Button>
      <p className="fwp-muted">Notifications sent: { site.outbox.length ? site.outbox.join( ' · ' ) : 'none' }</p>
    </section>
  );
};

// ---- 3. Private stays private: Import::start() ----
const startImport = ( { access, privateNetwork, makePublic } ) => {
  const reason = privateNetwork ? 'BuddyBoss was set up as a private network: only logged-in members could see it.' : '';
  if ( reason && access === 'open' && ! makePublic ) {
    return { status: 409, code: 'forumwp_import_private', message: `${ reason } Your community is open to everyone, so it would become public…` };
  }
  return { status: 200, state: 'running' };
};
const PrivacyPanel = ( { say } ) => {
  const [ access, setAccess ] = useState( 'open' );
  const [ privateNetwork, setPrivateNetwork ] = useState( true );
  const [ makePublic, setMakePublic ] = useState( false );
  // ImportController::present() sends this sentence, or ''.
  const privacy = privateNetwork && access === 'open' ? 'BuddyBoss was set up as a private network…' : '';
  const send = ( body ) => () => {
    const answer = startImport( body );
    return answer.status === 200 ? 'started.' : `${ answer.status } ${ answer.code }`;
  };
  return (
    <section>
      <h3>3. Members-only content waits for a decision</h3>
      <CheckboxControl __nextHasNoMarginBottom label="BuddyBoss was a private network" checked={ privateNetwork } onChange={ setPrivateNetwork } />
      <SelectControl __nextHasNoMarginBottom __next40pxDefaultSize label="ForumWP access" value={ access } options={ [ { value: 'open', label: 'Open to everyone' }, { value: 'members', label: 'Members only' } ] } onChange={ setAccess } />
      { privacy && <CheckboxControl __nextHasNoMarginBottom label="I understand: import it and make it public" checked={ makePublic } onChange={ setMakePublic } /> }
      <p>
        <Button variant="primary" disabled={ !! privacy && ! makePublic } onClick={ () => say( 'Start import (the screen)', send( { access, privateNetwork, makePublic } ) ) }>Start import</Button>{ ' ' }
        <Button variant="secondary" onClick={ () => say( 'POST /import/buddyboss without make_public (WP-CLI, a script)', send( { access, privateNetwork, makePublic: false } ) ) }>Send the request without the checkbox</Button>
      </p>
    </section>
  );
};

const Demo = () => {
  const [ log, setLog ] = useState( [] );
  const say = ( label, fn ) => {
    const line = `${ label }: ${ fn() }`;
    console.log( line );
    setLog( ( l ) => [ line, ...l ].slice( 0, 12 ) );
  };
  return (
    <div style={ { maxWidth: 760 } }>
      <FilesPanel say={ say } />
      <QuietPanel say={ say } />
      <PrivacyPanel say={ say } />
      <ol className="fwp-log">{ log.map( ( line, i ) => <li key={ i }>{ line }</li> ) }</ol>
    </div>
  );
};

document.head.insertAdjacentHTML( 'beforeend', '<style>.fwp-log li{font-size:13px;margin-bottom:4px}.fwp-muted{color:#757575;font-size:13px}section{border-bottom:1px solid #ddd;padding-bottom:12px;margin-bottom:12px}h3{margin:8px 0}</style>' ); // Added so this runs on its own
createRoot( document.getElementById( 'forumwp-root' ) ).render( <Demo /> );
