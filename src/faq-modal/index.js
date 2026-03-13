import { registerBlockType } from '@wordpress/blocks';
import './style.scss';
import Edit from './edit';
import save from './save';
import metadata from './block.json';

registerBlockType(metadata.name, {

    supports: {
        align: true,
        anchor: true,
        typography: {
            // Declare support for block's text alignment.
            textAlign: true // Support for left, center, right alignment.
        },
        background: {
            backgroundImage: true, // Enable background image control.
            backgroundSize: true,   // Enable background size control.
            backgroundColor: true   // Enable background color control.
        }
    },
    edit: Edit, // Component for editing the block in the editor.
    save,  // Component for saving the block's content.
});
