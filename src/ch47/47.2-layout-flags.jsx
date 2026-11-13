// @id 47.2
// @title A layout from an add-on: the composer and tag flags, and the feed you get when the add-on is off
// @section 47.8
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button, CheckboxControl, SelectControl } from '@wordpress/components'; // Added so this runs on its own
import { addFilter, applyFilters, removeFilter } from '@wordpress/hooks'; // Added so this runs on its own

// ForumWP, app/portal/layouts.js (shortened). The real spaceLayouts() reads the filter once
// and keeps the answer; this one reads it every time, so you can switch Pro on and off.
const builtIn = () => [
  { value: 'feed', label: 'Feed' },
  { value: 'forum', label: 'Forum', needsTitle: true, prompt: 'Start a new topic…' },
];
const spaceLayouts = () => applyFilters( 'forumwp.spaceLayouts', builtIn() );
const layoutOf = ( value ) => spaceLayouts().find( ( l ) => l.value === value );

// Added so this runs on its own: three spaces and their posts. "Resources" was saved as a
// library while Pro was on; the server keeps that layout even when Pro is off.
const spaces = [
  { id: 1, title: 'General', layout: 'feed', tags: [ 'News', 'Wins' ] },
  { id: 2, title: 'Help', layout: 'forum', tags: [ 'Setup', 'Billing' ] },
  { id: 3, title: 'Resources', layout: 'library', tags: [ 'Guides', 'Templates' ] },
];
const posts = [
  { id: 11, space: 3, title: 'Brand guide', files: [ 'brand-guide.pdf' ], tag: 'Guides' },
  { id: 12, space: 3, title: 'Launch checklist', files: [ 'checklist.docx', 'checklist.pdf' ], tag: 'Templates' },
  { id: 13, space: 1, title: 'Welcome, Ada!', files: [], tag: 'News' },
  { id: 14, space: 2, title: 'How do I connect Stripe?', files: [], tag: 'Billing' },
];

// ForumWP Pro, app/portal/library/index.js (shortened): the Library layout.
const Library = ( { space } ) => (
  <div className="lib">
    <Button variant="primary" size="compact">Add a document</Button>
    <p className="chips">Folders: { space.tags.map( ( t ) => <span key={ t } className="chip">{ t } ({ posts.filter( ( p ) => p.space === space.id && p.tag === t ).length })</span> ) }</p>
    <ul>{ posts.filter( ( p ) => p.space === space.id ).map( ( p ) => <li key={ p.id }>{ p.title } · { p.files[ 0 ] }{ p.files.length > 1 ? ` +${ p.files.length - 1 } more` : '' } <Button variant="secondary" size="compact">Download</Button></li> ) }</ul>
  </div>
);
const proLayouts = ( layouts ) => [
  ...layouts,
  { value: 'library', label: 'Library', render: Library, needsTitle: true, prompt: 'Add a document…', composer: false, tagFilter: false },
];

// Added so this runs on its own: ForumWP's own parts, drawn as plain boxes.
const Composer = ( { prompt } ) => <div className="box">Post box: { prompt ?? 'Write something…' }</div>;
const TagFilter = ( { space } ) => <p className="chips">{ space.tags.map( ( t ) => <span key={ t } className="chip">{ t }</span> ) }</p>;
const Feed = ( { space } ) => <ul>{ posts.filter( ( p ) => p.space === space.id ).map( ( p ) => <li key={ p.id }>{ p.title }{ p.files.length ? ` (files: ${ p.files.join( ', ' ) })` : '' }</li> ) }</ul>;

// ForumWP, app/portal/screens/Space.js (shortened)
const SpaceContent = ( { space } ) => {
  const Render = layoutOf( space.layout )?.render;
  if ( Render ) {
    return <Render space={ space } />;
  }
  return <Feed space={ space } />;
};

const Space = ( { space, mistake } ) => {
  const layout = layoutOf( space.layout );
  let showComposer;
  try {
    // The mistake: `=== true` hides it wherever the flag is missing, and `layout.` crashes on an unknown layout.
    showComposer = mistake ? layout.composer === true : layout?.composer !== false;
  } catch ( e ) {
    return <p className="error">Uncaught { e.name }: { e.message }</p>;
  }
  const showTags = mistake ? layout?.tagFilter === true : layout?.tagFilter !== false;

  return (
    <div>
      <p className="fwp-muted">layout "{ space.layout }" → { layout ? `registered (composer: ${ String( layout.composer ) }, tagFilter: ${ String( layout.tagFilter ) })` : 'nobody registered it: drawn as a feed' }</p>
      { showComposer && <Composer prompt={ layout?.prompt } /> }
      { showTags && <TagFilter space={ space } /> }
      <SpaceContent space={ space } />
    </div>
  );
};

const Demo = () => {
  const [ pro, setPro ] = useState( true );
  const [ mistake, setMistake ] = useState( false );
  const [ id, setId ] = useState( '3' );
  const toggle = ( on ) => {
    if ( on ) {
      addFilter( 'forumwp.spaceLayouts', 'forumwp-pro/library', proLayouts );
    } else {
      removeFilter( 'forumwp.spaceLayouts', 'forumwp-pro/library' );
    }
    console.log( on ? 'ForumWP Pro on: layouts are' : 'ForumWP Pro off: layouts are', spaceLayouts().map( ( l ) => l.value ) );
    setPro( on );
  };

  return (
    <div style={ { maxWidth: 680 } }>
      <CheckboxControl __nextHasNoMarginBottom label="ForumWP Pro is active (registers the Library layout)" checked={ pro } onChange={ toggle } />
      <CheckboxControl __nextHasNoMarginBottom label="Check the flags with === true (the mistake)" checked={ mistake } onChange={ setMistake } />
      <SelectControl __nextHasNoMarginBottom __next40pxDefaultSize label="Space" value={ id } options={ spaces.map( ( s ) => ( { value: String( s.id ), label: `${ s.title } (${ s.layout })` } ) ) } onChange={ setId } />
      <Space key={ id } space={ spaces.find( ( s ) => String( s.id ) === id ) } mistake={ mistake } />
    </div>
  );
};

addFilter( 'forumwp.spaceLayouts', 'forumwp-pro/library', proLayouts ); // Pro loads before the app starts.
document.head.insertAdjacentHTML( 'beforeend', '<style>.box{border:1px dashed #949494;padding:10px;border-radius:6px;color:#555;margin:8px 0}.chip{display:inline-block;background:#f0f0f0;border-radius:12px;padding:2px 10px;margin-right:6px;font-size:13px}.fwp-muted{color:#757575;font-size:13px}.error{color:#b32d2e;font-family:monospace}.lib li{margin:6px 0}</style>' ); // Added so this runs on its own
createRoot( document.getElementById( 'forumwp-root' ) ).render( <Demo /> );
