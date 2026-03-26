import React from 'react';
import './assets/styles.css';

export function CategoryNavigation({ onCategoryClick }) {
    // Static category list including "All" option
    const categoryies = ['All', 'Shirts', 'Pants', 'Accessories', 'Mobiles', 'Mobile Accessories'];

    return (
        <nav className="category-navigation">
            <ul className="category-list">
                {categoryies.map((category, index) => (
                    <li
                      key={index}
                      className="category-item"
                      onClick={() => onCategoryClick(category === 'All' ? '' : category)} // Trigger the click handler on category click
                    >
                      {category}
                    </li>
                ))}
            </ul>
        </nav>
    );
}