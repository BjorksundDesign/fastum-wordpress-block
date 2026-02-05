import { BlockControls } from '@wordpress/block-editor';
import { ToolbarGroup, ToolbarButton, ToolbarDropdownMenu, Dropdown, MenuGroup, MenuItem  } from '@wordpress/components';
import { chevronUp,
  chevronDown,
  copy,
  trash,
  check,
  arrowLeft,
  arrowRight,
  external,
  login, } from '@wordpress/icons';
import { createParentMoveHandlers } from './text-modal-parent-move';
import { __ } from '@wordpress/i18n';

export function TextModalControllers({
  activeId,
  orderedItems = [],
  onUp,
  onDown,
  onDuplicate,
  onRemove,
  menus = [], // array of dropdown configs    

  context,
  attributes,
  setAttributes,
  updateCard,
}) {
  if (!activeId) return null;

  const idx = orderedItems.findIndex((i) => i.id === activeId);
  if (idx === -1) return null;

  const disableUp = idx === 0;
  const disableDown = idx === orderedItems.length - 1;

   const cardsCount = Array.isArray(attributes?.cards) ? attributes.cards.length : 0;
   const cardOptions = Array.from({ length: cardsCount }, (_, i) => ({
  title: `Card ${i + 1}`,
  onClick: () => handleMoveIntoCard(activeId, i),
  isDisabled: context?.scope === 'card' && context?.cardIndex === i,
}));
  const isCard = context?.scope === 'card';
  const cardIndex = isCard ? context.cardIndex : null;
  const hasCards = cardsCount > 0;

  const disableBreakOut = !isCard;
  const disableMoveLeft = !isCard || cardIndex === 0;
  const disableMoveRight = !isCard || cardIndex == null || cardIndex >= cardsCount - 1;
  const disableInsertFirst = isCard || !hasCards;

  const { handleBreakOut, handleMoveIntoCard } =
      createParentMoveHandlers({ attributes, setAttributes, updateCard, context });


  return (
    <BlockControls group="block">
      <ToolbarGroup>
        <ToolbarButton
          icon={chevronUp}
          label={__('Move up')}
          onClick={() => onUp(activeId)}
          disabled={disableUp}
        />
        <ToolbarButton
          icon={chevronDown}
          label={__('Move down')}
          onClick={() => onDown(activeId)}
          disabled={disableDown}
        />
        {context.scope === 'card' && (
          <ToolbarButton
            icon={external}
            label={__('Break out')}
            onClick={() => handleBreakOut(activeId)}
          />
        )}


{cardsCount > 0 && (
  cardsCount === 1 ? (
    <ToolbarButton
      icon={login}
      label={__('Move to card')}
      onClick={() => handleMoveIntoCard(activeId, 0)}
      disabled={context?.scope === 'card' && context?.cardIndex === 0}
    />
  ) : (
    <ToolbarDropdownMenu
      icon={login}
      label={__('Move to card')}
      controls={cardOptions}
    />
  )
)}


        <ToolbarButton
          icon={copy}
          label={__('Duplicate')}
          onClick={() => onDuplicate(activeId)}
        />
        <ToolbarButton
          icon={trash}
          label={__('Remove')}
          onClick={() => onRemove(activeId)}
          isDestructive
        />
      </ToolbarGroup>
       {menus.length > 0 && (
        <ToolbarGroup>
          {menus.map((menu) => {
            const options = menu.options || [];
              const current = menu.getValue?.({ activeId });
              const currentOption = options.find((o) => o.value === current);
              const buttonText = currentOption?.label || menu.label;

              return (
                <Dropdown
                  key={menu.key}
                  renderToggle={({ isOpen, onToggle }) => (
                    <ToolbarButton
                      onClick={onToggle}
                      aria-expanded={isOpen}
                    >
                      {buttonText}                       {/* ✅ THIS is the visible closed value */}
                    </ToolbarButton>
                  )}
                  renderContent={({ onClose }) => (
                    <MenuGroup label={menu.label}>
                      {options.map((opt) => (
                        <MenuItem
                          key={opt.value}
                          icon={current === opt.value ? check : undefined}
                          isSelected={current === opt.value}
                          onClick={() => {
                            menu.onSelect?.({ activeId, value: opt.value });
                            onClose();
                          }}
                        >
                          {opt.label}
                        </MenuItem>
                      ))}
                    </MenuGroup>
                  )}
                />
              );
          })}
        </ToolbarGroup>
      )}
    </BlockControls>
  );
}
