// shared/serializers/text-modal.serialize.js
import { RichText } from '@wordpress/block-editor';

/** Map '3/2' -> '3 / 2', '2/3' -> '2 / 3' etc. */
export function aspectToCss(val) {
  if (!val || val === 'none') return undefined;
  if (val === '3/2') return '3 / 2';
  if (val === '2/3') return '2 / 3';
  return val;
}

/** Bestäm heading-tag baserat på headingType eller size (xl/l/m/s). */
export function resolveHeadingTag(item) {
  if (item?.headingType) return item.headingType;
  const size = item?.size;
  return size === 'xl' ? 'h1' : size === 'l' ? 'h2' : size === 'm' ? 'h3' : 'h4';
}

/** Rendera ett (1) item till en React-nod för save.js */
export function renderItemNode(item) {
  if (!item || !item.type) return null;

  switch (item.type) {
    case 'heading': {
      const Tag = resolveHeadingTag(item);
      return (
        <RichText.Content
          key={item.id}
          tagName={Tag}
          className={`heading ${item.size || ''}`}
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
      const listItems = Array.isArray(item.list) ? item.list : [];
      if (!listItems.length) return null;
      // FontAwesome-ikon via CSS custom props
      const liStyle = {
        '--faIcon': item.icon || '"\\f00c"',
        '--iconColor': item.iconColor || '#000000',
      };
      return (
        <ul key={item.id} className="text-modal-ul">
          {listItems.map((li, i) => (
            <li key={`${item.id}_${i}`} className="list" style={liStyle}>
              <RichText.Content tagName="span" value={li || ''} />
            </li>
          ))}
        </ul>
      );
    }

    case 'button': {
      const href = item?.url || '#';
      const isPrimary = !!item?.isPrimary;
      const openInNew = !!item?.openInNew;
      return (
        <p key={item.id} className="btn-wrap">
          <a
            className={`wp-block-button__link ${isPrimary ? 'button-primary' : 'button-secondary'} wp-block-button fastum-button`}
            href={href}
            target={openInNew ? '_blank' : undefined}
            rel={openInNew ? 'noopener' : undefined}
          >
            {item.text || ''}
          </a>
        </p>
      );
    }

    case 'image': {
      // För bästa SEO i save: spara {id, url, alt, caption} i item.image
      const img = item.image;
      const hasUrl = img && typeof img === 'object' && (img.url || img.src);
      if (!hasUrl) {
        // Saknar URL → skriv ut en data-hook så PHP kan ersätta på frontend
        const id = typeof img === 'number' ? img : undefined;
        return (
          <figure key={item.id} className="image" data-attachment-id={id || ''} />
        );
      }
      const url = img.url || img.src;
      const alt = img.alt || '';
      const caption = img.caption || '';
      return (
        <figure key={item.id} className="image">
          <img src={url} alt={alt} />
          {caption ? <figcaption>{caption}</figcaption> : null}
        </figure>
      );
    }

    default:
      return null;
  }
}

/** Rendera alla items (utan block-wrapper) */
export function renderItemsNodes(items = []) {
  return items.map(renderItemNode);
}

/**
 * Hjälper save.js att rendera en komplett layout med valfri bildkolumn
 * om du kör block med text-/knappkolumn + bildkolumn.
 */
export function renderLayoutNodes({
  items = [],
  hasRightImageSection = false,
  rightImage = null, // {url, alt, caption, width, objectFit, aspect}
  columnOrder = false,
  textAlign = 'left',
  imageWidth,
  imageSize,
  imageAspect,
}) {
  const imgStyles = {
    width: imageWidth || undefined,
    objectFit: imageSize || undefined,
    aspectRatio: aspectToCss(imageAspect),
  };
  const rightImgUrl = rightImage?.url || rightImage?.src || '';
  const rightImgAlt = rightImage?.alt || '';
  const rightImgCap = rightImage?.caption || '';

  return (
    <article className={`text-modal-article ${hasRightImageSection ? 'two-columns' : 'oneColumn'} ${columnOrder ? 'invert' : ''}`}>
      <section className={`text-modal-section ${columnOrder ? 'invertOrder' : ''} align-${textAlign}`}>
        {renderItemsNodes(items)}
      </section>
      {hasRightImageSection && rightImgUrl && (
        <section className="image-modal-section">
          <div className="image-container">
            <figure className="image">
              <img src={rightImgUrl} alt={rightImgAlt} style={imgStyles} />
              {rightImgCap ? <figcaption>{rightImgCap}</figcaption> : null}
            </figure>
          </div>
        </section>
      )}
    </article>
  );
}
