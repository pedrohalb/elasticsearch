package com.elasticsearch.search.domain;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.query_dsl.Query;
import co.elastic.clients.elasticsearch.core.SearchResponse;
import co.elastic.clients.elasticsearch.core.search.Suggester;
import co.elastic.clients.elasticsearch.core.search.Suggestion;
import co.elastic.clients.json.jackson.JacksonJsonpMapper;
import co.elastic.clients.transport.ElasticsearchTransport;
import co.elastic.clients.transport.rest_client.RestClientTransport;
import com.elasticsearch.search.api.model.SuggestionPair;
import com.elasticsearch.search.processing.BuildQuery;
import com.fasterxml.jackson.databind.node.ObjectNode;
import nl.altindag.ssl.SSLFactory;
import org.apache.http.HttpHost;
import org.apache.http.auth.AuthScope;
import org.apache.http.auth.UsernamePasswordCredentials;
import org.apache.http.client.CredentialsProvider;
import org.apache.http.impl.client.BasicCredentialsProvider;
import org.apache.http.impl.nio.client.HttpAsyncClientBuilder;
import org.elasticsearch.client.RestClient;
import org.springframework.stereotype.Component;
import com.elasticsearch.search.api.model.ResultAutocomplete;// ou .Result.AutocompleteItem


import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Component
public class EsClient {
    private ElasticsearchClient elasticsearchClient;
    private static final int RESULT_MAX_VALUE = 10000;
    private Query myQuery;

    public EsClient() {
        createConnection();
    }

    private void createConnection() {
        CredentialsProvider credentialsProvider = new BasicCredentialsProvider();
        String USER = "elastic";
        String PWD = "user123";
        credentialsProvider.setCredentials(AuthScope.ANY,
                new UsernamePasswordCredentials(USER, PWD));

        SSLFactory sslFactory = SSLFactory.builder()
                .withUnsafeTrustMaterial()
                .withUnsafeHostnameVerifier()
                .build();

        RestClient restClient = RestClient.builder(
                        new HttpHost("localhost", 9200, "https"))
                .setHttpClientConfigCallback((HttpAsyncClientBuilder httpClientBuilder) -> httpClientBuilder
                        .setDefaultCredentialsProvider(credentialsProvider)
                        .setSSLContext(sslFactory.getSslContext())
                        .setSSLHostnameVerifier(sslFactory.getHostnameVerifier())
                ).build();

        ElasticsearchTransport transport = new RestClientTransport(
                restClient,
                new JacksonJsonpMapper()
        );

        elasticsearchClient = new ElasticsearchClient(transport);
    }

    // 🔍 Busca principal com sugestão de correção
    public SearchResponse<ObjectNode> search(String query, List<List<String>> contentInQuotes, Integer page) {
        if (!contentInQuotes.get(1).isEmpty()) {
            if (contentInQuotes.get(0).isEmpty()) {
                myQuery = BuildQuery.must(
                        BuildQuery.matchPhrase("content", contentInQuotes.get(1).toString())
                );
                // se não houver palavras fora das aspas
            } else {
                myQuery = BuildQuery.must(
                        BuildQuery.matchPhrase("content", contentInQuotes.get(1).toString()),
                        BuildQuery.match("content", contentInQuotes.get(0).toString())
                );
                // Se houver palavras com e sem aspas
            }
        } else {
            // Inclui também o autocomplete na consulta
            myQuery = BuildQuery.should(
                    BuildQuery.match("content", contentInQuotes.get(0).toString()),
                    BuildQuery.match("content_autocomplete", contentInQuotes.get(0).toString())
            );
            // Se não houver conteúdo entre aspas
        }

        try {
            return elasticsearchClient.search(s -> s
                    .index("wikipedia_auto_v2")
                    .from((page - 1) * 10)
                    .size(10)
                    .query(myQuery)
                    .suggest(sug -> sug
                            .suggesters("my-suggestion", v -> v
                                    .term(t -> t
                                            .field("content_suggest")
                                            .size(2)
                                    )
                                    .text(query)
                            )
                            // Aqui você define um suggester do tipo term que atua sobre o campo "content_suggest" do índice, com base na query.
                    ), ObjectNode.class
            );
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    // ✍️ Sugestão de correção (term suggester)
    public List<SuggestionPair> searchSuggestion(String query) {
        SearchResponse<ObjectNode> response;
        List<SuggestionPair> suggestionPairs = new ArrayList<>();

        try {
            var suggester = Suggester.of(s -> s
                    .suggesters("my-suggestion", su -> su
                            .text(query)
                            .term(t -> t.field("content_suggest").size(1))
                    )
            );

            response = elasticsearchClient.search(s -> s
                    .index("wikipedia_auto_v2")
                    .suggest(suggester), ObjectNode.class
            );

            String[] queryAsArray = query.split("\\s+");
            int i = 0;

            for (Map.Entry<String, List<Suggestion<ObjectNode>>> entry : response.suggest().entrySet()) {
                List<Suggestion<ObjectNode>> suggestions = entry.getValue();
                for (Suggestion<ObjectNode> suggestion : suggestions) {
                    if (!suggestion.term().options().isEmpty() && i < queryAsArray.length) {
                        String originalWord = queryAsArray[i];
                        String suggestedWord = suggestion.term().options().get(0).text();

                        SuggestionPair pair = new SuggestionPair();
                        pair.setOriginal(originalWord);
                        pair.setSuggestion(suggestedWord);
                        suggestionPairs.add(pair);
                    }
                    i++;
                }
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        return suggestionPairs;
    }



    // 💡 Novo método: sugestões de autocomplete com base no prefixo digitado
    public List<ResultAutocomplete> autocompleteSuggestions(String prefix) {
        try {
            SearchResponse<ObjectNode> response = elasticsearchClient.search(s -> s
                            .index("wikipedia_auto_v2")
                            .query(q -> q
                                    .match(m -> m
                                            .field("content_autocomplete")
                                            .query(prefix)
                                    )
                            )
                            .size(5),
                    ObjectNode.class
            );

            return response.hits().hits().stream()
                    .map(hit -> {
                        ResultAutocomplete item = new ResultAutocomplete();
                        item.setTitle(hit.source().get("title").asText());
                        item.setUrl(hit.source().get("url").asText());
                        return item;
                    })
                    .distinct()
                    .collect(Collectors.toList());

        } catch (IOException e) {
            throw new RuntimeException("Erro ao buscar autocomplete", e);
        }
    }



}
