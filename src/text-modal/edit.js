import { __ } from '@wordpress/i18n';
import { InspectorControls, RichText, useBlockProps, useSetting, LinkControl, ColorPalette, MediaUpload, MediaUploadCheck } from '@wordpress/block-editor';
import { Panel, PanelBody, PanelRow, Button, Icon, TextControl, ToggleControl, SelectControl, Toolbar, ToolbarButton } from '@wordpress/components';
import { Fragment } from '@wordpress/element';
import './editor.scss';
import { useEffect, useState } from '@wordpress/element';
import { Image } from "@10up/block-components"; 
import { TextModalInspector, TextModalRender } from '../shared/components/text-modal';
import { ColorPickerRow } from '../shared/components/color-icon-picker';
import { ImageModalInspector, ImageModalRender } from '../shared/components/image-modal';

export default function Edit(props) {
    const { attributes, setAttributes } = props;
    const { items, backgroundColor, image, columnOrder, faIconColor,faIcon, faIconRaw, textAlign } = attributes;
    
    
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


    useEffect(() => {
        if (!items) {
            setAttributes({ items: [] });
        }        
       
    }, [items, setAttributes]);


    const DEFAULT_FA_ICON = '"\\f00c"'; // Escaped for CSS content
    const DEFAULT_FA_ICON_COLOR = 'red';

    const addItem = (type) => {
        const currentCount = items.filter(item => item.type === type).length + 1; // Increment count
        const isFirstHeadingCheck = type === 'heading' && items.filter(item => item.type === 'heading').length === 0;
        updateFaIcon("f00c")


        const newItem = { 
            id: Date.now(), 
            type: type, 
            text: '',
            list: ["Item 1", "Item 2", "Item 3"],
            url: '', 
            isPrimary: true, 
            showRawText: true,
            icon: DEFAULT_FA_ICON,
            iconColor: DEFAULT_FA_ICON_COLOR,
            size: isFirstHeadingCheck ? 'l' : 's', 
            count: currentCount, 
            headingType: isFirstHeadingCheck ? 'h2' : 'h3' // First heading is h2, others start as h3
        };         
        setAttributes({ items: [...items, newItem] });
    };

    const toggleColumnOrder = () => {
        setAttributes({ columnOrder: !columnOrder });
    };

    const handleImageUpload = (item, media) => {
        setAttributes({ image: media });
    };

      const GLOBAL_TM_ID = 'global';
  const [openTextModals, setOpenTextModals] = useState({}); // { [id: string]: boolean }
  const isTextModalOpen = (id) => !!openTextModals[id];

    const updateFaIcon = (newText) => {
        setAttributes({ faIcon: `"\\${newText}"` }); // Set the attribute
        setAttributes({ faIconRaw: newText }); // Set the attribute
    };

    const faIconStyle = {
        '--faIcon': faIcon,
        '--iconColor': faIconColor
    }

    const toggleTextModal = (id, event) => {
    event?.stopPropagation?.();
    setOpenTextModals(prev => (prev[id] ? {} : { [id]: true }));
  };

     const stopPropagation = (event) => {
        event.stopPropagation(); // Prevent the click from propagating to the parent
    };

     const widthOptions = [
    { label: 'Full', value: '100%' },
    { label: 'Half', value: '50%' },
  ];

     const imageSizingOptions = [
    { label: 'Cover', value: 'cover' },
    { label: 'Contain', value: 'contain' },
  ];

     const imageAspectOptions = [
    { label: '3/2', value: '3/2' },
    { label: '2/3', value: '2/3' },
    { label: 'None', value: 'none' },
  ];

    return (
        <div className="text-modal-wrapper" {...useBlockProps({ style: { ...faIconStyle,  backgroundColor }, className: `align-${textAlign}` })}>
            <InspectorControls>
                    <PanelBody 
                        title={
                            <>
                                <span className='grid panel-body-span'>
                                    {/* <span className='chevron-icon'/> */}
                                    Text Modal
                                    <span className={`plus-icon ${isTextModalOpen(GLOBAL_TM_ID) ? 'true' : 'false'}`} onClick={(e) => toggleTextModal(GLOBAL_TM_ID, e)} style={{ cursor: 'pointer' }} />
                                </span>
                                {isTextModalOpen(GLOBAL_TM_ID) && (
                                    <div className="text-inspector-menu" onClick={stopPropagation}  >
                                    <TextModalInspector
                                        readItems={() => attributes.items}                      
                                        writeItems={(newItems) => setAttributes({ items: newItems })}
                                        enable={['headingmenu', 'paragraphmenu', 'listmenu', 'buttonmenu']}
                                        updateCard={(color) => setAttributes({ backgroundColor: color })}
                                        context={{ scope: 'global' }}
                                        
                                        />
                                    </div>
                                )}
                            </>
                        } 
                        onClick={stopPropagation}
                        className="panel-body"
                        initialOpen

                        >
                        <PanelRow className="grid grid-2-button inspector-row">
                            {/* <ToggleControl
                                label="Invert column order"
                                checked={columnOrder}
                                onChange=
                                {toggleColumnOrder}
                                /> */}
                            Column order:
                            <Button className="inspector-button" onClick={toggleColumnOrder} disabled={columnOrder===true} aria-label="Normal order">Normal</Button>
                            <Button className="inspector-button" onClick={toggleColumnOrder} disabled={columnOrder===false} aria-label="Invert order">Inverted</Button>
                        </PanelRow>
                         <PanelRow className="grid grid-2-button inspector-row">
                Image sizing:
                {imageSizingOptions.map(option => (
                    <Button 
                        key={option.value} 
                        className="inspector-button" 
                        onClick={() => setAttributes({ imageSize: option.value })} // Update image size attribute
                        disabled={attributes.imageSize === option.value} 
                        aria-label={`Image sizing ${option.label}`}>
                        {option.label}
                    </Button>                    
                ))}
            </PanelRow>
            <PanelRow className="grid grid-3-button inspector-row">
                Image aspect:
                {imageAspectOptions.map(option => (
                    <Button 
                        key={option.value} 
                        className="inspector-button" 
                        onClick={() => setAttributes({ imageAspect: option.value })} // Update image aspect attribute
                        disabled={attributes.imageAspect === option.value} 
                        aria-label={`Image aspect ${option.label}`}>
                        {option.label}
                    </Button> 
                ))}
            </PanelRow>
            <PanelRow className="grid grid-2-button inspector-row">
                Image width:
                {widthOptions.map(option => {
                  switch (option.label) {
                    case 'Full':
                      return(
                      <Button 
                          key={option.value} 
                          className="inspector-button" 
                          onClick={() => setAttributes({ imageWidth: option.value })} // Update image aspect attribute
                          disabled={attributes.imageWidth === option.value} 
                          aria-label={`Image aspect ${option.label}`}>
                          {option.label}
                      </Button> 
                      ) 
                    case 'Half':
                      return(
                        <TextControl
                          className="panel-control-settings inspector-button input"
                          value={attributes.imageWidth ?? '50%'}
                          onChange={(v) => {
                            // Use a regular expression to check if the input is a valid number
                            const numericValue = v.replace(/[^0-9]/g, '');
                            setAttributes({ imageWidth: (numericValue+'%') });
                          }}
                        />
                      )                    
                  }
                })}
            </PanelRow>
                    <ImageModalInspector imageTitle="Column Image" attributes={attributes} item={attributes} onChange={handleImageUpload}/>
                    <TextModalInspector
                        readItems={() => attributes.items}                      
                        writeItems={(newItems) => setAttributes({ items: newItems })}
                        enable={['heading', 'paragraph', 'list', 'button', 'color', 'image', 'imagemenu']} 
                        initialBackgroundColor={attributes.backgroundColor}
                        updateCard={(color) => setAttributes({ backgroundColor: color })}
                        context={{ scope: 'global' }} 
                        attributes={attributes} 
                    />
                    </PanelBody>
            </InspectorControls>
            <article className={`text-modal-article ${image ? "two-columns" : "oneColumn"} ${columnOrder ? "invert" : ""}`}>
                <section className={`text-modal-section ${columnOrder ? "invertOrder" : ""}`}>
                    <TextModalRender
                        readItems={() => attributes.items}
                        writeItems={(newItems) => setAttributes({ items: newItems })}
                        backgroundColor={attributes.backgroundColor}
                        enable={['heading', 'paragraph', 'list', 'button']}
                        attributes={attributes}
                        context={{ scope: 'global' }}
                    />
                </section>
                {image &&
                    <section className="image-modal-section">
                        <div className="image-container">
                            <ImageModalRender attributes={attributes} item={attributes} onChange={handleImageUpload}/>
                        </div>
                    </section>
                }
            </article>
        </div>
    );
}
