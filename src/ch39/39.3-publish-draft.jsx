// @id 39.3
// @title Publishing a draft: screened like a new post when its author publishes it
// @section 39.3
// @click Publish now
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button, CheckboxControl, Notice, RadioControl, RangeControl } from '@wordpress/components'; // Added so this runs on its own

// Added so this runs on its own: Tunde's original post (#7, published 20 minutes ago), and its
// copy in the new space (#41), a draft marked copied_from: 7.
const LIMIT = 3; // posts_per_hour
const REFUSED = [ 'casino' ]; // ForumWP Pro's refused words
const makeTable = ( recent, word ) => [
  ...Array.from( { length: recent }, ( _, i ) => ( { id: 90 + i, user: 'Tunde', status: 'published', text: `Note ${ i + 1 }`, minutes: 10 + i } ) ),
  { id: 7, user: 'Tunde', status: 'published', text: 'Office hours Bring your questions.', minutes: 20 },
  {
    id: 41,
    user: 'Tunde',
    status: 'draft',
    text: `Office hours Bring your questions.${ word ? ' Prizes from our casino partner!' : '' }`,
    minutes: 1,
    meta: { copied_from: 7 },
  },
];

// Spam::left_out(): drafts never count, nor the ids in `except`.
const leftOut = ( row, except ) => row.status !== 'draft' && ! except.includes( row.id );

// Spam::screen(), shortened: the hourly limit, repeats, then add-ons (Pro's refused words).
const screen = ( table, user, text, except ) => {
  if ( user === 'Ada' ) {
    return { status: 'published', reason: '' }; // Moderators skip every check.
  }
  const recent = table.filter( ( r ) => r.user === user && r.minutes < 60 && leftOut( r, except ) );
  if ( recent.length >= LIMIT ) {
    return { error: 'You have posted a lot in the last hour. Please wait a while before posting again.' };
  }
  if ( recent.some( ( r ) => r.text.trim() === text.trim() ) ) {
    return { error: 'You already posted that.' };
  }
  const word = REFUSED.find( ( w ) => text.toLowerCase().includes( w ) );
  if ( word ) {
    return { error: `“${ word }” isn’t allowed here. Please change it and try again.` };
  }
  return { status: 'published', reason: '' };
};

// Posts::publish_draft(), in JavaScript.
const publishDraft = ( table, post, user, { screened, except } ) => {
  if ( post.status !== 'draft' ) {
    return { post };
  }
  let result = { status: 'published', reason: '' };
  if ( screened && user === post.user ) {
    result = screen( table, user, post.text, except ? [ post.meta.copied_from ] : [] );
    if ( result.error ) {
      return { error: result.error };
    }
  }
  // UPDATE … SET status = 'published' WHERE id = 41 AND status = 'draft'
  const done = post.status === 'draft' ? 1 : 0;
  post.status = result.status;
  return { post, fired: done === 1 && post.status === 'published' };
};

const Demo = () => {
  const [ who, setWho ] = useState( 'Tunde' );
  const [ recent, setRecent ] = useState( 1 );
  const [ word, setWord ] = useState( false );
  const [ screened, setScreened ] = useState( true );
  const [ except, setExcept ] = useState( true );
  const [ out, setOut ] = useState( null );

  const publish = ( times ) => {
    const table = makeTable( recent, word );
    const draft = table.find( ( r ) => r.id === 41 );
    const results = Array.from( { length: times }, () => publishDraft( table, draft, who, { screened, except } ) );
    const fired = results.filter( ( r ) => r.fired ).length;
    console.log( `${ who } publishes #41:`, results.map( ( r ) => r.error ?? r.post.status ).join( ', ' ), `· forumwp_post_published fired ${ fired }×` );
    setOut( { results, fired, status: draft.status } );
  };

  return (
    <div style={ { maxWidth: 600 } }>
      <RadioControl
        label="Who presses Publish now"
        selected={ who }
        options={ [ { label: 'Tunde, the draft’s author', value: 'Tunde' }, { label: 'Ada, a moderator', value: 'Ada' } ] }
        onChange={ setWho }
      />
      <RangeControl label="Tunde’s other posts in the last hour" min={ 0 } max={ 3 } value={ recent } onChange={ setRecent } __nextHasNoMarginBottom __next40pxDefaultSize />
      <CheckboxControl label="The draft mentions a casino" checked={ word } onChange={ setWord } __nextHasNoMarginBottom />
      <CheckboxControl label="Screen it when its author publishes it (0.32.0)" checked={ screened } onChange={ setScreened } __nextHasNoMarginBottom />
      <CheckboxControl label="Leave out the post it was copied from (except)" checked={ except } onChange={ setExcept } __nextHasNoMarginBottom />
      <p>
        <Button variant="primary" onClick={ () => publish( 1 ) }>Publish now</Button>{ ' ' }
        <Button variant="secondary" onClick={ () => publish( 2 ) }>Double-click Publish now</Button>
      </p>
      { out && (
        <div className="fwp-stack">
          { out.results.map( ( r, i ) =>
            r.error ? (
              <Notice key={ i } status="error" isDismissible={ false }>{ r.error } (it stays a draft)</Notice>
            ) : (
              <Notice key={ i } status="success" isDismissible={ false }>Request { i + 1 }: post #41 is { r.post.status }.</Notice>
            )
          ) }
          <p>
            forumwp_post_published fired { out.fired }× · points for Tunde: +0 (Posts::is_copy(): a copy earns its author nothing)
          </p>
        </div>
      ) }
    </div>
  );
};

createRoot( document.getElementById( 'forumwp-root' ) ).render( <Demo /> );
