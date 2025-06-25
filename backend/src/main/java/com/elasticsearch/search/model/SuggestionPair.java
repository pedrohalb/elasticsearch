package com.elasticsearch.search.model;

public class SuggestionPair {
    private String original;
    private String suggestion;

    // Getters e setters
    public String getOriginal() {
        return original;
    }

    public void setOriginal(String original) {
        this.original = original;
    }

    public String getSuggestion() {
        return suggestion;
    }

    public void setSuggestion(String suggestion) {
        this.suggestion = suggestion;
    }
}


