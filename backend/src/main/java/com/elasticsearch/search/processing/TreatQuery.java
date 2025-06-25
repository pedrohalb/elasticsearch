package com.elasticsearch.search.processing;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class TreatQuery {

    public static String treatContent(String content) {
        content = content.replaceAll("</?(som|math|strong)\\d*>", "");
        content = content.replaceAll("[^A-Za-z\\s]+", ""); // Preserve aspas duplas e dígitos
        content = content.replaceAll("\\s+", " ");
        content = content.replaceAll("^\\s+", "");
        return content;
    }
    // Limpa e normaliza o conteúdo textual vindo da base de dados ou de sugestões, removendo tags e caracteres indesejados.

    public static List<List<String>> treatQuotes(String query) {
        List<String> quotedContent = new ArrayList<>();
        List<String> nonQuotedContent = new ArrayList<>();

        // Pattern para capturar texto entre aspas, incluindo as próprias aspas
        Pattern quotesPattern = Pattern.compile("\\Q\"\\E(.*?)\\Q\"\\E");
        Matcher quotesContent = quotesPattern.matcher(query);

        while (quotesContent.find()) {
            quotedContent.add(quotesContent.group().trim()); // Adiciona o texto com as aspas
        }

        // Divide o texto usando o pattern de aspas
        String[] parts = quotesPattern.split(query);

        // Adiciona os textos sem aspas ao grupo não citado
        for (String part : parts) {
            String trimmedPart = part.trim();
            if (!trimmedPart.isEmpty()) {
                nonQuotedContent.add(trimmedPart);
            }
        }

        // Retorna os resultados como uma lista de listas
        List<List<String>> result = new ArrayList<>();
        result.add(nonQuotedContent); // Grupo sem aspas
        result.add(quotedContent);    // Grupo com aspas

        return result;
    }
    // Separa a query em termos "com aspas" e "sem aspas", para diferenciar o tipo de busca (exata ou não).

    public static boolean containsPartialSubstring(String sugWord, String word) {
        int wordLength = word.length();
        int sugWordLength = sugWord.length();

        for (int start = 0; start < wordLength; start++) { // Começa a partir da terceira letra
            for (int end = start + 3; end <= wordLength-2; end++) {
                String substring = word.substring(start, end);
                if (sugWord.contains(substring)) {
                    return true;
                }
            }
        }
        return false;
    }
    // Verifica se há alguma substring parcialmente semelhante
    // Verificação de similaridade parcial entre palavras
    // Correção de palavras digitadas com erro

    public static String getFullAdjustedQuery(String originalQuery, String suggestion) {
        String[] splittedQuery = originalQuery.toLowerCase().split(" ");
        String[] splittedSuggestion = suggestion.toLowerCase().split(" ");
        String adjustedQuery = "";

        if (suggestion.equals("")) return originalQuery;


        for (String word : splittedQuery) {
            boolean replaced = false;


            for (String sugWord : splittedSuggestion) {
                if (containsPartialSubstring(sugWord, word)) {
                    adjustedQuery += suggestion + " ";
                    replaced = true;
                    break;
                }
            }
            // Se a palavra não foi substituída, mantém a palavra original na consulta ajustada
            if (!replaced) {
                adjustedQuery += word + " ";
            }
            if(adjustedQuery.trim().equals(suggestion)) break;
        }

        return adjustedQuery.trim(); // Remove espaços em branco extras no final
    }
    // Ajusta a query original com base na sugestão vinda do Elasticsearch. Se identificar que uma sugestão se relaciona parcialmente com alguma palavra da query original, troca pela sugestão inteira.

}

