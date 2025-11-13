import { __ } from '@wordpress/i18n';
import {
  InspectorControls,
  useBlockProps,
  InnerBlocks,
} from '@wordpress/block-editor';
import {
  Panel,
  PanelBody,
  PanelRow,
  Button,
  TextControl,
  SelectControl,
} from '@wordpress/components';
import { TextModalInspector, TextModalRender, RowButtons, RenderControl } from '../shared/components/text-modal';
import { useEffect, useMemo, useState, useRef, useCallback  } from '@wordpress/element';
import './style.scss';
import '../styles/scss/global.scss';



// ---------- defaults ----------
const DEFAULT_FA_ICON = '\"\\f00c\"'; // CSS content escaped
const DEFAULT_FA_ICON_COLOR = '#E03131';

const newId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;


const newItem = (type, indexInCard) => ({
  id: newId(),
  type,
  text: '',
  list: type === 'list' ? ['Item 1'] : [],
  url: '',
  textColor:'',
  modalType: 'column',
  isPrimary: true,
  icon: DEFAULT_FA_ICON,
  iconColor: DEFAULT_FA_ICON_COLOR,
  size: type === 'heading' ? 'm' : '',
  count: indexInCard + 1,
  headingType: type === 'heading' ? 'h2' : undefined,
});

const newCard = (i) => ({
  id: `card-${newId()}-${i}`,
  items: [newItem('heading', 0), newItem('paragraph', 1)],
  image: null,
  align: 'left',
  cardOrderMobile: i+1,
  backgroundColor: '',
  topIconRaw: '',
  textColor:'#000000',
  topIcon: '""',
  topIconColor: '#000000',
});

