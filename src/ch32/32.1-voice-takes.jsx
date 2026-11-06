// @id 32.1
// @title Recording again while the first take is still uploading
// @section 32.1
// @click Record
import { createRoot, useEffect, useRef, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button } from '@wordpress/components'; // Added so this runs on its own

// Added so this runs on its own: a pretend recorder and server. A sandbox can't always use your
// microphone, so FakeRecorder behaves like MediaRecorder (start, stop, onstop) without one.
class FakeRecorder {
  constructor() {
    this.state = 'inactive';
    this.stream = { getTracks: () => [ { stop: () => console.log( 'Microphone off' ) } ] };
  }
  start() {
    this.state = 'recording';
    console.log( 'Microphone on' );
  }
  stop() {
    this.state = 'inactive';
    setTimeout( () => this.onstop?.(), 50 );
  }
}
let nextId = 501;
const uploadVoice = ( seconds ) =>
  new Promise( ( resolve ) => {
    const id = nextId++;
    console.log( `Uploading a ${ seconds } s take as ${ id }…` );
    setTimeout( () => resolve( { id } ), 2500 );
  } );
const discardVoice = ( id ) => {
  console.log( `DELETE /voice/${ id } (thrown away)` );
  return Promise.resolve();
};

const useVoiceRecorder = () => {
  const [ state, setState ] = useState( () => ( { status: 'idle', seconds: 0, id: 0, error: '' } ) );
  const recorder = useRef( null );
  const timer = useRef( null );
  // Which recording is current, so a slow upload of a discarded one is ignored.
  const take = useRef( 0 );

  const update = ( changes ) => setState( ( s ) => ( { ...s, ...changes } ) );

  const cleanUp = () => {
    window.clearInterval( timer.current );
    recorder.current?.stream.getTracks().forEach( ( t ) => t.stop() );
    recorder.current = null;
  };

  // Leaving the screen stops the microphone.
  useEffect(
    () => () => {
      take.current++;
      cleanUp();
    },
    []
  );

  const stop = () => {
    if ( recorder.current?.state === 'recording' ) {
      recorder.current.stop();
    }
  };

  const start = () => {
    const current = ++take.current;
    const media = new FakeRecorder();
    const began = Date.now();
    recorder.current = media;

    media.onstop = async () => {
      cleanUp();
      // Thrown away (removed, recorded again, or the screen closed).
      if ( current !== take.current ) {
        return;
      }
      const seconds = Math.round( ( Date.now() - began ) / 1000 );
      update( { status: 'uploading', seconds } );
      try {
        const saved = await uploadVoice( seconds );
        // Thrown away while it was saving: it goes now.
        if ( current !== take.current ) {
          discardVoice( saved.id ).catch( () => {} );
        } else {
          console.log( `Take ${ current } is ready as ${ saved.id }` );
          update( { status: 'ready', id: saved.id } );
        }
      } catch ( error ) {
        if ( current === take.current ) {
          update( { status: 'ready', id: 0, error: error.message } );
        }
      }
    };

    media.start();
    update( { status: 'recording', seconds: 0, id: 0 } );
    timer.current = window.setInterval( () => update( { seconds: ( Date.now() - began ) / 1000 } ), 250 );
  };

  const reset = () => {
    take.current++;
    cleanUp();
    update( { status: 'idle', seconds: 0, id: 0, error: '' } );
  };

  const discard = () => {
    if ( state.id ) {
      discardVoice( state.id ).catch( () => {} );
    }
    reset();
  };

  return {
    ...state,
    start,
    stop,
    remove: discard,
    rerecord: () => {
      discard();
      start();
    },
  };
};

// Added so this runs on its own: the buttons.
const VoiceNote = () => {
  const voice = useVoiceRecorder();

  return (
    <div style={ { display: 'grid', gap: 12, maxWidth: 480 } }>
      <p>
        Status: <strong>{ voice.status }</strong>
        { voice.status === 'recording' && ` (${ voice.seconds.toFixed( 1 ) } s)` }
        { voice.id > 0 && `, will send voice note ${ voice.id }` }
      </p>
      <div className="fwp-row">
        <Button variant="primary" disabled={ voice.status === 'recording' } onClick={ voice.start }>
          Record
        </Button>
        <Button variant="secondary" disabled={ voice.status !== 'recording' } onClick={ voice.stop }>
          Stop
        </Button>
        <Button variant="secondary" disabled={ voice.status === 'idle' } onClick={ voice.rerecord }>
          Record again
        </Button>
        <Button variant="tertiary" isDestructive disabled={ voice.status === 'idle' } onClick={ voice.remove }>
          Remove
        </Button>
      </div>
      <p className="fwp-muted">Record, Stop, then press "Record again" while it says "uploading".</p>
    </div>
  );
};

createRoot( document.getElementById( 'forumwp-root' ) ).render( <VoiceNote /> );
