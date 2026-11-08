// @id 38.5
// @title Background jobs: a spam check that fails open, and a transcript the app polls for
// @section 38.6
// @click Publish
import { createRoot, useEffect, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button, Notice, SelectControl, Spinner } from '@wordpress/components'; // Added so this runs on its own
import { QueryClient, QueryClientProvider, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'; // Added so this runs on its own

// Added so this runs on its own: a pretend server with a job queue. In ForumWP Pro the queue is
// Action Scheduler (as_enqueue_async_action), and a worker runs jobs after the request has ended.
const server = ( () => {
  const posts = [];
  const notes = [];
  const queue = [];
  let aiMode = 'fine';
  const transcript = { status: 'none', segments: [] };

  // Added so this runs on its own: what the pretend AI does, chosen in the demo.
  const ai = async () => {
    await new Promise( ( r ) => setTimeout( r, 600 ) );
    if ( aiMode === 'down' ) {
      return { error: 'forumwp_pro_ai_failed', message: 'The AI service didn’t answer. Please try again in a moment.' };
    }
    return {
      fine: { spam: false, reason: '' },
      spam: { spam: true, reason: 'Advertises a paid service with a link.' },
      odd: { spam: 'maybe', reason: 'Not sure', confidence: 0.5 },
    }[ aiMode ];
  };

  // SpamCheck::verdict(): exactly { spam: bool, reason: string }, or null.
  const verdict = ( reply ) => {
    if ( ! reply || typeof reply.spam !== 'boolean' || typeof reply.reason !== 'string' || Object.keys( reply ).some( ( k ) => ! [ 'spam', 'reason' ].includes( k ) ) ) {
      return null;
    }
    return { spam: reply.spam, reason: reply.spam && ! reply.reason ? 'Looks like spam.' : reply.reason };
  };

  // SpamCheck::run(), the background job.
  const run = async ( id ) => {
    const post = posts.find( ( p ) => p.id === id );
    if ( ! post || post.status !== 'published' ) {
      return;
    }
    const reply = await ai();
    const result = reply.error ? null : verdict( reply );
    if ( result === null ) {
      // Fail open: the post stays up. The note is written down for the log.
      notes.push( `post ${ id }: check failed (${ reply.error ? reply.message : 'the AI’s answer wasn’t in the expected form' }), left up` );
      return;
    }
    if ( ! result.spam ) {
      notes.push( `post ${ id }: ok` );
      return;
    }
    notes.push( `post ${ id }: spam (${ result.reason }), held for a moderator` );
    post.status = 'held';
  };

  // Added so this runs on its own: the worker. It picks up one job a second.
  setInterval( () => {
    const job = queue.shift();
    if ( job ) {
      console.log( 'worker: running', job.hook, job.args );
      job.hook === 'forumwp_pro_ai_spam_check' ? run( job.args[ 1 ] ) : transcribe();
    }
  }, 1000 );

  // Transcripts::run(), shortened: queued → working → ready.
  const transcribe = async () => {
    transcript.status = 'working';
    await new Promise( ( r ) => setTimeout( r, 2500 ) );
    transcript.status = 'ready';
    transcript.segments = [ { s: 0, e: 4, t: 'Welcome, everyone.' }, { s: 4, e: 9, t: 'Today: the new feed.' } ];
  };

  return {
    setAiMode: ( m ) => ( aiMode = m ),
    // POST /posts: published at once; the check is queued, not run.
    publish: ( body ) => {
      const post = { id: posts.length + 1, body, status: 'published' };
      posts.push( post );
      queue.push( { hook: 'forumwp_pro_ai_spam_check', args: [ 'post', post.id ] } );
      return post;
    },
    posts: () => posts.map( ( p ) => ( { ...p } ) ),
    notes: () => [ ...notes ],
    // GET and POST /ai/transcripts/replay/42
    transcript: async () => {
      console.log( 'GET /ai/transcripts/replay/42 →', transcript.status );
      return { ...transcript };
    },
    transcribe: async () => {
      transcript.status = 'queued';
      queue.push( { hook: 'forumwp_pro_ai_transcribe', args: [ 7 ] } );
      return { ...transcript };
    },
  };
} )();

const SpamDemo = () => {
  const [ mode, setMode ] = useState( 'fine' );
  const [ , redraw ] = useState( 0 );
  // Added so this runs on its own: redraw twice a second to show the job's effect.
  useEffect( () => {
    const timer = setInterval( () => redraw( ( n ) => n + 1 ), 500 );
    return () => clearInterval( timer );
  }, [] );

  return (
    <div className="fwp-card">
      <strong>Spam check</strong>
      <SelectControl
        label="The AI will…"
        value={ mode }
        onChange={ ( m ) => { setMode( m ); server.setAiMode( m ); } }
        options={ [
          { value: 'fine', label: 'say it looks fine' },
          { value: 'spam', label: 'say it’s spam' },
          { value: 'odd', label: 'answer in the wrong shape' },
          { value: 'down', label: 'not answer (service down)' },
        ] }
        __next40pxDefaultSize
        __nextHasNoMarginBottom
      />
      <p>
        <Button variant="primary" onClick={ () => server.publish( 'Hi! I just joined. Try my SEO tool at example.com' ) }>Publish</Button>
      </p>
      <ul>
        { server.posts().map( ( p ) => <li key={ p.id }>Post { p.id }: <strong>{ p.status }</strong></li> ) }
      </ul>
      <ul className="fwp-muted">{ server.notes().map( ( n, i ) => <li key={ i }>{ n }</li> ) }</ul>
    </div>
  );
};

// From app/portal/ai/Transcript.js, shortened: poll while the job is queued or working.
const TranscriptPanel = () => {
  const queryClient = useQueryClient();
  const key = [ 'fwpp-ai-transcript', 'replay', 42 ];
  const { data, isPending } = useQuery( {
    queryKey: key,
    queryFn: () => server.transcript(),
    // While it is being made, look again every few seconds.
    refetchInterval: ( query ) =>
      [ 'queued', 'working' ].includes( query.state.data?.status ) ? 1000 : false,
  } );
  const make = useMutation( {
    mutationFn: () => server.transcribe(),
    onSuccess: ( fresh ) => queryClient.setQueryData( key, fresh ),
  } );

  if ( isPending ) {
    return <Spinner />;
  }

  return (
    <div className="fwp-card">
      <strong>Transcript</strong>
      { data.status === 'none' && <p><Button variant="secondary" onClick={ () => make.mutate() }>Make transcript</Button></p> }
      { [ 'queued', 'working' ].includes( data.status ) && (
        <Notice status="info" isDismissible={ false }>Making the transcript ({ data.status })… You can leave this page.</Notice>
      ) }
      { data.status === 'ready' && (
        <ul>{ data.segments.map( ( s ) => <li key={ s.s }>[0:0{ s.s }] { s.t }</li> ) }</ul>
      ) }
    </div>
  );
};

createRoot( document.getElementById( 'forumwp-root' ) ).render(
  <QueryClientProvider client={ new QueryClient() }>
    <div style={ { maxWidth: 560 } }>
      <SpamDemo />
      <TranscriptPanel />
    </div>
  </QueryClientProvider>
);
