import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getCategories, getProducts } from '../services/menuService.js';

const MenuContext = createContext(undefined);

const mapCategory = (category) => ({
  id: category._id,
  label: category.name,
  sortOrder: category.sortOrder ?? 0,
});

const mapProduct = (product) => ({
  id: product._id,
  // The list endpoint populates `category`, so it may be an object or an id.
  categoryId:
    product.category && typeof product.category === 'object'
      ? product.category._id
      : product.category,
  name: product.name,
  price: product.price,
  image: product.image || null,
});

/**
 * Loads the live menu (categories + available products) from the API and
 * exposes it in the shape the kiosk components expect. Replaces the old static
 * `data/kioskMenu.js` placeholder data.
 */
export const MenuProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    return Promise.all([getCategories(), getProducts()])
      .then(([cats, prods]) => {
        setCategories(cats.map(mapCategory).sort((a, b) => a.sortOrder - b.sortOrder));
        setItems(prods.map(mapProduct));
      })
      .catch((err) => setError(err?.response?.data?.message || 'Unable to load the menu.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const itemsById = useMemo(() => new Map(items.map((item) => [item.id, item])), [items]);

  const getItemsByCategory = useCallback(
    (categoryId) => items.filter((item) => item.categoryId === categoryId),
    [items],
  );

  const getItemById = useCallback((id) => itemsById.get(id) ?? null, [itemsById]);

  const value = useMemo(
    () => ({ categories, items, loading, error, reload: load, getItemsByCategory, getItemById }),
    [categories, items, loading, error, load, getItemsByCategory, getItemById],
  );

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
};

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
};
