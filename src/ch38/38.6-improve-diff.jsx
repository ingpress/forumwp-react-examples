// @id 38.6
// @title Writing help: a word-by-word diff, added through forumwp.textTools
// @section 38.7
// @click Make it shorter
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button, CheckboxControl, Notice, TextareaControl } from '@wordpress/components'; // Added so this runs on its own
import { createHooks } from '@wordpress/hooks'; // Added so this runs on its own
import { QueryClient, QueryClientProvider, useMutation } from '@tanstack/react-query'; // Added so this runs on its own

// Added so this runs on its own: what ForumWP Pro prints for the app (Ai::app_data()), and a fresh
// copy of wp.hooks each time the connector is switched, so Pro's file can be "loaded" again.
let hooks = createHooks();
window.forumwpPro = { ai: { helpers: {} } };

// Added so this runs on its own: a pretend POST /ai/write. Each action is a fixed rewrite.
const aiApi = {
  write: async ( { text, action } ) => {
    console.log( 'POST /forumwp-pro/v1/ai/write', action, `(${ text.length } characters sent)` );
    await new Promise( ( r ) => setTimeout( r, 500 ) );
    const out = {
      grammar: text.replace( /\bi\b/g, 'I' ).replace( /\bteh\b/g, 'the' ).replace( /\bdont\b/g, 'don’t' ),
      shorter: text.replace( /\b(really|very|just|I think that) /g, '' ),
      friendlier: `Hi all! ${ text } Thanks so much!`,
    }[ action ];
    return { text: out };
  },
};

// From app/portal/ai/diff.js
const wordDiff = ( before, after ) => {
  const a = before.split( /(\s+)/ ).filter( Boolean );
  const b = after.split( /(\s+)/ ).filter( Boolean );
  if ( a.length * b.length > 4_000_000 ) {
    return [
      { type: 'removed', text: before },
      { type: 'added', text: after },
    ];
  }

  // lengths[ i ][ j ]: the longest common run of a[ i… ] and b[ j… ].
  const width = b.length + 1;
  const lengths = new Uint16Array( ( a.length + 1 ) * width );
  for ( let i = a.length - 1; i >= 0; i-- ) {
    for ( let j = b.length - 1; j >= 0; j-- ) {
      lengths[ i * width + j ] =
        a[ i ] === b[ j ]
          ? lengths[ ( i + 1 ) * width + j + 1 ] + 1
          : Math.max( lengths[ ( i + 1 ) * width + j ], lengths[ i * width + j + 1 ] );
    }
  }

  const parts = [];
  const push = ( type, text ) => {
    const last = parts[ parts.length - 1 ];
    if ( last?.type === type ) {
      last.text += text;
    } else {
      parts.push( { type, text } );
    }
  };
  let i = 0;
  let j = 0;
  while ( i < a.length && j < b.length ) {
    if ( a[ i ] === b[ j ] ) {
      push( 'same', a[ i ] );
      i++;
      j++;
    } else if ( lengths[ ( i + 1 ) * width + j ] >= lengths[ i * width + j + 1 ] ) {
      push( 'removed', a[ i++ ] );
    } else {
      push( 'added', b[ j++ ] );
    }
  }
  a.slice( i ).forEach( ( t ) => push( 'removed', t ) );
  b.slice( j ).forEach( ( t ) => push( 'added', t ) );

  return parts;
};

const changeCount = ( parts ) =>
  parts.filter(
    ( part, i ) =>
      part.type !== 'same' &&
      part.text.trim() &&
      ! ( part.type === 'added' && parts[ i - 1 ]?.type === 'removed' )
  ).length;

// From app/portal/ai/Improve.js
const Diff = ( { before, after } ) => {
  const parts = wordDiff( before, after );

  return (
    <>
      <p className="fwpp-diff">
        { parts.map( ( part, i ) => {
          if ( part.type === 'added' ) {
            return <ins key={ i }>{ part.text }</ins>;
          }
          if ( part.type === 'removed' ) {
            return <del key={ i }>{ part.text }</del>;
          }
          return <span key={ i }>{ part.text }</span>;
        } ) }
      </p>
      <p className="fwp-muted">{ changeCount( parts ) } changes</p>
    </>
  );
};

const ACTIONS = [
  { id: 'grammar', label: 'Fix spelling & grammar' },
  { id: 'shorter', label: 'Make it shorter' },
  { id: 'friendlier', label: 'Make it friendlier' },
];

