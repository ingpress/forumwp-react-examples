// @id 36.2
// @title A step editor that draws its "otherwise" list by calling itself
// @section 36.7
// @click Otherwise, add: Send an email
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button } from '@wordpress/components'; // Added so this runs on its own

// Added so this runs on its own: a small catalog (the server sends it in ForumWP Pro) and blankStep().
const cat = {
  steps: {
    message: { label: 'Send a message' },
    wait: { label: 'Wait 3 days' },
    condition: { label: 'Only if they have not posted' },
    email: { label: 'Send an email' },
    badge: { label: 'Give a badge' },
  },
};
const newStepId = () => 's' + Math.random().toString( 36 ).slice( 2, 10 );
const blankStep = ( type ) => ( { id: newStepId(), type, ...( type === 'condition' ? { else: [] } : {} ) } );

const move = ( list, from, by ) => {
  const to = from + by;
  if ( to < 0 || to >= list.length ) {
    return list;
  }
  const next = [ ...list ];
  [ next[ from ], next[ to ] ] = [ next[ to ], next[ from ] ];

  return next;
};

const insertAt = ( list, at, item ) => [ ...list.slice( 0, at ), item, ...list.slice( at ) ];

// Added so this runs on its own: a much smaller StepCard and Join than the real ones.
const StepCard = ( { step, index, count, catalog, nested, onMove, onRemove, renderElse } ) => (
  <div className="fwp-card" style={ { marginLeft: nested ? 24 : 0 } }>
    <strong>{ catalog.steps[ step.type ]?.label ?? 'This kind of step is no longer available' }</strong>
    <span className="fwp-muted"> ({ step.id })</span>
    <div className="fwp-row">
      <Button size="small" disabled={ index === 0 } onClick={ () => onMove( -1 ) }>Up</Button>
      <Button size="small" disabled={ index === count - 1 } onClick={ () => onMove( 1 ) }>Down</Button>
      <Button size="small" isDestructive onClick={ onRemove }>Remove</Button>
    </div>
    { step.type === 'condition' && (
      <div>
        <p className="fwp-muted">Otherwise:</p>
        { renderElse() }
      </div>
    ) }
  </div>
);
// Only one level of "otherwise": a condition can't go inside one.
const Join = ( { catalog, nested, onAdd } ) => (
  <div className="fwp-row" style={ { marginLeft: nested ? 24 : 0 } }>
    { Object.keys( catalog.steps )
      .filter( ( type ) => ! nested || type !== 'condition' )
      .map( ( type ) => (
        <Button key={ type } size="small" variant="link" onClick={ () => onAdd( blankStep( type ) ) }>
          { nested ? 'Otherwise, add: ' : 'Add: ' }
          { catalog.steps[ type ].label }
        </Button>
      ) ) }
  </div>
);

const Editor = () => {
  const [ form, setForm ] = useState( () => ( {
    title: 'Nudge new members',
    steps: [ blankStep( 'message' ), blankStep( 'wait' ), blankStep( 'condition' ), blankStep( 'badge' ) ],
  } ) );
  const change = ( next ) => setForm( ( f ) => ( { ...f, ...next } ) );
  const setSteps = ( steps ) => change( { steps } );

  const renderSteps = ( steps, onChange, nested = false ) =>
    steps.map( ( step, i ) => (
      <div key={ step.id } className="fwp-flow__item">
        <StepCard
          step={ step }
          index={ i }
          count={ steps.length }
          catalog={ cat }
          nested={ nested }
          onMove={ ( by ) => onChange( move( steps, i, by ) ) }
          onRemove={ () => onChange( steps.filter( ( s ) => s.id !== step.id ) ) }
          renderElse={ () => (
            <>
              { renderSteps(
                step.else,
                ( others ) => onChange( steps.map( ( s ) => ( s.id === step.id ? { ...s, else: others } : s ) ) ),
                true
              ) }
              { step.else.length === 0 && (
                <Join
                  catalog={ cat }
                  nested
                  onAdd={ ( added ) => onChange( steps.map( ( s ) => ( s.id === step.id ? { ...s, else: [ added ] } : s ) ) ) }
                />
              ) }
            </>
          ) }
        />
        <Join catalog={ cat } nested={ nested } onAdd={ ( added ) => onChange( insertAt( steps, i + 1, added ) ) } />
      </div>
    ) );

  return (
    <div style={ { display: 'grid', gap: 8, maxWidth: 560 } }>
      { renderSteps( form.steps, setSteps ) }
      <p>What would be saved:</p>
      <pre style={ { fontSize: 12, whiteSpace: 'pre-wrap' } }>
        { JSON.stringify( form.steps.map( ( s ) => ( s.else ? { type: s.type, id: s.id, else: s.else.map( ( o ) => o.type ) } : { type: s.type, id: s.id } ) ), null, 1 ) }
      </pre>
    </div>
  );
};

createRoot( document.getElementById( 'forumwp-root' ) ).render( <Editor /> );
