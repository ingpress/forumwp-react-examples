// @id 36.1
// @title A run log with Retry
// @section 36.6
// @click Retry
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button, Notice } from '@wordpress/components'; // Added so this runs on its own
import {
  QueryClient,
  QueryClientProvider,
  useInfiniteQuery,
  useQueryClient,
} from '@tanstack/react-query'; // Added so this runs on its own

// Added so this runs on its own: a pretend server. Run 880 stopped at its webhook step; a worker
// picks up queued runs two seconds later and finishes them.
const runs = [
  { id: 880, member: 'Tunde', status: 'failed', log: [ 'Message sent', 'Webhook refused: 500 Server Error' ] },
  { id: 879, member: 'Kemi', status: 'waiting', log: [ 'Message sent', 'Waiting 3 days' ] },
  { id: 878, member: 'Ada', status: 'done', log: [ 'Message sent', 'Webhook sent' ] },
  { id: 877, member: 'Sam', status: 'done', log: [ 'Message sent', 'Webhook sent' ] },
];
const later = ( fn, ms = 300 ) => new Promise( ( resolve, reject ) => setTimeout( () => {
  try {
    resolve( fn() );
  } catch ( e ) {
    reject( e );
  }
}, ms ) );
const proGet = ( path ) => {
  console.log( 'GET', path );
  const before = Number( new URLSearchParams( path.split( '?' )[ 1 ] ).get( 'before' ) ) || Infinity;
  const limit = 2; // the real list asks for 6 at a time
  const older = runs.filter( ( r ) => r.id < before );
  return later( () => ( { runs: older.slice( 0, limit ).map( ( r ) => ( { ...r, log: [ ...r.log ] } ) ), more: older.length > limit } ) );
};
const proPost = ( path ) => {
  console.log( 'POST', path );
  const id = Number( path.match( /runs\/(\d+)/ )[ 1 ] );
  return later( () => {
    const run = runs.find( ( r ) => r.id === id );
    // Engine::retry(): UPDATE ... WHERE id = %d AND status = 'failed'. Only one click can win.
    if ( run.status !== 'failed' ) {
      throw { status: 409, message: 'Only a run that failed can be retried.' };
    }
    run.status = 'queued';
    run.log.push( 'Retrying the webhook' );
    setTimeout( () => {
      // The worker tries only the failed step again; the message isn't sent twice.
      run.status = 'done';
      run.log[ run.log.length - 1 ] = 'Webhook sent';
    }, 2000 );
    return { ...run };
  }, 500 );
};

const runsKey = ( id ) => [ 'forumwp-pro', 'automation-runs', id ];
const KEY = [ 'forumwp-pro', 'automations' ]; // Added so this runs on its own

const RunLog = ( { id } ) => {
  const queryClient = useQueryClient();
  const [ retrying, setRetrying ] = useState( 0 );
  const [ problem, setProblem ] = useState( '' );
  const { data, fetchNextPage, hasNextPage } = useInfiniteQuery( {
    queryKey: runsKey( id ),
    queryFn: ( { pageParam } ) => proGet( `/automations/${ id }/runs?limit=6&before=${ pageParam }` ),
    initialPageParam: 0,
    getNextPageParam: ( last ) => ( last.more ? last.runs[ last.runs.length - 1 ].id : undefined ),
    // Waiting and queued runs move on in the background. (The real list checks every 30 seconds.)
    refetchInterval: 3000,
  } );

  const retry = async ( run ) => {
    setRetrying( run.id );
    try {
      const result = await proPost( `/automations/runs/${ run.id }/retry` );
      console.log( `Retried the run for ${ result.member }: in the queue.` );
    } catch ( e ) {
      setProblem( e.message );
    }
    queryClient.invalidateQueries( { queryKey: runsKey( id ) } );
    queryClient.invalidateQueries( { queryKey: KEY } );
    setRetrying( 0 );
  };

  if ( ! data ) {
    return <p>Loading…</p>;
  }
  return (
    <div style={ { display: 'grid', gap: 8, maxWidth: 520 } }>
      { problem && (
        <Notice status="warning" onRemove={ () => setProblem( '' ) }>
          { problem }
        </Notice>
      ) }
      { data.pages.flatMap( ( p ) => p.runs ).map( ( run ) => (
        <div key={ run.id } className="fwp-card">
          <strong>{ run.member }</strong>: { run.status }
          <ol>
            { run.log.map( ( line, i ) => (
              <li key={ i }>{ line }</li>
            ) ) }
          </ol>
          { run.status === 'failed' && (
            <Button variant="secondary" isBusy={ retrying === run.id } onClick={ () => retry( run ) }>
              Retry
            </Button>
          ) }
        </div>
      ) ) }
      { hasNextPage && (
        <Button variant="link" onClick={ () => fetchNextPage() }>
          Show older runs
        </Button>
      ) }
      <p className="fwp-muted">Try a double-click on Retry: the second request gets a 409.</p>
    </div>
  );
};

createRoot( document.getElementById( 'forumwp-root' ) ).render(
  <QueryClientProvider client={ new QueryClient() }>
    <RunLog id={ 3 } />
  </QueryClientProvider>
);
