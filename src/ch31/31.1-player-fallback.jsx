// @id 31.1
// @title A video that can't play offers a download instead
// @section 31.1
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import { __, sprintf } from '@wordpress/i18n'; // Added so this runs on its own

const Player = ( { item } ) => {
  const [ failed, setFailed ] = useState( false );
  const isAudio = item.type === 'audio';
  const download = (
    <a href={ item.url } download={ item.name || true }>
      { isAudio ? __( 'Download the audio', 'forumwp' ) : __( 'Download the video', 'forumwp' ) }
    </a>
  );

  if ( failed ) {
    return (
      <p className="fwp-media-error">
        { isAudio
          ? __( "This audio can't play in your browser.", 'forumwp' )
          : __( "This video can't play in your browser.", 'forumwp' ) }{ ' ' }
        { download }
      </p>
    );
  }

  const Tag = isAudio ? 'audio' : 'video';
  const sized = ! isAudio && item.width > 0 && item.height > 0;

  return (
    <Tag
      className={ isAudio ? 'fwp-audio' : 'fwp-video' }
      src={ item.url }
      controls
      preload="metadata"
      aria-label={ sprintf( isAudio ? __( 'Audio: %s', 'forumwp' ) : __( 'Video: %s', 'forumwp' ), item.name ?? '' ) }
      onError={ () => {
        console.log( `${ item.name }: the browser fired "error"` ); // Added so this runs on its own
        setFailed( true );
      } }
      // A browser that can't decode the picture may still play the sound.
      onLoadedMetadata={ ( e ) => sized && ! e.currentTarget.videoWidth && setFailed( true ) }
      { ...( isAudio ? {} : { playsInline: true, style: sized ? { aspectRatio: `${ item.width } / ${ item.height }`, width: 320 } : undefined } ) }
    >
      { download }
    </Tag>
  );
};

// Added so this runs on its own: two uploads whose bytes no browser can decode, like an
// iPhone's HEVC video in Chrome. (A real post would have real files from the server.)
const attachments = [
  { id: 1, type: 'video', name: 'IMG_0412.mov', url: 'data:video/mp4;base64,AAAAIGZ0eXBoZXZj', width: 1920, height: 1080 },
  { id: 2, type: 'audio', name: 'voice-memo.m4a', url: 'data:audio/mp4;base64,AAAA' },
];

createRoot( document.getElementById( 'forumwp-root' ) ).render(
  <div className="fwp-post">
    <p>
      <strong>Tunde:</strong> Here is the bug on my phone.
    </p>
    { attachments.map( ( item ) => (
      <Player key={ item.id } item={ item } />
    ) ) }
  </div>
);
