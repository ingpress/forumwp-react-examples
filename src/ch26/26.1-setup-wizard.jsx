// @id 26.1
// @title A multi-step form that saves once (the setup guide)
// @section 26.1
// @click Continue
import { createRoot, useState, useEffect } from '@wordpress/element'; // Added so this runs on its own
import apiFetch from '@wordpress/api-fetch'; // Added so this runs on its own
import { Button, CheckboxControl, Notice, Spinner, TextControl, TextareaControl, ToggleControl } from '@wordpress/components'; // Added so this runs on its own
import { QueryClient, QueryClientProvider, useQuery, useMutation } from '@tanstack/react-query'; // Added so this runs on its own

// Added so this runs on its own: the setup route lives in wp-admin, so this answers it in the
// browser. GET returns the starting values; POST "saves" and returns what was stored, with the
// address cleaned (try "My Community!" as the address).
const PATH = '/forumwp/v1/setup';
apiFetch.use( ( options, next ) => {
  if ( options.path !== PATH ) {
    return next( options );
  }
  console.info( `[stub] ${ options.method ?? 'GET' } ${ PATH }`, options.data ?? '' );
  const answer = options.method === 'POST'
    ? {
        name: options.data.settings.community_name.trim(),
        url: 'https://example.test/' + ( options.data.settings.portal_slug.toLowerCase().replace( /[^a-z0-9]+/g, '-' ).replace( /^-|-$/g, '' ) || 'community' ) + '/',
        spaces: options.data.spaces,
        welcomed: !! options.data.welcome.title,
      }
    : {
        settings: { community_name: 'Maker Collective', portal_slug: 'community' },
        spaces: [
          { key: 'general', label: 'General', exists: true },
          { key: 'questions', label: 'Questions', exists: false },
          { key: 'showcase', label: 'Showcase', exists: false },
        ],
        welcome: { title: 'Welcome!', body: 'Say hello and tell us what you are working on.' },
      };
  return new Promise( ( resolve ) => setTimeout( () => resolve( answer ), 400 ) );
} );

// Added so this runs on its own: the "Your community is ready" screen, built from finish.data.
const Done = ( { state } ) => (
  <Notice status="success" isDismissible={ false }>
    { state.name } is ready at <a href={ state.url }>{ state.url }</a> with { state.spaces.length } space(s){ state.welcomed ? ' and a welcome post' : '' }.
  </Notice>
);

// Added so this runs on its own: a shortened app/admin/SetupWizard.js with three pages of questions.
const SetupWizard = () => {
  const { data, error, isPending } = useQuery( {
    queryKey: [ 'setup' ],
    queryFn: () => apiFetch( { path: PATH } ),
  } );
  const finish = useMutation( {
    mutationFn: ( answers ) =>
      apiFetch( { path: PATH, method: 'POST', data: answers } ),
  } );

  const [ step, setStep ] = useState( 0 );
  const [ settings, setSettings ] = useState( null );
  const [ spaces, setSpaces ] = useState( [] );
  const [ welcome, setWelcome ] = useState( {} ); // Added so this runs on its own
  const [ sayHello, setSayHello ] = useState( true ); // Added so this runs on its own
  const canWelcome = spaces.length > 0; // Added so this runs on its own: a welcome post needs a space

  useEffect( () => {
    if ( data && ! settings ) {
      setSettings( data.settings );
      setSpaces( data.spaces.filter( ( s ) => s.exists || s.key === 'questions' ).map( ( s ) => s.key ) );
      setWelcome( data.welcome );
    }
  }, [ data, settings ] );

  const submit = () =>
    finish.mutate( {
      settings,
      spaces,
      welcome: canWelcome && sayHello ? welcome : {},
    } );

  // Added so this runs on its own: loading and error states.
  if ( error ) {
    return <Notice status="error" isDismissible={ false }>{ error.message }</Notice>;
  }
  if ( isPending || ! settings ) {
    return <Spinner />;
  }

  if ( finish.isSuccess ) {
    return <Done state={ finish.data } />;
  }

  const valid =
    step !== 0 ||
    ( settings.community_name.trim() && settings.portal_slug.trim() );

  // Added so this runs on its own: the three pages, Back, Continue and Finish.
  const setSetting = ( key ) => ( value ) => setSettings( { ...settings, [ key ]: value } );
  const last = 2;
  return (
    <div className="fwp-card">
      <p>Step { step + 1 } of { last + 1 }</p>
      { step === 0 && (
        <>
          <TextControl label="Community name" value={ settings.community_name } onChange={ setSetting( 'community_name' ) } __next40pxDefaultSize __nextHasNoMarginBottom />
          <TextControl label="Address" value={ settings.portal_slug } onChange={ setSetting( 'portal_slug' ) } __next40pxDefaultSize __nextHasNoMarginBottom />
        </>
      ) }
      { step === 1 && data.spaces.map( ( s ) => (
        <CheckboxControl key={ s.key } label={ s.label } checked={ spaces.includes( s.key ) }
          onChange={ ( on ) => setSpaces( on ? [ ...spaces, s.key ] : spaces.filter( ( k ) => k !== s.key ) ) } __nextHasNoMarginBottom />
      ) ) }
      { step === 2 && ( canWelcome ? (
        <>
          <ToggleControl label="Post a welcome message" checked={ sayHello } onChange={ setSayHello } __nextHasNoMarginBottom />
          { sayHello && (
            <>
              <TextControl label="Title" value={ welcome.title } onChange={ ( title ) => setWelcome( { ...welcome, title } ) } __next40pxDefaultSize __nextHasNoMarginBottom />
              <TextareaControl label="Message" value={ welcome.body } onChange={ ( body ) => setWelcome( { ...welcome, body } ) } __nextHasNoMarginBottom />
            </>
          ) }
        </>
      ) : <p>Choose at least one space to post a welcome message.</p> ) }
      { finish.isError && <Notice status="error" isDismissible={ false }>{ finish.error.message }</Notice> }
      <p>
        { step > 0 && <Button variant="tertiary" onClick={ () => setStep( step - 1 ) }>Back</Button> }{ ' ' }
        { step < last
          ? <Button variant="primary" disabled={ ! valid } onClick={ () => setStep( step + 1 ) }>Continue</Button>
          : <Button variant="primary" isBusy={ finish.isPending } disabled={ finish.isPending } onClick={ submit }>Finish</Button> }
      </p>
    </div>
  );
};

createRoot( document.getElementById( 'forumwp-root' ) ).render( // Added so this runs on its own
  <QueryClientProvider client={ new QueryClient() }><SetupWizard /></QueryClientProvider>
);
