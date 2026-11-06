// @id 33.1
// @title One Edit component for every block, made from block.json
// @section 33.1
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import { Disabled, PanelBody, RangeControl, ToggleControl, TextControl } from '@wordpress/components'; // Added so this runs on its own
import { __ } from '@wordpress/i18n'; // Added so this runs on its own

// Added so this runs on its own: the editor isn't here, so these stand in for WordPress's.
// InspectorControls normally puts its children in the sidebar; here it draws them in a box.
const InspectorControls = ( { children } ) => <aside className="fwp-card" style={ { background: '#f6f7f7' } }>{ children }</aside>;
const useBlockProps = () => ( { className: 'wp-block' } );
const blocks = [];
const registerBlockType = ( name, settings ) => blocks.push( { name, ...settings } );
// ServerSideRender asks PHP's render_callback for the HTML. A pretend render_topics() does it here,
// drawing as a visitor would see it (the editor preview is a REST request).
const renderTopics = ( a ) =>
  `${ a.heading ? `<h${ a.level }>${ a.heading }</h${ a.level }>` : '' }` +
  ( a.tabs ? '<p><a href="#">Latest</a> · <a href="#">Unanswered</a> · <a href="#">Solved</a></p>' : '' ) +
  '<ul>' + Array.from( { length: a.count }, ( _, i ) => `<li>Topic ${ i + 1 } by Ada</li>` ).join( '' ) + '</ul>';
const ServerSideRender = ( { attributes } ) => <div dangerouslySetInnerHTML={ { __html: renderTopics( attributes ) } } />;

// Added so this runs on its own: blocks/topics/block.json (part of it).
const topics = {
  name: 'forumwp/topics',
  title: 'Community topics',
  attributes: {
    count: { type: 'number', default: 5 },
    tabs: { type: 'boolean', default: false },
    heading: { type: 'string', default: '' },
    level: { type: 'number', default: 2 },
  },
};

// Every ForumWP block is drawn by PHP; the editor shows that same output.
const preview = ( name, attributes ) => (
  <Disabled>
    <ServerSideRender block={ name } attributes={ attributes } />
  </Disabled>
);

const register = ( metadata, controls ) => {
  const Edit = ( { attributes, setAttributes } ) => {
    const set = ( key ) => ( value ) => setAttributes( { [ key ]: value } );

    return (
      <div { ...useBlockProps() }>
        <InspectorControls>
          <PanelBody title={ __( 'Settings', 'forumwp' ) }>{ controls( attributes, set ) }</PanelBody>
        </InspectorControls>
        { preview( metadata.name, attributes ) }
      </div>
    );
  };
  registerBlockType( metadata.name, { ...metadata, edit: Edit } );
};

register( topics, ( attributes, set ) => (
  <>
    <TextControl __next40pxDefaultSize __nextHasNoMarginBottom label="Heading" value={ attributes.heading } onChange={ set( 'heading' ) } />
    <RangeControl __next40pxDefaultSize __nextHasNoMarginBottom label="Topics to show" min={ 1 } max={ 20 } value={ attributes.count } onChange={ set( 'count' ) } />
    <ToggleControl __nextHasNoMarginBottom label="Show as tabs" checked={ attributes.tabs } onChange={ set( 'tabs' ) } />
  </>
) );

// Added so this runs on its own: what the editor does with a registered block. It fills in the
// defaults from block.json, keeps the attributes, and draws Edit with them.
const EditorCanvas = ( { block } ) => {
  const defaults = Object.fromEntries( Object.entries( block.attributes ).map( ( [ k, v ] ) => [ k, v.default ] ) );
  const [ attributes, setAll ] = useState( defaults );
  const setAttributes = ( changes ) => setAll( ( a ) => ( { ...a, ...changes } ) );
  const { edit: Edit } = block;

  return (
    <div style={ { display: 'grid', gap: 12, maxWidth: 520 } }>
      <Edit attributes={ attributes } setAttributes={ setAttributes } />
      <p>What the post saves:</p>
      <code>{ `<!-- wp:${ block.name } ${ JSON.stringify( Object.fromEntries( Object.entries( attributes ).filter( ( [ k, v ] ) => v !== defaults[ k ] ) ) ) } /-->` }</code>
    </div>
  );
};

createRoot( document.getElementById( 'forumwp-root' ) ).render( <EditorCanvas block={ blocks[ 0 ] } /> );