const renderControl = (title, attributeTitle, options, attributes, setAttributes) => { 
    if (options.length > 3) {      
        return (
           <PanelRow className={`grid grid-1-button inspector-row`}>
                {title}
              <SelectControl
                  value={attributes[attributeTitle]}
                  options={options}
                  onChange={(value) => setAttributes({ [attributeTitle]: value })}
              />
            </PanelRow>
        );
    } else {
        return (
        <PanelRow className={`grid grid-${options.length}-button inspector-row`}>
          {title}
              {options.map(option => (
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

// export const splitItemsOnFirstHeading = (items = []) => {
//   if (!items.length) return { first: null, rest: [], firstIndex: -1 };
//   const firstHeadingIdx = items.findIndex((it) => it?.type === 'heading');
//   const idx = firstHeadingIdx >= 0 ? firstHeadingIdx : 0;
//   const first = items[idx] || null;
//   const rest = items.filter((_, i) => i !== idx);
//   return { first, rest, firstIndex: idx };
// };

export const splitItemsOnFirstHeading = (items = []) => {
  if (!items.length) return { first: null, rest: [], firstIndex: -1 };
  const firstHeadingIdx = items.findIndex((it) => it?.type === 'heading');
  const idx = firstHeadingIdx >= 0 ? firstHeadingIdx : -1;
  const first = idx >= 0 ? items[idx] : null;
  const rest  = idx >= 0 ? items.filter((_, i) => i !== idx) : [...items];
  return { first, rest, firstIndex: idx };
};


export default function Edit(props) {
  const { attributes, setAttributes } = props;
  const {
    numberOfCards,
    cards = [], // [{id, items: [...], image, align, backgroundColor}]
    faIcon = DEFAULT_FA_ICON,
    items,
    backgroundColor,
    textColor,
    faIconColor = DEFAULT_FA_ICON_COLOR,
    contentOrientation,
    topSectionFlags,
    modalType,
  } = attributes;

  const GLOBAL_TM_ID = 'global';
  const [openTextModals, setOpenTextModals] = useState({}); // { [id: string]: boolean }
  const [inspectorMenuItems, setInspectorMenuItems] = useState([]);
  const [inspectorItems, setInspectorItems] = useState([]);
  const [isOpenById, setIsOpenById] = useState({});
  const [isGlobalOpen, setGlobalOpen] = useState(true);
  const [openInspectorId, setOpenInspectorId] = useState(null); // the ONLY open menu id
  const inspectorMenuRef = useRef(null);   



   useEffect(() => {
  // keep only ids that still exist
  const existing = new Set((cards || []).map(c => c.id));
  setIsOpenById(prev => {
    const next = {};
    Object.keys(prev).forEach(id => {
      if (existing.has(id)) next[id] = prev[id];
    });
    return next;
  });
}, [cards]);

//   const toggleCardOpen = (id) => {
//   setIsOpenById(prev => {
//     const next = { ...prev };
//     if (next[id]) delete next[id]; else next[id] = true;
//     return next;
//   });
// };
const isTextModalOpen = useCallback(
  (id) => openInspectorId === id,
  [openInspectorId]
);

const toggleTextModal = useCallback((id, event, forceClose = false) => {
  event?.stopPropagation?.();
  setOpenInspectorId((prev) => (forceClose ? null : prev === id ? null : id));
}, []);

const toggleCardOpen = (id) => {
    setIsOpenById((prevState) => {
        // Check if the current id is already open
        if (prevState[id]) {
            // If it is, close it by returning an empty object
            return {};
        } else {
            // Otherwise, open the selected card and close all others
            return { [id]: true };
        }
    });
};

useEffect(() => {
  const handleClickOutside = (event) => {
    const node = inspectorMenuRef.current;
    if (!openInspectorId) return;
    if (node && !node.contains(event.target)) {
      setOpenInspectorId(null);
    }
  };
  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, [openInspectorId]);

const makeWriteFirstItem = (cards, updateCard) => (cardIndex, firstIndex) => (newArr) => {
  const newFirst = Array.isArray(newArr) ? newArr[0] : newArr;
  const current = cards[cardIndex]?.items || [];
  const next = [...current];

  if (firstIndex === -1) {
    if (newFirst) next.unshift(newFirst); // saknades rubrik: lägg in överst
  } else {
    next[firstIndex] = { ...next[firstIndex], ...newFirst }; // ersätt/merga befintlig
  }
  updateCard({ items: next }, cardIndex);
};

// Skriv-funktion för "rest" (alla andra items än first)
const makeWriteRestItems = (cards, updateCard) => (cardIndex, firstItem, firstIndex) => (newRest) => {
  if (firstIndex === -1) {
    // fanns ingen rubrik – rest är hela listan
    updateCard({ items: newRest }, cardIndex);
    return;
  }
  const rebuilt = [...newRest];
  // lägg tillbaka first på sin originalposition
  rebuilt.splice(firstIndex, 0, firstItem);
  updateCard({ items: rebuilt }, cardIndex);
};

useEffect(() => {
  // If there are no cards yet, bootstrap using numberOfCards
  if (!cards?.length) {
    setAttributes({
      cards: Array.from({ length: numberOfCards }, (_, i) => newCard(i)),
    });
    return;
  }

  // Grow/shrink cards array to match numberOfCards while preserving existing content
  if (cards.length !== numberOfCards) {
    let next = [...cards];
    if (numberOfCards > cards.length) {
      const toAdd = numberOfCards - cards.length;
      for (let i = 0; i < toAdd; i++) {
        next.push(newCard(cards.length + i));
      }
    } else {
      next = next.slice(0, numberOfCards);
    }
    setAttributes({ cards: next });
  }
  // no cleanup
}, [numberOfCards]); 

useEffect(() => {
    const menuItems = inspectorMenuItemsFilter(attributes.modalType);
    const items = inspectorItemsFilter(attributes.modalType);
    setInspectorMenuItems(menuItems);
    setInspectorItems(items);
    
}, [attributes.modalType]);

useEffect(() => {
  const validIds = new Set([GLOBAL_TM_ID, ...cards.map(c => c.id)]);
  setOpenTextModals(prev => {
    const next = {};
    Object.keys(prev).forEach(k => { if (validIds.has(k)) next[k] = prev[k]; });
    return next;
  });
}, [cards]);

const newId = () => Date.now() + Math.random();

const ensureList = (arr) => Array.isArray(arr) ? arr : [];

const insertAfter = (arr, idx, value) => {
  const next = [...arr];
  next.splice(idx + 1, 0, value);
  return next;
};

// Recount the `count` property for items within a card
const recountItems = (items) =>
  items.map((it, i) => ({ ...it, count: i + 1 }));

// Deep clone an item with a fresh id (and list copy if needed)
const cloneItem = (item) => {
  const copy = { ...item, id: newId() };
  if (item.type === 'list') copy.list = [...ensureList(item.list)];
  return copy;
};

  const faIconStyle = useMemo(
    () => ({ '--faIcon': faIcon, '--iconColor': faIconColor }),
    [faIcon, faIconColor]
  );

  // -------------- Card-level operations --------------
  // const updateCard = (patch, cardIndex) => {
  //   const next = [...cards];
    
  //   if(cardIndex === undefined){
  //     setAttributes(patch)
  //     return;
  //   }
  //   next[cardIndex] = { ...next[cardIndex], ...patch };
  //   setAttributes({ cards: next });
    
  // };

  const updateCard = (patch, cardIndex) => {
  const next = [...cards];

  // Global patch — låt vara
  if (cardIndex === undefined) {
    setAttributes(patch);
    return;
  }

  const prevCard = next[cardIndex] || {};
  const nextCard = { ...prevCard, ...patch };

  // Räkna om kortets flaggor när items ändras (eller om man tvingar det)
  const itemsChanged = 'items' in patch;
  const forceRecompute = patch?.recomputeFlags === true;

  if (itemsChanged || forceRecompute) {
    const flags = computeTopFlagsFromList(nextCard.items || []);
    nextCard.topSectionFlags = flags;     // <-- sparas på kortet
  }

  next[cardIndex] = nextCard;
  setAttributes({ cards: next });
};


  const moveCard = (from, to) => {
    if (to < 0 || to >= cards.length) return;
    const next = [...cards];
    const [spliced] = next.splice(from, 1);
    next.splice(to, 0, spliced);
    setAttributes({ cards: next });
  };

  const deleteCard = (cardId) => {
    const next = cards.filter(c => c.id !== cardId);
    setAttributes({
      cards: next,
      numberOfCards: Math.max(0, next.length), // håll dessa i synk
    });
};

  const setContentOrientation = () => {
    setAttributes({contentOrientation: !contentOrientation});
  };

     const stopPropagation = (event) => {
        event.stopPropagation(); // Prevent the click from propagating to the parent
    };

const duplicateCard = (cardIndex) => {
  const orig = cards[cardIndex];
  if (!orig) return;

  const clonedItems = recountItems(orig.items.map(cloneItem));
  const clonedCard = {
    ...orig,
    id: `card-${newId()}-${cardIndex + 1}`,
    items: clonedItems,
  };

  const next = insertAfter(cards, cardIndex, clonedCard);
  setAttributes({
    cards: next,
    numberOfCards: next.length,
  });
};


    const writeFirstItem = (cardIndex, firstIndex) => (newArr) => {
  const newFirst = Array.isArray(newArr) ? newArr[0] : newArr;
  const current = cards[cardIndex]?.items || [];
  const next = [...current];

  if (firstIndex === -1) {
    // no heading existed yet — insert at the top
    if (newFirst) next.unshift(newFirst);
  } else {
    // replace/merge the existing first item
    next[firstIndex] = { ...next[firstIndex], ...newFirst };
  }

  updateCard(cardIndex, { items: next });
};

   const modalTypeOptions = [
    { label: 'Hero', value: 'hero' },
    { label: 'Columns', value: 'columns' },
    { label: 'Cards', value: 'cards' },
    { label: 'FAQ/Dropdown', value: 'dropdown' },
    { label: 'Limeform', value: 'lime-form' },
  ];

   const borderOptions = [
    { label: 'Show', value: 'show' },
    { label: 'Hide', value: 'hide' },
  ];

     const widthOptions = [
    { label: 'Full', value: '100%' },
    { label: 'Half', value: '50%' },
  ];

       const cardWidthOptions = [
    { label: 'Card', value: '400px' },
    { label: 'Column', value: '600px' },
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

    const bgImageStyle = [
    { label: 'Shaded', value: 'shaded' },
    { label: 'Color', value: 'color' },
  ];



   const textColorOptions = [
    { label: 'Black', value: '#000000' },
    { label: 'White', value: '#ffffff' },
  ];



const setMobilePosition = (cardIndex, targetPos1Based) => {
  const cards = attributes.cards ?? [];
  const n = cards.length;
  if (!n || cardIndex < 0 || cardIndex >= n) return;

  const norm = cards.map((c, i) => ({
    id: c.id ?? `card-${i}`,
    idx: i,
    pos: Number(c.cardOrderMobile) || (i + 1),
  }));

  const orderedIds = norm
    .slice()
    .sort((a, b) => (a.pos - b.pos) || (a.idx - b.idx))
    .map(o => o.id);

  const currentId = norm[cardIndex].id;
  const fromIdx = orderedIds.indexOf(currentId);
  const toIdx = Math.max(0, Math.min(n - 1, targetPos1Based - 1));
  if (fromIdx === -1) return;

  const newOrder = [...orderedIds];
  newOrder.splice(fromIdx, 1);
  newOrder.splice(toIdx, 0, currentId);

  const next = cards.map((c, i) => {
    const id = c.id ?? `card-${i}`;
    const pos1 = newOrder.indexOf(id) + 1; // 1-based
    return { ...c, cardOrderMobile: pos1 };
  });

  setAttributes({ cards: next });
};




let modalTitle;

switch (attributes.modalType) {
  case 'cards':
    modalTitle = 'Card Modal';
    break;
  case 'columns':
    modalTitle = 'Column Modal';
    break;
  case 'hero':
    modalTitle = 'Hero Modal';
    break;
  case 'dropdown':
    modalTitle = 'FAQ/Dropdown Modal';
    break;
  case 'lime-form':
    modalTitle = 'Lime Modal';
    break;
  default:
    modalTitle = 'Default Modal'; // Optional default case
}
      
  const inspectorMenuItemsFilter = (type) => {    
    if (type === 'hero'){return ['headingmenu', 'paragraphmenu', 'buttonmenu', 'colormenu']}
    if(type ==='cards' || type ==='lime-form' ){return ['headingmenu', 'paragraphmenu', 'colormenu']}
    else{
          return ['headingmenu', 'paragraphmenu', 'listmenu', 'buttonmenu', 'colormenu']
    }
  }

  const inspectorItemsFilter = (type) => {
    if (type === 'hero'){return ['heading', 'paragraph', 'button']}
    if  (type ==='cards' || type ==='lime-form' ){return ['heading', 'paragraph', 'list', 'button']}
    else{
      return ['heading', 'paragraph', 'list', 'button']
    }
  }

  const enableOptions = [
    'heading',
    'paragraph',
    'list',
    'button',
    'color',
    'textcolor',
    ...(attributes.modalType !== 'dropdown' ? ['image', 'imagemenu'] : []),
];

// Samla alla items (wrapper + cards) i en lista
const collectItems = (attributes) => {
  const top = Array.isArray(attributes.items) ? attributes.items : [];
  const fromCards = (attributes.cards ?? []).flatMap(c =>
    Array.isArray(c.items) ? c.items : []
  );
  return [...top, ...fromCards];
};

const computeTopFlagsFromList = (list = []) => {
  const norm = Array.isArray(list) ? list : [];
  const typeOf = (i) =>
    (i && typeof i.type === 'string') ? i.type.toLowerCase() : '';

  const hasText   = norm.some(i => ['heading','paragraph','list'].includes(typeOf(i)));
  const hasImage  = norm.some(i => typeOf(i) === 'image');
  const hasButton = norm.some(i => typeOf(i) === 'button');

  return [
    hasText   && 'contains-text',
    hasImage  && 'contains-image',
    hasButton && 'contains-button',
  ].filter(Boolean).join(' ');
};



useEffect(() => {
  const flags = computeTopFlagsFromList(attributes.items || []);
  if (flags !== (attributes.topSectionFlags || '')) {
    setAttributes({ topSectionFlags: flags });
  }
}, [attributes.items]);

  return (
    <div className="cards-wrapper" {...useBlockProps({ style: { ...faIconStyle,  backgroundColor } })}>
      <InspectorControls>
        <Panel>
           <PanelBody 
              title={
                  <>
                      <span className='grid panel-body-span'>
                          {/* <span className='chevron-icon'/> */}
                          {modalTitle}
                          <span className={`plus-icon ${isTextModalOpen(GLOBAL_TM_ID) ? 'true' : 'false'}`} onClick={(e) => toggleTextModal(GLOBAL_TM_ID, e)} style={{ cursor: 'pointer' }} />
                      </span>
                     <div
                      className="text-inspector-menu"
                      data-open={isTextModalOpen(GLOBAL_TM_ID)}
                      hidden={!isTextModalOpen(GLOBAL_TM_ID)}
                      ref={isTextModalOpen(GLOBAL_TM_ID) ? inspectorMenuRef : null}
                      onClick={(e) => e.stopPropagation()} // clicks inside shouldn't bubble to document
                      >
                      <TextModalInspector
                          readItems={() => attributes.items}                      
                          writeItems={(newItems) => setAttributes({ items: newItems })}
                          enable={inspectorMenuItems}
                          updateCard={updateCard}
                          context={{ scope: 'global' }}  
                          />
                    {attributes.modalType !== 'hero' && attributes.modalType !== 'lime-form' &&(
                      <Button 
                        className="inspector-button" 
                        onClick={() => setAttributes({ numberOfCards: numberOfCards + 1 })}>
                        Add card
                      </Button>
                      )}
                    </div>
                  </>
              } 
              opened={isGlobalOpen}            // controlled: always open
              onToggle={() => setGlobalOpen(true)}
              initialOpen={true}
              className="panel-body"
              >
            {renderControl('Modal type:', 'modalType', modalTypeOptions, attributes, setAttributes)}
             {attributes.modalType !== 'hero' && attributes.modalType !== 'lime-form' && (
              <>
              {renderControl('Card border:', 'cardBorder', borderOptions, attributes, setAttributes)}
              {/* {renderControl('Card width:', 'cardWidthOptions', cardWidthOptions, attributes, setAttributes)} */}
              </>
             )}
           
             {cards.length !== 0 && attributes.modalType !== 'hero' && attributes.modalType !== 'lime-form' &&
                cards.some(card => 
                  card.items && card.items.some(item => item.image)) && (
                    <>
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
                  {renderControl('Image sizing:', 'imageSize', imageSizingOptions, attributes, setAttributes)}
                  {renderControl('Image aspect:', 'imageAspect', imageAspectOptions, attributes, setAttributes)}
              </>
                    
                  )}
                    {renderControl('Text color:', 'textColor', textColorOptions, attributes, setAttributes)}
            <PanelRow className="grid grid-2-button inspector-row">
                       Background color:
                      {bgImageStyle.map(option => {
                        switch (option.label) {
                          case 'Shaded':
                            return(
                              <Button 
                                  key={option.value} 
                                  className={`inspector-button ${attributes.bgImageStyle === option.value ? 'active' : 'inactive'}`}
                                  onClick={() => setAttributes({ bgImageStyle: option.value })} // Update image aspect attribute
                                  disabled={attributes.bgImageStyle === option.value} 
                                  aria-label={`Background Image Style ${option.label}`}>
                                  {option.label}
                              </Button> 
                            )                    
                          case 'Color':
                            return(
                              // <Button 
                              //     key={option.value} 
                              //     className="inspector-button" 
                              //     onClick={() => setAttributes({ backgroundColor: option.value })} // Update card border attribute
                              //     aria-label={`backgroundColor ${option.label}`}>
                              //     {option.label}
                              // </Button>
                            <TextModalInspector
                              readItems={() => attributes.items}
                              writeItems={(newItems) => setAttributes({ items: newItems })}
                              enable={['color']}
                              minimal={true}
                              previewBg={attributes.backgroundColor}
                              initialBackgroundColor={attributes.backgroundColor}
                              updateCard={updateCard}
                              context={{ scope: 'global' }}
                            />
                            
                          )}
                        })}
                  </PanelRow>
            <TextModalInspector
              readItems={() => attributes.items}
              writeItems={(newItems) => setAttributes({ items: newItems })}
              // enable={['heading', 'paragraph', 'color']}
              enable={inspectorItems}
              previewBg={attributes.backgroundColor}
              initialBackgroundColor={attributes.backgroundColor}
              updateCard={updateCard}
              context={{ scope: 'global' }}
            />
          </PanelBody>

          {attributes.modalType !== 'hero' && attributes.modalType !== 'lime-form' && cards.map((card, i) => {
            const firstHeading = card.items.find(it => it.type === 'heading' && it.text);
            const cardTitle = 
              attributes.modalType === 'cards' ? 'Card' :
              attributes.modalType === 'columns' ? 'Column' :
              attributes.modalType === 'dropdown' ? 'Dropdown' :
              'Card'; // Fallback value if none match
            const title = (cardTitle+' '+(i+1));
            const disableUp = i === 0;
            const disableDown = i === cards.length - 1;
            
            return (
              <>
              
              <PanelBody 
                title={
                          <>
                              <span className='grid panel-body-span'>
                                  {title}
                                  <span className={`plus-icon ${isTextModalOpen(card.id) ? 'true' : 'false'}`} onClick={(e) => toggleTextModal(card.id, e)} style={{ cursor: 'pointer' }} />
                              </span>
                              <div className="text-inspector-menu" 
                              data-open={isTextModalOpen(card.id)}
                              hidden={!isTextModalOpen(card.id)}
                              ref={isTextModalOpen(card.id) ? inspectorMenuRef : null}
                              onClick={(e) => e.stopPropagation()}>
                                   <TextModalInspector
                                       readItems={() => cards[i].items}
                                       writeItems={(newItems) => updateCard({ items: newItems }, i)}
                                       enable={['headingmenu', 'paragraphmenu', 'listmenu', 'buttonmenu']}
                                       previewBg={card.backgroundColor}
                                       initialBackgroundValue = {card.backgroundColor}
                                       backgroundColor={attributes.backgroundColor}
                                       updateCard={updateCard}
                                       onChangeBackgroundColor={(c) => setAttributes({ backgroundColor: c })}
                                       context={{ scope: 'card', cardIndex: i }}
                                     />
                                   <PanelRow className="grid grid-4-button no-title minimal inspector-row">
                                   <RowButtons
                                     onUp={() => moveCard(i, i - 1)}
                                     onDown={() => moveCard(i, i + 1)}
                                     onRemove={() => deleteCard(card.id)}
                                     onDuplicate={() => duplicateCard(i)}
                                     disableUp={disableUp}
                                     disableDown={disableDown}
                                     modalType='cardIconRowbutton'
                                   />
                                 </PanelRow>
                               </div>
                          </>
                      }  
                key={`card-controls-${card.id}`} 
                className="card-item panel-body" 
                initialOpen={false}>
                <div style={{'--grid-template-columns': 'auto 1fr'}}>
                   <TextModalInspector
                            readItems={() => cards[i].items}
                            writeItems={(newItems) => updateCard({ items: newItems }, i)}
                            enable={enableOptions}
                            previewBg={card.backgroundColor}
                            initialBackgroundValue = {card.backgroundColor}
                            backgroundColor={attributes.backgroundColor}
                            attributes={attributes}
                            card={card}
                            updateCard={updateCard}
                            onChangeBackgroundColor={(c) => setAttributes({ backgroundColor: c })}
                            onSetMobilePosition={(pos) => setMobilePosition(i, pos)}   // ← new prop
                            context={{ scope: 'card', cardIndex: i }} // valfritt
                          />
                </div>
              </PanelBody>
              </>
            );
          })}
        </Panel>
      </InspectorControls>

      {/* Frontend/Editor preview */}
      <article className={`card-modal-article ${attributes.bgImageStyle} ${attributes.modalType} article`} style={{backgroundColor: backgroundColor}}>
        {topSectionFlags !== '' || attributes.modalType === 'lime-form' ?
        <section className={`card-modal-section ${attributes.modalType}`}>
          <TextModalRender
                readItems={() => attributes.items}
                writeItems={(newItems) => setAttributes({ items: newItems })}
                enable={inspectorItems}
                backgroundColor={attributes.backgroundColor}
                context={{ scope: 'global' }}
                attributes={attributes}
                />
          {attributes.modalType === 'lime-form' &&
            <div className="custom-container">
                  <InnerBlocks />
            </div>
          }       
        </section>
        : ''}
        {attributes.modalType !== 'hero' && attributes.modalType !== 'lime-form' && cards.length > 0 && 
        <div className={`cards-grid ${attributes.modalType}`}>
          {cards.map((card, i) => {
            const open = !!isOpenById[card.id];
            return (
              <section
              key={card.id}
              className={`${attributes.modalType === 'dropdown' ? 'dropdown-modal-card' : 'card-modal-card'} ${attributes.imageSize} ${attributes.align} ${attributes.cardBorder}`}
              style={{ backgroundColor: card.backgroundColor, "--currentCardOrder": card.cardOrderMobile }}
              >
                {attributes.modalType === 'dropdown' ? (
                  (() => {
                    const { first, rest, firstIndex } = splitItemsOnFirstHeading(cards[i].items || []);
                    const writeFirst = makeWriteFirstItem(cards, updateCard)(i, firstIndex);
                    const writeRest  = makeWriteRestItems(cards, updateCard)(i, first, firstIndex);

                    const open = !!isOpenById[card.id]; // din befintliga state

                    return (
                      <details
                        key={card.id}
                        className={`accordion-card ${attributes.cardBorder}`}
                        style={{ backgroundColor: card.backgroundColor, color: textColor }}
                        // Viktigt: lämna bort "open" för att vara stängd som default
                        {...(open ? { open: true } : {})}
                      >
                        <summary
                          className="accordion-card__summary"
                          role="button"
                          aria-expanded={open}
                          onClick={(e) => {
                            e.preventDefault();
                            toggleCardOpen(card.id);
                          }}
                        >
                          <TextModalRender
                            // Visa ENDAST rubriken i summary
                            readItems={() => [first ?? { type: 'heading', text: 'Untitled', headingType: 'h2', size: 'xl' }]}
                            writeItems={writeFirst}
                            attributes={attributes}
                            backgroundColor={card.backgroundColor}
                            cardAttributes={card}
                            enable={['heading']}
                            className={`text-wrapper`}
                            context={{ scope: 'card', cardIndex: i }}
                          />
                        </summary>

                        <div className="accordion-card__content">
                          <TextModalRender
                            // Visa resten i innehållet
                            readItems={() => rest}
                            writeItems={writeRest}
                            backgroundColor={card.backgroundColor}
                            contentOrientation={contentOrientation}
                            cardAttributes={card}
                            attributes={attributes}
                            className={`text-wrapper`}
                            enable={enableOptions}
                            context={{ scope: 'card', cardIndex: i }}
                          />
                        </div>
                      </details>
                    );
                  })()
                ) : (
                  // ... din befintliga icke-dropdown-render (oförändrad)
                  <TextModalRender
                    readItems={() => cards[i].items}
                    writeItems={(newItems) => updateCard({ items: newItems }, i)}
                    backgroundColor={card.backgroundColor}
                    enable={inspectorItems}
                    contentOrientation={contentOrientation}
                    attributes={attributes}
                    cardAttributes={card}
                    className={`text-wrapper`}
                    context={{ scope: 'card', cardIndex: i }}
                  />
                )}

              </section>

            );
          })}
         </div>
          }
          {/* {attributes.modalType === 'dropdown' && 
                <section className="faq-grid cards-grid">
                          {cards.map((card, i) => {
                            const { first, rest, firstIndex } = splitItemsOnFirstHeading(card.items || []);
                                const writeRestItems = makeWriteRestItems(i, first, firstIndex);
                                const writeFirst = writeFirstItem(i, firstIndex);
                                const open = !!isOpenById[card.id];
                                return (
                                <details
                                    key={card.id}
                                    className={`accordion-card ${attributes.align} ${attributes.cardBorder}`}
                                    style={{ backgroundColor: card.backgroundColor, color: textColor }}
                                    open={open}             
                                >
                                    <summary
                                    className="accordion-card__summary"
                                    role="button"
                                    aria-expanded={open}
                                    onClick={(e) => {
                                        e.preventDefault();    
                                        toggleCardOpen(card.id);
                                    }}
                                    >
                                    <TextModalRender
                                        readItems={() => [first ?? { type: 'heading', text: __('Untitled'), headingType: 'h2' }]}
                                        writeItems={writeFirst}                     
                                        attributes={attributes}
                                        backgroundColor={card.backgroundColor}
                                        cardAttributes={card}
                                        enable={['heading']}
                                        className={`text-wrapper ${attributes.align}`}
                                        context={{ scope: 'card', cardIndex: i }}
                                        />
                                    </summary>
                                    <div className="accordion-card__content">
                                        <TextModalRender
                                            readItems={() => rest}
                                            writeItems={writeRestItems}
                                            backgroundColor={card.backgroundColor}
                                            contentOrientation={contentOrientation}
                                            attributes={attributes}
                                            buttonClass="card-button"
                                            className={`text-wrapper ${attributes.align}`}
                                            enable={inspectorItems}
                                            context={{ scope: 'card', cardIndex: i }}
                                        />
                                    </div>
                                </details>
                                );

                          })}
                        </section>
          } */}
      </article>
    </div>
  );
}

