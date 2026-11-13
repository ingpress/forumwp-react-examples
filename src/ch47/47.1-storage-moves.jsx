// @id 47.1
// @title Moving uploads to storage: records, a batch that fails, Try again, and a staging copy that can't delete the live files
// @section 47.4
// @click Move existing uploads
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button, CheckboxControl } from '@wordpress/components'; // Added so this runs on its own

// Added so this runs on its own: a pretend site (attachments with their records), a pretend
// S3 (buckets of keys), a pretend Action Scheduler (pending jobs) and two sites sharing
// the same database copy: the live site and a staging copy. 4 uploads a batch.
const BATCH = 4;
const s3 = { 'live-bucket': new Set(), 'new-bucket': new Set() };
const sites = {};
const makeSite = () => ( {
  settings: { bucket: 'live-bucket' },
  uploads: [ 801, 802, 803, 804, 805, 806, 807, 808, 809, 810 ].map( ( id ) => ( { id, name: `photo-${ id }.jpg`, onDisk: true, record: null } ) ),
  jobs: [],
  running: '',
  failed: {},
  deleting: [],
} );
sites[ 'example.com' ] = makeSite();
const options = { site: 'example.com', broken: false };
const site = () => sites[ options.site ];

// Storage::ours(): only the site that moved a file deletes it.
const ours = ( record ) => record.site === options.site;

// Storage::move() and copy_up(): put the file, then save where it went, then delete the local copy.
const move = ( u ) => {
  if ( u.record ) {
    return true;
  }
  if ( options.broken && u.id === 806 ) {
    return 'The storage service answered 503 Service Unavailable.';
  }
  const bucket = site().settings.bucket;
  s3[ bucket ].add( u.name );
  u.record = { bucket, key: u.name, base: `https://${ bucket }.s3.amazonaws.com`, site: options.site };
  u.onDisk = false;
  return true;
};

// Storage::restore(): download from the record's own bucket, forget the record, delete only if ours.
const restore = ( u ) => {
  const record = u.record;
  u.onDisk = true;
  u.record = null;
  if ( ours( record ) ) {
    s3[ record.bucket ].delete( record.key );
  }
  return true;
};

// Storage::next(): queue a batch only if none is pending.
const next = () => {
  if ( ! site().jobs.some( ( j ) => j.status === 'pending' ) ) {
    site().jobs.push( { status: 'pending' } );
  }
};

// Storage::batch()
const batch = () => {
  const s = site();
  const dir = s.running;
  const todo = s.uploads.filter( ( u ) => ( dir === 'up' ? ! u.record : u.record ) && ! s.failed[ u.id ] );
  if ( ! todo.length ) {
    s.running = '';
    return 'Nothing left: the move is finished.';
  }
  next(); // Queued first, so a batch that dies doesn't stop the move.
  const done = [];
  for ( const u of todo.slice( 0, BATCH ) ) {
    s.failed[ u.id ] = 'Moving it was interrupted.'; // Failing until it succeeds.
    const result = dir === 'up' ? move( u ) : restore( u );
    if ( result === true ) {
      delete s.failed[ u.id ];
      done.push( u.id );
    } else {
      s.failed[ u.id ] = result;
    }
  }
  return `Moved ${ done.join( ', ' ) || 'nothing' }${ Object.keys( s.failed ).length ? `; failing: ${ Object.keys( s.failed ).join( ', ' ) }` : '' }.`;
};

const runJob = () => {
  const job = site().jobs.find( ( j ) => j.status === 'pending' );
  if ( ! job ) {
    return 'No job is waiting.';
  }
  job.status = 'in-progress';
  const said = site().running ? batch() : 'The move was stopped.';
  job.status = 'complete';
  return said;
};

// Deleting an upload: delete_attachment → Storage::forget().
const remove = () => {
  const u = site().uploads.find( ( x ) => x.record );
  if ( ! u ) {
    return 'No upload in storage to delete.';
  }
  site().uploads = site().uploads.filter( ( x ) => x !== u );
  if ( ! ours( u.record ) ) {
    return `Deleted ${ u.name } here. Its record names ${ u.record.site }, so the file stays in ${ u.record.bucket }.`;
  }
  s3[ u.record.bucket ].delete( u.record.key );
  return `Deleted ${ u.name } here and from ${ u.record.bucket }.`;
};

