// @id 31.2
// @title Counting uploads that are still on their way
// @section 31.2
// @click Pick 8 photos
import { createRoot, useRef, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button, Notice, ToggleControl } from '@wordpress/components'; // Added so this runs on its own
import { __, sprintf } from '@wordpress/i18n'; // Added so this runs on its own

// Added so this runs on its own: the limits the server prints into forumwpData.uploads,
// a pretend upload that takes 600 ms, and pretend files (just a name, a type and a size).
const uploads = {
  perPost: 10,
  filesPerPost: 5,
  image: { max: 10 * 1024 * 1024, message: 'Photos can be up to 10 MB.' },
  media: { max: 100 * 1024 * 1024, message: 'Videos and audio can be up to 100 MB.' },
};
let nextId = 1;
const uploadMedia = ( file ) =>
  new Promise( ( resolve ) => setTimeout( () => resolve( { id: nextId++, name: file.name } ), 600 ) );
const fakeFiles = ( n, prefix, type = 'image/jpeg', size = 2e6 ) =>
  Array.from( { length: n }, ( _, i ) => ( { name: `${ prefix }-${ i + 1 }.jpg`, type, size } ) );
const limitFor = ( limits, file ) => ( /^(video|audio)\//.test( file.type ) ? limits.media : limits.image );

const Composer = () => {
  const [ form, setForm ] = useState( { images: [] } );
  const [ uploading, setUploading ] = useState( 0 );
  const [ uploadError, setUploadError ] = useState( null );
  const [ countPending, setCountPending ] = useState( true ); // Added so this runs on its own
  const perPost = { images: uploads.perPost };
  // Uploads still on their way, per list, so the per-post limits count them.
  const pending = useRef( { images: 0 } );

  const addMedia = async ( chosen, key ) => {
    setUploadError( null );
    const room = Math.max( 0, perPost[ key ] - form[ key ].length - ( countPending ? pending.current[ key ] : 0 ) );
    if ( chosen.length > room ) {
      setUploadError(
        sprintf( __( 'A post can have up to %d photos, videos or audio clips.', 'forumwp' ), perPost.images )
      );
    }
    // Files over the site's limits are turned away before they are sent.
    const files = chosen.slice( 0, room ).filter( ( file ) => {
      const limit = limitFor( uploads, file );
      if ( limit && file.size > limit.max ) {
        setUploadError( sprintf( __( '%1$s is too big. %2$s', 'forumwp' ), file.name, limit.message ) );
        return false;
      }
      return true;
    } );
    pending.current[ key ] += files.length;
    for ( const file of files ) {
      setUploading( ( n ) => n + 1 );
      try {
        const media = await uploadMedia( file );
        setForm( ( f ) => ( { ...f, [ key ]: [ ...f[ key ], { ...media, uploadedAt: Date.now() } ] } ) );
      } catch ( error ) {
        setUploadError( error.message );
      } finally {
        pending.current[ key ] -= 1;
        setUploading( ( n ) => n - 1 );
      }
    }
  };

  return (
    <div style={ { display: 'grid', gap: 12, maxWidth: 520 } }>
      <ToggleControl
        __nextHasNoMarginBottom
        label="Count uploads still on their way (turn off to see the bug)"
        checked={ countPending }
        onChange={ setCountPending }
      />
      <div className="fwp-row">
        <Button variant="secondary" onClick={ () => addMedia( fakeFiles( 8, 'beach' ), 'images' ) }>
          Pick 8 photos
        </Button>
        <Button variant="secondary" onClick={ () => addMedia( fakeFiles( 1, 'holiday', 'video/mp4', 300e6 ), 'images' ) }>
          Pick a 300 MB video
        </Button>
        <Button variant="tertiary" onClick={ () => setForm( { images: [] } ) }>
          Empty the post
        </Button>
      </div>
      <p>
        In the post: { form.images.length } · still uploading: { uploading }
      </p>
      { form.images.length > perPost.images && (
        <Notice status="error" isDismissible={ false }>
          The post now has more than { perPost.images }: the server would refuse it.
        </Notice>
      ) }
      { uploadError && (
        <Notice status="warning" isDismissible={ false }>
          { uploadError }
        </Notice>
      ) }
      <p className="fwp-muted">Click "Pick 8 photos" twice quickly, with the toggle on and then off.</p>
    </div>
  );
};

createRoot( document.getElementById( 'forumwp-root' ) ).render( <Composer /> );
