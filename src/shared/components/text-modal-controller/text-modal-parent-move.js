/**
 * shared/components/text-modal/text-modal-parent-move.js
 *
 * Parent moving helpers for TextModalControllers.
 * - Text-only: heading / paragraph / list / innerblock
 * - Batches updates to avoid race conditions (single setAttributes call per move)
 */

const TEXT_TYPES = new Set(['heading', 'paragraph', 'list', 'innerblock']);

const isText = (it) => TEXT_TYPES.has(String(it?.type || '').toLowerCase());
const safeArr = (a) => (Array.isArray(a) ? a : []);
const findItemIndexById = (arr, id) => safeArr(arr).findIndex((it) => it?.id === id);

/**
 * Recount "count" per type (matches your current text-modal recount behavior).
 * If you instead want count = i+1, swap implementation.
 */
const recountByType = (arr) => {
  const tally = {};
  return safeArr(arr).map((it) => {
    const t = String(it?.type || '');
    tally[t] = (tally[t] || 0) + 1;
    return { ...it, count: tally[t] };
  });
};

/**
 * Mirrors the "contains-text/image/button" flags used in your cards.
 * Keeps card wrapper classes in sync after moves.
 */
const computeTopFlagsFromList = (list = []) => {
  const norm = safeArr(list);
  const typeOf = (i) => (i && typeof i.type === 'string' ? i.type.toLowerCase() : '');

  const hasText = norm.some((i) => ['heading', 'paragraph', 'list', 'innerblock'].includes(typeOf(i)));
  const hasImage = norm.some((i) => typeOf(i) === 'image');
  const hasButton = norm.some((i) => typeOf(i) === 'button');

  return [hasText && 'contains-text', hasImage && 'contains-image', hasButton && 'contains-button']
    .filter(Boolean)
    .join(' ');
};

export function createParentMoveHandlers({ attributes, setAttributes, context }) {
  const cards = safeArr(attributes?.cards);

  const getCardItems = (i) => safeArr(cards?.[i]?.items);
  const getGlobalItems = () => safeArr(attributes?.items);

  /**
   * Card -> Global (append at end)
   */
  const handleBreakOut = (activeId) => {
    if (!activeId) return;
    if (context?.scope !== 'card') return;

    const fromCardIndex = context.cardIndex;
    if (typeof fromCardIndex !== 'number') return;
    if (!cards[fromCardIndex]) return;

    const fromItems = getCardItems(fromCardIndex);
    const fromIndex = findItemIndexById(fromItems, activeId);
    if (fromIndex === -1) return;

    const moving = fromItems[fromIndex];
    if (!isText(moving)) return;

    const nextFromItems = recountByType(fromItems.filter((_, i) => i !== fromIndex));
    const nextGlobalItems = recountByType([...getGlobalItems(), moving]);

    const nextCards = [...cards];
    nextCards[fromCardIndex] = {
      ...nextCards[fromCardIndex],
      items: nextFromItems,
      topSectionFlags: computeTopFlagsFromList(nextFromItems),
    };

    setAttributes({
      items: nextGlobalItems,
      cards: nextCards,
    });
  };

  /**
   * Card -> Neighbor Card (append at end of target)
   * NOTE: This is the race-condition safe version (single setAttributes).
   */
  const handleMoveIntoCard = (activeId, targetCardIndex) => {
  if (!activeId) return;

  const cards = safeArr(attributes?.cards);
  if (targetCardIndex < 0 || targetCardIndex >= cards.length) return;

  // FROM: GLOBAL -> CARD
  if (context?.scope === 'global') {
    const globalItems = safeArr(attributes?.items);
    const fromIndex = findItemIndexById(globalItems, activeId);
    if (fromIndex === -1) return;

    const moving = globalItems[fromIndex];
    if (!isText(moving)) return;

    const targetItems = safeArr(cards[targetCardIndex]?.items);

    const nextGlobalItems = recountByType(globalItems.filter((_, i) => i !== fromIndex));
    const nextTargetItems = recountByType([...targetItems, moving]);

    const nextCards = [...cards];
    nextCards[targetCardIndex] = {
      ...nextCards[targetCardIndex],
      items: nextTargetItems,
      topSectionFlags: computeTopFlagsFromList(nextTargetItems),
    };

    setAttributes({ items: nextGlobalItems, cards: nextCards });
    return;
  }

  // FROM: CARD -> CARD
  if (context?.scope === 'card') {
    const fromCardIndex = context.cardIndex;
    if (typeof fromCardIndex !== 'number') return;
    if (fromCardIndex === targetCardIndex) return;

    const fromItems = safeArr(cards[fromCardIndex]?.items);
    const toItems = safeArr(cards[targetCardIndex]?.items);

    const fromIndex = findItemIndexById(fromItems, activeId);
    if (fromIndex === -1) return;

    const moving = fromItems[fromIndex];
    if (!isText(moving)) return;

    const nextFromItems = recountByType(fromItems.filter((_, i) => i !== fromIndex));
    const nextToItems = recountByType([...toItems, moving]);

    const nextCards = [...cards];
    nextCards[fromCardIndex] = {
      ...nextCards[fromCardIndex],
      items: nextFromItems,
      topSectionFlags: computeTopFlagsFromList(nextFromItems),
    };
    nextCards[targetCardIndex] = {
      ...nextCards[targetCardIndex],
      items: nextToItems,
      topSectionFlags: computeTopFlagsFromList(nextToItems),
    };

    setAttributes({ cards: nextCards });
  }
};


  return {
    handleBreakOut,
    handleMoveIntoCard,
  };
}
