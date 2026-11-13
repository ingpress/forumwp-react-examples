// @id 47.3
// @title The library list: search after a pause, folders with counts, and a download count that goes up once
// @section 47.10
import { createRoot, useEffect, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button, SearchControl, SelectControl, Spinner } from '@wordpress/components'; // Added so this runs on its own
import { QueryClient, QueryClientProvider, useInfiniteQuery, useQueryClient } from '@tanstack/react-query'; // Added so this runs on its own

// Added so this runs on its own: a pretend GET /forumwp-pro/v1/spaces/3/library. 2 items a
// page (the real one has 20): it reads 3 to know whether there's another page. Downloads
// count once per person per file per day, as Library::count() does. Each answer takes 300 ms.
const folders = [ { id: 4, name: 'Guides' }, { id: 5, name: 'Templates' } ];
const db = [
  { id: 21, title: 'Brand guide', tag: 4, files: [ { id: 901, name: 'brand-guide.pdf' } ], downloads: 12 },
  { id: 22, title: 'Launch checklist', tag: 5, files: [ { id: 902, name: 'checklist.docx' } ], downloads: 30 },
  { id: 23, title: 'Onboarding guide', tag: 4, files: [ { id: 903, name: 'onboarding.pdf' } ], downloads: 4 },
  { id: 24, title: 'Email templates', tag: 5, files: [ { id: 904, name: 'emails.zip' } ], downloads: 18 },
  { id: 25, title: 'Pricing worksheet', tag: 0, files: [ { id: 905, name: 'pricing.xlsx' } ], downloads: 7 },
];
const countedToday = new Set();
const requests = [];
const PER_PAGE = 2;
const fakeGet = ( { sort, folder, search, page } ) =>
  new Promise( ( resolve ) => {
    requests.push( search );
    console.log( `GET /spaces/3/library?sort=${ sort }&folder=${ folder }&search=${ search }&page=${ page }` );
    const sorts = { newest: ( a, b ) => b.id - a.id, name: ( a, b ) => a.title.localeCompare( b.title ), downloads: ( a, b ) => b.downloads - a.downloads };
    const all = db.filter( ( d ) => ( ! folder || d.tag === folder ) && d.title.toLowerCase().includes( search.toLowerCase() ) ).sort( sorts[ sort ] );
    const rows = all.slice( ( page - 1 ) * PER_PAGE, ( page - 1 ) * PER_PAGE + PER_PAGE + 1 );
    const counts = { 0: db.length };
    db.forEach( ( d ) => d.tag && ( counts[ d.tag ] = ( counts[ d.tag ] ?? 0 ) + 1 ) );
    setTimeout( () => resolve( { items: rows.slice( 0, PER_PAGE ).map( ( d ) => ( { ...d } ) ), hasMore: rows.length > PER_PAGE, folders: counts } ), 300 );
  } );
const serverCountsDownload = ( fileId ) => {
  if ( ! countedToday.has( fileId ) ) {
    countedToday.add( fileId );
    db.find( ( d ) => d.files[ 0 ].id === fileId ).downloads++;
  }
};

// ForumWP Pro, app/portal/library/api.js (shortened)
const useLibrary = ( spaceId, { sort, folder, search } ) =>
  useInfiniteQuery( {
    queryKey: [ 'library', spaceId, sort, folder, search ],
    queryFn: ( { pageParam } ) => fakeGet( { sort, folder, search, page: pageParam } ),
    initialPageParam: 1,
    getNextPageParam: ( last, pages ) => ( last.hasMore ? pages.length + 1 : undefined ),
    placeholderData: ( previous ) => previous,
  } );

const counted = new Set();
const useCountDownload = () => {
  const queryClient = useQueryClient();

  return ( itemId, fileId ) => {
    if ( counted.has( fileId ) ) {
      return;
    }
    counted.add( fileId );
    queryClient.setQueriesData( { queryKey: [ 'library' ] }, ( data ) =>
      data
        ? { ...data, pages: data.pages.map( ( page ) => ( { ...page, items: page.items.map( ( item ) => ( item.id === itemId ? { ...item, downloads: item.downloads + 1 } : item ) ) } ) ) }
        : data
    );
  };
};

// ForumWP Pro, app/portal/library/Library.js (shortened)
const Library = () => {
  const [ sort, setSort ] = useState( 'newest' );
  const [ query, setQuery ] = useState( '' );
  const [ search, setSearch ] = useState( '' );
  const [ tag, setTag ] = useState( 0 ); // Added so this runs on its own: the real one reads ?tag= from the address.

  // Search once typing pauses.
  useEffect( () => {
    const timer = setTimeout( () => setSearch( query.trim() ), 300 );

    return () => clearTimeout( timer );
  }, [ query ] );

  const { data, isPending, isFetching, fetchNextPage, hasNextPage, isFetchingNextPage } = useLibrary( 3, { sort, folder: tag, search } );
  const countDownload = useCountDownload();
  const items = data?.pages.flatMap( ( p ) => p.items ) ?? [];
  const counts = data?.pages[ 0 ]?.folders;

  return (
    <div style={ { maxWidth: 640 } }>
      <div style={ { display: 'flex', gap: 8, alignItems: 'end' } }>
        <SearchControl __nextHasNoMarginBottom label="Search the library" value={ query } onChange={ setQuery } />
        <SelectControl __nextHasNoMarginBottom __next40pxDefaultSize label="Sort by" value={ sort } options={ [ { value: 'newest', label: 'Newest' }, { value: 'name', label: 'Name' }, { value: 'downloads', label: 'Most downloaded' } ] } onChange={ setSort } />
      </div>
      <p>
        { [ { id: 0, name: 'All documents' }, ...folders ].map( ( f ) => (
          <Button key={ f.id } variant={ tag === f.id ? 'primary' : 'secondary' } size="compact" onClick={ () => setTag( f.id ) } style={ { marginRight: 6 } }>
            { f.name } { counts ? `(${ counts[ f.id ] ?? 0 })` : '' }
          </Button>
        ) ) }
      </p>
      <p className="fwp-muted">In the box: "{ query }" · searched: "{ search }" · requests so far: { requests.length }{ isFetching && ! isFetchingNextPage ? ' · loading…' : '' }</p>
      { isPending && <Spinner /> }
      <ul style={ { opacity: isFetching && ! isFetchingNextPage ? 0.6 : 1 } }>
        { items.map( ( item ) => (
          <li key={ item.id } style={ { marginBottom: 8 } }>
            <b>{ item.title }</b> · { item.files[ 0 ].name } · { item.downloads } downloads{ ' ' }
            <Button variant="secondary" size="compact" onClick={ () => { countDownload( item.id, item.files[ 0 ].id ); serverCountsDownload( item.files[ 0 ].id ); } }>Download</Button>
          </li>
        ) ) }
      </ul>
      { data && ! items.length && <p>No documents match your search.</p> }
      { hasNextPage && <Button variant="secondary" isBusy={ isFetchingNextPage } onClick={ () => fetchNextPage() }>Load more</Button> }
    </div>
  );
};

const queryClient = new QueryClient(); // Added so this runs on its own
document.head.insertAdjacentHTML( 'beforeend', '<style>.fwp-muted{color:#757575;font-size:13px}</style>' ); // Added so this runs on its own
createRoot( document.getElementById( 'forumwp-root' ) ).render( <QueryClientProvider client={ queryClient }><Library /></QueryClientProvider> );
