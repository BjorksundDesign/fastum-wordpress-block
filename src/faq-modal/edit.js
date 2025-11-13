import { __ } from '@wordpress/i18n';
import {
  InspectorControls,
  RichText,
  useBlockProps,
  LinkControl,
  ColorPalette,
  MediaUpload,
} from '@wordpress/block-editor';
import {
  Panel,
  PanelBody,
  PanelRow,
  Button,
  TextControl,
  ToggleControl,
  SelectControl,
  RangeControl,
} from '@wordpress/components';
import { TextModalInspector, TextModalRender, RowButtons } from '../shared/components/text-modal';
import { useEffect, useMemo, useState, useCallback } from '@wordpress/element';
import { IconColorPickerRow, ColorPickerRow } from '../shared/components/color-icon-picker';
import { Image } from '@10up/block-components';
import './editor.scss';
import '../styles/scss/global.scss'


/**
 * ================================================================
 * Dynamic Card Wrapper — single block with N cards, each card can
 * contain heading/paragraph/list/button (per-card), optional image,
 * and its own controls. Numbers of cards is controlled by
 * `numberOfCards`.
 * ================================================================
 */

// ---------- helpers (colors/contrast) ----------

const getLuminance = (hex) => {
  if (!hex) return 0;
  const [r, g, b] = hex
    .replace('#', '')
    .match(/.{1,2}/g)
    .map((x) => parseInt(x, 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const getContrastRatio = (bg, fg) => {
  const L1 = getLuminance(bg);
  const L2 = getLuminance(fg);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
};
const getTextColor = (bg) => {
  const black = '#000000';
  const white = '#FFFFFF';
  return getContrastRatio(bg, black) >= 7 ? black : white;
};
const getButtonTone = (bg) => (getContrastRatio(bg, '#000000') >= 4.5 ? 'black' : 'white');

// ---------- defaults ----------
const DEFAULT_FA_ICON = '\"\\f00c\"'; // CSS content escaped
const DEFAULT_FA_ICON_COLOR = '#E03131';

const newItem = (type, indexInCard) => ({
  id: Date.now() + Math.random(),
  type, // 'heading' | 'paragraph' | 'list' | 'button'
  text: '',
  list: type === 'list' ? ['Item 1'] : [],
  url: '',
  isPrimary: true,
  icon: DEFAULT_FA_ICON,
  iconColor: DEFAULT_FA_ICON_COLOR,
  size: type === 'heading' ? 'm' : '',
  count: indexInCard + 1,
  headingType: type === 'heading' ? 'h2' : undefined,
});

const newCard = (i) => ({
  id: `card-${Date.now()}-${i}`,
  items: [newItem('heading', 0), newItem('paragraph', 0), newItem('button', 0)],
  image: null,
  align: 'left',
  backgroundColor: '#ffffff',
  topIconRaw: '',                 // t.ex. "f005"
  topIcon: '""',                  // CSS content t.ex. '"\f005"'
  topIconColor: '#000000',
});

const MAX_TITLE_LENGTH = 30; // Set your desired maximum length

const truncateTitle = (title) => {
  if (!title) return __('Card');
  return title.length > MAX_TITLE_LENGTH ? title.slice(0, MAX_TITLE_LENGTH) + '...' : title;
};

// ---------- FAQ splitting helper ----------
export const splitItemsOnFirstHeading = (items = []) => {
  if (!items.length) return { first: null, rest: [], firstIndex: -1 };
  const firstHeadingIdx = items.findIndex((it) => it?.type === 'heading');
  const idx = firstHeadingIdx >= 0 ? firstHeadingIdx : 0;
  const first = items[idx] || null;
  const rest = items.filter((_, i) => i !== idx);
  return { first, rest, firstIndex: idx };
};

export default function Edit(props) {
  const { attributes, setAttributes } = props;
  const {
    numberOfCards = 3,
    cards = [], // [{id, items: [...], image, align, backgroundColor}]
    columnOrder = false,
    faIcon = DEFAULT_FA_ICON,
    items = [],
    backgroundColor,
    faIconColor = DEFAULT_FA_ICON_COLOR,
    contentOrientation,
    disableTypes = { heading: false, paragraph: false, list: false, image: false },
  } = attributes;

  const [isColorPickerOpen, setIsColorPickerOpen] = useState({});
  // track accordion open state per card (editor only)
  const [isOpenById, setIsOpenById] = useState({});
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

  const faIconStyle = useMemo(
    () => ({ '--faIcon': faIcon, '--iconColor': faIconColor }),
    [faIcon, faIconColor]
  );

  // -------------- Card-level operations --------------
  const updateCard = (cardIndex, patch) => {
    const next = [...cards];
    next[cardIndex] = { ...next[cardIndex], ...patch };
    setAttributes({ cards: next });
  };

    const GLOBAL_TM_ID = 'global';
  const [openTextModals, setOpenTextModals] = useState({}); // { [id: string]: boolean }

  const isTextModalOpen = (id) => !!openTextModals[id];

  const toggleTextModal = (id, event) => {
    event?.stopPropagation?.();
    setOpenTextModals(prev => (prev[id] ? {} : { [id]: true }));
    // If you want ONLY ONE open at a time, use:
    // setOpenTextModals(prev => (prev[id] ? {} : { [id]: true }));
  };

  const moveCard = (from, to) => {
    if (to < 0 || to >= cards.length) return;
    const next = [...cards];
    const [spliced] = next.splice(from, 1);
    next.splice(to, 0, spliced);
    setAttributes({ cards: next });
  };

  const deleteCard = (cardId) => {
  const next = cards.filter((c) => c.id !== cardId);
  setAttributes({
    cards: next,
    numberOfCards: Math.max(0, next.length),
  });
  // also remove any dangling open state
  setIsOpenById(prev => {
    if (!prev[cardId]) return prev;
    const { [cardId]: _removed, ...rest } = prev;
    return rest;
  });
};

  const toggleCardOpen = (id) => {
  setIsOpenById(prev => {
    const next = { ...prev };
    if (next[id]) delete next[id]; else next[id] = true;
    return next;
  });
};

  const setContentOrientation = () => {
    setAttributes({ contentOrientation: !contentOrientation });
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

  // helper to create a writer that merges "rest" back into the card while preserving first heading
  const makeWriteRestItems = useCallback(
    (cardIndex, firstItem, firstIndex) => (newRest) => {
      if (firstIndex === -1) {
        updateCard(cardIndex, { items: newRest });
        return;
      }
      const rebuilt = [...newRest];
      rebuilt.splice(firstIndex, 0, firstItem);
      updateCard(cardIndex, { items: rebuilt });
    },
    [updateCard]
  );

  return (
    <div className="cards-wrapper" {...useBlockProps({ style: { ...faIconStyle, backgroundColor } })}>
      <InspectorControls>
        <Panel>
          <PanelBody title={__('Modal text')} initialOpen={false}>
            <TextModalInspector
              readItems={() => attributes.items}                      // läser från global items
              writeItems={(newItems) => setAttributes({ items: newItems })} // skriver globalt
              enable={['heading', 'paragraph', 'button', 'headingmenu', 'paragraphmenu', 'buttonmenu']}
              previewBg={attributes.backgroundColor}
              context={{ scope: 'global' }}   // kan du använda internt om du vill
            />
          </PanelBody>
          <PanelBody title={__('Card Settings')} initialOpen>
            <ColorPickerRow
              value={backgroundColor}
              onChange={(c) => setAttributes({ backgroundColor: c })}
            />
            <Button 
              className="grid grid-no-button inspector-row inspector-button" 
              onClick={() => setAttributes({ numberOfCards: numberOfCards + 1 })}>
              Add card
            </Button>
            <PanelRow>
              <ToggleControl
                label={__('Invert column order')}
                checked={contentOrientation}
                onChange={setContentOrientation}
              />
            </PanelRow>
          </PanelBody>

          {cards.map((card, i) => {
            const firstHeading = card.items.find((it) => it.type === 'heading' && it.text);
            const title = truncateTitle(firstHeading?.text?.trim()) || __('Card');
                        const disableUp = i === 0;
            const disableDown = i === cards.length - 1;
            return (
              <div key={`card-controls-wrap-${card.id}`}>
                <PanelBody 
                title={
                  <>
                      <span className='grid panel-body-span'>
                          {title}
                          <span className={`plus-icon ${isTextModalOpen(card.id) ? 'true' : 'false'}`} onClick={(e) => toggleTextModal(card.id, e)} style={{ cursor: 'pointer' }} />
                      </span>
                      {isTextModalOpen(card.id) && (
                        <div className="text-inspector-menu">
                            <TextModalInspector
                                readItems={() => cards[i].items}
                                writeItems={(newItems) => updateCard(i, { items: newItems })}
                                enable={['headingmenu', 'paragraphmenu', 'listmenu', 'buttonmenu']}
                                previewBg={card.backgroundColor}
                                initialBackgroundValue = {card.backgroundColor}
                                backgroundColor={attributes.backgroundColor}
                                updateCard={updateCard}
                                onChangeBackgroundColor={(c) => setAttributes({ backgroundColor: c })}
                                context={{ scope: 'card', cardIndex: i }} // valfritt
                              />
                            <PanelRow className="grid grid-4-button inspector-row">
                            <RowButtons
                              onUp={() => moveCard(i, i - 1)}
                              onDown={() => moveCard(i, i + 1)}
                              onRemove={() => deleteCard(card.id)}
                              onDuplicate={() => duplicateCard(i)}
                              disableUp={disableUp}
                              disableDown={disableDown}
                            />
                          </PanelRow>
                        </div>
                    )}
                  </>
              }  
                
                
                
                key={`card-controls-${card.id}`} initialOpen>
                  <div style={{ '--grid-template-columns': 'auto 1fr' }}>
                    <TextModalInspector
                      readItems={() => cards[i].items}
                      writeItems={(newItems) => updateCard(i, { items: newItems })}
                      enable={['heading', 'paragraph', 'button','color', 'list','listmenu', 'headingmenu', 'paragraphmenu', 'buttonmenu']}
                      previewBg={card.backgroundColor}
                      initialBackgroundValue={card.backgroundColor}
                      backgroundColor={attributes.backgroundColor}
                      updateCard={updateCard}
                      onChangeBackgroundColor={(c) => setAttributes({ backgroundColor: c })}
                      context={{ scope: 'card', cardIndex: i }} // valfritt
                    />
                  </div>
                </PanelBody>
                <div className="card-list-button-wrapper" style={{ marginLeft: 'auto' }}>
                  <Button onClick={() => moveCard(i, i - 1)} disabled={i === 0}>↑</Button>
                  <Button onClick={() => moveCard(i, i + 1)} disabled={i === cards.length - 1}>↓</Button>
                  <Button isDestructive onClick={() => deleteCard(card.id)} aria-label={__('Delete card')}>×</Button>
                </div>
              </div>
            );
          })}
        </Panel>
      </InspectorControls>

      {/* Frontend/Editor preview */}
      <article className={`faq-modal-article article`}>
        {/* Keep global section as a normal section (not an accordion) */}
        <section className={`faq-modal-section`}>
          <TextModalRender
            readItems={() => attributes.items}
            writeItems={(newItems) => setAttributes({ items: newItems })}
            backgroundColor={attributes.backgroundColor}
            context={{ scope: 'global' }}
            attributes={attributes}
          />
        </section>

        {/* GRID OF PER-CARD ACCORDIONS */}
        <div className="faq-grid">
          {cards.map((card, i) => {
            const { first, rest, firstIndex } = splitItemsOnFirstHeading(card.items || []);
                 const writeRestItems = makeWriteRestItems(i, first, firstIndex);
                const writeFirst = writeFirstItem(i, firstIndex);
                const open = !!isOpenById[card.id];
                const textColor = getTextColor(card.backgroundColor || '#000000');
                return (
                <details
                    key={card.id}
                    className={`accordion-card ${attributes.align} ${attributes.cardBorder}`}
                    style={{ backgroundColor: card.backgroundColor, color: textColor }}
                    open={open}                 // controlled by React
                >
                    <summary
                    className="accordion-card__summary"
                    role="button"
                    aria-expanded={open}
                    onClick={(e) => {
                        e.preventDefault();     // stop native <details> toggling
                        toggleCardOpen(card.id);
                    }}
                    >
                     <TextModalRender
                        readItems={() => [first ?? { type: 'heading', text: __('Untitled'), headingType: 'h2' }]}
                        writeItems={writeFirst}                      // <-- write into this card
                        context={{ scope: 'card', cardIndex: i }}
                        attributes={attributes}
                        backgroundColor={card.backgroundColor}
                        // (optional) lock to heading-only to avoid changing type in summary:
                        disable={{ heading: false, paragraph: true, list: true, image: true, button: true }}
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
                            context={{ scope: 'card', cardIndex: i }}
                        />
                    </div>
                </details>
                );

          })}
        </div>
      </article>
    </div>
  );
}
