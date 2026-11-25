// @id 52.7
// @title Back returns to where you were in the feed
// @section 52.6
import { createRoot, useEffect, useLayoutEffect, useRef, useState } from '@wordpress/element'; // Added so this runs on its own
import { CheckboxControl } from '@wordpress/components'; // Added so this runs on its own
// In the course this is BrowserRouter; MemoryRouter keeps the address inside the example so it runs anywhere.
import { MemoryRouter, Routes, Route, Link, useLocation, useNavigate, useNavigationType, useParams } from 'react-router-dom'; // Added so this runs on its own

// From ForumWP's app/portal/hooks/useScrollMemory.js.
// How far down each visited screen was scrolled, by the router's key for its history entry.
const places = new Map();

// How long Back waits for the screen it returns to, to be drawn as long as it was.
const WAIT = 3000;

const useScrollMemory = () => {
  const { key, pathname, hash } = useLocation();
  const type = useNavigationType();
  // The open screen's key and address, as of the last move.
  const open = useRef( { key, pathname } );

  // Remember how far the open screen is scrolled, as it is scrolled.
  useEffect( () => {
    try {
      window.history.scrollRestoration = 'manual';
    } catch {}
    const remember = () => places.set( open.current.key, window.scrollY );
    window.addEventListener( 'scroll', remember, { passive: true } );

    return () => window.removeEventListener( 'scroll', remember );
  }, [] );

  // After every move, before the browser paints the new screen.
  useLayoutEffect( () => {
    const from = open.current;
    open.current = { key, pathname };
    if ( from.key === key ) {
      return;
    }
    // Back or Forward: to where this screen was.
    if ( type === 'POP' ) {
      const top = places.get( key ) ?? 0;
      if ( ! top ) {
        // It was at its top (or never scrolled): there again, not at the
        // place the screen being left was scrolled to. Nothing to wait for.
        window.scrollTo( 0, 0 );

        return;
      }
      // The screen may still be loading: try on each frame until the page is
      // long enough, for a few seconds, unless the member scrolls meanwhile.
      const started = Date.now();
      let frame = 0;
      const stop = () => {
        window.cancelAnimationFrame( frame );
        [ 'wheel', 'touchstart', 'keydown' ].forEach( ( name ) =>
          window.removeEventListener( name, stop )
        );
      };
      const tryNow = () => {
        const longest =
          document.documentElement.scrollHeight - window.innerHeight;
        if ( longest >= top || Date.now() - started > WAIT ) {
          window.scrollTo( 0, top );
          stop();
        } else {
          frame = window.requestAnimationFrame( tryNow );
        }
      };
      [ 'wheel', 'touchstart', 'keydown' ].forEach( ( name ) =>
        window.addEventListener( name, stop, { passive: true } )
      );
      tryNow();

      return stop;
    }
    // A link to another screen: its top. Not for a tab or filter of the same
    // screen, a "#comment-12" link (which scrolls to the comment), or an address
    // corrected in place (a new draft getting its id).
    if ( type === 'PUSH' && from.pathname !== pathname && ! hash ) {
      window.scrollTo( 0, 0 );
    }
    // Only when the screen changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ key ] );
};

// Added so this runs on its own: 60 pretend posts, and a pretend server that takes
// 0.7 seconds, so every screen starts as a short page with "Loading…", as in the real app.
const posts = Array.from( { length: 60 }, ( _, i ) => ( {
  id: i + 1,
  author: i % 2 ? 'Tunde' : 'Ada',
  title: `Post ${ i + 1 }`,
  body: 'Something worth reading. '.repeat( 2 + ( i % 4 ) ),
} ) );
const useLoaded = ( what ) => {
  const [ data, setData ] = useState( null );
  useEffect( () => {
    const timer = setTimeout( () => setData( what ), 700 );

    return () => clearTimeout( timer );
  }, [] );

  return data;
};

const Feed = () => {
  const list = useLoaded( posts );
  if ( ! list ) {
    return <p className="fwp-muted">Loading the feed…</p>;
  }

  return list.map( ( post ) => (
    <article key={ post.id } className="fwp-card">
      <strong>{ post.author }</strong>
      <h3><Link to={ `/p/${ post.id }` }>{ post.title }</Link></h3>
      <p>{ post.body }</p>
    </article>
  ) );
};

const Post = () => {
  const { id } = useParams();
  const post = useLoaded( posts[ id - 1 ] );
  if ( ! post ) {
    return <p className="fwp-muted">Loading the post…</p>;
  }

  return (
    <article className="fwp-card">
      <strong>{ post.author }</strong>
      <h3>{ post.title }</h3>
      { Array.from( { length: 30 }, ( _, i ) => (
        <p key={ i }>Reply { i + 1 }: { post.body }</p>
      ) ) }
    </article>
  );
};

// The hook is used once, by the layout. Added so this runs on its own: a second layout
// without it, to compare. (A hook can't be switched off inside one component: Chapter 8.)
const Remembering = ( { children } ) => {
  useScrollMemory();

  return children;
};
const Forgetting = ( { children } ) => children;

// Added so this runs on its own: the bar stands in for the browser's Back button, which
// can't reach the pretend address, and shows how far down the page is.
const Bar = ( { remember, setRemember } ) => {
  const navigate = useNavigate();
  const { pathname, key } = useLocation();
  const [ top, setTop ] = useState( 0 );
  useEffect( () => {
    const timer = setInterval( () => setTop( Math.round( window.scrollY ) ), 200 );

    return () => clearInterval( timer );
  }, [] );

  return (
    <div className="fwp-bar">
      <button type="button" onClick={ () => navigate( -1 ) } disabled={ key === 'default' }>← Back</button>{ ' ' }
      <strong>{ pathname === '/' ? 'The feed' : `Post ${ pathname.slice( 3 ) }` }, scrolled { top } pixels down</strong>
      <CheckboxControl label="Remember the scroll position (useScrollMemory)" checked={ remember } onChange={ setRemember } />
      <p className="fwp-muted">Try: scroll down to about Post 30, open it, scroll down its replies and press Back. You return to Post 30, after the feed has loaded. Then untick the box and do the same: Back leaves you at the top of the feed, because the page was still short and loading when the browser tried, and you have to find Post 30 again.</p>
    </div>
  );
};

const App = () => {
  const [ remember, setRemember ] = useState( true );
  const Layout = remember ? Remembering : Forgetting;

  return (
    <MemoryRouter>
      <div style={ { maxWidth: 560 } }>
        <Bar remember={ remember } setRemember={ setRemember } />
        <Layout>
          <Routes>
            <Route path="/" element={ <Feed /> } />
            <Route path="/p/:id" element={ <Post /> } />
          </Routes>
        </Layout>
      </div>
    </MemoryRouter>
  );
};

document.head.insertAdjacentHTML( 'beforeend', '<style>.fwp-card{border:1px solid #ddd;border-radius:8px;padding:12px;margin:0 0 12px}.fwp-card h3{margin:4px 0}.fwp-muted{color:#757575;margin:4px 0 0}.fwp-bar{position:sticky;top:0;background:#fff;border-bottom:1px solid #ddd;padding:8px 0;margin-bottom:12px;z-index:1}</style>' ); // Added so this runs on its own
createRoot( document.getElementById( 'forumwp-root' ) ).render( <App /> );
