// @id 54.2
// @title A debounced preview with one request in flight
// @section 54.8
// @click Make three quick changes
import { createRoot, useEffect, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button, CheckboxControl, SelectControl } from '@wordpress/components'; // Added so this runs on its own
import { QueryClient, QueryClientProvider, useQuery, keepPreviousData } from '@tanstack/react-query'; // Added so this runs on its own

// Added so this runs on its own: a pretend GET /search that takes 500 ms and counts the searches
// sent (ForumWP allows 30 a minute), and how many were on their way at once.
const stats = { sent: 0, inFlight: 0, most: 0 };
const COUNTS = { all: 12, posts: 8, events: 5 };
const get = ( path, query ) => {
  stats.sent++;
  stats.inFlight++;
  stats.most = Math.max( stats.most, stats.inFlight );
  console.log( `search ${ stats.sent } sent:`, JSON.stringify( query ), stats.inFlight > 1 ? `(${ stats.inFlight } on their way at once)` : '' );

  return new Promise( ( resolve ) => setTimeout( () => {
    stats.inFlight--;
    const n = Math.max( 0, ( COUNTS[ query.type || 'all' ] ) - ( query.in ? 2 : 0 ) - ( query.when === 'week' ? 2 : 0 ) );
    resolve( { posts: Array.from( { length: n }, ( _, i ) => ( { id: i } ) ) } );
  }, 500 ) );
};

// From ForumWP's app/portal/hooks/useDebounced.js.
export const useDebounced = ( value, delay = 250 ) => {
  const [ settled, setSettled ] = useState( value );
  useEffect( () => {
    const timer = window.setTimeout( () => setSettled( value ), delay );

    return () => window.clearTimeout( timer );
  }, [ value, delay ] );

  return settled;
};

// From ForumWP's app/portal/api/misc.js.
export const useSearch = ( q, filters = {} ) => {
  const chosen = Object.fromEntries(
    Object.entries( filters ).filter( ( [ , value ] ) => value )
  );

  return useQuery( {
    queryKey: [ 'search', q, chosen ],
    queryFn: () => get( '/search', { q, ...chosen } ),
    enabled: q.trim().length >= 2,
    placeholderData: keepPreviousData,
  } );
};

const asQuery = ( values ) => ( {
  ...values,
  type: values.type === 'all' ? '' : values.type,
} );

// From ForumWP's app/portal/screens/Search.js (FiltersSheet), shown in a box instead of
// WordPress's Modal. `everyChange` (added) switches to the version the review found: a
// search for every change.
const FiltersSheet = ( { q, values, everyChange } ) => {
  const [ draft, setDraft ] = useState( values );
  // How many results the filters would give, before using them. Each one is a
  // search (and counts against the limit on searches): asked once the choices
  // have stayed put for a moment, and never while the last one is still coming.
  const settled = useDebounced( draft, 400 );
  const [ asked, setAsked ] = useState( values );
  const { data, isFetching, isPlaceholderData } = useSearch(
    q,
    asQuery( everyChange ? draft : asked )
  );
  useEffect( () => {
    if ( ! isFetching && settled !== asked ) {
      setAsked( settled );
    }
  }, [ settled, asked, isFetching ] );
  // The count, only when it is for the choices on screen.
  const counted = data && ! isPlaceholderData && ( everyChange || asked === draft );

  // Added so this runs on its own: the fields, a button that makes three changes 150 ms apart,
  // and what the pretend server has seen.
  const change = ( changes ) => setDraft( ( d ) => ( { ...d, ...changes } ) );
  const quick = () => {
    change( { type: 'events' } );
    setTimeout( () => change( { when: 'week' } ), 150 );
    setTimeout( () => change( { in: 'garden-club' } ), 300 );
  };
  const [ , tick ] = useState( 0 );
  useEffect( () => {
    const t = setInterval( () => tick( ( n ) => n + 1 ), 100 );

    return () => clearInterval( t );
  }, [] );

  return (
    <div className="fwp-card" style={ { maxWidth: 420 } }>
      <h3 style={ { marginTop: 0 } }>Filters</h3>
      <SelectControl __next40pxDefaultSize __nextHasNoMarginBottom label="Type" value={ draft.type }
        options={ [ { value: 'all', label: 'Everything' }, { value: 'posts', label: 'Posts' }, { value: 'events', label: 'Events' } ] }
        onChange={ ( type ) => change( { type } ) } />
      <SelectControl __next40pxDefaultSize __nextHasNoMarginBottom label="Space" value={ draft.in }
        options={ [ { value: '', label: 'Any space' }, { value: 'garden-club', label: 'Garden Club' } ] }
        onChange={ ( v ) => change( { in: v } ) } />
      <SelectControl __next40pxDefaultSize __nextHasNoMarginBottom label="When" value={ draft.when }
        options={ [ { value: '', label: 'Any time' }, { value: 'week', label: 'Past week' } ] }
        onChange={ ( when ) => change( { when } ) } />
      <p style={ { display: 'flex', gap: 8, flexWrap: 'wrap' } }>
        <Button variant="secondary" onClick={ quick }>Make three quick changes</Button>
        <Button variant="primary">
          { counted ? `Show ${ data.posts.length } result${ data.posts.length === 1 ? '' : 's' }` : 'Show results' }
        </Button>
      </p>
      <p style={ { fontSize: 13, margin: 0 } }>
        Searches sent: <strong>{ stats.sent }</strong> · on their way now: { stats.inFlight } · most at once: { stats.most }
      </p>
    </div>
  );
};

// Added so this runs on its own.
const NO_FILTERS = { type: 'all', in: '', by: '', when: '' };
const App = () => {
  const [ everyChange, setEveryChange ] = useState( false );
  const [ client, setClient ] = useState( () => new QueryClient() );

  return (
    <div>
      <CheckboxControl __nextHasNoMarginBottom
        label="Search on every change (the version the review found)"
        checked={ everyChange }
        onChange={ ( on ) => {
          stats.sent = 0;
          stats.most = 0;
          console.log( on ? '— a search for every change —' : '— debounced, one at a time —' );
          setClient( new QueryClient() );
          setEveryChange( on );
        } } />
      <QueryClientProvider client={ client } key={ String( everyChange ) }>
        <FiltersSheet q="compost" values={ NO_FILTERS } everyChange={ everyChange } />
      </QueryClientProvider>
    </div>
  );
};

createRoot( document.getElementById( 'forumwp-root' ) ).render( <App /> );