// Improve, shortened: plain buttons instead of the Dropdown menu, no translating.
const Improve = ( { value, onChange, kind } ) => {
  const [ suggestion, setSuggestion ] = useState( null );
  const write = useMutation( {
    mutationFn: ( data ) => aiApi.write( { text: value, ...data } ),
    onSuccess: ( { text }, data ) => setSuggestion( { before: value, after: text, ...data } ),
  } );
  const use = ( text ) => {
    onChange( text );
    setSuggestion( null );
  };

  return (
    <div className="fwpp-improve">
      { ACTIONS.map( ( action ) => (
        <Button key={ action.id } size="compact" variant="secondary" disabled={ ! value.trim() || write.isPending } onClick={ () => write.mutate( { action: action.id } ) }>
          { action.label }
        </Button>
      ) ) }
      <span className="fwp-muted"> Only this { kind === 'comment' ? 'comment' : 'draft' } is sent to the AI service.</span>
      { write.error && <Notice status="error" onRemove={ () => write.reset() }>{ write.error.message }</Notice> }
      { suggestion && (
        <section className="fwp-card" aria-label="Suggestion">
          <strong>Suggestion</strong> <span className="fwpp-ai-tag">AI</span>
          <Diff before={ suggestion.before } after={ suggestion.after } />
          <Button variant="primary" onClick={ () => use( suggestion.after ) }>Replace</Button>
          <Button variant="secondary" onClick={ () => use( `${ value.trimEnd() }\n\n${ suggestion.after }` ) }>Insert below</Button>
          <Button variant="tertiary" onClick={ () => setSuggestion( null ) }>Discard</Button>
        </section>
      ) }
    </div>
  );
};

// From app/portal/ai/index.js and shared.js: Pro adds its pieces only for helpers this member can use.
const loadPro = () => {
  const ai = () => window.forumwpPro?.ai ?? {};
  const can = ( helper ) => !! ai().helpers?.[ helper ];
  const NS = 'forumwp-pro/ai';
  if ( can( 'writing' ) ) {
    hooks.addFilter( 'forumwp.textTools', NS, ( tools ) => [ ...tools, Improve ] );
  }
  if ( can( 'ask' ) ) {
    hooks.addFilter( 'forumwp.searchModes', NS, ( modes ) => [ ...modes, { id: 'ask', label: 'Ask', path: '/ask' } ] );
  }
};

// From ForumWP's app/portal/extend.js
const list = ( value ) => ( Array.isArray( value ) ? value : [] );
const components = ( name ) => list( hooks.applyFilters( name, [] ) ).filter( ( item ) => typeof item === 'function' );
const textTools = () => components( 'forumwp.textTools' );
const searchModes = () =>
  list( hooks.applyFilters( 'forumwp.searchModes', [] ) ).filter( ( mode ) => mode?.id && mode?.label && mode?.path );

// The post box, shortened: ForumWP draws whatever tools add-ons gave it.
const Composer = () => {
  const [ body, setBody ] = useState( 'I think that i really dont know teh best price for my very first course.' );

  return (
    <div className="fwp-card">
      <div className="fwp-search">
        Search box: <Button size="compact" isPressed>Search</Button>
        { searchModes().map( ( m ) => <Button key={ m.id } size="compact">{ m.label }</Button> ) }
      </div>
      <TextareaControl label="Post" value={ body } onChange={ setBody } __nextHasNoMarginBottom />
      <div className="fwp-composer__tools">
        { textTools().map( ( Tool, i ) => (
          <Tool key={ i } kind="post" value={ body } onChange={ setBody } />
        ) ) }
        { textTools().length === 0 && <span className="fwp-muted">No text tools: the AI helpers stay hidden.</span> }
      </div>
    </div>
  );
};

// Added so this runs on its own: switch the connector, then "reload" Pro's file.
const Demo = () => {
  const [ ready, setReady ] = useState( true );
  const [ load, setLoad ] = useState( 0 );
  const toggle = ( on ) => {
    setReady( on );
    window.forumwpPro.ai.helpers = on ? { writing: true, ask: true, summaries: true } : {};
    hooks = createHooks();
    loadPro();
    setLoad( ( n ) => n + 1 );
  };
  return (
    <div style={ { maxWidth: 640 } }>
      <CheckboxControl label="An AI connector is set up in Settings → Connectors" checked={ ready } onChange={ toggle } __nextHasNoMarginBottom />
      <Composer key={ load } />
    </div>
  );
};

document.head.insertAdjacentHTML( 'beforeend', `<style>
  .fwpp-diff ins { background: #d7f5dd; text-decoration: none; }
  .fwpp-diff del { background: #fde2e1; color: #8a2424; }
  .fwpp-improve .components-button { margin: 4px 4px 4px 0; }
  .fwpp-ai-tag { background: #efe8fd; border-radius: 4px; padding: 0 6px; font-size: 12px; }
  .fwp-muted { color: #757575; }
</style>` ); // Added so this runs on its own

// Added so this runs on its own: the page loads with a connector set up.
window.forumwpPro.ai.helpers = { writing: true, ask: true, summaries: true };
loadPro();

createRoot( document.getElementById( 'forumwp-root' ) ).render(
  <QueryClientProvider client={ new QueryClient() }>
    <Demo />
  </QueryClientProvider>
);
