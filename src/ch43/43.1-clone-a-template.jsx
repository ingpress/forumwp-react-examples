// @id 43.1
// @title Cloning a template subsite: copy every table, then fix the roles option, addresses (plain and in JSON) and dates
// @section 43.2
// @click Start a demo
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button, CheckboxControl } from '@wordpress/components'; // Added so this runs on its own

// Added so this runs on its own: the template site (wp_2_) as a few tables of rows. It was
// built 3 days and 2 hours ago. The real template has 77 tables; three are enough here.
const HOUR = 3600;
const now = Math.floor( Date.now() / 1000 );
const built = now - ( 3 * 24 + 2 ) * HOUR - 1200;
const iso = ( t ) => new Date( t * 1000 ).toISOString().slice( 0, 19 ).replace( 'T', ' ' );
const fromIso = ( s ) => Date.parse( s.replace( ' ', 'T' ) + 'Z' ) / 1000;
const template = {
  options: [
    { option_name: 'siteurl', option_value: 'https://demo.forumwp.com/template' },
    { option_name: 'home', option_value: 'https://demo.forumwp.com/template' },
    { option_name: 'wp_2_user_roles', option_value: '{"administrator":{"capabilities":{"manage_options":true}}}' },
    { option_name: 'forumwp_demo_built_at', option_value: String( built ) },
    { option_name: '_transient_forumwp_stats', option_value: '{"members":40}' },
  ],
  forumwp_posts: [
    { id: 1, title: 'Welcome to Maker Collective', created_at: iso( built - 2 * HOUR ), meta: '{}' },
    { id: 2, title: 'Spring meetup (live)', created_at: iso( built - 26 * HOUR ), meta: '{"event_start":"' + iso( built + 2 * 24 * HOUR ) + '"}' },
  ],
  forumwp_library: [
    { id: 1, title: 'Starter guide.pdf', meta: '{"url":"https:\\/\\/demo.forumwp.com\\/template\\/wp-content\\/uploads\\/sites\\/2\\/guide.pdf"}' },
  ],
};

const ago = ( t ) => {
  const h = Math.round( ( now - t ) / HOUR );
  const days = ( n ) => `${ n } day${ n === 1 ? '' : 's' }`;
  return h < 0 ? `in ${ days( Math.round( -h / 24 ) ) }` : h < 24 ? `${ h } hours ago` : `${ days( Math.round( h / 24 ) ) } ago (it's over)`;
};

