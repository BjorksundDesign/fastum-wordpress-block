import { RichText } from '@wordpress/block-editor';
import { Fragment } from '@wordpress/element';

const Save = ({ attributes }) => {
    const { items, align, backgroundColor } = attributes;

    return (
        <article className={`text-modal-article`} style={{ backgroundColor: backgroundColor }}>
            <section clssName="text-modal-section">
                <div className="text-wrapper">
                        {items.map((item) => {
                            switch (item.type) {
                                case 'heading':
                                    return (
                                        <RichText.Content
                                            key={item.id}
                                            tagName={item.headingType}
                                            className={`heading ${item.size} ${attributes.align}` }
                                            value={item.text ?? ''}
                                        />
                                    );

                                case 'paragraph':
                                    return (
                                        <RichText.Content
                                            key={item.id}
                                            tagName="p"
                                            className="paragraph"
                                            value={item.text}
                                        />
                                    );

                                case 'list':
                                    return (
                                        <ul key={item.id} className="text-modal-ul">
                                            {item.list.map((li, idx) => (
                                                <li key={`${item.id}_${idx}`} className="list">
                                                    {li}
                                                </li>
                                            ))}
                                        </ul>
                                    );

                                case 'image':
                                    return (
                                        <div key={item.id} className="image-wrapper">
                                            <img src={item.image} alt={item.text} className={`text-modal-img ${attributes.imageAspectRatio} ${attributes.imageSizing} ${attributes.imageWidth}`}/>
                                        </div>
                                    );

                                default:
                                    return null;
                            }
                        })}        
                </div>
            </section>
        </article>
    );
};

export default Save;
