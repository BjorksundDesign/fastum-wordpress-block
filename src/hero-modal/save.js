import { RichText } from '@wordpress/block-editor';

export default function save({ attributes }) {
    const { items } = attributes;

    return (
        <div className="heroWrapper">
            <section className="hero-modal-section">
                <div role="text-wrapper" className="text-wrapper">
                    {items.map((item) => {
                        switch (item.type) {
                            case 'heading':
                                return (
                                    <RichText.Content
                                        tagName={item.size === 'xl' ? 'h1' : item.size === 'l' ? 'h2' : item.size === 'm' ? 'h3' : 'h4'}
                                        className={`heading ${item.size}`}
                                        value={item.text}
                                        key={item.id}
                                    />
                                );
                            case 'paragraph':
                                return (
                                    <RichText.Content
                                        tagName="p"
                                        className="paragraph"
                                        value={item.text}
                                        key={item.id}
                                    />
                                );
                            default:
                                return null; // Handle unknown item types
                        }
                    })}
                </div>
                <div role="button-wrapper">
                    {items.map(item => {
                        if (item.type === 'button') {
                            return (
                                <button 
                                    key={item.id}
                                    className={`${item.isPrimary ? 'button-primary' : 'button-secondary'} wp-block-button fastum-button`}
                                    onClick={() => window.open(item.url, '_blank')} // Open URL in a new tab
                                >
                                    <RichText.Content
                                        tagName="p"
                                        value={item.text}
                                        className='wp-block-button__link'
                                    />
                                </button>
                            );
                        }
                        return null; // Handle unknown item types
                    })}
                </div>
            </section>
        </div>
    );
}
