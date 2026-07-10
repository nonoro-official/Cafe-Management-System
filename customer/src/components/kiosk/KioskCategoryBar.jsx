import { useEffect, useRef, useState } from 'react';

const KioskCategoryBar = ({ categories, activeCategoryId, onSelect }) => {
  const scrollRef = useRef(null);
  const [thumbStyle, setThumbStyle] = useState({ width: '100%', left: '0%' });

  useEffect(() => {
    const element = scrollRef.current;

    if (!element) {
      return undefined;
    }

    const updateThumb = () => {
      const { scrollWidth, clientWidth, scrollLeft } = element;

      if (scrollWidth <= clientWidth) {
        setThumbStyle({ width: '100%', left: '0%' });
        return;
      }

      setThumbStyle({
        width: `${(clientWidth / scrollWidth) * 100}%`,
        left: `${(scrollLeft / scrollWidth) * 100}%`,
      });
    };

    updateThumb();
    element.addEventListener('scroll', updateThumb, { passive: true });
    window.addEventListener('resize', updateThumb);

    return () => {
      element.removeEventListener('scroll', updateThumb);
      window.removeEventListener('resize', updateThumb);
    };
  }, [categories]);

  return (
    <div className="kiosk-dashboard__categories">
      <div ref={scrollRef} className="kiosk-dashboard__category-scroll" role="tablist">
        {categories.map((category) => {
          const isActive = category.id === activeCategoryId;

          return (
            <button
              key={category.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`kiosk-dashboard__category${isActive ? ' kiosk-dashboard__category--active' : ''}`}
              onClick={() => onSelect(category.id)}
            >
              {category.label}
            </button>
          );
        })}
      </div>

      <div className="kiosk-dashboard__category-track" aria-hidden="true">
        <div className="kiosk-dashboard__category-thumb" style={thumbStyle} />
      </div>
    </div>
  );
};

export default KioskCategoryBar;
