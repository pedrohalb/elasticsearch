import React, { useState, useEffect, useRef, useCallback } from "react";
import { useFavorites } from "../contexts/FavoritesContext";
import { Heart, ArrowLeft, Trash2 } from "lucide-react";

// Receba como props:
const FavoriteMenu = ({ isOpen, setIsOpen }) => {
  const { favorites, removeFavorite } = useFavorites();
  const [itemsToShow, setItemsToShow] = useState(6);
  const [itemToRemove, setItemToRemove] = useState(null);
  const observerRef = useRef(null);
  const [confirming, setConfirming] = useState(null);

  const loadMore = () => setItemsToShow((prev) => prev + 3);

  const lastItemRef = useCallback(
    (node) => {
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && itemsToShow < favorites.length) {
          loadMore();
        }
      });
      if (node) observerRef.current.observe(node);
    },
    [itemsToShow, favorites.length]
  );

  useEffect(() => {
    if (!isOpen) setItemsToShow(6);
  }, [isOpen]);

  return (
    <div
      className={`favorite-menu ${!isOpen ? "minimized" : ""}`}
      style={{
        width: isOpen ? "360px" : "60px",
        height: isOpen ? "auto" : "60px",
        borderRadius: isOpen ? "1rem" : "50%",
        zIndex: isOpen ? 20 : 5, // Favoritos acima se aberto
      }}
    >
      <div className="favorite-header-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{ background: "none", border: "none", cursor: "pointer" }}
        >
          <Heart
            color="white"
            fill={isOpen ? "white" : "none"}
            strokeWidth={2}
          />
        </button>
        {isOpen && <h2 className="top-cards-title">Favoritos</h2>}
        {isOpen && (
          <button
            className="carousel-arrow"
            onClick={() => setIsOpen(false)}
            title="Recolher favoritos"
          >
            <ArrowLeft />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="favorites-scroll-area">
          <div className="favorite-card-page">
            {favorites.slice(0, itemsToShow).map((item, index) => {
              const isLast = index === itemsToShow - 1;
              return (
                <div
                  key={index}
                  className="favorite-card"
                  ref={isLast ? lastItemRef : null}
                >
                  <div
                    onClick={() => window.open(item.url, "_blank")}
                    style={{ flex: 1 }}
                  >
                    <div className="favorite-card-header">
                      <h3>{item.title}</h3>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="view-more"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Ver mais <span className="external-icon">↗</span>
                      </a>
                    </div>
                    <div className="favorite-divider" />
                    <p
                      dangerouslySetInnerHTML={{
                        __html: highlightTerm(item.abs, item.query),
                      }}
                    />
                  </div>

                  <div className="favorite-card-footer">
                    <button
                      className="delete-icon-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirming(item);
                      }}
                      title="Remover dos favoritos"
                    >
                      <Trash2 color="white" size={18} />
                    </button>
                  </div>
                  {confirming && confirming.title === item.title && (
                    <div
                      className="delete-popup-overlay"
                      onClick={() => setConfirming(null)}
                    >
                      <div
                        className="delete-popup"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <p>Remover este item dos favoritos?</p>
                        <div className="popup-buttons">
                          <button
                            className="popup-btn cancel"
                            onClick={() => setConfirming(null)}
                          >
                            Cancelar
                          </button>
                          <button
                            className="popup-btn confirm"
                            onClick={() => {
                              removeFavorite(confirming);
                              setConfirming(null);
                            }}
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Popup de confirmação */}
    </div>
  );
};

function highlightTerm(text, term) {
  const regex = new RegExp(`(${term})`, "gi");
  return text.replace(regex, "<mark>$1</mark>");
}

export default FavoriteMenu;
