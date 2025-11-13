import { RichText, useBlockProps, InnerBlocks } from '@wordpress/block-editor';

/**
 * SAVE — statisk frontend-markup (ingen interaktion här)
 */
export default function save({ attributes }) {
  const {
    align = '',
    modalType = '',
    bgImageStyle = 'color',
    items = [],
    backgroundColor,
    textColor,
    cards = [],
    imageSize = '',      
    imageWidth = '100%', 
    imageAspect = 'none', 
    imageSizing = '',    
    cardBorder = '',      
    cardWidthOptions = '',
    faIcon,
    faIconColor,
    topSectionFlags,
  } = attributes;

  // Rotens CSS-variabler (för listikoner m.m.)
  const faIconStyle = {
    ...(faIcon ? { '--faIcon': faIcon } : {}),
    ...(faIconColor ? { '--iconColor': faIconColor } : {}),
  };

  const blockProps = useBlockProps.save({
    className: `card-modal-article ${bgImageStyle || ''} ${modalType || ''} article`,
    style: {
      ...(backgroundColor ? { backgroundColor } : {}),
      ...faIconStyle,
    },
  });
  

  // ---------- Helpers ----------
  const getUrl = (maybeUrl) => {
    if (!maybeUrl) return '#';
    if (typeof maybeUrl === 'string') return maybeUrl;
    if (typeof maybeUrl === 'object') {
      return maybeUrl.url || maybeUrl.href || maybeUrl.link || '#';
    }
    return '#';
  };

  const sectionClassFlags = (list) => {
    const hasText   = list.some(i => ['heading', 'paragraph', 'list'].includes(i.type));
    const hasImage  = list.some(i => i.type === 'image');
    const hasButton = list.some(i => i.type === 'button');
    return [
      'text-modal-section',
      hasText ? 'contains-text' : null,
      hasImage ? 'contains-image' : null,
      hasButton ? 'contains-button' : null,
    ].filter(Boolean).join(' ');
  };

  const getImgSrc = (image) => {
    if (!image) return null;
    if (typeof image === 'string') return image;
    if (image.url) return image.url;
    if (image.source_url) return image.source_url;
    if (image.sizes?.large?.url) return image.sizes.large.url;
    if (image.sizes?.full?.url) return image.sizes.full.url;
    return null;
  };

  const splitItemsOnFirstHeading = (arr = []) => {
    if (!arr.length) return { first: null, rest: [], firstIndex: -1 };
    const idx = arr.findIndex((it) => it?.type === 'heading');
    const i = idx >= 0 ? idx : 0;
    const first = arr[i] || null;
    const rest = arr.filter((_, k) => k !== i);
    return { first, rest, firstIndex: i };
  };
  
const computeTopFlags = (list = []) => {
  const hasText   = list.some(i => ['heading','paragraph','list'].includes(i?.type));
  const hasImage  = list.some(i => i?.type === 'image');
  const hasButton = list.some(i => i?.type === 'button');
  return [
    hasText   ? 'contains-text'   : null,
    hasImage  ? 'contains-image'  : null,
    hasButton ? 'contains-button' : null,
  ].filter(Boolean).join(' ');
};


const topFlags = computeTopFlags(items);
const showTop  = topFlags.length > 0 || modalType === 'lime-form';

  // ---------- Renderers ----------
  const renderTextItems = (list, alignClass, currentModalType) => {
    const texts = list.filter((i) => ['heading', 'paragraph', 'list'].includes(i.type));
    if (texts.length === 0) return null;

    return (
      <div className={`text-wrapper ${alignClass || ''}`} style={{ order: '2' }}>
        {list.map((item) => {
          switch (item.type) {
            case 'heading': {
              const tag = item.headingType || 'h2';
              const sizeClass = item.size || 'm';
              return (
                <RichText.Content
                  key={item.id}
                  tagName={tag}
                  className={`heading ${sizeClass}`}
                  value={item.text || ''}
                />
              );
            }
            case 'paragraph':
              return (
                <RichText.Content
                  key={item.id}
                  tagName="p"
                  className="paragraph"
                  value={item.text || ''}
                />
              );
            case 'list': {
              // I hero döljer du listor i edit – spegla det även här
              if (currentModalType === 'hero') return null;
              const listItems = Array.isArray(item.list) ? item.list : [];
              const iconVar = item.icon || '"\\f00c"';
              const iconColor = item.iconColor || '#000000';
              return (
                <ul key={item.id} className="text-modal-ul">
                  {listItems.map((li, idx) => (
                    <li
                      key={`${item.id}_${idx}`}
                      className="list"
                      style={{ '--faIcon': iconVar, '--iconColor': iconColor }}
                    >
                      <RichText.Content tagName="span" value={li || ''} />
                    </li>
                  ))}
                </ul>
              );
            }
            default:
              return null;
          }
        })}
      </div>
    );
  };

  // Renderar endast om det finns knappar
  const renderButtons = (list, alignClasses, color, currentModalType, extraClass = '') => {
    const buttons = list.filter((i) => i.type === 'button');
    if (buttons.length === 0) return null;

    return (
      <div
        role="button-wrapper"
        className={`button-wrapper ${alignClasses || ''} ${currentModalType || ''}`}
        style={{ order: '3', ...(color ? { color } : {}) }}
      >
        {buttons.map((btn, idx) => {
          const multipleButtons = buttons.length > 1 && currentModalType === 'cards';
          const isPrimary = !!btn.isPrimary;
          const href = getUrl(btn.url);
          return (
            <div key={btn.id || `btn_${idx}`}>
              {multipleButtons ? <hr /> : null}
              <a
                className={
                  `wp-block-button fastum-button ` +
                  `${isPrimary ? 'button-primary' : 'button-secondary'} ` +
                  `${alignClasses || ''} ${currentModalType || ''} ${extraClass}`
                }
                href={href}
                target="_blank"
                rel="noopener"
              >
                 <RichText.Content
                  tagName="span"
                  value={btn?.text || `Button ${btn.count || ''}`}
                  className="wp-block-button__link"
                />
              </a>
            </div>
          );
        })}
      </div>
    );
  };

  const renderImages = (list) => {
    const images = list.filter((i) => i.type === 'image');
    if (images.length === 0) return null;

    // Style/klass enligt dina attribut
    const aspectClass = imageAspect || '';
    const widthClass  = imageWidth || '';
    const sizingClass = imageSizing || '';

    const imgStyleBase = {
      width: imageWidth || '100%',
      ...(imageAspect && imageAspect !== 'none' ? { aspectRatio: imageAspect } : {}),
      ...(imageSize ? { objectFit: imageSize } : {}), // cover/contain
    };

    return (
      <div className="image-wrapper" style={{ order: '1' }}>
        {images.map((imgItem) => {
          const src = getImgSrc(imgItem.image) || getImgSrc(imgItem.imageUrl);
          if (!src) return null;
          const alt = imgItem.alt || '';
          return (
            <div key={imgItem.id} className={`image-container ${sizingClass}`}>
              <img
                className={`text-modal-img ${aspectClass} ${sizingClass} ${widthClass}`}
                src={src}
                alt={alt}
                style={imgStyleBase}
              />
            </div>
          );
        })}
      </div>
    );
  };

  // ---------- Render ----------
  return (
    <article {...blockProps}>
      {/* Top/Global sektionen */}
      {showTop &&
      <section className={`card-modal-section ${modalType || ''}`}>
        <div role="text-modal-section" className={`text-modal-section ${topFlags}`}>
          {renderTextItems(items, align, modalType)}
          {renderButtons(items, align, textColor, modalType)}
        </div>
        {modalType === 'lime-form' && (
          <div className="custom-container">
            <InnerBlocks.Content />
          </div>
        )}
      </section>
      }
      {/* Cards/Columns/Dropdown (ej hero/lime-form) */}
      {modalType !== 'hero' && modalType !== 'lime-form' && (
        <div className={`cards-grid ${modalType || ''}`}>
          {cards.map((card) => {
            const cardBg = card?.backgroundColor;
            const cardTextColor = card?.textColor || textColor;
            const cardAlign = card?.align ?? 'left';
            const perCardItems = Array.isArray(card?.items) ? card.items : [];

            // Dropdown/Faq: dela upp på första heading
            if (modalType === 'dropdown') {
              const { first, rest } = splitItemsOnFirstHeading(perCardItems);
              return (
                <section
                  key={card.id}
                  className={`dropdown-modal-card ${imageSize || ''} ${cardAlign || ''} ${cardBorder || ''}`}
                  style={{
                    ...(cardBg ? { backgroundColor: cardBg } : {}),
                    ...(cardWidthOptions ? { maxWidth: cardWidthOptions } : {}),
                  }}
                >
                  <details className={`accordion-card ${cardAlign || ''} ${cardBorder || ''}`} style={{ color: cardTextColor }}>
                    <summary className="accordion-card__summary" role="button" aria-expanded={false}>
                      <div className={sectionClassFlags(first ? [first] : [])}>
                        {first
                          ? renderTextItems([first], cardAlign, modalType)
                          : renderTextItems([], cardAlign, modalType)}
                      </div>
                    </summary>
                    <div className="accordion-card__content">
                      <div className={sectionClassFlags(rest)}>
                        {renderImages(rest)}
                        {renderTextItems(rest, cardAlign, modalType)}
                        {renderButtons(rest, `${cardAlign || ''}`, cardTextColor, modalType, 'card-button')}
                      </div>
                    </div>
                  </details>
                </section>
              );
            }

            // Cards/Columns
            return (
              <section
                  key={card.id}
                  className={`${modalType === 'dropdown' ? 'dropdown-modal-card' : 'card-modal-card'} ${imageSize || ''} ${cardAlign || ''} ${cardBorder || ''}`}
                  style={{
                    ...(cardBg ? { backgroundColor: cardBg } : {}),
                    ...(cardWidthOptions ? { maxWidth: cardWidthOptions } : {}),
                    ...(card?.cardOrderMobile != null ? { ['--currentCardOrder']: String(card.cardOrderMobile) } : {}),
                  }}
                >
                <div className={sectionClassFlags(perCardItems)}>
                  {renderImages(perCardItems)}
                  {renderTextItems(perCardItems, cardAlign, modalType)}
                  {renderButtons(
                    perCardItems,
                    `${cardAlign || ''}`.trim(),
                    cardTextColor,
                    modalType,
                    'card-button'
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </article>
  );
}
