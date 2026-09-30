const { get, run } = require('../config/db');

/**
 * Resolves a category ID or custom category string.
 * If categoryId is 'other' or 'others' or empty, and a customCategory name is provided:
 * 1. Checks if a category with that name exists (case-insensitive).
 * 2. If it exists, returns its ID.
 * 3. If it doesn't exist, inserts it into the categories table and returns the new ID.
 * If no custom name is provided, returns or creates the generic "Others" category ID.
 */
const resolveCategoryId = async (categoryId, customCategory) => {
  const isOther = !categoryId || String(categoryId).toLowerCase() === 'other' || String(categoryId).toLowerCase() === 'others';

  if (isOther && customCategory && customCategory.trim()) {
    const cleanName = customCategory.trim();

    // Check if category already exists (case-insensitive)
    const existing = await get('SELECT id FROM categories WHERE LOWER(name) = LOWER(?)', [cleanName]);
    if (existing) {
      return existing.id;
    }

    // Create new category
    const defaultImg = 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80';
    const newCat = await run(
      'INSERT INTO categories (name, description, icon, image, status) VALUES (?, ?, ?, ?, ?)',
      [cleanName, 'User submitted custom category', 'HelpCircle', defaultImg, 'ACTIVE']
    );
    return newCat.id;
  }

  if (isOther) {
    // Return or create default "Others" category
    let othersCat = await get("SELECT id FROM categories WHERE LOWER(name) = 'others' OR LOWER(name) = 'other'");
    if (!othersCat) {
      const defaultImg = 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80';
      const newCat = await run(
        'INSERT INTO categories (name, description, icon, image, status) VALUES (?, ?, ?, ?, ?)',
        ['Others', 'Other & specialized custom services', 'HelpCircle', defaultImg, 'ACTIVE']
      );
      return newCat.id;
    }
    return othersCat.id;
  }

  return categoryId;
};

module.exports = { resolveCategoryId };
