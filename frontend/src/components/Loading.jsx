import React from "react";
import "../styles.css";

export default function Loading() {
  return (
    <div className="loading-container">
      <div className="spinner" />
      <p>Carregando...</p>
    </div>
  );
}
