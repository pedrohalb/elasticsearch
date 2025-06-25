package com.elasticsearch.search.service;

import co.elastic.clients.elasticsearch.core.search.Hit;
import com.elasticsearch.search.api.model.Result;
import com.elasticsearch.search.api.model.ResultAutocomplete;
import com.elasticsearch.search.api.model.ResultHits;
import com.elasticsearch.search.api.model.SuggestionPair;
import com.elasticsearch.search.domain.EsClient;
import com.elasticsearch.search.processing.TreatQuery;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class SearchService {

    private final EsClient esClient;

    public SearchService(EsClient esClient) {
        this.esClient = esClient;
    }

    public Result submitQuery(String query, Integer page) {
        Result result = new Result();

        // Sugestão de correção (spellcheck)
        List<SuggestionPair> suggestionPairs = esClient.searchSuggestion(query);
        result.setSuggest(suggestionPairs);


        // Trata a sugestão antes de ajustar a query original
        String treatedSuggestion = suggestionPairs.stream()
                .map(SuggestionPair::getSuggestion)
                .collect(Collectors.joining(" "));

        if (!treatedSuggestion.isEmpty()) {
            query = TreatQuery.getFullAdjustedQuery(query, treatedSuggestion);
        }

        // Sugestões de autocomplete baseadas no prefixo digitado
        List<ResultAutocomplete> autocomplete = esClient.autocompleteSuggestions(query);
        result.autocomplete(autocomplete);




        // Executa a busca principal com base na query ajustada
        var searchResponse = esClient.search(query, TreatQuery.treatQuotes(query), page);
        List<Hit<ObjectNode>> hits = searchResponse.hits().hits();

        List<ResultHits> hitsList = hits.stream().map(h ->
                new ResultHits()
                        .abs(TreatQuery.treatContent(h.source().get("content").asText()))
                        .title(h.source().get("title").asText())
                        .url(h.source().get("url").asText())
        ).collect(Collectors.toList());

        long totalHits = searchResponse.hits().total().value();
        result.hits(hitsList);
        result.total((int) totalHits);

        return result;
    }

    public static void main(String[] args) {
        // Teste manual, se desejar:
        // var s = new SearchService(new EsClient());
        // System.out.println(s.submitQuery("randomized binar", 1));
    }
}
