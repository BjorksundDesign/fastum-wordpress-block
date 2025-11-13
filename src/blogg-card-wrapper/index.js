import { registerBlockType } from '@wordpress/blocks';
import metadata from './block.json';
import Edit from './edit';
import './editor.scss';

registerBlockType(metadata.name, {
    edit: Edit,
    supports: {
		align: true,
		anchor: true,
		typography: {
        // Declare support for block's text alignment.
        // This adds support for all the options:
        // left, center, right.
        textAlign: true
    }
	}
});