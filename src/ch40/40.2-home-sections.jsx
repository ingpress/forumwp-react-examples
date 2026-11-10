// @id 40.2
// @title One request for a whole screen: GET /home built from sections that add-ons can add to
// @section 40.2
// @click Load My home
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button, CheckboxControl } from '@wordpress/components'; // Added so this runs on its own
import { createHooks } from '@wordpress/hooks'; // Added so this runs on its own

// Added so this runs on its own: two sets of hooks. `php` stands in for WordPress's
// apply_filters() on the server; `js` is wp.hooks in the browser.
const php = createHooks();
const js = createHooks();
let requests = 0;

// ForumWP, src/Home/Home.php: definitions(), shortened to three of ForumWP's sections and
// Pro's "Continue learning", which ForumWP lists (so the admin can place it) without data.
const definitions = () => {
  const core = {
    greeting: { label: 'Greeting', column: 'top', data: ( user ) => ( { firstName: user.name } ) },
    whats_new: {
      label: 'What’s new in your spaces',
      column: 'main',
      options: { per_space: { type: 'int', default: 3, min: 1, max: 10 } },
      data: ( user, options ) => ( { total: 4, perSpace: options.per_space } ),
    },
    learning: { label: 'Continue learning', column: 'main', pro: true },
    spaces: { label: 'Spaces you might like', column: 'side', data: () => null }, // nothing to suggest: left out
  };
  const sections = php.applyFilters( 'forumwp_home_sections', core );
  const out = {};
  for ( const [ id, s ] of Object.entries( sections ) ) {
    if ( ! s?.label ) {
      continue;
    }
    out[ id ] = { ...s, options: s.options ?? {}, data: typeof s.data === 'function' ? s.data : null };
  }
  return out;
};

// Home::clean_layout(): the admin's saved order, each option clamped. A section nothing
// registers right now keeps its place and options.
const cleanLayout = ( saved, defs ) =>
  saved.map( ( s ) => {
    const options = {};
    for ( const [ key, o ] of Object.entries( defs[ s.id ]?.options ?? {} ) ) {
      options[ key ] = Math.max( o.min, Math.min( o.max, Number( s.options?.[ key ] ?? o.default ) ) );
    }
    return { id: s.id, on: s.on ?? true, options: defs[ s.id ] ? options : s.options ?? {} };
  } );

// Home::build(): the sections with something to show, in the admin's order.
const build = ( user, saved ) => {
  requests++;
  const defs = definitions();
  const sections = [];
  for ( const section of cleanLayout( saved, defs ) ) {
    const def = defs[ section.id ];
    if ( ! section.on || ! def || ! def.data ) {
      continue;
    }
    let data;
    try {
      data = def.data( user, section.options );
    } catch ( e ) {
      console.log( `${ section.id }: ${ e.message } (left out, the page still loads)` );
      data = null; // An add-on's error leaves its section out rather than breaking the page.
    }
    if ( data === null ) {
      continue;
    }
    sections.push( { id: section.id, column: def.column, options: section.options, data } );
  }
  return { sections };
};

// Added so this runs on its own: ForumWP Pro, as two plugins' worth of filters.
const proOn = () => {
  // ForumWP Pro, src/Home/Sections.php: gives the 'learning' section its data.
  php.addFilter( 'forumwp_home_sections', 'pro', ( sections ) => {
    if ( sections.learning ) {
      sections.learning.data = ( user ) => {
        if ( window.proBroken ) {
          throw new Error( 'Call to undefined method Course::next()' );
        }
        return { items: [ { title: 'Pricing your first course', next: 'Lesson 3: Anchors' } ] };
      };
    }
    return sections;
  } );
  // ForumWP Pro, app/portal/promotions/index.js: draws it.
  js.addFilter( 'forumwp.homeSections', 'pro', ( list ) => [ ...list, { id: 'learning', component: Learning } ] );
};
const proOff = () => {
  php.removeFilter( 'forumwp_home_sections', 'pro' );
  js.removeFilter( 'forumwp.homeSections', 'pro' );
};

// The app's side. ForumWP, app/portal/extend.js
const homeSections = () =>
  ( js.applyFilters( 'forumwp.homeSections', [] ) ?? [] ).filter( ( s ) => s?.id && typeof s.component === 'function' );

const HomeSection = ( { title, children } ) => (
  <section className="fwp-card"><h3>{ title }</h3>{ children }</section>
);
const Greeting = ( { data } ) => <h2>Good morning, { data.firstName }</h2>;
const WhatsNew = ( { data } ) => (
  <HomeSection title="What’s new in your spaces">{ data.total } new posts ({ data.perSpace } per space)</HomeSection>
);
const Learning = ( { data } ) => (
  <HomeSection title="Continue learning">{ data.items.map( ( c ) => <p key={ c.title }>{ c.title }: { c.next }</p> ) }</HomeSection>
);

// ForumWP, app/portal/screens/MyHome.js, shortened
const CORE = { greeting: Greeting, whats_new: WhatsNew };
const MyHome = ( { data } ) => {
  const drawers = { ...CORE };
  homeSections().forEach( ( s ) => ( drawers[ s.id ] = s.component ) );
  const sections = data.sections.filter( ( s ) => drawers[ s.id ] );
  return sections.map( ( section ) => {
    const Section = drawers[ section.id ];
    return <Section key={ section.id } data={ section.data } options={ section.options } />;
  } );
};

// The admin's saved order (Settings → General → My home). per_space 40 is out of range.
const SAVED = [
  { id: 'greeting' },
  { id: 'learning' },
  { id: 'whats_new', options: { per_space: 40 } },
  { id: 'spaces' },
];

const Demo = () => {
  const [ pro, setPro ] = useState( true );
  const [ broken, setBroken ] = useState( false );
  const [ answer, setAnswer ] = useState( null );
  const load = () => {
    proOff();
    if ( pro ) {
      proOn();
    }
    window.proBroken = broken;
    const data = build( { name: 'Ada' }, SAVED );
    console.log( `GET /home (request ${ requests }): ${ data.sections.map( ( s ) => s.id ).join( ', ' ) }` );
    setAnswer( data );
  };

  return (
    <div style={ { maxWidth: 640 } }>
      <CheckboxControl label="ForumWP Pro is active" checked={ pro } onChange={ setPro } __nextHasNoMarginBottom />
      <CheckboxControl label="Pro's section throws an error" checked={ broken } onChange={ setBroken } __nextHasNoMarginBottom />
      <p><Button variant="primary" onClick={ load }>Load My home</Button></p>
      { answer && (
        <>
          <p className="fwp-muted">
            Saved layout after <code>clean_layout()</code>: <code>{ JSON.stringify( cleanLayout( SAVED, definitions() ) ) }</code>
          </p>
          <pre className="fwp-json">{ JSON.stringify( answer, null, 1 ) }</pre>
          <MyHome data={ answer } />
        </>
      ) }
    </div>
  );
};

document.head.insertAdjacentHTML( 'beforeend', `<style>
  .fwp-muted { color: #757575; font-size: 13px; }
  .fwp-json { background: #f6f7f7; padding: 8px; font-size: 12px; max-height: 220px; overflow: auto; }
</style>` ); // Added so this runs on its own

createRoot( document.getElementById( 'forumwp-root' ) ).render( <Demo /> );
