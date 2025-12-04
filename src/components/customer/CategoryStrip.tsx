'use client';

// Categories based on requirements
const CATEGORIES = [
  { id: 'all', label: 'All', icon: '🏪' },
  { id: 'food-pastries', label: 'Food & Pastries', icon: '🥐' },
  { id: 'local-finds', label: 'Local Finds', icon: '🎁' },
  { id: 'drinks', label: 'Drinks', icon: '☕' },
  { id: 'crafts', label: 'Crafts', icon: '🎨' },
  { id: 'seasonal', label: 'Seasonal', icon: '🎃' },
];

interface CategoryStripProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export function CategoryStrip({ selectedCategory, onSelectCategory }: CategoryStripProps) {
  const handleCategoryClick = (categoryId: string) => {
    if (categoryId === 'all') {
      onSelectCategory(null);
    } else {
      onSelectCategory(categoryId === selectedCategory ? null : categoryId);
    }
  };

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-2 overflow-x-auto py-4 scrollbar-hide">
          {CATEGORIES.map((category) => {
            const isActive = 
              (category.id === 'all' && !selectedCategory) ||
              category.id === selectedCategory;

            return (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition font-medium text-sm
                  ${isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                <span className="text-lg">{category.icon}</span>
                {category.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