const Demo = () => {
  const [ log, setLog ] = useState( [] );
  const [ , redraw ] = useState( 0 );
  const [ broken, setBroken ] = useState( false );
  options.broken = broken;
  const act = ( label, fn ) => {
    const line = `[${ options.site }] ${ label }: ${ fn() }`;
    console.log( line );
    setLog( ( l ) => [ line, ...l ].slice( 0, 12 ) );
  };
  const s = site();
  const start = ( dir ) => () => {
    s.running = dir;
    s.failed = {};
    next();
    return dir === 'up' ? 'Moving uploads to storage… (a batch is queued)' : 'Bringing uploads back… (a batch is queued)';
  };

  return (
    <div style={ { maxWidth: 780 } }>
      <CheckboxControl __nextHasNoMarginBottom label="The storage service fails for photo-806.jpg" checked={ broken } onChange={ setBroken } />
      <p>
        <Button variant="primary" onClick={ () => act( 'Move existing uploads', start( 'up' ) ) }>Move existing uploads</Button>{ ' ' }
        <Button variant="secondary" onClick={ () => act( 'Run the next job', runJob ) }>Run the next job</Button>{ ' ' }
        <Button variant="secondary" disabled={ ! Object.keys( s.failed ).length || !! s.running } onClick={ () => act( 'Try again', start( 'up' ) ) }>Try again</Button>{ ' ' }
        <Button variant="secondary" onClick={ () => act( 'Bring uploads back', start( 'down' ) ) }>Bring uploads back</Button>
      </p>
      <p>
        <Button variant="secondary" onClick={ () => act( 'Change the bucket', () => ( ( s.settings.bucket = s.settings.bucket === 'live-bucket' ? 'new-bucket' : 'live-bucket' ), `New uploads now go to ${ s.settings.bucket }. Moved files keep their record's bucket.` ) ) }>Change the bucket</Button>{ ' ' }
        <Button variant="secondary" onClick={ () => act( 'Delete an upload in storage', remove ) }>Delete an upload in storage</Button>{ ' ' }
        <Button variant="secondary" onClick={ () => act( 'Switch site', () => {
          if ( options.site === 'example.com' ) {
            // The host copies the database: same settings, same records.
            sites[ 'staging.example.com' ] = JSON.parse( JSON.stringify( sites[ 'example.com' ] ) );
            options.site = 'staging.example.com';
            return 'Now on a fresh copy of the live site.';
          }
          options.site = 'example.com';
          return 'Back on the live site.';
        } ) }>{ options.site === 'example.com' ? 'Make a staging copy and switch to it' : 'Back to the live site' }</Button>{ ' ' }
        <Button variant="tertiary" onClick={ () => redraw( ( n ) => n + 1 ) }>Refresh</Button>
      </p>
      <p className="fwp-muted">
        On this server: { s.uploads.filter( ( u ) => u.onDisk ).length } · in storage: { s.uploads.filter( ( u ) => u.record ).length } · running: { s.running || 'no' } · jobs waiting: { s.jobs.filter( ( j ) => j.status === 'pending' ).length }
        <br />
        live-bucket holds { s3[ 'live-bucket' ].size } files · new-bucket holds { s3[ 'new-bucket' ].size } · live site's uploads in storage: { sites[ 'example.com' ].uploads.filter( ( u ) => u.record && s3[ u.record.bucket ].has( u.record.key ) ).length } of { sites[ 'example.com' ].uploads.filter( ( u ) => u.record ).length } still there
      </p>
      { Object.keys( s.failed ).length > 0 && ! s.running && (
        <ul className="fwp-failed">{ Object.entries( s.failed ).map( ( [ id, why ] ) => <li key={ id }>photo-{ id }.jpg ({ why })</li> ) }</ul>
      ) }
      <ol className="fwp-log">{ log.map( ( line, i ) => <li key={ i }>{ line }</li> ) }</ol>
    </div>
  );
};

document.head.insertAdjacentHTML( 'beforeend', '<style>.fwp-log li,.fwp-failed li{font-size:13px;margin-bottom:4px}.fwp-muted{color:#757575}.fwp-failed{color:#b32d2e}</style>' ); // Added so this runs on its own
createRoot( document.getElementById( 'forumwp-root' ) ).render( <Demo /> );
