import { registerBlockType } from '@wordpress/blocks';
import './style.scss';
import Edit from './edit';
import save from './save';
import metadata from './block.json';
import Icon from './attributes/hero-modal-icon.svg';

registerBlockType( metadata.name, {
	/**
	 * @see ./edit.js
	 */
	icon: {
			src: <img src={Icon} alt="Block Icon" />
		},
	supports: {
		align: true,
		anchor: true,
		typography: {
        // Declare support for block's text alignment.
        // This adds support for all the options:
        // left, center, right.
        textAlign: true
    },
	background: {
        backgroundImage: true, // Enable background image control.
        backgroundSize: true // Enable background image + size control.
    }
	},
	edit: Edit, // Component for editing the block in the editor.
	save,  // Component for saving the block's content.
} );
