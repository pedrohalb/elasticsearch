import { useState } from "react";
import { fetchApi } from "../service/api";

export default function useSearch() {
  const [autocompleteList, setAutocompleteList] = useState([]);
  const [suggestion, setSuggestion] = useState(null);

  const search = async (
    query,
    page = 1,
    options = { keepSuggestion: false }
  ) => {
    const data = await fetchApi(query, page);

    // Só atualiza sugestão se permitido
    if (!options.keepSuggestion) {
      if (Array.isArray(data.suggest) && data.suggest.length > 0) {
        setSuggestion({ pairs: data.suggest });
      } else {
        setSuggestion(null);
      }
    }

    setAutocompleteList(data.autocomplete || []);
  };

  return {
    search,
    autocompleteList,
    suggestion,
    setSuggestion, // <-- Expondo a função para fora
  };
}
