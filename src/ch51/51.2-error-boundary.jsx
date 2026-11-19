// @id 51.2
// @title An error boundary keeps the rest of the page
// @section 51.5
// @click Break the leaderboard
// @expect error
import { Component, createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button, CheckboxControl } from '@wordpress/components'; // Added so this runs on its own

// ForumWP's ErrorBoundary, shortened.
class ErrorBoundary extends Component {
  constructor( props ) {
    super( props );
    this.state = { error: null };
    this.retry = this.retry.bind( this );
  }

  static getDerivedStateFromError( error ) {
    return { error };
  }

  componentDidCatch( error ) {
    console.log( 'Caught: ' + error.message );
  }

  retry() {
    this.props.onRetry?.();
    this.setState( { error: null } );
  }

  render() {
    if ( ! this.state.error ) {
      return this.props.children;
    }

    return (
      <div className="fwp-oops" role="alert">
        <strong>This part didn’t load.</strong>{ ' ' }
        <Button variant="secondary" onClick={ this.retry }>Try again</Button>
      </div>
    );
  }
}

// A screen that breaks while drawing when its data isn't what it expected.
const Leaderboard = ( { data } ) => (
  <ol>{ data.rows.map( ( row ) => <li key={ row.name }>{ row.name }: { row.points } points</li> ) }</ol>
);

const good = { rows: [ { name: 'Ada', points: 120 }, { name: 'Tunde', points: 95 } ] };

const App = () => {
  const [ data, setData ] = useState( good );
  const [ guarded, setGuarded ] = useState( true );
  const [ draft, setDraft ] = useState( 'Half a comment I was writ' );
  const board = <Leaderboard data={ data } />;

  return (
    <div style={ { maxWidth: 640 } }>
      <CheckboxControl label="Wrap the leaderboard in an ErrorBoundary" checked={ guarded } onChange={ setGuarded } />
      <p>
        <Button variant="primary" onClick={ () => setData( {} ) }>Break the leaderboard (the server answers without rows)</Button>
      </p>
      <div className="fwp-card">
        <strong>Leaderboard</strong>
        { guarded ? <ErrorBoundary onRetry={ () => setData( good ) }>{ board }</ErrorBoundary> : board }
      </div>
      <div className="fwp-card">
        <strong>Your comment</strong><br />
        <textarea value={ draft } onChange={ ( e ) => setDraft( e.target.value ) } rows={ 2 } style={ { width: '100%' } } />
      </div>
      <p className="fwp-muted">Try: break it with the box ticked (the comment box stays, and "Try again" brings the board back). Reload the page, untick the box and break it again: the whole page goes blank, comment and all. (The console shows the error either way: a boundary decides what the member sees, it does not hide the error from you.)</p>
    </div>
  );
};

document.head.insertAdjacentHTML( 'beforeend', '<style>.fwp-card{border:1px solid #ddd;border-radius:8px;padding:12px;margin:12px 0}.fwp-oops{background:#fcf0f1;padding:8px;border-radius:6px}.fwp-muted{color:#757575}</style>' ); // Added so this runs on its own
createRoot( document.getElementById( 'forumwp-root' ) ).render( <App /> );
