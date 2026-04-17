import { useState } from "react";
import "./App.css";

export default function App() {
  const [query, setQuery] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!query) return;

    setLoading(true);
    setData(null);

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/analyze?query=${query}`
      );
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  const renderStock = () => (
    <div className="grid">
      <Card title="Prediction" value={data.data.prediction} />
      <Card title="Confidence" value={`${(data.data.confidence * 100).toFixed(1)}%`} />
      <Card title="Sentiment" value={data.data.sentiment} />
      <Card title="Trend" value={data.data.trend} />
    </div>
  );

  const renderKeyword = () => (
    <div className="gridKeywords">
      {Object.entries(data.data).map(([company, info]) => (
        <div className="card" key={company}>
          <div className="title">{company}</div>
          <div>Mentions: {info.mentions}</div>
          <div className={info.sentiment >= 0 ? "green" : "red"}>
            Sentiment: {info.sentiment}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="app">
      {/* SIDEBAR */}
      <div className="sidebar">
        <div className="logo">StockAI</div>

        <input
          className="input"
          placeholder="Enter ticker or keyword..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <button className="button" onClick={analyze}>
          Analyze
        </button>

        <div className="hint">Try: AAPL, NVDA, AI</div>
      </div>

      {/* MAIN */}
      <div className="main">
        {loading && <div className="loading">Analyzing market data...</div>}

        {data?.type === "stock" && renderStock()}
        {data?.type === "keyword" && renderKeyword()}

        {!data && !loading && (
          <div className="empty">Enter a stock or keyword to begin</div>
        )}
      </div>
    </div>
  );
}

/* CARD COMPONENT */
function Card({ title, value }) {
  return (
    <div className="card">
      <div className="title">{title}</div>
      <div className="value">{value}</div>
    </div>
  );
}