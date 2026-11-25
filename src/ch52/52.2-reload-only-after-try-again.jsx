// @id 52.2
// @title Reload only after "Try again" fails
// @section 52.3
// @click Open Members
// @expect error
import { Component, createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button, CheckboxControl } from '@wordpress/components'; // Added so this runs on its own

// Added so this runs on its own: a pretend reload (a real one would restart the example),
// a pretend "online" switch, and a screen whose file won't download while `missing` is ticked.
const world = { online: true, missing: true, reloads: 0, page: 1, tell: () => {} };
const reloadThePage = () => {
  world.reloads++;
  world.page++; // A new page: everything on it is drawn afresh.
  world.missing = false; // After a reload the new app asks for the new file.
  world.tell();
};

// A screen's file (build/portal-*.js) that would not download.
const isChunkError = ( error ) =>
  error?.name === 'ChunkLoadError' ||
  /Loading (CSS )?chunk|dynamically imported module/i.test( error?.message ?? '' );

// Which file failed: its address when webpack gives it, else the error's words.
const chunkOf = ( error ) => error?.request || error?.message || '';

let reloadedAt = 0; // In ForumWP this is kept in sessionStorage, which survives a reload.
const reloadOnce = () => {
  if ( world.online === false ) { // window.navigator.onLine in ForumWP
    return false;
  }
  if ( Date.now() - reloadedAt < 60_000 ) {
    return false;
  }
  reloadedAt = Date.now();
  reloadThePage(); // window.location.reload() in ForumWP

  return true;
};

// From ForumWP's app/portal/components/ErrorBoundary.js. `surprise` is the first
// version: reload as soon as a file fails.
class ErrorBoundary extends Component {
  constructor( props ) {
    super( props );
    this.state = { error: null, reloading: false };
    // The file "Try again" was pressed for, until the next error says how that went.
    this.retried = null;
    this.retry = this.retry.bind( this );
  }

  static getDerivedStateFromError( error ) {
    return { error };
  }

  componentDidCatch( error ) {
    // Only the same file failing again after "Try again" reloads the page. A retry
    // that worked must not make some later failure reload it without asking.
    const failedAgain =
      this.retried !== null && chunkOf( error ) === this.retried;
    this.retried = null;
    if ( isChunkError( error ) && ( failedAgain || this.props.surprise ) && reloadOnce() ) {
      this.setState( { reloading: true } );
    }
    console.log( 'Caught: ' + error.message );
  }

  retry() {
    this.retried = isChunkError( this.state.error )
      ? chunkOf( this.state.error )
      : null;
    this.props.onRetry?.();
    this.setState( { error: null } );
  }

  render() {
    const { error, reloading } = this.state;
    if ( ! error ) {
      return this.props.children;
    }
    if ( reloading ) {
      return null;
    }

    return (
      <div className="fwp-oops" role="alert">
        <strong>This screen didn’t load.</strong> Check your connection and try again.{ ' ' }
        <Button variant="secondary" onClick={ this.retry }>Try again</Button>
      </div>
    );
  }
}

// Added so this runs on its own: stands for a screen made with lazy( () => import( … ) ).
const Members = () => {
  if ( world.missing ) {
    const error = new Error( 'Loading chunk portal-members failed.' );
    error.name = 'ChunkLoadError';
    throw error;
  }

  return <p>Members: Ada, Tunde, Kemi.</p>;
};

const App = () => {
  const [ , redraw ] = useState( 0 );
  world.tell = () => redraw( ( n ) => n + 1 );
  const [ surprise, setSurprise ] = useState( false );
  const [ open, setOpen ] = useState( 0 );
  const [ draft, setDraft ] = useState( 'Six settings I changed and have not saved' );

  return (
    <div style={ { maxWidth: 640 } }>
      <CheckboxControl label="First version: reload as soon as a file fails (the bug)" checked={ surprise } onChange={ setSurprise } />
      <CheckboxControl label="The browser is online" checked={ world.online } onChange={ ( v ) => { world.online = v; world.tell(); } } />
      <CheckboxControl label="The Members file is missing (the plugin was updated)" checked={ world.missing } onChange={ ( v ) => { world.missing = v; world.tell(); } } />
      <p><Button variant="primary" onClick={ () => setOpen( open + 1 ) }>Open Members</Button></p>
      <div className="fwp-card">
        { open > 0 && (
          <ErrorBoundary key={ `${ world.page }-${ open }-${ surprise }` } surprise={ surprise } onRetry={ world.tell }>
            <Members />
          </ErrorBoundary>
        ) }
      </div>
      <div className="fwp-card">
        <strong>Unsaved work elsewhere on the page</strong><br />
        <input value={ draft } onChange={ ( e ) => setDraft( e.target.value ) } style={ { width: '100%' } } />
      </div>
      <p><strong>Page reloads so far: { world.reloads }</strong> (each one would have thrown the unsaved work away)</p>
      <p className="fwp-muted">Try: open Members. Nothing reloads; you are asked. Press "Try again": the same file fails again, so now the page reloads (the count goes to 1 and the new file loads). Start again with the first box ticked: the reload happens the moment you open Members, with nobody asked. Tick "missing" again, untick "online", open Members and press "Try again": no reload while offline, where a reload would show nothing at all.</p>
    </div>
  );
};

document.head.insertAdjacentHTML( 'beforeend', '<style>.fwp-card{border:1px solid #ddd;border-radius:8px;padding:12px;margin:12px 0;min-height:24px}.fwp-oops{background:#fcf0f1;padding:8px;border-radius:6px}.fwp-muted{color:#757575}</style>' ); // Added so this runs on its own
createRoot( document.getElementById( 'forumwp-root' ) ).render( <App /> );
