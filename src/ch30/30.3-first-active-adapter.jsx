// @id 30.3
// @title Six plugins, one adapter each, the first active one wins
// @section 30.4
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import { CheckboxControl } from '@wordpress/components'; // Added so this runs on its own
import { applyFilters } from '@wordpress/hooks'; // Added so this runs on its own

// Added so this runs on its own: the page, as Page::current() describes it.
const page = { titleParts: [ 'How do I change my avatar?', 'Help', 'Maker Collective' ] };
const titleOf = ( p, separator = '·' ) => p.titleParts.join( ` ${ separator.trim() } ` );

// Which SEO plugins are switched on (tick them below).
const activePlugins = new Set( [ 'yoast' ] );

// The shared part, like the Integration base class: every adapter uses it.
const base = {
  prints_title: () => false,
  title_for( value, separator ) {
    return page ? titleOf( page, separator ) : value;
  },
};

// One small adapter per plugin. Each says whether its plugin is active and what separator it uses.
const adapter = ( key, label, separator, extra = {} ) => ( {
  ...base,
  key,
  label,
  active: () => activePlugins.has( key ),
  separator: () => separator,
  ...extra,
} );
const INTEGRATIONS = [
  adapter( 'yoast', 'Yoast SEO', '-', { prints_title: () => true } ),
  adapter( 'rankmath', 'Rank Math', '|', { prints_title: () => true } ),
  adapter( 'aioseo', 'All in One SEO', '–' ),
  adapter( 'seoframework', 'The SEO Framework', '|' ),
  adapter( 'crawlwp', 'CrawlWP', '·' ),
  adapter( 'seopress', 'SEOPress', '-' ),
];

// Seo::integrations(): what the filter returns is checked, then only active ones are kept.
const integrations = () =>
  applyFilters( 'forumwp.seoIntegrations', INTEGRATIONS ).filter(
    ( i ) => i && typeof i.active === 'function' && typeof i.title_for === 'function' && i.active()
  );

const App = () => {
  const [ , redraw ] = useState( 0 );
  const all = integrations();
  const chosen = all[ 0 ] ?? null; // only the first active one registers

  return (
    <div style={ { display: 'grid', gap: 8, maxWidth: 520 } }>
      { INTEGRATIONS.map( ( i ) => (
        <CheckboxControl
          key={ i.key }
          __nextHasNoMarginBottom
          label={ i.label }
          checked={ activePlugins.has( i.key ) }
          onChange={ ( on ) => {
            if ( on ) {
              activePlugins.add( i.key );
            } else {
              activePlugins.delete( i.key );
            }
            redraw( ( n ) => n + 1 );
          } }
        />
      ) ) }
      <p>
        Active: { all.map( ( i ) => i.label ).join( ', ' ) || 'none' }
      </p>
      <p>
        Prints the head: <strong>{ chosen ? chosen.label : 'ForumWP itself' }</strong>
      </p>
      <p>
        &lt;title&gt;{ chosen ? chosen.title_for( '', chosen.separator() ) : titleOf( page ) }&lt;/title&gt;
      </p>
    </div>
  );
};

createRoot( document.getElementById( 'forumwp-root' ) ).render( <App /> );
