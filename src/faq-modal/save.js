// save.js
import { useBlockProps, RichText } from '@wordpress/block-editor';

export default function save({ attributes }) {
  const {
    items = [],
    cards = [],
    backgroundColor,
    faIcon,
    faIconColor,
    align,
    cardBorder,
  } = attributes;

  return (
    <div
      {...useBlockProps.save({
        className: 'cards-wrapper',
        style: {
          backgroundColor: backgroundColor,
          '--faIcon': faIcon,
          '--iconColor': faIconColor,
        },
      })}
    >
      <article className="faq-modal-article article">
        {/* Global content */}
        <section className="faq-modal-section">
          {items.map((item, index) => {
            switch (item.type) {
              case 'heading':
                return (
                  <RichText.Content
                    key={index}
                    tagName={item.headingType || 'h2'}
                    className={`heading ${item.size || ''}`}
                    value={item.text}
                  />
                );
              case 'paragraph':
                return (
                  <RichText.Content
                    key={index}
                    tagName="p"
                    className="paragraph"
                    value={item.text}
                  />
                );
              case 'list':
                return (
                  <ul key={index} className="list">
                    {(item.list || []).map((li, liIndex) => (
                      <li key={liIndex}>{li}</li>
                    ))}
                  </ul>
                );
              case 'button':
                return (
                  <a
                    key={index}
                    href={item.url || '#'}
                    className={`btn ${item.isPrimary ? 'is-primary' : 'is-secondary'}`}
                  >
                    {item.text || 'Button'}
                  </a>
                );
              default:
                return null;
            }
          })}
        </section>

        {/* Cards */}
        <div className="faq-grid">
          {cards.map((card, cIndex) => {
            const cardItems = card.items || [];
            return (
              <details
                key={card.id || cIndex}
                className={`accordion-card ${align || ''} ${cardBorder || ''}`}
                style={{ backgroundColor: card.backgroundColor }}
              >
                <summary className="accordion-card__summary">
                  {/* För SEO: visa första headingen eller fallback */}
                  {cardItems.find((it) => it.type === 'heading') ? (
                    <RichText.Content
                      tagName={cardItems.find((it) => it.type === 'heading').headingType || 'h2'}
                      value={cardItems.find((it) => it.type === 'heading').text || 'Untitled'}
                      className="heading"
                    />
                  ) : (
                    <h2 className="heading">Untitled</h2>
                  )}
                </summary>

                <div className="accordion-card__content">
                  {cardItems
                    .filter((it) => it.type !== 'heading')
                    .map((item, i) => {
                      switch (item.type) {
                        case 'paragraph':
                          return (
                            <RichText.Content
                              key={i}
                              tagName="p"
                              className="paragraph"
                              value={item.text}
                            />
                          );
                        case 'list':
                          return (
                            <ul key={i} className="list">
                              {(item.list || []).map((li, liIndex) => (
                                <li key={liIndex}>{li}</li>
                              ))}
                            </ul>
                          );
                        case 'button':
                          return (
                            <a
                              key={i}
                              href={item.url || '#'}
                              className={`btn ${item.isPrimary ? 'is-primary' : 'is-secondary'}`}
                            >
                              {item.text || 'Button'}
                            </a>
                          );
                        default:
                          return null;
                      }
                    })}
                </div>
              </details>
            );
          })}
        </div>
      </article>
    </div>
  );
}
