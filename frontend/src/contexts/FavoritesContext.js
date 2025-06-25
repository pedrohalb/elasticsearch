import React, { createContext, useContext, useState, useEffect } from "react";

const FavoritesContext = createContext();

export const useFavorites = () => useContext(FavoritesContext);

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState(() => {
    const stored = localStorage.getItem("favorites");
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (card) => {
    setFavorites((prev) => {
      const exists = prev.find((item) => item.title === card.title);
      if (exists) {
        return prev.filter((item) => item.title !== card.title);
      } else {
        return [...prev, card];
      }
    });
  };

  const removeFavorite = (cardToRemove) => {
    setFavorites((prev) =>
      prev.filter((item) => item.title !== cardToRemove.title)
    );
  };

  const isFavorited = (title) => favorites.some((item) => item.title === title);

  return (
    <FavoritesContext.Provider
      value={{ favorites, toggleFavorite, removeFavorite, isFavorited }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};