const Demo = () => {
  const [ fix, setFix ] = useState( { roles: true, json: true, dates: true } );
  const [ out, setOut ] = useState( null );
  const toggle = ( k ) => ( v ) => setFix( ( f ) => ( { ...f, [ k ]: v } ) );

  const start = () => {
    const site = 57;
    const log = [];
    // Step 2: Db::copy_tables(). The rows move inside the database; PHP sends three statements.
    const copy = {};
    for ( const [ name, rows ] of Object.entries( template ) ) {
      log.push( `DROP TABLE IF EXISTS wp_${ site }_${ name }`, `CREATE TABLE wp_${ site }_${ name } LIKE wp_2_${ name }`, `INSERT INTO wp_${ site }_${ name } SELECT * FROM wp_2_${ name }   (${ rows.length } rows, never read by PHP)` );
      copy[ name ] = rows.map( ( r ) => ( { ...r } ) );
    }
    // Step 3: Cloner::fix_site().
    if ( fix.roles ) {
      copy.options.find( ( o ) => o.option_name === 'wp_2_user_roles' ).option_name = `wp_${ site }_user_roles`;
      log.push( `UPDATE wp_${ site }_options SET option_name = 'wp_${ site }_user_roles' WHERE option_name = 'wp_2_user_roles'` );
    }
    copy.options = copy.options.filter( ( o ) => ! o.option_name.startsWith( '_transient_' ) );
    log.push( `DELETE FROM wp_${ site }_options WHERE option_name LIKE '\\_transient\\_%' …` );
    const pairs = [ [ '/template/', '/d-k3j9x0qz2a/' ], [ '/sites/2/', `/sites/${ site }/` ] ];
    if ( fix.json ) {
      pairs.push( [ '\\/template\\/', '\\/d-k3j9x0qz2a\\/' ], [ '\\/sites\\/2\\/', `\\/sites\\/${ site }\\/` ] );
    }
    for ( const rows of Object.values( copy ) ) {
      for ( const r of rows ) {
        for ( const k of Object.keys( r ) ) {
          if ( typeof r[ k ] === 'string' ) {
            pairs.forEach( ( [ a, b ] ) => ( r[ k ] = r[ k ].split( a ).join( b ) ) );
          }
        }
      }
    }
    copy.options.forEach( ( o ) => [ 'siteurl', 'home' ].includes( o.option_name ) && ( o.option_value = 'https://demo.forumwp.com/d-k3j9x0qz2a' ) );
    log.push( `Db::replace(): ${ pairs.map( ( [ a, b ] ) => `${ a } → ${ b }` ).join( ', ' ) }` );
    if ( fix.dates ) {
      const shift = Math.floor( ( now - built ) / HOUR ) * HOUR; // whole hours
      log.push( `Db::shift_dates(): every date + ${ shift } seconds (${ shift / HOUR } hours)` );
      const move = ( s ) => iso( fromIso( s ) + shift );
      copy.forumwp_posts.forEach( ( p ) => {
        p.created_at = move( p.created_at );
        p.meta = p.meta.replace( /\d{4}-\d\d-\d\d \d\d:\d\d:\d\d/g, move );
      } );
    }
    log.forEach( ( l ) => console.log( l ) );

    // What Kemi sees in her new sandbox.
    const roles = copy.options.find( ( o ) => o.option_name === `wp_${ site }_user_roles` );
    const file = JSON.parse( copy.forumwp_library[ 0 ].meta ).url;
    const event = JSON.parse( copy.forumwp_posts[ 1 ].meta ).event_start;
    setOut( {
      log,
      sees: [
        roles ? 'Dashboard: opens (her account is an administrator: wp_57_user_roles defines the role).' : 'Dashboard: "Sorry, you are not allowed to access this page." (no wp_57_user_roles, so no roles on site 57)',
        `Library, Starter guide.pdf → ${ file } ${ file.includes( '/template/' ) ? '→ 403 (the template is for network admins only)' : '→ 200' }`,
        `"${ copy.forumwp_posts[ 0 ].title }": posted ${ ago( fromIso( copy.forumwp_posts[ 0 ].created_at ) ).replace( " (it's over)", '' ) }`,
        `Spring meetup (live): starts ${ ago( fromIso( event ) ) }`,
      ],
    } );
  };

  return (
    <div style={ { maxWidth: 760 } }>
      <CheckboxControl __nextHasNoMarginBottom label="Rename the roles option (wp_2_user_roles → wp_57_user_roles)" checked={ fix.roles } onChange={ toggle( 'roles' ) } />
      <CheckboxControl __nextHasNoMarginBottom label="Replace addresses inside JSON too (escaped slashes)" checked={ fix.json } onChange={ toggle( 'json' ) } />
      <CheckboxControl __nextHasNoMarginBottom label="Move the dates forward by the template's age" checked={ fix.dates } onChange={ toggle( 'dates' ) } />
      <Button variant="primary" onClick={ start }>Start a demo</Button>
      { out && (
        <>
          <h3>What Kemi sees at /d-k3j9x0qz2a/</h3>
          <ul>{ out.sees.map( ( l, i ) => <li key={ i }>{ l }</li> ) }</ul>
          <h3>Statements</h3>
          <ol className="fwp-log">{ out.log.map( ( l, i ) => <li key={ i }>{ l }</li> ) }</ol>
        </>
      ) }
    </div>
  );
};

document.head.insertAdjacentHTML( 'beforeend', `<style>
  .fwp-log li { word-break: break-word; margin-bottom: 2px; font: 12px/1.5 ui-monospace, Menlo, monospace; }
</style>` ); // Added so this runs on its own

createRoot( document.getElementById( 'forumwp-root' ) ).render( <Demo /> );
