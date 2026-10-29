// @id 28.2
// @title Showing a default without storing it
// @section 28.2
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import { TextareaControl, TextControl } from '@wordpress/components'; // Added so this runs on its own
import { __ } from '@wordpress/i18n'; // Added so this runs on its own

// Added so this runs on its own: the defaults the settings screen gets from the server.
const defaults = {
  welcome_email_subject: 'Welcome to {community}',
  welcome_email_body: 'Hi {first_name},\n\nWelcome to {community}!',
};

const WelcomeFields = () => {
  // Added so this runs on its own: the settings being edited; empty means "use the default".
  const [ form, setForm ] = useState( { welcome_email_subject: '', welcome_email_body: '' } );
  const set = ( key ) => ( value ) => setForm( { ...form, [ key ]: value } );

  // Empty means "use the default", which is shown until the admin edits it.
  const text = ( key ) => form[ key ] || defaults[ key ] || '';

  return (
    <div style={ { display: 'grid', gap: 16, maxWidth: 480 } }>
      <TextControl
        __next40pxDefaultSize
        __nextHasNoMarginBottom
        label={ __( 'Subject', 'forumwp' ) }
        value={ text( 'welcome_email_subject' ) }
        onChange={ set( 'welcome_email_subject' ) }
      />
      <TextareaControl
        __nextHasNoMarginBottom
        label={ __( 'Email', 'forumwp' ) }
        rows={ 5 }
        value={ text( 'welcome_email_body' ) }
        onChange={ set( 'welcome_email_body' ) }
      />
      <p>What would be saved:</p>
      <pre>{ JSON.stringify( form, null, 2 ) }</pre>
    </div>
  );
};

createRoot( document.getElementById( 'forumwp-root' ) ).render( <WelcomeFields /> );
