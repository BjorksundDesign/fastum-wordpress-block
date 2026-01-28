// text-modal-setters.js
import { updateItem, removeItem } from './text-modal-helpers'; 
// ^ adjust import path based on where you keep these helpers
// If updateItem/removeItem are still inside TextModal.js today,
// move them to a shared helper file too (recommended).

export const recount = (arr) => {
  const tally = {};
  return arr.map((it) => {
    tally[it.type] = (tally[it.type] || 0) + 1;
    return { ...it, count: tally[it.type] };
  });
};

export function createTextModalSetters({ items, commit }) {
  const setHeadingText = (id, text) => commit(updateItem(items, id, { text }));
  const setHeadingSize = (id, size) => commit(updateItem(items, id, { size }));
  const setHeadingType = (id, headingType) => commit(updateItem(items, id, { headingType }));
  const setParagraphText = (id, text) => commit(updateItem(items, id, { text }));

  const setListType = (id, listType) => commit(updateItem(items, id, { listType }));

  const setButtonText = (id, text) => commit(updateItem(items, id, { text }));
  const setButtonURL = (id, url) => commit(updateItem(items, id, { url }));
  const setButtonColor = (id, buttonColor) => commit(updateItem(items, id, { buttonColor }));
  const setImage = (id, image, extra) => {
    if (extra === 'remove') {
      commit(recount(removeItem(items, id)));
      return;
    }
    commit(updateItem(items, id, { image }));
  };

  return {
    setHeadingText,
    setHeadingSize,
    setHeadingType,
    setParagraphText,
    setListType,
    setImage,
    setButtonText,
    setButtonURL,
    setButtonColor,
  };
}
