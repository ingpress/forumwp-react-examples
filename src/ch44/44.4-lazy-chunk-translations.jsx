// @id 44.4
// @title A lazy-loaded screen with React.lazy() and import(), and its chunk translations loaded before the app starts
// @section 44.9
// @click Open Messages
import { createRoot, lazy, Suspense, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button, CheckboxControl, Spinner } from '@wordpress/components'; // Added so this runs on its own
import { createI18n } from '@wordpress/i18n'; // Added so this runs on its own

// Added so this runs on its own: the page's translations. The real app uses the global
// wp.i18n; a fresh createI18n() per "page load" here lets you start again with other settings.
const FR_MAIN = { 'Feed': [ 'Fil' ], 'Messages': [ 'Messages' ] }; // languages/forumwp-fr_FR-<md5 of build/portal.js>.json
const FR_CHUNK = { 'New message': [ 'Nouveau message' ], 'Nothing here yet.': [ 'Rien pour l’instant.' ] }; // …-<md5 of build/portal-messages.js>.json
const header = { '': { domain: 'forumwp', lang: 'fr', plural_forms: 'nplurals=2; plural=(n > 1);' } };

// What the server prints before portal.js: wp_set_script_translations() for the main file,
// and Assets::chunk_translations() for each build/portal-*.js.
const pageLoad = ( french, chunkTranslations, log ) => {
  const i18n = createI18n();
  if ( french ) {
    i18n.setLocaleData( { ...header, ...FR_MAIN }, 'forumwp' );
    log( 'printed before portal.js: setLocaleData() for portal.js' );
    if ( chunkTranslations ) {
      i18n.setLocaleData( { ...header, ...FR_CHUNK }, 'forumwp' );
      log( 'printed before portal.js: setLocaleData() for portal-messages.js (chunk_translations())' );
    }
  }
  log( 'downloaded: build/portal.js' );
  // The chunk: a pretend import() that "downloads" build/portal-messages.js.
  const importMessages = () => {
    log( 'downloading: build/portal-messages.js …' );
    return new Promise( ( resolve ) => setTimeout( () => {
      log( 'downloaded: build/portal-messages.js' );
      const MessagesScreen = () => (
        <div className="fwp-card">
          <h3>{ i18n.__( 'Messages', 'forumwp' ) }</h3>
          <Button variant="primary">{ i18n.__( 'New message', 'forumwp' ) }</Button>
          <p>{ i18n.__( 'Nothing here yet.', 'forumwp' ) }</p>
        </div>
      );
      resolve( { default: MessagesScreen } );
    }, 900 ) );
  };
  // lazyComponent(): made once per page load, never inside a render.
  const Lazy = lazy( importMessages );
  const Messages = () => <Suspense fallback={ <Spinner /> }><Lazy /></Suspense>;
  return { i18n, Messages };
};

// Added so this runs on its own: where the pretend page writes its log.
const logged = [];
let logTo = ( l ) => logged.push( l );
const log = ( l ) => logTo( l );

const Demo = () => {
  const [ french, setFrench ] = useState( true );
  const [ chunks, setChunks ] = useState( true );
  const [ lines, setLines ] = useState( logged );
  const [ page, setPage ] = useState( () => pageLoad( true, true, log ) );
  const [ screen, setScreen ] = useState( 'feed' );
  logTo = ( l ) => {
    console.log( l );
    setLines( ( x ) => [ ...x, l ] );
  };
  const load = () => {
    setLines( [] );
    setScreen( 'feed' );
    setPage( pageLoad( french, chunks, log ) );
  };
  const { i18n, Messages } = page;
  return (
    <div style={ { maxWidth: 760 } }>
      <CheckboxControl __nextHasNoMarginBottom label="The site is in French" checked={ french } onChange={ setFrench } />
      <CheckboxControl __nextHasNoMarginBottom label="Assets::chunk_translations() ran" checked={ chunks } onChange={ setChunks } />
      <p><Button variant="secondary" onClick={ load }>Load the page again with these settings</Button></p>
      <p>
        <Button variant={ screen === 'feed' ? 'primary' : 'tertiary' } onClick={ () => setScreen( 'feed' ) }>{ i18n.__( 'Feed', 'forumwp' ) }</Button>{ ' ' }
        <Button variant={ screen === 'messages' ? 'primary' : 'tertiary' } onClick={ () => setScreen( 'messages' ) }>Open Messages</Button>
      </p>
      { screen === 'messages' ? <Messages /> : <div className="fwp-card">{ i18n.__( 'Feed', 'forumwp' ) }: …</div> }
      <ol className="fwp-log">{ lines.map( ( l, i ) => <li key={ i }>{ l }</li> ) }</ol>
    </div>
  );
};

document.head.insertAdjacentHTML( 'beforeend', `<style>
  .fwp-log li { font-size: 13px; }
</style>` ); // Added so this runs on its own

createRoot( document.getElementById( 'forumwp-root' ) ).render( <Demo /> );
