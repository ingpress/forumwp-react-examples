// @id 38.1
// @title Checking what the AI sent back, and drawing it as text
// @section 38.2
import { createRoot, Fragment, useState } from '@wordpress/element'; // Added so this runs on its own
import { Notice } from '@wordpress/components'; // Added so this runs on its own

// Added so this runs on its own: the two posts that were sent with the question, as [1] and [2].
const sent = [
  { id: 881, title: 'Changing your avatar' },
  { id: 902, title: 'Profile photos are square now' },
];

// Added so this runs on its own: six replies a model could really send back.
const replies = {
  good: '{"found": true, "answer": "Open **Edit profile** and choose a photo [1]. Square photos look best [2]."}',
  invented: '{"found": true, "answer": "Open **Edit profile** [1]. You can also email support [7]."}',
  wrapped: 'Sure! Here is the JSON:\n```json\n{"found": true, "answer": "Choose a photo under **Edit profile** [2]."}\n```',
  noCite: '{"found": true, "answer": "I think you can change it somewhere in your settings."}',
  html: '{"found": true, "answer": "Click <img src=x onerror=alert(1)> **Edit profile** [1]."}',
  list: '[ "Edit profile" ]',
};

// ForumWPPro\Ai\Client::decode(), in JavaScript: the JSON object in a reply.
const decode = ( text ) => {
  text = text.trim();
  const start = text.indexOf( '{' );
  const end = text.lastIndexOf( '}' );
  if ( start === -1 || end < start ) {
    return null;
  }
  let data;
  try {
    data = JSON.parse( text.slice( start, end + 1 ) );
  } catch {
    return null;
  }

  return data && typeof data === 'object' && ! Array.isArray( data ) ? data : null;
};

// ForumWPPro\Ai\Ask::check_reply(), in JavaScript. (On the server, sanitize_textarea_field()
// also strips tags first; it's left out here so you can see React draw them as text.)
const checkReply = ( reply, count ) => {
  if ( reply.found !== true || typeof reply.answer !== 'string' ) {
    return null;
  }
  const cited = [];
  const answer = reply.answer.trim().slice( 0, 3000 ).replace( /\s*\[(\d+)\]/g, ( m, digits ) => {
    const n = Number( digits );
    if ( n < 1 || n > count ) {
      console.log( `dropped [${ n }]: only ${ count } posts were sent` );
      return '';
    }
    let at = cited.indexOf( n );
    if ( at === -1 ) {
      cited.push( n );
      at = cited.length - 1;
    }

    return ` [${ at + 1 }]`;
  } );

  return cited.length && answer.trim() ? { answer: answer.trim(), cited } : null;
};

// From app/portal/ai/Ask.js. (Link is the app's router link; a plain <a> here.)
const AnswerText = ( { text, sources } ) => {
  const Link = ( { to, ...props } ) => <a href={ `#${ to }` } { ...props } />; // Added so this runs on its own

  return text.split( /\n{2,}/ ).map( ( para, p ) => (
    <p key={ p }>
      { para.split( /(\*\*[^*]+\*\*|\[\d+\])/ ).map( ( bit, i ) => {
        const cite = /^\[(\d+)\]$/.exec( bit );
        if ( cite && sources[ cite[ 1 ] - 1 ] ) {
          const source = sources[ cite[ 1 ] - 1 ];
          return (
            <Link key={ i } className="fwpp-cite" to={ `/p/${ source.id }` } aria-label={ `Source ${ cite[ 1 ] }: ${ source.title }` }>
              { cite[ 1 ] }
            </Link>
          );
        }
        if ( /^\*\*[^*]+\*\*$/.test( bit ) ) {
          return <strong key={ i }>{ bit.slice( 2, -2 ) }</strong>;
        }

        return <Fragment key={ i }>{ bit }</Fragment>;
      } ) }
    </p>
  ) );
};

// Added so this runs on its own: pick a reply, see what the checks make of it.
const Demo = () => {
  const [ which, setWhich ] = useState( 'good' );
  const raw = replies[ which ];
  const data = decode( raw );
  const checked = data ? checkReply( data, sent.length ) : null;

  return (
    <div className="fwp-card" style={ { maxWidth: 620 } }>
      <p>
        The AI sent back:{ ' ' }
        <select value={ which } onChange={ ( e ) => setWhich( e.target.value ) }>
          { Object.keys( replies ).map( ( k ) => <option key={ k }>{ k }</option> ) }
        </select>
      </p>
      <pre style={ { whiteSpace: 'pre-wrap', background: '#f6f7f7', padding: 8 } }>{ raw }</pre>
      { ! data && (
        <Notice status="error" isDismissible={ false }>
          The AI service sent back something we couldn’t read. Please try again.
        </Notice>
      ) }
      { data && ! checked && <p>No answer: the app shows “No answer found in posts you can see.”</p> }
      { checked && (
        <>
          <AnswerText text={ checked.answer } sources={ checked.cited.map( ( n ) => sent[ n - 1 ] ) } />
          <ol>
            { checked.cited.map( ( n ) => <li key={ n }>{ sent[ n - 1 ].title }</li> ) }
          </ol>
        </>
      ) }
    </div>
  );
};

createRoot( document.getElementById( 'forumwp-root' ) ).render( <Demo /> );
