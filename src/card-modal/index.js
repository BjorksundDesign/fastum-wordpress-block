import { registerBlockType } from '@wordpress/blocks';
import './style.scss';
import Edit from './edit';
import save from './save';
import metadata from './block.json';
import Icon from './attributes/fastum-f.svg';

registerBlockType(metadata.name, {
    /**
     * Block icon
     * @see ./attributes/text-wrapper-icon.svg
     */
    icon: {
        src: <img src={Icon} alt="Block Icon" />
    },

        __experimentalLabel: ( attributes ) => {
        
        const modalType = attributes?.modalType || 'default';
        const metaData = attributes?.metadata || {};
        console.log('index.js', metaData.name);
        
            
        if (metaData.name !== '' && metaData.name !== undefined) {
            return metaData.name;
        }

        if (attributes?.isFaq === true) {
            return 'FAQ';
        }
        
        if (modalType === 'dropdown') {
            return 'Dropdown';
        }

        if (modalType === 'cards') {
            return 'Cards';
        }

        if (modalType === 'hero') {
            return 'Hero';
        }

        if (modalType === 'columns') {
            return 'Columns';
        }

        if (modalType === 'lime-form') {
            return 'lime-form';
        }


        return 'Fastum block';
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
        },
      
        },
     innerBlocks: {
        // Define what inner blocks are allowed
        allowedBlocks: ['core/paragraph', 'core/image'], // Example: Allow paragraphs and images
        template: [ // Optional: Define a default template for inner blocks
            ['core/paragraph', { placeholder: 'Enter text...' }],
            ['core/image']
        ],
    },
    edit: Edit, // Component for editing the block in the editor.
    save,  // Component for saving the block's content.
    
});
