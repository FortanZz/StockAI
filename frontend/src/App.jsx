import { useState } from "react";
import "./App.css";

export default function App() {
  const [query, setQuery] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    if (!query) return;

    setLoading(true);
    setData(null);

    const res = await fetch(
      `http://127.0.0.1:8000/analyze?query=${query}`
    );

    const json = await res.json();
    setData(json);
    setLoading(false);
  };

  return (
    <div className="page">
      <div className="center">
        <h1 className="logo">StockAI Terminal</h1>

        <input
          className="input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="AAPL / AI / NASDAQ"
          onKeyDown={(e) => e.key === "Enter" && search()}
        />

        <button className="button" onClick={search}>
          Analyze
        </button>

        {loading && <p className="loading">Processing market data...</p>}

        {/* STOCK VIEW */}
        {data?.type === "stock" && (
          <div className="card">
            <p>
              Prediction:{" "}
              <span className={data.data.prediction === "UP" ? "green" : "red"}>
                {data.data.prediction}
              </span>
            </p>

            <p>
              Confidence: {(data.data.confidence * 100).toFixed(1)}%
            </p>

            <p>
              Sentiment:{" "}
              <span className={data.data.sentiment >= 0 ? "green" : "red"}>
                {data.data.sentiment}
              </span>
            </p>

            <p>Trend: {data.data.trend}</p>
          </div>
        )}

        {/* NASDAQ VIEW */}
        {data?.type === "nasdaq" && (
          <div className="grid">
            {Object.entries(data.data).map(([ticker, v]) => (
              <div className="card" key={ticker}>
                <h3>{ticker}</h3>

                <p>
                  Prediction:{" "}
                  <span className={v.prediction === "UP" ? "green" : "red"}>
                    {v.prediction}
                  </span>
                </p>

                <p>
                  Confidence: {(v.confidence * 100).toFixed(1)}%
                </p>

                <p>
                  Sentiment:{" "}
                  <span className={v.sentiment >= 0 ? "green" : "red"}>
                    {v.sentiment}
                  </span>
                </p>
              </div>
            ))}
          </div>
        )}

        {!data && !loading && (
          <p className="hint">Try: AAPL • AI • NASDAQ</p>
        )}
      </div>
    </div>
  );
}