package com.elasticsearch.search.processing;

import co.elastic.clients.elasticsearch._types.query_dsl.BoolQuery;
import co.elastic.clients.elasticsearch._types.query_dsl.MatchPhraseQuery;
import co.elastic.clients.elasticsearch._types.query_dsl.MatchQuery;
import co.elastic.clients.elasticsearch._types.query_dsl.Query;

public class BuildQuery {

    public static Query must(Query... qs){
        BoolQuery.Builder bq = new BoolQuery.Builder();

        for(Query q :  qs){
            bq.must(q);
        }

        return bq.build()._toQuery();
    }
    // Todos os critérios passados devem ser verdadeiros para o documento ser retornado. (e)

    public static Query should(Query... qs){
        BoolQuery.Builder bq = new BoolQuery.Builder();

        for(Query q : qs){
            bq.should(q);
        }

        return bq.build()._toQuery();
    }
    // Deve atender a pelo menos um dos critérios. (ou)

    public static Query matchPhrase(String field, String q){
        return MatchPhraseQuery.of(s -> s.field(field).query(q))._toQuery();
    }
    // Cria uma match_phrase query — busca por frases exatas (ordem e proximidade são importantes).

    public static Query match(String field, String q){
        return MatchQuery.of(s -> s.field(field).query(q))._toQuery();
    }
    // Cria uma match query — busca por documentos que contêm as palavras (ordem e posição não importam).

    public static Query mustNot(Query... qs){
        BoolQuery.Builder bq = new BoolQuery.Builder();

        for(Query q : qs){
            bq.mustNot(q);
        }
        return bq.build()._toQuery();
    }
    // Exclui documentos que satisfaçam qualquer um dos critérios.
}
