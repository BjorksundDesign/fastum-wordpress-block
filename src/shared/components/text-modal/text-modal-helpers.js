export const updateItem = (items, id, patch) =>
  items.map((i) => (i.id === id ? { ...i, ...patch } : i));

export const removeItem = (items, id) =>
  items.filter((i) => i.id !== id);

export const toVirtualAnchor = (el) => {
  if (!el) return null;
  return {
    getBoundingClientRect: () => el.getBoundingClientRect(),
    ownerDocument: el.ownerDocument,
  };
};
