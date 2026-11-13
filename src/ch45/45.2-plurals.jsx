// @id 45.2
// @title Plurals with _n(): English, and Polish's three forms from a translation file, next to the __() version that can't be translated
// @section 45.5
// @click Show 0 to 25
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button } from '@wordpress/components'; // Added so this runs on its own
import { createI18n, sprintf } from '@wordpress/i18n'; // Added so this runs on its own

// Added so this runs on its own: two languages as wp i18n make-json would write them.
const english = createI18n();
const polish = createI18n( {
  '': { domain: 'forumwp', lang: 'pl', plural_forms: 'nplurals=3; plural=(n==1 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2);' },
  '%d draft': [ '%d szkic', '%d szkice', '%d szkiców' ],
  // The __() version: one string, so the translator had to pick one form for every number.
  '%d drafts': [ '%d szkiców' ],
}, 'forumwp' );

// ForumWP, app/portal/components/Drafts.js: the count in the panel.
const label = ( i18n, total ) => sprintf( /* translators: %d: number of drafts */ i18n._n( '%d draft', '%d drafts', total, 'forumwp' ), total );
// The mistake: a count in __().
const wrong = ( i18n, total ) => sprintf( i18n.__( '%d drafts', 'forumwp' ), total );

const Demo = () => {
  const [ rows, setRows ] = useState( [] );
  const show = () => {
    const r = Array.from( { length: 26 }, ( _, n ) => ( { n, en: label( english, n ), pl: label( polish, n ), enWrong: wrong( english, n ), plWrong: wrong( polish, n ) } ) );
    console.log( r.filter( ( x ) => [ 1, 2, 5, 12, 22, 25 ].includes( x.n ) ).map( ( x ) => `${ x.en } / ${ x.pl }` ).join( ' · ' ) );
    setRows( r );
  };
  return (
    <div style={ { maxWidth: 760 } }>
      <p><Button variant="primary" onClick={ show }>Show 0 to 25</Button></p>
      { rows.length > 0 && (
        <table className="fwp-table">
          <thead><tr><th>n</th><th>_n(), English</th><th>_n(), Polish</th><th>__(), English</th><th>__(), Polish</th></tr></thead>
          <tbody>{ rows.map( ( r ) => <tr key={ r.n }><td>{ r.n }</td><td>{ r.en }</td><td>{ r.pl }</td><td>{ r.enWrong }</td><td>{ r.plWrong }</td></tr> ) }</tbody>
        </table>
      ) }
    </div>
  );
};

document.head.insertAdjacentHTML( 'beforeend', `<style>
  .fwp-table { border-collapse: collapse; font-size: 13px; }
  .fwp-table td, .fwp-table th { border: 1px solid #ddd; padding: 2px 8px; text-align: left; }
</style>` ); // Added so this runs on its own

createRoot( document.getElementById( 'forumwp-root' ) ).render( <Demo /> );
