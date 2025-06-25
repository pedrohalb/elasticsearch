import React, { useState, useEffect } from "react";
import SearchBar from "../components/SearchBar";
import Pagination from "../components/Pagination";
import { WeatherData } from "../components/WeatherData";
import { fetchApi } from "../service/api";
import "../styles.css";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import logoIcon from "../assets/logo.png";
import ParticlesBackground from "../components/ParticlesBackground";
import LightFocusOverlay from "../components/LightFocusOverlay";
import FloatingAstronaut from "../components/FloatingAstronaut";
import Loading from "../components/Loading";
import FavoriteMenu from "../components/FavoriteMenu";
import FrequentClickedMenu from "../components/FrequentMenu";
import { useFavorites } from "../contexts/FavoritesContext";
import { Heart } from "lucide-react";

function Home() {
  const [query, setQuery] = useState("");
  const [resultsVisible, setResultsVisible] = useState(false);
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const itemsPerPage = 10;
  const astronautControls = useAnimation();
  const [searchCounts, setSearchCounts] = useState({});
  const [featuredResult, setFeaturedResult] = useState(null);
  const [clickStats, setClickStats] = useState({});
  const [topClickedCards, setTopClickedCards] = useState([]);
  const [hasShownResults, sethasShownResults] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const { toggleFavorite, isFavorited } = useFavorites();
  const [favoriteMenuOpen, setFavoriteMenuOpen] = useState(false);
  const [frequentMenuOpen, setFrequentMenuOpen] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const handleClick = () => {
      setOverlayVisible(false);
    };

    window.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("click", handleClick);
    };
  }, []);

  // Carrega histórico de cliques
  useEffect(() => {
    const saved = localStorage.getItem("clickStats");
    if (saved) {
      setClickStats(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("clickStats", JSON.stringify(clickStats));
  }, [clickStats]);

  const handleSearch = async (newQuery) => {
    const key = newQuery.toLowerCase().trim();
    if (!key) return;

    sethasShownResults(true);
    setQuery(key); // <- isso garante que a frase corrigida caia no useEffect
    setPage(1);
    setResultsVisible(true);

    setSearchCounts((prevCounts) => {
      const updatedCounts = { ...prevCounts };
      updatedCounts[key] = (updatedCounts[key] || 0) + 1;
      return updatedCounts;
    });

    try {
      const data = await fetchApi(key, 1);
      if (data.Hits && data.Hits.length > 0) {
        setFeaturedResult({ ...data.Hits[0], query: key });
      }
    } catch (e) {
      console.error("Erro ao buscar destaque:", e);
    }
  };

  useEffect(() => {
    if (query) {
      loadResults(query, page);
    }
  }, [query, page]);

  const loadResults = async (q, p) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchApi(q, p);
      const total = data.total || 0;
      if (total === 0) {
        setResults([]);
        setTotalPages(1);
        setError(
          `Nenhum resultado encontrado para '${q}'. Tente outra palavra!`
        );
      } else {
        setResults(data.Hits || []);
        setTotalPages(Math.ceil(total / itemsPerPage));
      }
    } catch (err) {
      setError(
        "Erro ao buscar os resultados. Por favor, tente novamente mais tarde."
      );
      setResults([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <LightFocusOverlay visible={overlayVisible} />

      <div className="home-container starfield">
        <AnimatePresence>
          <WeatherData />
          <FavoriteMenu
            isOpen={favoriteMenuOpen}
            setIsOpen={(value) => {
              setFavoriteMenuOpen(value);
              if (value) setFrequentMenuOpen(false); // Abrindo favoritos -> fecha frequentes
            }}
          />

          <FrequentClickedMenu
            isOpen={frequentMenuOpen}
            setIsOpen={(value) => {
              setFrequentMenuOpen(value);
              if (value) setFavoriteMenuOpen(false); // Abrindo frequentes -> fecha favoritos
            }}
            clickStats={clickStats}
            resultsVisible={resultsVisible}
            fetchApi={fetchApi}
          />

          <ParticlesBackground />

          <motion.div className="title-and-search">
            <motion.div
              initial={{ opacity: 1, y: 0 }}
              animate={{
                opacity: resultsVisible ? 0 : 1,
                y: resultsVisible ? -300 : 0,
              }}
              transition={{ type: "spring", stiffness: 80 }}
            >
              <motion.img
                src={logoIcon}
                alt="DeepSpace Logo"
                animate={{
                  scale: 3,
                  y: 100,
                }}
                transition={{ type: "spring", stiffness: 80 }}
                style={{ width: "clamp(150px, 30vw, 400px)", height: "auto" }}
              />
            </motion.div>

            <motion.div
              className={`search-wrapper ${
                resultsVisible ? "near-results" : "centered"
              }`}
              animate={{ y: resultsVisible ? -20 : 0 }}
              transition={{ type: "spring", stiffness: 80 }}
            >
              <SearchBar
                onSearch={handleSearch}
                resultsVisible={resultsVisible}
                onClear={() => {
                  setQuery("");
                  setResultsVisible(false);
                  setResults([]);
                  setFeaturedResult(null);
                  // 👈 resetar a logo ao limpar
                }}
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Astronauta visível sempre */}
        <FloatingAstronaut
          controls={astronautControls}
          resultsVisible={resultsVisible}
          hasShownResults={hasShownResults}
        />

        <>
          <AnimatePresence>
            {resultsVisible && (
              <motion.div
                className="results-wrapper"
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                transition={{ duration: 0.6 }}
              >
                <div className="results-container">
                  <h2>
                    Resultados para: <span>{query}</span>
                  </h2>

                  {loading && <Loading />}

                  {error && (
                    <div className="error-message">
                      <p>{error}</p>
                    </div>
                  )}

                  {!loading && !error && (
                    <>
                      <div className="results-list">
                        {results.map((item, index) => (
                          <div key={index} className="result-card">
                            <div>
                              <Heart
                                className="favorite-header"
                                color="white"
                                fill={
                                  isFavorited(item.title) ? "white" : "none"
                                }
                                style={{ cursor: "pointer", float: "right" }}
                                onClick={() =>
                                  toggleFavorite({ ...item, query })
                                }
                              />
                              <h3>{item.title}</h3>

                              <div className="divider-line"></div>
                              <p
                                dangerouslySetInnerHTML={{
                                  __html: highlightTerm(item.abs, query),
                                }}
                              />
                            </div>
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="view-more"
                              onClick={() => {
                                const key = query.toLowerCase();
                                const title = item.title;

                                setClickStats((prev) => {
                                  const updated = { ...prev };
                                  if (!updated[key]) updated[key] = {};
                                  updated[key][title] =
                                    (updated[key][title] || 0) + 1;
                                  return updated;
                                });
                              }}
                            >
                              Ver mais <span className="external-icon">↗</span>
                            </a>
                          </div>
                        ))}
                      </div>

                      <div className="pagination-wrapper">
                        <Pagination
                          page={page}
                          setPage={setPage}
                          totalPages={totalPages}
                          query={query}
                        />
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      </div>
    </>
  );
}

function highlightTerm(text, term) {
  const regex = new RegExp(`(${term})`, "gi");
  return text.replace(regex, "<mark>$1</mark>");
}

export default Home;
