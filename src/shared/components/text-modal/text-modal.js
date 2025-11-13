// TextModal.js
import { __ } from '@wordpress/i18n';
import { useMemo, useState, useEffect, useRef, useCallback } from '@wordpress/element';
import {
  PanelBody,
  PanelRow,
  Button,
  TextControl,
  SelectControl,
  ToggleControl,
  ToolbarGroup,
  ToolbarDropdownMenu,
} from '@wordpress/components';
import { RichText, ColorPalette, MediaUpload, LinkControl,   InnerBlocks,
 } from '@wordpress/block-editor';
import { IconColorPickerRow, ColorPickerRow } from '../color-icon-picker';
import { ImageModalInspector, ImageModalRender } from '../image-modal';
import { Image } from '@10up/block-components';
import './text-modal.scss'
import '../../../styles/scss/global.scss'
// import { useEffect, useRef  } from 'react';

/* =========================
   Contrast & Text Color Utils
   ========================= */
const COMMON_FA = [
  { label: 'Check',         hex: 'f00c' },
  { label: 'Chevron Right', hex: 'f054' },
  { label: 'Chevron Left',  hex: 'f053' },
  { label: 'Angle Right',   hex: 'f105' },
  { label: 'Caret Right',   hex: 'f0da' },
  { label: 'Arrow Right',   hex: 'f061' },
  { label: 'Circle',        hex: 'f111' },
  { label: 'Dot Circle',    hex: 'f192' },
  { label: 'Square',        hex: 'f0c8' },
  { label: 'Star',          hex: 'f005' },
];

   const getLuminance = (color) => {
  if (!color) return 0;    
  const hex = color.replace('#', '');
  const full =
    hex.length === 3 ? hex.split('').map((c) => c + c).join('') :
    hex.length === 6 ? hex : '000000';

  const rgb = full.match(/\w\w/g).map((x) => parseInt(x, 16) / 255);
  const [r, g, b] = rgb.map((c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  );
  return 0.2126*r + 0.7152*g + 0.0722*b;
};
const getContrastRatio = (bg, fg) => {
  const L1 = getLuminance(bg), L2 = getLuminance(fg);
  const lighter = Math.max(L1, L2), darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
};
const getTextColor = (bg) => {
  const black = '#000000', white = '#FFFFFF';  
  if (bg === undefined){
    return
  } 
  if (bg !== null){
    return getContrastRatio(bg, black) >= 7 ? black : white;
  }
  return getContrastRatio(bg, black) >= 7 ? black : white;
};

/* =========================
   Item Helpers
   ========================= */
const newId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

const nextCountForType = (items, type) =>
  items.filter((i) => i.type === type).length + 1;

const addItem = (items, type) => {
  const isFirstHeadingCheck = type === 'heading' && items.filter(item => item.type === 'heading').length === 0;
  const base = {
    id: newId(),
    type,
    text: '',
    cardOrderMobile: '',
    size: isFirstHeadingCheck ? 'l' : 's', 
    headingType: isFirstHeadingCheck ? 'h2' : 'h3',
    count: nextCountForType(items, type),
    contentOrientation: false,
    textColor: '#000000',
    backgroundColor: '#ffffff',
    url: null,
  };
  if (type === 'list') {
    base.list = [''];
    base.iconRaw = 'f00c';
    base.icon = '"\\f00c"';
    base.iconColor = '#000000';
  } else if (type === 'image') {
  base.image = null; // media ID
  }
  return [...items, base];
};

  const isFirstHeading = (items, id) => {
      const headingItems = items.filter(item => item.type === 'heading');
      return headingItems.length > 0 && headingItems[0].id === id; // Check if the given id is the first heading
  };


const updateItem = (items, id, patch) =>
  items.map((i) => (i.id === id ? { ...i, ...patch } : i));

const removeItem = (items, id) => items.filter((i) => i.id !== id);

const moveItem = (items, id, dir) => {
  const idx = items.findIndex((i) => i.id === id);
  if (idx < 0) return items;
  const to = dir === 'up' ? idx - 1 : idx + 1;
  if (to < 0 || to >= items.length) return items;
  const next = [...items];
  const [moved] = next.splice(idx, 1);
  next.splice(to, 0, moved);
  return next;
};

const getButtonStyle = (bgColor) => {
    const primaryColor = '#000000';
    const whiteColor = '#ffffff';
    const primaryContrast = getContrastRatio(bgColor, primaryColor);
    const whiteContrast = getContrastRatio(bgColor, whiteColor);
    return (primaryContrast >= 4.5) ? 'black' : 'white';
};




export const RemoveCard = (cards, cardId) => {
  return cards.filter(c => c.id !== cardId);
};

const ensureList = (arr) => Array.isArray(arr) ? arr : [''];
const normalizeItems = (items = []) =>
  items.map((it) => it.type === 'list'
    ? { ...it, list: ensureList(it.list) }
    : { ...it, text: it.text ?? '' }
  );
  
/* =========================
   Small inline UI
   ========================= */
export const RowButtons = ({ onUp, onDown, onRemove, onDuplicate, disableUp, disableDown, modalType }) => (
  <>
    {onUp && <Button onClick={onUp} disabled={disableUp} className={`inspector-button row-button fa-icon-base move-up ${modalType}`} aria-label="Move up"></Button>}
    {onDown && <Button onClick={onDown} disabled={disableDown} className={`inspector-button row-button fa-icon-base move-down ${modalType}`}  aria-label="Move down"></Button>}
    {onDuplicate && <Button onClick={onDuplicate} className="inspector-button row-button fa-icon-base copy" aria-label="Duplicate"></Button>}
    {onRemove && <Button isDestructive onClick={onRemove} className="inspector-button row-button fa-icon-base remove" aria-label="Remove"></Button>}
  </>
);

/* =========================
   Inspector
   ========================= */
/**
 * @param {Object} props
 * @param {Function} props.readItems   - () => items[]
 * @param {Function} props.writeItems  - (nextItems) => void
 * @param {Object}   [props.disable]
 * @param {string}   [props.previewBg]
 * @param {boolean}   [props.contentOrientation]
 * @param {Object}   [props.context]   - valfri meta (t.ex. { scope:'card', cardIndex:0 })
 */
export function TextModalInspector({
  readItems,
  writeItems,
  disable = {},
  enable = [],
  previewBg,
  context,
  minimal = false,
  imageTitle,
  attributes,
  card,
  updateCard,
  updateImage,
  initialBackgroundColor,
  onSetMobilePosition,
}) {
  const items = normalizeItems(readItems?.() || []);
  const [isHovered, setIsHovered] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState(initialBackgroundColor ?? '#ffffff');
  // const [isTextModalOpen, setTextModalOpen] = useState(false);
  const [isOpenById, setIsOpenById] = useState({});
  const [openTextModals, setOpenTextModals] = useState({}); // { [id: string]: boolean }
  const [currentCardOrder, setCurrentCardOrder] = useState(context.cardIndex || '');
  const [openId, setOpenId] = useState(null);


 const menuRef = useRef(null);
  const isTextModalOpen = useCallback(
    (id) => openId === id,
    [openId]
  );
  
  const toggleTextModal = useCallback((id, event, forceClose = false) => {
  event?.stopPropagation?.();
  setOpenId((prev) => (forceClose ? null : prev === id ? null : id));
}, []);
  
useEffect(() => {
  const handleClickOutside = (event) => {
    const node = menuRef.current;
    if (!openId) return;
    if (node && !node.contains(event.target)) {
      setOpenId(null);
    }
  };
  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, [openId]);

  // const toggleTextModal = (event) => {
  //     event.stopPropagation(); // Prevent the click from propagating to the parent
  //     setTextModalOpen(!isTextModalOpen); // Toggle modal visibility
  // };
  
  const [openColor, setOpenColor] = useState({});

  const buttonStyle = getButtonStyle(backgroundColor || '#000000'); // Default to white if no background color

  
  
  const toggleColorPicker = (id) =>
    setOpenColor((s) => ({ ...s, [id]: !s[id] }));
  
  // Preview-stil för FA-ikon (bygger på CSS-variabler)
  const iconPreviewStyle = (it) => ({
    '--faIcon': it.icon || '"\\f00c"',
    '--iconColor': it.iconColor || '#000000',
  });
  
useEffect(() => {
  setBackgroundColor(initialBackgroundColor);
  
 if (initialBackgroundColor) {
   const nextTextColor = getTextColor(initialBackgroundColor);
   if (updateCard && context?.cardIndex !== undefined) {
     updateCard({ textColor: nextTextColor }, context.cardIndex);
   } else {
     updateCard({ textColor: nextTextColor });
  }
}
}, [initialBackgroundColor]);
  
  const handleColorChange = (color) => {
    setBackgroundColor(color);
    updateCard({ backgroundColor: color }, context.cardIndex); // Update the card's background color
  };

  const handleCardOrderChange = (value) => {
        // Check if the input is a valid number
        const numberValue = Number(value);
        
        // If it's NaN or not a number, clear the input
        if (isNaN(numberValue) || value.trim() === '') {
            setCurrentCardOrder('');
            updateCard({ cardOrderMobile: context.cardIndex }, context.cardIndex); // Update the card's background color
        } else {
            // Update the state with the new number
            setCurrentCardOrder(numberValue);
            updateCard({ cardOrderMobile: numberValue }, context.cardIndex); // Update the card's background color
        }
    };
  
  const contentOrientation = false;
  // I TextModalInspector, nära dina commit helpers:
  const duplicate = (id) => commit(duplicateItem(items, id));

  const counts = useMemo(() => {
    const c = { heading: 0, paragraph: 0, list: 0 , image: 0};
    items.forEach((i) => (c[i.type] = (c[i.type] || 0) + 1));
    return c;
  }, [items]);
  
  const commit = (next) => writeItems?.(normalizeItems(next), context);
  
  const add = (type) => commit(addItem(items, type));
  const remove = (id) => commit(recount(removeItem(items, id)));
  const up = (id) => commit(moveItem(items, id, 'up'));
  const down = (id) => commit(moveItem(items, id, 'down'));
  
  const setHeadingText = (id, text) => commit(updateItem(items, id, { text }));
  const setHeadingSize = (id, size) => commit(updateItem(items, id, { size }));
  const setHeadingType = (id, headingType) => commit(updateItem(items, id, { headingType:headingType }));
  const setParagraphText = (id, text) => commit(updateItem(items, id, { text }));
  const setImage = (id, image, extra) => {
  if (extra === 'remove') {
    // Call a function to remove the image
    commit(updateItem(items, id, { image: null })); // Assuming null removes the image
    commit(recount(removeItem(items, id)));
  } else {
    // Call the function to set the image
    commit(updateItem(items, id, { image }));
  }
};
  const setButtonText = (id, text) => commit(updateItem(items, id, { text }));
  const setButtonURL = (id, text) => commit(updateItem(items, id, { url: text }));

  
const handleBackgroundColorChange = (color) => {      

    setBackgroundColor(color);
    const nextTextColor = getTextColor(color);

    // Update card based on context
    if (updateCard && context.cardIndex !== undefined) {
        console.log('Updating card at index:', context.cardIndex, { backgroundColor: color, textColor: nextTextColor });
        updateCard({ backgroundColor: color, textColor: nextTextColor, bgImageStyle: false }, context.cardIndex);
    } else {
        console.log('Updating block-level attributes:', { backgroundColor: color, textColor: nextTextColor });
        updateCard({ backgroundColor: color, textColor: nextTextColor, bgImageStyle: false });
    }
};

  const setListItem = (id, liIndex, text) => {
    const item = items.find((i) => i.id === id);
    const list = ensureList(item?.list);
    const next = [...list];
    next[liIndex] = text;
    commit(updateItem(items, id, { list: next }));
  };
  const addListItem = (id) => {
    const item = items.find((i) => i.id === id);
    const list = ensureList(item?.list);
    commit(updateItem(items, id, { list: [...list, ''] }));
  };
  const removeListItem = (id, liIndex) => {
    const item = items.find((i) => i.id === id);
    const list = ensureList(item?.list);
    const next = list.filter((_, i) => i !== liIndex);
    commit(updateItem(items, id, { list: next.length ? next : [''] }));
  };

  const setListIconRaw = (id, raw) => {
    const sanitized = (raw || '').replace(/^\\/, '').trim();
    const cssContent = `"\\${sanitized}"`;
    commit(updateItem(items, id, { iconRaw: sanitized, icon: cssContent }));
  };
  const setListIconColor = (id, color) => {
    commit(updateItem(items, id, { iconColor: color || '#000000' }));
  };

  const getCurrentAlign = (idx, card, attributes) =>
  (typeof idx === 'number' ? (card?.align ?? 'left') : (attributes?.align ?? 'left'));

const setAlign = (value, idx, { updateCard, setAttributes }) => {
  if (typeof idx === 'number' && updateCard) {
    updateCard({ align: value }, idx);          // per-card
  } else if (updateCard) {
    updateCard({ align: value });               // block-level via updateCard
  } else if (setAttributes) {
    setAttributes({ align: value });            // fallback
  }
};

  function recount(arr) {
    const tally = {};
    return arr.map((it) => {
      tally[it.type] = (tally[it.type] || 0) + 1;
      return { ...it, count: tally[it.type] };
    });
  }


// Lägg nära dina item-helpers
const insertAfter = (arr, index, item) => {
  const next = [...arr];
  next.splice(index + 1, 0, item);
  return next;
};

// OBS: använd befintliga newId(), ensureList(), recount()
function duplicateItem(items, id) {
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) return items;

  const original = items[idx];

  // Om du bara vill tillåta 1 image i blocket – tillåt ej duplicering av image
  if (original.type === 'image') {
    return items;
  }

  // Djup kopia av relevanta fält
  const copy = {
    ...original,
    id: newId(),
  };

  if (original.type === 'list') {
    copy.list = [...ensureList(original.list)];
  }

  // Lägg in direkt efter originalet och räkna om counts
  const inserted = insertAfter(items, idx, copy);
  return recount(inserted);
}

  const handleImageUpload = (media) => {
    setImage(item.id, media?.id ?? null)
};
  
const imageExists = items.some(item => item.type === 'image');
const idx = context?.cardIndex;
const currentCard = attributes?.cards?.[idx];
const current = currentCard?.textColor ?? attributes?.textColor ?? '';

const buttonItems = items.filter(item => item.type === 'button');
const textItems = items.filter(item => ['heading', 'paragraph', 'list'].includes(item.type));

const renderControl = (title, attributeTitle, modalType, attributes, setAttributes) => { 
    if (modalType.length > 3) {
        return (
           <PanelRow className={`grid grid-1-button inspector-row`}>
                {title}
              <SelectControl
                  value={attributes[attributeTitle]}
                  options={modalType}
                  onChange={(value) => setAttributes({ [attributeTitle]: value })}
              />
            </PanelRow>
        );
    } else {
        return (
        <PanelRow className={`grid grid-${modalType.length}-button inspector-row`}>
          {title}
              {modalType.map(option => (
                <Button 
                    key={option.value} 
                    className="inspector-button" 
                    onClick={() => setAttributes({ [attributeTitle]: option.value })} // Update card border attribute
                    disabled={attributes[attributeTitle] === option.value} 
                    aria-label={`${attributeTitle} ${option.label}`}>
                    {option.label}
                </Button>
              ))}
          </PanelRow> 
        );                   
    }
};

    const cardOrderMobile = [
    { label: 'Mirror', value: 'mirror' },
    { label: 'Custom', value: 'custom' },
  ];

  const headerSizeOptions = [
    { label: 'XL', value: 'xl' },
    { label: 'L', value: 'l' },
    { label: 'M', value: 'm' },
    { label: 'S', value: 's' },
  ];

   const headerTypeOptions = [
    { label: 'H1', value: 'h1' },
    { label: 'H2', value: 'h2' },
    { label: 'H3', value: 'h3' },
    { label: 'H4', value: 'h4' },
  ];

     const textColorOptions = [
    { label: 'Black', value: '#000000' },
    { label: 'White', value: '#ffffff' },
  ];

  const textAlignOptions = [
  { label: 'Left', value: 'leftAlignText', icon: 'editor-alignleft' },
  { label: 'Center', value: 'centerAlignText', icon: 'editor-aligncenter' },
  { label: 'Right', value: 'rightAlignText', icon: 'editor-alignright' },
];
       const stopPropagation = (event) => {
        event.stopPropagation(); // Prevent the click from propagating to the parent
    };


  return (
    //Need to add stop propegation
    <>
         {enable.includes('color') && (
          <ColorPickerRow
            value={backgroundColor}
            minimal={minimal}
            onChange={handleBackgroundColorChange}
        />
          )}
        {context.scope !== 'global' && !!attributes &&
        <>
        <PanelRow className={`grid grid-${attributes.cards?.length}-button inspector-row`}>
          Mobile position:
            {attributes.cards?.map((c, idx) => (
              <Button
                key={c.id ?? idx}
                className="inspector-button"
                onClick={() => onSetMobilePosition?.(idx + 1)}   // ← call parent
                disabled={(card?.cardOrderMobile ?? -1) === (idx + 1)}
                aria-label={`Mobile position ${idx + 1}`}
              >
                {idx + 1}
              </Button>
            ))}
          </PanelRow>
          </>
        }
        {context.scope !== 'global' && enable.includes('textcolor') && 
        <PanelRow className={`grid grid-2-button inspector-row`}>
          Text color:
              {textColorOptions.map(option => (
                <Button
                  key={option.value}
                  className="inspector-button"
                  onClick={() => {
                    if (typeof idx === 'number' && updateCard) {
                      updateCard({ textColor: option.value }, idx);      // per-card
                    } else if (updateCard) {
                      updateCard({ textColor: option.value });           // block-level via updateCard
                    } else if (setAttributes) {
                      setAttributes({ textColor: option.value });        // fallback
                    }
                  }}
                  disabled={current === option.value}
                  aria-label={`textColor ${option.label}`}
                >
                  {option.label}
                </Button>
                ))}
          </PanelRow>
           
          }
          {context?.scope === 'card' && typeof idx === 'number' && currentCard && (
            <PanelRow className="grid grid-3-button inspector-row">
              Text align:
              {textAlignOptions.map(option => (
                <Button
                  key={option.value}
                  className="inspector-button"
                  icon={option.icon}
                  onClick={() => updateCard?.({ align: option.value }, idx)}
                  disabled={(currentCard?.align ?? 'left') === option.value}
                  aria-label={`textAlign ${option.label}`}
                >
                </Button>
              ))}
            </PanelRow>
          )}
        {['headingmenu', 'paragraphmenu', 'listmenu', 'buttonmenu', 'imagemenu'].some(item => enable.includes(item)) && (
        <PanelRow className="panel-settings">
          {enable.includes('headingmenu') && (
            <Button className="inspector-button" onClick={() => add('heading')}>
              {__('Add heading')}
            </Button>
          )}
          {enable.includes('paragraphmenu') && (
            <Button className="inspector-button" onClick={() => add('paragraph')}>
              {__('Add paragraph')}
            </Button>
          )}
          {enable.includes('listmenu') && (
            <Button className="inspector-button" onClick={() => add('list')}>
              {__('Add list')}
            </Button>
          )}
          {enable.includes('buttonmenu') && (
          <Button className="inspector-button" onClick={() => add('button')}>
            {__('Add button')}
          </Button>
          )}
          {enable.includes('imagemenu') && !imageExists && (
          <PanelRow className="grid grid-1-button inspector-row">
            {imageTitle ?? 'Image:'}
              <Button className="inspector-button" onClick={() => add('image')}>
                {__('Add image')}
              </Button>
          </PanelRow>
            )}
         {enable.includes('image') && imageExists && (
           <>
              {items.map((item, index) => {
                switch (item.type) {
                  case 'image':
                    return (
                      <ImageModalInspector key={item.id} item={item} onChange={setImage} />
                    );
                  }
                })}
            </>
      )}
                </PanelRow>
              )}
        
        {/* {items.length === 0 && enable.some(item => ['list', 'heading', 'paragraph'].includes(item)) && (
          <PanelRow><em>{__('No items yet.')}</em></PanelRow>
        )} */}
        {textItems.map((item, index) => {
          const disableUp = index === 0;
          const disableDown = index === textItems.length - 1;

          if (item.type === 'heading' && !enable.includes('heading')) return null;
          if (item.type === 'paragraph' && !enable.includes('paragraph')) return null;
          if (item.type === 'list' && !enable.includes('list')) return null;

          switch (item.type) {
            case 'heading':
              return (
                <>
                <PanelBody key={item.id}
                  title={
                              <>
                                  <span className='grid panel-body-span'>
                                       {`${__('Heading')} ${item.count || index + 1}`} 
                                      <span className={`plus-icon ${isTextModalOpen(item.id) ? 'true' : 'false'}`} onClick={(e) => toggleTextModal(item.id, e)} style={{ cursor: 'pointer' }} />
                      </span>
                      <div className="text-inspector-menu" 
                        data-open={isTextModalOpen(item.id)}
                        hidden={!isTextModalOpen(item.id)}
                        ref={isTextModalOpen(item.id) ? menuRef : null}
                        onClick={(e) => e.stopPropagation()}>
                      <PanelRow className="grid grid-4-button no-title minimal inspector-row">
                        <RowButtons
                          onUp={() => up(item.id)}
                          onDown={() => down(item.id)}
                          onRemove={() => remove(item.id)}
                          onDuplicate={() => duplicate(item.id)}
                          disableUp={disableUp}
                          disableDown={disableDown}
                        />
                      </PanelRow>
                    </div>
                  </>
              } 
              onClick={stopPropagation}
              className="text-modal-panel-body" 
              // onClick={stopPropagation}
              initialOpen={false}>
                  <PanelRow className="grid grid-1-button inspector-row">
                    Text:
                    <TextControl
                      className="panel-control-settings inspector-button input"
                      // label={__('Text')}
                      value={item.text ?? 'Heading'}
                      onChange={(v) => setHeadingText(item.id, v)}
                    />
                  </PanelRow>
                  <PanelRow className="grid grid-4-button inspector-row">
                    Size:
                    {headerSizeOptions.map(option => (
                      <Button key={option.value} className="inspector-button" onClick={() => setHeadingSize(item.id, option.value)} disabled={item.size === option.value} aria-label="Text size option.value">{option.label}</Button>
                    ))}
                  </PanelRow>
                  <PanelRow className="grid grid-4-button inspector-row">
                    Type:
                    {headerTypeOptions.map(option => (
                      <Button key={option.value} className="inspector-button" onClick={() => setHeadingType(item.id, option.value)} disabled={item.headingType === option.value} aria-label="Text size option.value">{option.label}</Button>
                    ))}
                  </PanelRow>
                </PanelBody>
                  </>
              );

            case 'paragraph':
              return (
                <>
                <PanelBody key={item.id}
                  title={
                      <>
                          <span className='grid panel-body-span'>
                                {`${__('Paragraph')} ${item.count || index + 1}`} 
                              <span className={`plus-icon ${isTextModalOpen(item.id) ? 'true' : 'false'}`} onClick={(e) => toggleTextModal(item.id, e)} style={{ cursor: 'pointer' }} />
                      </span>
                    <div className="text-inspector-menu" 
                      data-open={isTextModalOpen(item.id)}
                      hidden={!isTextModalOpen(item.id)}
                      ref={isTextModalOpen(item.id) ? menuRef : null}
                      onClick={(e) => e.stopPropagation()}
                    >
                       <PanelRow className="grid grid-4-button no-title minimal inspector-row">
                        <RowButtons
                          onUp={() => up(item.id)}
                          onDown={() => down(item.id)}
                          onRemove={() => remove(item.id)}
                          onDuplicate={() => duplicate(item.id)}
                          disableUp={disableUp}
                          disableDown={disableDown}
                        />
                      </PanelRow>
                    </div>
                  </>
              } 
                  className="text-modal-panel-body" 
                  initialOpen={false}>
                   <PanelRow className="grid grid-1-button inspector-row">
                    Text:
                    <TextControl
                      className="panel-control-settings inspector-button input"
                      value={item.text ?? 'Paragraph'}
                      onChange={(v) => setParagraphText(item.id, v)}
                    />
                  </PanelRow>
                </PanelBody>
                  </>
              );

            case 'list':
              return (
                <>
                 <PanelBody key={item.id}
                  title={
                          <>
                            <span className='grid panel-body-span'>
                                {`${__('List')} ${item.count || index + 1}`} 
                              <span className={`plus-icon ${isTextModalOpen(item.id) ? 'true' : 'false'}`} onClick={(e) => toggleTextModal(item.id, e)} style={{ cursor: 'pointer' }} />
                      </span>
                    <div className="text-inspector-menu" 
                      data-open={isTextModalOpen(item.id)}
                      hidden={!isTextModalOpen(item.id)}
                      ref={isTextModalOpen(item.id) ? menuRef : null}
                      onClick={(e) => e.stopPropagation()}>
                      <Button onClick={() => addListItem(item.id)}>{__('Add list item')}</Button>
                      <PanelRow className="grid grid-4-button no-title minimal inspector-row">
                        <RowButtons
                            onUp={() => up(item.id)}
                            onDown={() => down(item.id)}
                            onRemove={() => remove(item.id)}
                            onDuplicate={() => duplicate(item.id)}
                            disableUp={disableUp}
                            disableDown={disableDown}
                            />
                        </PanelRow>
                    </div>
                  </>
              } 
                  className="text-modal-panel-body" 
                  initialOpen={false}>
                    <IconColorPickerRow
                        iconHex={item.iconRaw}
                        color={item.iconColor}
                        onIconChange={(hex) => setListIconRaw(item.id, hex)}
                        onColorChange={(c) => setListIconColor(item.id, c)}
                        label={__('Icon color')}
                      />
                    
                  {ensureList(item.list).map((li, liIndex) => (
                    <div style={{'--grid-template-columns':'auto 1fr auto'}}>
                    <PanelRow className="grid inspector-row"  key={`${item.id}_${liIndex}`}>
                      {`${__('List item')} ${liIndex + 1}`}
                      <TextControl
                        className="panel-control-settings inspector-button input"
                        value={li || ''}
                        onChange={(v) => setListItem(item.id, liIndex, v)}
                      />
                      <RowButtons 
                      //Behöver göra unika funktioner för listitems
                        onRemove={() => removeListItem(item.id, liIndex)} 
                      />
                    </PanelRow>
                    </div>
                  ))}
                </PanelBody>
               
                  </>
              );

            default:
              return null;
          }
        })}
        {buttonItems.some(item => item.type === 'button') && (
          <>
            {buttonItems.map((item, index) => {
              const disableUp = index === 0;
              const disableDown = index === buttonItems.length - 1;

              if (!enable.includes('button')) return null;

                return(
                <>
                <PanelBody key={item.id}
                 title={
                          <>
                            <span className='grid panel-body-span panel-button'>
                                {`${__('Button')} ${item.count || index + 1}`} 
                              <span className={`plus-icon ${isTextModalOpen(item.id) ? 'true' : 'false'}`} onClick={(e) => toggleTextModal(item.id, e)} style={{ cursor: 'pointer' }} />
                      </span>
                    <div className="text-inspector-menu" 
                      data-open={isTextModalOpen(item.id)}
                      hidden={!isTextModalOpen(item.id)}
                      ref={isTextModalOpen(item.id) ? menuRef : null}
                      onClick={(e) => e.stopPropagation()}>
                       <PanelRow className="grid grid-4-button no-title minimal inspector-row">
                        <RowButtons
                          onUp={() => up(item.id)}
                          onDown={() => down(item.id)}
                          onRemove={() => remove(item.id)}
                          onDuplicate={() => duplicate(item.id)}
                          disableUp={disableUp}
                          disableDown={disableDown}
                        />
                      </PanelRow>
                    </div>
                  </>
              } 
                  className="text-modal-panel-body" 
                  initialOpen={false}>
                        {(() => {
                            switch (item.type) {
                                case 'button':
                                    return (
                                        <>
                                          <PanelRow className="grid grid-1-button inspector-row">
                                            Text:
                                            <TextControl
                                              className="panel-control-settings inspector-button input"
                                              value={item.text ?? 'Button'}
                                              onChange={(v) => setButtonText(item.id, v)}
                                            />
                                        </PanelRow>
                                        <PanelRow label="Button URL" className="grid grid-1-button inspector-row">
                                            Button URL:
                                            <LinkControl
                                                className="linkLinkControl panel-control-settings inspector-button input"
                                                label="Button URL"
                                                value={item.url}
                                                onChange={(newUrl) => setButtonURL(item.id, newUrl)}
                                            />
                                        </PanelRow>
                                        </>
                                    );
                                default:
                                    return null; // Handle unknown item types
                            }
                        })()}
                </PanelBody>
                </>
                )
            })}
            </>
        )}
    </>
  );
}

/* =========================
   Renderer (Edit preview)
   ========================= */
export function TextModalRender({
  readItems,
  writeItems,
  disable = {},
  enable = [],
  backgroundColor,
  className = 'text-wrapper',
  context,
  cardAttributes,
  attributes,
  contentOrientation,
  buttonClass,
  inverted = false, 
}) {
  
  const [focusTarget, setFocusTarget] = useState(null);
  const buttonStyle = getButtonStyle(backgroundColor || '#000000'); // Default to white if no background color

  
  

  const items = normalizeItems(readItems?.() || []);
  const commit = (next) => writeItems?.(normalizeItems(next), context);


  const setText = (id, text) => commit(updateItem(items, id, { text }));
  const setButtonText = (id, text) => commit(updateItem(items, id, { text }));

  const textColor = () => {
  if (context.scope === 'global') {
    if (attributes) {
      return attributes.textColor;
    } else {
      console.warn('attributes not set', attributes);
    }
  }

  if (context.scope === 'card') {
    if (cardAttributes) {
      return cardAttributes.textColor;
    } else {
      console.warn('cardAttributes not set', cardAttributes);
    }
  }

  // Fallback
  console.warn('Unexpected scope or missing attributes', context.scope, attributes, cardAttributes);
  return undefined;
};

  const setListEntry = (id, index, newText) => {
    const snapshot = normalizeItems(readItems?.() || []); // defensivt mot stale closures
    const item = snapshot.find((i) => i.id === id);
    const list = ensureList(item?.list);
    const parts = String(newText).split(/<br>\s*-/i);

    const updated = [...list];
    updated[index] = parts[0];

    if (parts.length > 1) {
      const toInsert = parts.slice(1);
      updated.splice(index + 1, 0, ...toInsert);
      setFocusTarget({ listId: id, index: index + 1 });
    }

    commit(updateItem(snapshot, id, { list: updated }));
  };

  const tagFor = (item) => {
    if (item.type === 'heading') return item.headingType || 'h2';
    if (item.type === 'paragraph') return 'p';
    return 'div';
  };

     const borderOptions = [
    { label: 'Show', value: 'show' },
    { label: 'Hide', value: 'hide' },
  ];

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



  // const additionalClasses = [];

  // // Check for text-related items
  // if (items.some(item => ['headline', 'paragraph', 'list'].includes(item.type))) {
  //   additionalClasses.push('contains-text');
  // }

  // // Check for image items
  // if (items.some(item => item.type === 'image')) {
  //   additionalClasses.push('contains-image');
  // }

  // // Check for button items
  // if (items.some(item => item.type === 'button')) {
  //   additionalClasses.push('contains-button');
  // }

  // // Join the class names into a single string
  // const classNames = additionalClasses.join(' ');

  return (
    <div className={`text-modal-section ${cardAttributes?.topSectionFlags ?? attributes.topSectionFlags}`}>
      {items.some(item => ['list', 'heading', 'paragraph'].includes(item.type)) && (
        <div role="text-wrapper" className={`${className} ${(cardAttributes?.align)}`} 
        style={{
        order: '2',
        color: textColor()
      }} 
        >
      {items.map((item) => {
        if (item.type === 'heading' && !enable.includes('heading')) return null;
        if (item.type === 'paragraph' && !enable.includes('paragraph')) return null;
        if (item.type === 'list' && !enable.includes('list')) return null;
        if (item.type === 'image' && !enable.includes('image')) return null;
        if (item.type === 'color' && !enable.includes('color')) return null;
        
        switch (item.type) {
          case 'heading':
            const first = isFirstHeading(items, item.id);
            return (
              <RichText
                key={item.id}
                position={first}
                tagName={first ? 'h2' : tagFor(item)}
                className={`block-editor-rich-text__editable wp-block is-selected wp-block-heading rich-text heading ${item.size || 'xl'} ${first ? 'is-first-heading' : ''}`}
                id={`block-${item.id}`} // Assuming item.id is unique
                role="document" // Use standard role for headings
                aria-label={`Block: Heading`} // Accessibility label
                data-block={item.id} // Data attribute for block ID
                data-type="core/heading" // Data attribute for block type
                data-title="Heading" // Data attribute for title
                contentEditable={true} // Ensure it's editable
                value={item.text ?? ''}
                data-wp-block-attribute-key="content"
                placeholder={`Heading ${item.count || 1}`}
                data-listener-added_95ef2b5b="true"
                onChange={(v) => setText(item.id, v)}
              />
            );
          case 'paragraph':
            return (
              <RichText
                key={item.id}
                tagName="p"
                className={`paragraph`}
                value={item.text ?? ''}
                placeholder={`Paragraph ${item.count || 1}`}
                onChange={(v) => setText(item.id, v)}
              />
            );
          case 'list':
            return (
              <ul key={item.id} className={`text-modal-ul `}>
                {ensureList(item.list).map((li, idx) => (
                  <li
                    key={`${item.id}_${idx}`}
                    className="list"
                    style={{ '--faIcon': item.icon || '"\\f00c"', '--iconColor': item.iconColor || '#000000' }}
                  >
                    <RichText
                      tagName="span"
                      value={li ?? ''}
                      placeholder={__('List item')}
                      allowedFormats={['core/bold', 'core/italic', 'core/link']}
                      onChange={(v) => setListEntry(item.id, idx, v)}
                      ref={(el) => {
                        if (!el) return;
                        if (focusTarget && focusTarget.listId === item.id && focusTarget.index === idx) {
                          el.focus?.();
                        }
                      }}
                      onFocus={() => {
                        if (focusTarget && focusTarget.listId === item.id && focusTarget.index === idx) {
                          setFocusTarget(null);
                        }
                      }}
                      onKeyDown={(e) => {
                        const isBackspace = e.key === 'Backspace' || e.keyCode === 8;
                        const current = ensureList(item.list)[idx] || '';
                        if (isBackspace && current.trim() === '') {
                          e.preventDefault();
                          const next = ensureList(item.list).filter((_, i) => i !== idx);
                          const snapshot = normalizeItems(readItems?.() || []);
                          commit(updateItem(snapshot, item.id, { list: next.length ? next : [''] }));
                        }
                      }}
                    />
                  </li>
                ))}
              </ul>
            );
        default:
            return null;
              }
            })}
          </div>
        )}       
        {items.some(item => item.type === 'button') && enable.includes('button') ? (
        <div role="button-wrapper" className={`button-wrapper ${attributes?.align || ''} ${cardAttributes?.align || ''}`} style={textColor && attributes.modalType === 'cards' ? { color: textColor, order: '3' } : {order : '3'}}>
          {/* {if (item.type === 'button' && !enable.includes('button')) return null;} */}
            {items.map(item => {
                switch (item.type) {
                    case 'button':
                        return (
                          <>
                          {(attributes.modalType === 'cards' || attributes.modalType === 'dropdown') ? <hr /> : null}
                            <button 
                                key={item.id}
                                className={`wp-block-button fastum-button ${attributes.align} ${attributes.modalType}`}
                                onClick={() => window.open(item.url, '_blank')} // Open URL in a new tab
                                disabled
                                >                                
                                <RichText
                                    tagName='span'
                                    label={'Button Text'}
                                    // style={item.isPrimary ? {} : { backgroundColor: buttonStyle, color: buttonStyle === 'black' ? 'white' : 'black' }}
                                    value={item?.text || `Button ${item.count}`} // Display count
                                    onChange={(newText) => setButtonText(item.id, newText)}
                                    className={`wp-block-button__link ${item.isPrimary ? 'button-primary' : 'button-secondary'}`}
                                    // allowedFormats={[]} 
                                    />
                            </button>
                          </>
                        );
                    default:
                        return null; // Handle unknown item types
                }
            })}
        </div>
        ):null}
         {items.some(item => item.type === 'image') ? (
        <div className="image-wrapper" style={{order : '1'}}>
            {items.map((item) => {
              if (item.type !== 'image' || disable.image) return null;

              return (
                <ImageModalRender key={item.id} attributes={attributes} item={item} onChange={(id, mediaId) => {
                const updatedItems = updateItem(items, id, { image: mediaId });
                commit(updatedItems);
              }} />
            );
        })}
      </div>
      ):null}
    </div>
  );
}
