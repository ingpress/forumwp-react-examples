// @id 50.3
// @title Sending a message once: no check, "same text within 5 seconds", and a client id
// @section 50.12
// @click The network delivers
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button, RadioControl } from '@wordpress/components'; // Added so this runs on its own

// Added so this runs on its own: a pretend server with a messages table and a clock.
const server = { now: 0, messages: [] };
const save = ( body, cid ) => {
  const message = { id: server.messages.length + 1, body, cid, at: server.now };
  server.messages.push( message );
  return message;
};

// POST /conversations/9/messages, three ways.
const routes = {
  // No check at all.
  none: ( { body } ) => ( { status: 200, message: save( body, '' ) } ),

  // The first fix: the same text within 5 seconds is refused.
  text: ( { body } ) => {
    const repeat = server.messages.find( ( m ) => m.body === body && server.now - m.at < 5 );
    return repeat ? { status: 409, error: 'You already sent that.' } : { status: 200, message: save( body, '' ) };
  },

  // Messages::already_sent() in 0.36.1.
  id: ( { body, client_id: cid } ) => {
    if ( cid ) {
      // The app named this message: the same name within ten minutes is the same message.
      // Two different names are two messages, even with the same words.
      const same = server.messages.find( ( m ) => m.cid === cid && server.now - m.at < 600 );
      return { status: 200, message: same ?? save( body, cid ) };
    }
    // No name (another app, a script): the same text within 2 seconds is one message sent twice.
    const repeat = server.messages.find( ( m ) => m.body === body && server.now - m.at < 2 );
    return { status: 200, message: repeat ?? save( body, '' ) };
  },
};

// What useSendMessage() adds to each message it sends.
const clientId = () => Date.now().toString( 36 ) + Math.random().toString( 36 ).slice( 2, 10 );

const Demo = () => {
  const [ rule, setRule ] = useState( 'none' );
  const [ log, setLog ] = useState( [] );
  const [ , redraw ] = useState( 0 );

  const say = ( line ) => {
    console.log( line );
    setLog( ( l ) => [ `[second ${ server.now }] ${ line }`, ...l ].slice( 0, 12 ) );
  };
  const post = ( data ) => {
    const answer = routes[ rule ]( data );
    return answer.status === 200 ? `200, message #${ answer.message.id }` : `${ answer.status } "${ answer.error }"`;
  };
  const request = ( body ) => ( rule === 'id' ? { body, client_id: clientId() } : { body } );

  return (
    <div style={ { maxWidth: 720 } }>
      <RadioControl
        label="The server's rule"
        selected={ rule }
        options={ [
          { label: 'No check', value: 'none' },
          { label: 'The same text within 5 seconds is refused (the first fix)', value: 'text' },
          { label: 'A client id; without one, the same text within 2 seconds (0.36.1)', value: 'id' },
        ] }
        onChange={ ( value ) => { server.messages = []; server.now = 0; setLog( [] ); setRule( value ); } }
      />
      <p>
        <Button variant="primary" onClick={ () => {
          // One request, delivered twice: the phone lost its connection after the server
          // saved the message, so the request was sent again exactly as it was.
          const data = request( 'On my way' );
          say( `"On my way" arrives twice. First: ${ post( data ) }. Second: ${ post( data ) }.` );
        } }>The network delivers "On my way" twice</Button>
      </p>
      <p>
        <Button variant="secondary" onClick={ () => say( `Tunde sends "ok": ${ post( request( 'ok' ) ) }.` ) }>Tunde sends "ok"</Button>{ ' ' }
        <Button variant="secondary" onClick={ () => { server.now += 1; say( 'One second passes.' ); } }>One second passes</Button>{ ' ' }
        <Button variant="tertiary" onClick={ () => { server.messages = []; server.now = 0; setLog( [] ); redraw( ( n ) => n + 1 ); } }>Start again</Button>
      </p>
      <p><strong>Saved in the conversation:</strong> { server.messages.length ? server.messages.map( ( m ) => `#${ m.id } "${ m.body }"` ).join( ', ' ) : 'nothing yet' }</p>
      <ol className="fwp-log">{ log.map( ( line, i ) => <li key={ i }>{ line }</li> ) }</ol>
      <p className="fwp-muted">Try: with each rule, deliver "On my way" twice. Then press Tunde sends "ok", One second passes, Tunde sends "ok": he really did say it twice.</p>
    </div>
  );
};

document.head.insertAdjacentHTML( 'beforeend', '<style>.fwp-log li{font-size:13px;margin-bottom:4px}.fwp-muted{color:#757575}</style>' ); // Added so this runs on its own
createRoot( document.getElementById( 'forumwp-root' ) ).render( <Demo /> );
