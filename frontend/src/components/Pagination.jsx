import React from "react";
import "../styles.css";

const Pagination = ({ page, setPage, totalPages }) => {
  const goToPage = (p) => {
    if (p >= 1 && p <= totalPages) {
      setPage(p);
    }
  };

  return (
    <div className="pagination modern-pagination">
      <span className="info">
        Página <strong>{page}</strong> de <strong>{totalPages}</strong>
      </span>
      <div className="controls">
        <button
          onClick={() => goToPage(1)}
          disabled={page === 1}
          className="page-btn"
        >
          ««
        </button>
        <button
          onClick={() => goToPage(page - 1)}
          disabled={page === 1}
          className="page-btn"
        >
          ‹
        </button>

        {[page - 1, page, page + 1].map((p, i) =>
          p > 0 && p <= totalPages ? (
            <button
              key={i}
              className={`page-btn ${p === page ? "active" : ""}`}
              onClick={() => goToPage(p)}
            >
              {p}
            </button>
          ) : null
        )}

        <button
          onClick={() => goToPage(page + 1)}
          disabled={page === totalPages}
          className="page-btn"
        >
          ›
        </button>
        <button
          onClick={() => goToPage(totalPages)}
          disabled={page === totalPages}
          className="page-btn"
        >
          »»
        </button>
      </div>
    </div>
  );
};

export default Pagination;
