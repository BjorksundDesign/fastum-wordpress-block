import { registerBlockType } from '@wordpress/blocks';
import './style.scss';
import Edit from './edit';
import save from './save';
import metadata from './block.json';
import Icon from './attributes/text-wrapper-icon.svg';

registerBlockType(metadata.name, {
    /**
     * Block icon
     * @see ./attributes/text-wrapper-icon.svg
     */
    icon: {
        src: <img src={Icon} alt="Block Icon" />
    },
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
