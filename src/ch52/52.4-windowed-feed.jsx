// @id 52.4
// @title A long feed that draws only what is near the screen
// @section 52.5
import { createRoot, useEffect, useRef, useState } from '@wordpress/element'; // Added so this runs on its own
import { CheckboxControl } from '@wordpress/components'; // Added so this runs on its own

// From ForumWP's app/portal/hooks/useWindowed.js.
// A long list only keeps the items near the screen drawn, once it has more than this many.
const WINDOW_AFTER = 40;

// Whether an item must stay drawn even far from the screen: it has the keyboard focus,
// something is being written in it, or its audio or video is playing.
const inUse = ( el ) =>
  el.contains( el.ownerDocument.activeElement ) ||
  !! el.querySelector( 'form, textarea' ) ||
  Array.from( el.querySelectorAll( 'audio, video' ) ).some(
    ( media ) => ! media.paused && ! media.ended
  );

const useWindowed = ( on ) => {
  const box = useRef();
  const [ height, setHeight ] = useState( null );

  useEffect( () => {
    const el = box.current;
    if ( ! on || ! el || ! window.IntersectionObserver ) {
      setHeight( null );

      return;
    }
    const observer = new window.IntersectionObserver(
      ( [ entry ] ) => {
        if ( entry.isIntersecting ) {
          setHeight( null );
        } else if ( ! inUse( el ) ) {
          setHeight( ( was ) => was ?? el.offsetHeight );
        }
      },
      // "Near" is three screens or so in ForumWP ('3000px 0px'): less here, so you can see it work.
      { rootMargin: '600px 0px' }
    );
    observer.observe( el );

    return () => observer.disconnect();
  }, [ on ] );

  return [ box, on ? height : null ];
};

// From app/portal/components/Feed.js.
const Windowed = ( { on, children } ) => {
  const [ box, height ] = useWindowed( on );

  return (
    <div
      ref={ box }
      className="fwp-windowed"
      style={ height === null ? undefined : { height } }
      // An empty box says nothing: screen readers skip it.
      aria-hidden={ height === null ? undefined : 'true' }
    >
      { height === null ? children : null }
    </div>
  );
};

// Added so this runs on its own: 300 pretend posts. Each has a "Reply" box, to try inUse().
const posts = Array.from( { length: 300 }, ( _, i ) => ( {
  id: i + 1,
  author: i % 2 ? 'Tunde' : 'Ada',
  body: `Post ${ i + 1 }. ` + 'Something worth reading. '.repeat( 1 + ( i % 4 ) ),
} ) );

const PostCard = ( { post } ) => {
  const [ replying, setReplying ] = useState( false );

  return (
    <article className="fwp-card">
      <strong>{ post.author }</strong>
      <p>{ post.body }</p>
      { replying ? (
        <textarea rows={ 2 } placeholder="A reply you haven't sent…" style={ { width: '100%' } } />
      ) : (
        <button type="button" onClick={ () => setReplying( true ) }>Reply</button>
      ) }
    </article>
  );
};

const App = () => {
  const [ windowing, setWindowing ] = useState( true );
  const [ drawn, setDrawn ] = useState( 0 );
  // Added so this runs on its own: count the posts that are really in the page.
  useEffect( () => {
    const timer = setInterval( () => setDrawn( document.querySelectorAll( 'article' ).length ), 300 );

    return () => clearInterval( timer );
  }, [] );
  const on = windowing && posts.length > WINDOW_AFTER;

  return (
    <div style={ { maxWidth: 560 } }>
      <div className="fwp-bar">
        <CheckboxControl label="Draw only what is near the screen" checked={ windowing } onChange={ setWindowing } />
        <strong>{ drawn } of { posts.length } posts are in the page</strong>
        <p className="fwp-muted">Try: scroll down and watch the number stay small while the scrollbar keeps its length. Press "Reply" on a post, type something, scroll far away and come back: the box and your words are still there, because a post with an open text box is never taken away.</p>
      </div>
      { posts.map( ( post ) => (
        <Windowed key={ post.id } on={ on }>
          <PostCard post={ post } />
        </Windowed>
      ) ) }
    </div>
  );
};

document.head.insertAdjacentHTML( 'beforeend', '<style>.fwp-card{border:1px solid #ddd;border-radius:8px;padding:12px;margin:0 0 12px}.fwp-windowed{display:flow-root}.fwp-muted{color:#757575;margin:4px 0 0}.fwp-bar{position:sticky;top:0;background:#fff;border-bottom:1px solid #ddd;padding:8px 0;margin-bottom:12px;z-index:1}</style>' ); // Added so this runs on its own
createRoot( document.getElementById( 'forumwp-root' ) ).render( <App /> );
