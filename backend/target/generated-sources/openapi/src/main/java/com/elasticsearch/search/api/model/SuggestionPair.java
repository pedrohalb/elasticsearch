package com.elasticsearch.search.api.model;

import java.util.Objects;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonCreator;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import org.openapitools.jackson.nullable.JsonNullable;
import java.io.Serializable;
import javax.validation.Valid;
import javax.validation.constraints.*;

/**
 * SuggestionPair
 */
@javax.annotation.Generated(value = "org.openapitools.codegen.languages.SpringCodegen", date = "2025-06-23T23:42:03.249986150-03:00[America/Sao_Paulo]")

public class SuggestionPair  implements Serializable {
  private static final long serialVersionUID = 1L;

  @JsonProperty("original")
  private String original;

  @JsonProperty("suggestion")
  private String suggestion;

  public SuggestionPair original(String original) {
    this.original = original;
    return this;
  }

  /**
   * Get original
   * @return original
  */
  @ApiModelProperty(value = "")


  public String getOriginal() {
    return original;
  }

  public void setOriginal(String original) {
    this.original = original;
  }

  public SuggestionPair suggestion(String suggestion) {
    this.suggestion = suggestion;
    return this;
  }

  /**
   * Get suggestion
   * @return suggestion
  */
  @ApiModelProperty(value = "")


  public String getSuggestion() {
    return suggestion;
  }

  public void setSuggestion(String suggestion) {
    this.suggestion = suggestion;
  }


  @Override
  public boolean equals(java.lang.Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    SuggestionPair suggestionPair = (SuggestionPair) o;
    return Objects.equals(this.original, suggestionPair.original) &&
        Objects.equals(this.suggestion, suggestionPair.suggestion);
  }

  @Override
  public int hashCode() {
    return Objects.hash(original, suggestion);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class SuggestionPair {\n");
    
    sb.append("    original: ").append(toIndentedString(original)).append("\n");
    sb.append("    suggestion: ").append(toIndentedString(suggestion)).append("\n");
    sb.append("}");
    return sb.toString();
  }

  /**
   * Convert the given object to string with each line indented by 4 spaces
   * (except the first line).
   */
  private String toIndentedString(java.lang.Object o) {
    if (o == null) {
      return "null";
    }
    return o.toString().replace("\n", "\n    ");
  }
}

