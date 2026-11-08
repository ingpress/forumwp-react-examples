// @id 37.5
// @title Chapters that move a Vimeo player through postMessage
// @section 37.6
// @click 12:30
import {
  createRoot,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from '@wordpress/element'; // Added so this runs on its own

// Added so this runs on its own: a pretend Vimeo player in a frame of its own. It speaks the
// same messages as player.vimeo.com ("ready", "timeupdate"; "setCurrentTime", "play"), and plays
// 10 times faster than real time so you can watch the chapters change.
const fakeVimeo = `<!doctype html><body style="margin:0;background:#1b1f27;color:#fff;font:16px sans-serif;display:grid;place-items:center;height:100vh">
<div id="t">Pretend Vimeo player</div>
<script>
  let seconds = 0, playing = false, listening = false;
  const duration = 1080;
  const tell = (m) => parent.postMessage(JSON.stringify(m), '*');
  addEventListener('message', (e) => {
    const m = JSON.parse(e.data);
    if (m.method === 'addEventListener' && m.value === 'timeupdate') { listening = true; playing = true; }
    if (m.method === 'setCurrentTime') { seconds = m.value; }
    if (m.method === 'play') { playing = true; }
  });
  setInterval(() => {
    if (playing) seconds = Math.min(duration, seconds + 2.5);
    document.getElementById('t').textContent = 'Pretend Vimeo player: ' + Math.floor(seconds) + ' s';
    if (listening) tell({ event: 'timeupdate', data: { seconds, duration } });
  }, 250);
  tell({ event: 'ready' });
</script></body>`;

// From app/portal/utils/live.js
const clock = ( seconds ) => {
  const s = Math.max( 0, Math.floor( seconds ) );
  const pad = ( n ) => String( n ).padStart( 2, '0' );

  return s >= 3600
    ? `${ Math.floor( s / 3600 ) }:${ pad( Math.floor( s / 60 ) % 60 ) }:${ pad( s % 60 ) }`
    : `${ Math.floor( s / 60 ) }:${ pad( s % 60 ) }`;
};

const chapterAt = ( chapters, time ) =>
  chapters.reduce( ( found, c, i ) => ( time >= c.at ? i : found ), -1 );

// From app/portal/components/ReplayPlayer.js
const ORIGINS = {
  youtube: 'https://www.youtube-nocookie.com',
  vimeo: 'https://player.vimeo.com',
};

const useEmbedPlayer = ( frame, kind, onTime ) => {
  const send = ( message ) =>
    frame.current?.contentWindow?.postMessage(
      JSON.stringify( message ),
      kind === 'vimeo' ? '*' : ORIGINS.youtube
    );

  useEffect( () => {
    if ( ! ORIGINS[ kind ] ) {
      return;
    }
    const listen = ( event ) => {
      if ( event.source !== frame.current?.contentWindow || typeof event.data !== 'string' ) {
        return;
      }
      let data;
      try {
        data = JSON.parse( event.data );
      } catch {
        return;
      }
      if ( kind === 'youtube' && data.event === 'infoDelivery' ) {
        onTime( { time: data.info?.currentTime, duration: data.info?.duration } );
      }
      if ( kind === 'vimeo' && data.event === 'ready' ) {
        send( { method: 'addEventListener', value: 'timeupdate' } );
      }
      if ( kind === 'vimeo' && data.event === 'timeupdate' ) {
        onTime( { time: data.data?.seconds, duration: data.data?.duration } );
      }
    };
    window.addEventListener( 'message', listen );

    return () => window.removeEventListener( 'message', listen );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ kind ] );

  return {
    // YouTube sends its time once asked to ("listening").
    onLoad: () =>
      kind === 'youtube'
        ? send( { event: 'listening', id: 1, channel: 'widget' } )
        : send( { method: 'addEventListener', value: 'timeupdate' } ),
    seek: ( seconds ) => {
      if ( kind === 'youtube' ) {
        send( { event: 'command', func: 'seekTo', args: [ seconds, true ] } );
        send( { event: 'command', func: 'playVideo', args: [] } );
      } else {
        send( { method: 'setCurrentTime', value: seconds } );
        send( { method: 'play' } );
      }
    },
  };
};

// ReplayPlayer, for YouTube and Vimeo only (an uploaded file uses a <video> element instead).
const ReplayPlayer = forwardRef( ( { replay, title, onTime }, ref ) => {
  const frame = useRef();
  const [ time, setTime ] = useState( 0 );
  const [ duration, setDuration ] = useState( replay.duration || 0 );
  const { chapters } = replay;

  const update = ( { time: t, duration: d } ) => {
    if ( typeof t === 'number' ) {
      setTime( t );
      onTime?.( t );
    }
    if ( d > 0 ) {
      setDuration( d );
    }
  };
  const embed = useEmbedPlayer( frame, replay.kind, update );

  const seek = ( seconds ) => {
    embed.seek( seconds );
    update( { time: seconds } );
  };
  useImperativeHandle( ref, () => ( { seek } ) );

  const current = chapterAt( chapters, time );

  return (
    <div>
      <iframe
        ref={ frame }
        srcDoc={ fakeVimeo } // Added so this runs on its own: in ForumWP, src={ replay.embed }
        title={ `Replay: ${ title }` }
        style={ { width: '100%', height: 180, border: 0 } } // Added so this runs on its own
        onLoad={ embed.onLoad }
      />
      { duration > 0 && (
        <p>
          { clock( time ) } / { clock( duration ) }
          { current >= 0 && ` · ${ chapters[ current ].title }` }
        </p>
      ) }
    </div>
  );
} );

// From app/portal/components/LivePage.js: the chapters, each a button that moves the player.
const Chapters = ( { chapters, time, seek } ) => {
  const current = chapterAt( chapters, time );

  return (
    <ol>
      { chapters.map( ( c, i ) => (
        <li key={ c.at }>
          <button
            type="button"
            className="components-button is-link"
            aria-current={ i === current ? 'true' : undefined }
            onClick={ () => seek( c.at ) }
          >
            { clock( c.at ) } { c.title }
          </button>
          { i === current && ' (playing)' }
        </li>
      ) ) }
    </ol>
  );
};

const ReplayView = ( { post } ) => {
  const player = useRef();
  const [ time, setTime ] = useState( 0 );
  const { replay } = post.event;
  const seek = ( seconds ) => player.current?.seek( seconds );

  return (
    <div style={ { maxWidth: 520 } }>
      <ReplayPlayer ref={ player } replay={ replay } title={ post.title } onTime={ setTime } />
      <Chapters chapters={ replay.chapters } time={ time } seek={ seek } />
    </div>
  );
};

// Added so this runs on its own: event.replay as the server sends it (Live::present_replay()).
const post = {
  id: 42,
  title: 'Monthly community call',
  event: {
    replay: {
      kind: 'vimeo',
      embed: 'https://player.vimeo.com/video/76979871?dnt=1',
      duration: null,
      chapters: [
        { at: 0, title: 'Welcome' },
        { at: 252, title: 'The new feed' },
        { at: 750, title: 'Q&A' },
      ],
    },
  },
};

createRoot( document.getElementById( 'forumwp-root' ) ).render( <ReplayView post={ post } /> );
