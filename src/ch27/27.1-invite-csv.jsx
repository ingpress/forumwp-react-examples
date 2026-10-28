// @id 27.1
// @title Reading a CSV file the member picks
// @section 27.1
// @click sample file
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button, FormFileUpload, Notice, TextareaControl } from '@wordpress/components'; // Added so this runs on its own
import { upload } from '@wordpress/icons'; // Added so this runs on its own
import { __, sprintf } from '@wordpress/i18n'; // Added so this runs on its own

const EMAIL = /[^\s,;:"'<>()]+@[^\s,;:"'<>()]+\.[a-z]{2,}/gi;
export const findEmails = ( text ) => [
  ...new Set( ( text.match( EMAIL ) ?? [] ).map( ( e ) => e.toLowerCase() ) ),
];

// Added so this runs on its own: the parts of app/portal/components/InviteDialog.js around the file.
const InviteDialog = () => {
  const [ emails, setEmails ] = useState( '' );
  const [ fileError, setFileError ] = useState( '' );

  const readFile = ( event ) => {
    const file = event.target.files?.[ 0 ];
    if ( ! file ) {
      return;
    }
    setFileError( '' );
    file.text()
      .then( ( text ) => {
        const found = findEmails( text );
        if ( ! found.length ) {
          setFileError( __( 'No email addresses found in that file.', 'forumwp' ) );
          return;
        }
        setEmails( findEmails( emails + '\n' + found.join( '\n' ) ).join( '\n' ) );
      } )
      .catch( () => setFileError( __( 'That file couldn’t be read.', 'forumwp' ) ) );
  };

  // Added so this runs on its own: a made-up Mailchimp export, passed to readFile as if picked.
  const addSample = () => {
    const csv = 'Email Address,First Name,Last Name\n"ada@example.com",Ada,Lovelace\n"TUNDE@example.com",Tunde,Bakare\nada@example.com,Ada,again\n';
    readFile( { target: { files: [ new File( [ csv ], 'members.csv', { type: 'text/csv' } ) ] } } );
  };

  const count = findEmails( emails ).length; // Added so this runs on its own
  return (
    <div className="fwp-card">
      <TextareaControl
        label={ __( 'Email addresses', 'forumwp' ) }
        value={ emails }
        onChange={ setEmails }
        rows={ 5 }
        __nextHasNoMarginBottom
      />
      <p>{ sprintf( '%d addresses found', count ) }{ count > 1000 && ' (only the first 1,000 will be invited)' }</p>
      { fileError && <Notice status="error" onRemove={ () => setFileError( '' ) }>{ fileError }</Notice> }
      <FormFileUpload
        accept=".csv,.txt,text/csv,text/plain"
        onChange={ readFile }
        render={ ( { openFileDialog } ) => (
          <Button variant="secondary" icon={ upload } onClick={ openFileDialog }>
            { __( 'Add from a CSV file', 'forumwp' ) }
          </Button>
        ) }
      />{ ' ' }
      <Button variant="tertiary" onClick={ addSample }>Use a sample file</Button>
    </div>
  );
};

// Added so this runs on its own: findEmails on a pasted email signature.
console.log( findEmails( 'Grace Hopper <Grace@Example.com>; cc: tunde@example.com, grace@example.com' ) );

createRoot( document.getElementById( 'forumwp-root' ) ).render( <InviteDialog /> ); // Added so this runs on its own
