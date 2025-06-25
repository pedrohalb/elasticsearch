import React, { useState, useEffect, useRef, useCallback } from "react";
import { RefreshCw, ArrowLeft } from "lucide-react";

const FrequentClickedMenu = ({
  isOpen,
  setIsOpen,
  clickStats,
  resultsVisible,
  fetchApi,
}) => {
  const [topClickedCards, setTopClickedCards] = useState([]);
  const [itemsToShow, setItemsToShow] = useState(6);
  const observerRef = useRef(null);

  const loadMore = () => setItemsToShow((prev) => prev + 3);

  const lastItemRef = useCallback(
    (node) => {
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && itemsToShow < topClickedCards.length) {
          loadMore();
        }
      });
      if (node) observerRef.current.observe(node);
    },
    [itemsToShow, topClickedCards.length]
  );

  // Função que busca os top clicados
  const fetchTopClickedCards = async () => {
    const allClicks = [];

    for (let topic in clickStats) {
      for (let title in clickStats[topic]) {
        allClicks.push({
          topic,
          title,
          count: clickStats[topic][title],
        });
      }
    }

    // Ordena por quantidade de cliques
    const sorted = allClicks.sort((a, b) => b.count - a.count).slice(0, 10);

    const cards = [];

    for (let { topic, title } of sorted) {
      try {
        const data = await fetchApi(topic, 1);
        const matched = data.Hits.find((hit) => hit.title === title);
        if (matched) {
          cards.push({ ...matched, query: topic });
        }
      } catch (e) {
        console.error(
          `Erro ao buscar dados para "${title}" no tópico "${topic}"`,
          e
        );
      }
    }

    setTopClickedCards(cards);
  };

  // Quando stats mudarem -> atualiza
  useEffect(() => {
    fetchTopClickedCards();
  }, [clickStats, fetchApi]);

  // Sempre que o menu abrir, recarrega
  useEffect(() => {
    if (isOpen) {
      setItemsToShow(6); // Reset scroll
      fetchTopClickedCards();
    }
  }, [isOpen]);

  return (
    <div
      className={`favorite-menu-2 ${!isOpen ? "minimized" : ""}`}
      style={{
        width: isOpen ? "360px" : "60px",
        height: isOpen ? "auto" : "60px",
        borderRadius: isOpen ? "1rem" : "50%",
        zIndex: isOpen ? 15 : 5,
      }}
    >
      <div className="favorite-header-3">
        {/* Botão de abrir/fechar */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            marginRight: "8px",
          }}
        >
          <RefreshCw color="white" strokeWidth={2} />
        </button>

        {isOpen && <h2 className="top-cards-title">Frequentes</h2>}

        {isOpen && (
          <button
            className="carousel-arrow"
            onClick={() => setIsOpen(false)}
            title="Recolher"
          >
            <ArrowLeft />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="favorites-scroll-area">
          <div className="favorite-card-page">
            {topClickedCards.slice(0, itemsToShow).map((item, index) => {
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
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

function highlightTerm(text, term) {
  const regex = new RegExp(`(${term})`, "gi");
  return text.replace(regex, "<mark>$1</mark>");
}

export default FrequentClickedMenu;
