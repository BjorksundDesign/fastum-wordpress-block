import { __ } from '@wordpress/i18n';
import { useState, useEffect, useMemo } from '@wordpress/element';
import {
    PanelBody,
    PanelRow,
    Button,
    TextControl,
    Panel,
} from '@wordpress/components';
import { RichText, MediaUpload } from '@wordpress/block-editor';
import { TextModalInspector, TextModalRender } from '../text-modal/text-modal'; // Import the existing TextModal for rendering content

const newId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

const addItem = (items) => ({
    id: newId(),
    title: 'New FAQ Title',
    content: [],
    isOpen: false,
});

const updateItem = (items, id, patch) => 
    items.map((item) => (item.id === id ? { ...item, ...patch } : item));

const removeItem = (items, id) => items.filter((item) => item.id !== id);

export function DropDownModalInspector({ readItems, writeItems, attributes }) {
    const [items, setItems] = useState(readItems() || []);

    useEffect(() => {
        writeItems(items);
    }, [items, writeItems]);

    const addNewItem = () => {
        setItems((prevItems) => [...prevItems, addItem(prevItems)]);
    };

    return (
        <Panel title={__('FAQ Items')}>
            <PanelRow>
                <Button onClick={addNewItem}>
                    {__('Add FAQ Item')}
                </Button>
            </PanelRow>
            {items.map((item) => (
                <PanelBody title='Faq item N'>
                    <div key={item.id} className="faq-item">
                            <TextModalInspector
                                readItems={() => item.content}
                                writeItems={(nextItems) =>
                                    setItems(updateItem(items, item.id, { content: nextItems }))
                                }
                                attributes={attributes}
                                backgroundColor={attributes.backgroundColor}
                                onChangeBackgroundColor={(c) => setAttributes({ backgroundColor: c })}
                                context={{ scope: 'global' }}   // kan du använda internt om du vill
                                />
                    </div>
                </PanelBody>
            ))}
        </Panel>
    );
}

export function DropDownModalRender({ readItems, className, attributes }) {
    const items = readItems() || [];

    return (
        <div className={`faq-modal-render ${className}`}>
            {items.map((item) => (
                <section
              key={item.id}
              className={`faq-item ${attributes.align}`}
              style={{ backgroundColor: item.backgroundColor }}
              >
                    <div className="faq-content">
                        <TextModalRender
                            readItems={() => item.content}
                            writeItems={() => {}}
                            backgroundColor={attributes.backgroundColor}
                            attributes={attributes}
                            context={{ scope: 'global' }}
                        />
                    </div>
                </section>
            ))}
        </div>
    );
}
