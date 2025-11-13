import { __ } from '@wordpress/i18n';
import { InspectorControls, RichText, useBlockProps, LinkControl } from '@wordpress/block-editor';
import { Panel, PanelBody, PanelRow, Button, TextControl, ToggleControl, SelectControl } from '@wordpress/components';
import './editor.scss';
import { useEffect, useState } from '@wordpress/element';
import { TextModalInspector, TextModalRender } from '../shared/components/text-modal';


export default function Edit(props) {
    const { attributes, setAttributes } = props;
    const { items } = attributes;
    const [isTextModalOpen, setTextModalOpen] = useState(false);
    const [isOpen, setIsOpen] = useState(true); // Keeps the panel open

    useEffect(() => {
        if (!items) {
            setAttributes({ items: [] });
        }
    }, [items, setAttributes]);

    useEffect(() => {
        if (!attributes.items || attributes.items.length === 0) {
            const initialItems = [
            {
                id: Date.now(),
                type: 'heading',
                text: '',
                list: ['Item 1', 'Item 2', 'Item 3'],
                url: '',
                isPrimary: true,
                showRawText: true,
                icon: '',
                iconColor: '',
                size: 'l',
                count: 1,
                headingType: 'h2'
            },
            {
                id: Date.now() + 1,
                type: 'paragraph',
                text: '',
                list: ['Item 1', 'Item 2', 'Item 3'],
                url: '',
                isPrimary: true,
                showRawText: true,
                icon: '',
                iconColor: '',
                size: 'l',
                count: 1,
                headingType: 'h3'
            },
            {
                id: Date.now() + 2,
                type: 'button',
                text: '',
                list: ['Item 1', 'Item 2', 'Item 3'],
                url: '',
                isPrimary: true,
                showRawText: true,
                icon: '',
                iconColor: '',
                size: 'l',
                count: 1,
                headingType: 'h3'
            }
            ];
            setAttributes({ items: initialItems });
        }
        }, []);

    const toggleTextModal = (event) => {
            event.stopPropagation(); // Prevent the click from propagating to the parent
            setTextModalOpen(!isTextModalOpen); // Toggle modal visibility
        };

    const updateItemText = (id, newText) => {
        const updatedItems = items.map(item => item.id === id ? { ...item, text: newText } : item);
        setAttributes({ items: updatedItems });
    };

    return (
        <div className="heroWrapper" {...useBlockProps()}>
            {/* <InspectorControls>
                <Panel>
                    <PanelBody title={__('Block settings')}>
                        <PanelRow>
                            <Button 
                                primary
                                onClick={() => addItem('heading')}
                            >
                                Add heading
                            </Button>
                        </PanelRow>
                        <PanelRow>
                            <Button 
                                primary
                                onClick={() => addItem('paragraph')}
                            >
                                Add paragraph
                            </Button>
                        </PanelRow>
                        <PanelRow>
                            <Button 
                                primary
                                onClick={() => addItem('button')}
                            >
                                Add button
                            </Button>
                        </PanelRow>
                        {items.map((item, index) => (
                            <PanelBody key={item.id}>
                                <PanelRow>
                                    {(() => {
                                        switch (item.type) {
                                            case 'heading':
                                                return (
                                                    <div>
                                                        <TextControl
                                                            label={`Heading ${item.count}`} // Display count
                                                            value={item.text}
                                                            onChange={(newText) => updateItemText(item.id, newText)}
                                                        />
                                                        <SelectControl
                                                            label="Heading Size"
                                                            value={item.size}
                                                            options={[
                                                                { label: 'XL', value: 'xl' },
                                                                { label: 'L', value: 'l' },
                                                                { label: 'M', value: 'm' },
                                                                { label: 'S', value: 's' },
                                                            ]}
                                                            onChange={(newSize) => updateHeadingSize(item.id, newSize)}
                                                        />
                                                    </div>
                                                );
                                            case 'paragraph':
                                                return (
                                                    <TextControl
                                                        label={`Paragraph ${item.count}`} // Display count
                                                        value={item.text}
                                                        onChange={(newText) => updateItemText(item.id, newText)}
                                                    />
                                                );
                                            case 'button':
                                                return (
                                                    <div>
                                                        <TextControl
                                                            label={`Button ${item.count}`} // Display count
                                                            value={item.text}
                                                            onChange={(newText) => updateItemText(item.id, newText)}
                                                        />
                                                        <PanelRow label="Button URL" className="panelRow">
                                                            <LinkControl
                                                                className="linkLinkControl"
                                                                label="Button URL"
                                                                value={item.url}
                                                                onChange={(newUrl) => updateButtonUrl(item.id, newUrl)}
                                                            />
                                                        </PanelRow>
                                                        <ToggleControl
                                                            label="Primary Style"
                                                            checked={item.isPrimary}
                                                            onChange={() => toggleButtonStyle(item.id)}
                                                        />
                                                    </div>
                                                );
                                            default:
                                                return null; // Handle unknown item types
                                        }
                                    })()}
                                </PanelRow>
                                <PanelRow>
                                    <Button 
                                        onClick={() => moveItemUp(item.id)}
                                        disabled={items[0]?.id === item.id}
                                    >
                                        ↑
                                    </Button>
                                    <Button 
                                        onClick={() => moveItemDown(item.id)}
                                        disabled={items[items.length - 1]?.id === item.id}
                                    >
                                        ↓
                                    </Button>
                                    <Button 
                                        isDestructive 
                                        onClick={() => removeItem(item.id)}
                                    >
                                        x
                                    </Button>
                                </PanelRow>
                            </PanelBody>
                        ))}
                    </PanelBody>
                </Panel>
            </InspectorControls> */}
             <InspectorControls>
                <Panel>
                    <PanelBody 
                        title={
                            <>
                                <span className='grid panel-body-span'>
                                    {/* <span className='chevron-icon'/> */}
                                    Hero Modal
                                    <span className={`plus-icon ${isTextModalOpen}`} onClick={toggleTextModal} style={{ cursor: 'pointer' }} />
                                </span>
                            </>
                        } 
                        initialOpen
                        className="panel-body">
                        {isTextModalOpen && (
                            <div className="text-inspector-menu">
                            <TextModalInspector
                                readItems={() => attributes.items}                      
                                writeItems={(newItems) => setAttributes({ items: newItems })}
                                enable={['headingmenu', 'paragraphmenu', 'buttonmenu']}
                                updateCard={(color) => setAttributes({ backgroundColor: color })}
                                context={{ scope: 'global' }}  
                                />
                            </div>
                        )}
                    <TextModalInspector
                        readItems={() => attributes.items}                      
                        writeItems={(newItems) => setAttributes({ items: newItems })}
                        enable={['heading', 'paragraph', 'button']} 
                        initialBackgroundColor={attributes.backgroundColor}
                        updateCard={(color) => setAttributes({ backgroundColor: color })}
                        context={{ scope: 'global' }}  
                    />
                    </PanelBody>
                </Panel>
            </InspectorControls>
            <section className="hero-modal-section">
                <div role="text-wrapper" className="text-wrapper">
                    {items.map((item, index) => {
                        switch (item.type) {
                            case 'heading':
                                return (
                                    <RichText
                                        tagName='h1'
                                        className={`heading ${item.size}`} // Apply the selected size class
                                        value={item?.text || `Heading ${item.count}`} // Display count
                                        onChange={(newText) => updateItemText(item.id, newText)}
                                        key={item.id}
                                        inlineToolbar
                                    />
                                );
                            case 'paragraph':
                                return (
                                    <RichText
                                        tagName='p'
                                        className='paragraph'
                                        value={item?.text || `Paragraph ${item.count}`} // Display count
                                        onChange={(newText) => updateItemText(item.id, newText)}
                                        key={item.id}
                                        inlineToolbar
                                    />
                                );
                            default:
                                return null; // Handle unknown item types
                        }
                    })}
                </div>
                <div role="button-wrapper" className={`button-wrapper ${attributes.align}`}>
                    {items.map(item => {
                        switch (item.type) {
                            case 'button':
                                return (
                                    <button 
                                        key={item.id}
                                        className={`${item.isPrimary ? 'button-primary' : 'button-secondary'} wp-block-button fastum-button ${attributes.align}`}
                                        onClick={() => window.open(item.url, '_blank')} // Open URL in a new tab
                                        disabled
                                    >
                                        <RichText
                                            tagName='p'
                                            label={'Button Text'}
                                            // style={item.isPrimary ? {} : { backgroundColor: buttonStyle, color: buttonStyle === 'black' ? 'white' : 'black' }}
                                            value={item?.text || `Button ${item.count}`} // Display count
                                            onChange={(newText) => updateItemText(item.id, newText)}
                                            className={`wp-block-button__link ${item.isPrimary ? 'button-primary' : 'button-secondary'}`}
                                            inlineToolbar
                                        />
                                    </button>
                                );
                            default:
                                return null; // Handle unknown item types
                        }
                    })}
                </div>
            </section>
        </div>
    );
}
