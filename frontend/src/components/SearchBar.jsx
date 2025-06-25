import React, { useState, useEffect, useRef } from "react";
import "../styles.css";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import useSearch from "../hooks/useSearch";
import debounce from "lodash.debounce";

export default function SearchBar({ onSearch, resultsVisible, onClear }) {
  const [input, setInput] = useState("");
  const [clicked, setClicked] = useState(false);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const wrapperRef = useRef(null);
  const { search, autocompleteList, suggestion, setSuggestion } = useSearch();
  const [inputFocused, setInputFocused] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (input.trim()) {
      setClicked(true);
      search(input, 1);
      onSearch(input);
      setTimeout(() => setClicked(false), 400);
      setShowAutocomplete(false);
    }
  };

  const handleSelectAutocomplete = (item) => {
    setInput(item.title);
    setShowAutocomplete(false);
    search(item.title, 1);
    onSearch(item.title);
  };

  // Corrigir só a palavra errada na frase completa
  const handleSuggestionClick = () => {
    if (suggestion?.pairs?.length > 0) {
      let correctedInput = input;

      suggestion.pairs.forEach(({ original, suggestion: suggested }) => {
        correctedInput = correctedInput.replace(
          new RegExp(`\\b${original}\\b`, "gi"),
          suggested
        );
      });

      setInput(correctedInput);
      setShowAutocomplete(false);
      setSuggestion(null); // <-- ESSENCIAL: limpa a sugestão para sumir o botão
      search(correctedInput, 1);
      onSearch(correctedInput);
    }
  };

  // Autocomplete com debounce
  const debouncedFetchAutocomplete = debounce((value) => {
    if (value.trim() && inputFocused) {
      search(value, 1);
      setShowAutocomplete(true);
    } else {
      setShowAutocomplete(false);
    }
  }, 300);

  useEffect(() => {
    debouncedFetchAutocomplete(input);
    return () => debouncedFetchAutocomplete.cancel();
  }, [debouncedFetchAutocomplete, input]);

  // Fecha o autocomplete ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowAutocomplete(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    console.log("suggestion atual:", suggestion);
  }, [suggestion]);

  return (
    <motion.div
      className="fullscreen-search"
      animate={
        clicked ? { scale: [1, 1.05, 1], boxShadow: "0 0 12px white" } : {}
      }
      transition={{ duration: 0.3 }}
      ref={wrapperRef}
    >
      {resultsVisible && (
        <button
          type="button"
          className="carousel-arrow-back"
          onClick={() => {
            setInput("");
            setShowAutocomplete(false);
            onClear();
          }}
          aria-label="Voltar"
        >
          <ArrowLeft />
        </button>
      )}
      <form className="search-bar" onSubmit={handleSearch}>
        <button type="submit" aria-label="Search">
          <motion.svg
            whileTap={{ scale: 0.9 }}
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="white"
            viewBox="0 0 24 24"
          >
            <path d="M10 2a8 8 0 105.293 14.293l5.707 5.707 1.414-1.414-5.707-5.707A8 8 0 0010 2zm0 2a6 6 0 110 12A6 6 0 0110 4z" />
          </motion.svg>
        </button>
        <input
          type="text"
          placeholder="Pesquisar..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => {
            setInputFocused(true);
            if (input.trim()) setShowAutocomplete(true);
          }}
          onBlur={() => {
            // Pequeno delay para não fechar antes de clicar em um item do autocomplete
            setTimeout(() => setInputFocused(false), 200);
          }}
        />

        {resultsVisible && (
          <button
            type="button"
            className="clear-btn"
            onMouseDown={(e) => {
              e.preventDefault();
              setInput("");
              setShowAutocomplete(false);
              onClear();
            }}
          >
            ×
          </button>
        )}
      </form>

      {/* Autocomplete */}
      {showAutocomplete && autocompleteList.length > 0 && !resultsVisible && (
        <ul className="autocomplete-list">
          {autocompleteList.map((item, i) => (
            <li key={i} onClick={() => handleSelectAutocomplete(item)}>
              {item.title}
            </li>
          ))}
        </ul>
      )}

      {/* Sugestão de correção */}
      {suggestion?.pairs?.length > 0 && resultsVisible && (
        <div className="suggestion-box">
          Você quis dizer:&nbsp;
          <button
            onClick={handleSuggestionClick}
            className="suggestion-button"
            style={{
              fontWeight: "bold",
              background: "none",
              border: "none",
              color: "#00f",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            {suggestion.pairs.map((p) => p.suggestion).join(" ")}
          </button>
          ?
        </div>
      )}
    </motion.div>
  );
}
