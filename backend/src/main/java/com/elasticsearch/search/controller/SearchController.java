package com.elasticsearch.search.controller;

import com.elasticsearch.search.api.facade.SearchApi;
import com.elasticsearch.search.api.model.Result;
import com.elasticsearch.search.service.SearchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RestController;

import java.util.concurrent.CompletableFuture;

@CrossOrigin(origins = {"http://localhost:3000"})
@RestController
public class SearchController implements SearchApi {

    private SearchService searchService;

    public SearchController(SearchService searchService) {
        this.searchService = searchService;
    }

    @Override
    public CompletableFuture<ResponseEntity<Result>> search(String query, Integer page) {
        var result = searchService.submitQuery(query, page);
        return CompletableFuture.supplyAsync(() -> ResponseEntity.ok(result));
    }
}
