import { Button } from '@wordpress/components';

const TEXT_TYPES = new Set(['heading', 'paragraph', 'list']);
const isText = (item) => TEXT_TYPES.has(String(item?.type || '').toLowerCase());

const recountItems = (items) => items.map((it, i) => ({ ...it, count: i + 1 }));

const safeArr = (a) => (Array.isArray(a) ? a : []);

const moveWithin = (arr, from, to) => {
  if (to < 0 || to >= arr.length) return arr;
  const next = [...arr];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
};

const removeByIndex = (arr, idx) => {
  const next = [...arr];
  next.splice(idx, 1);
  return next;
};

const insertAtEnd = (arr, item) => [...arr, item];

const getContainer = ({ scope, cardIndex }, attributes) => {
  if (scope === 'global') return safeArr(attributes.items);
  return safeArr(attributes.cards?.[cardIndex]?.items);
};

const setContainer = ({ scope, cardIndex }, nextItems, ctx) => {
  const { attributes, setAttributes, updateCard } = ctx;

  // Recount alltid (matchar er befintliga logik i edit.js)
  const recounted = recountItems(nextItems);

  if (scope === 'global') {
    setAttributes({ items: recounted });
  } else {
    // updateCard finns redan och hanterar flaggor när items ändras
    updateCard({ items: recounted }, cardIndex);
  }
};

const findItemIndexById = (items, id) => items.findIndex((it) => it?.id === id);

export function ItemParentMover({
  // required
  item,
  itemId,
  scope, // 'global' | 'card'
  cardIndex, // number when scope === 'card'
  attributes,
  setAttributes,
  updateCard,

  // optional: om du vill använda samma komponent för upp/ner också
  enableMoveUpDown = false,

  // UI tweaks
  className = '',
}) {
  const id = itemId || item?.id;
  if (!id || !isText(item)) return null;

  const ctx = { attributes, setAttributes, updateCard };

  const cardsCount = safeArr(attributes.cards).length;
  const hasCards = cardsCount > 0;

  const fromRef = { scope, cardIndex };
  const fromItems = getContainer(fromRef, attributes);
  const fromIndex = findItemIndexById(fromItems, id);
  if (fromIndex === -1) return null;

  const canMoveLeft = scope === 'card' && typeof cardIndex === 'number' && cardIndex > 0;
  const canMoveRight = scope === 'card' && typeof cardIndex === 'number' && cardIndex < cardsCount - 1;

  const moveUp = () => {
    const next = moveWithin(fromItems, fromIndex, fromIndex - 1);
    setContainer(fromRef, next, ctx);
  };

  const moveDown = () => {
    const next = moveWithin(fromItems, fromIndex, fromIndex + 1);
    setContainer(fromRef, next, ctx);
  };

  const breakOutToGlobal = () => {
    // card -> global
    if (scope !== 'card') return;

    const globalRef = { scope: 'global' };
    const globalItems = getContainer(globalRef, attributes);

    const moving = fromItems[fromIndex];
    if (!isText(moving)) return;

    const nextFrom = removeByIndex(fromItems, fromIndex);
    const nextGlobal = insertAtEnd(globalItems, moving);

    setContainer(fromRef, nextFrom, ctx);
    setContainer(globalRef, nextGlobal, ctx);
  };

  const moveToNeighborCard = (dir) => {
    if (scope !== 'card') return;
    const targetCardIndex = dir === 'left' ? cardIndex - 1 : cardIndex + 1;
    if (targetCardIndex < 0 || targetCardIndex >= cardsCount) return;

    const targetRef = { scope: 'card', cardIndex: targetCardIndex };
    const targetItems = getContainer(targetRef, attributes);

    const moving = fromItems[fromIndex];
    if (!isText(moving)) return;

    const nextFrom = removeByIndex(fromItems, fromIndex);
    const nextTarget = insertAtEnd(targetItems, moving);

    setContainer(fromRef, nextFrom, ctx);
    setContainer(targetRef, nextTarget, ctx);
  };

  const insertIntoFirstCard = () => {
    // global -> card 0
    if (scope !== 'global') return;
    if (!hasCards) return;

    const targetRef = { scope: 'card', cardIndex: 0 };
    const targetItems = getContainer(targetRef, attributes);

    const moving = fromItems[fromIndex];
    if (!isText(moving)) return;

    const nextGlobal = removeByIndex(fromItems, fromIndex);
    const nextTarget = insertAtEnd(targetItems, moving);

    setContainer(fromRef, nextGlobal, ctx);
    setContainer(targetRef, nextTarget, ctx);
  };

  return (
    <div className={`item-parent-mover ${className}`}>
      {enableMoveUpDown && (
        <>
          <Button
            onClick={moveUp}
            disabled={fromIndex <= 0}
            className="inspector-button row-button fa-icon-base move-up"
            aria-label="Move up"
          />
          <Button
            onClick={moveDown}
            disabled={fromIndex >= fromItems.length - 1}
            className="inspector-button row-button fa-icon-base move-down"
            aria-label="Move down"
          />
        </>
      )}

      {/* Card actions */}
      {scope === 'card' && (
        <>
          <Button
            onClick={breakOutToGlobal}
            className="inspector-button row-button fa-icon-base break-out"
            aria-label="Break out to global"
          />
          <Button
            onClick={() => moveToNeighborCard('left')}
            disabled={!canMoveLeft}
            className="inspector-button row-button fa-icon-base move-card-left"
            aria-label="Move to previous card"
          />
          <Button
            onClick={() => moveToNeighborCard('right')}
            disabled={!canMoveRight}
            className="inspector-button row-button fa-icon-base move-card-right"
            aria-label="Move to next card"
          />
        </>
      )}

      {/* Global actions */}
      {scope === 'global' && (
        <Button
          onClick={insertIntoFirstCard}
          disabled={!hasCards}
          className="inspector-button row-button fa-icon-base insert-first-card"
          aria-label="Insert into first card"
        />
      )}
    </div>
  );
}
