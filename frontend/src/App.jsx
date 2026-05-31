import { useMemo, useState } from "react";
import "./App.css";

const WATCHLIST = ["AAPL", "MSFT", "NVDA", "TSLA", "AMD", "NASDAQ"];

function formatPercent(value) {
  return `${(Number(value || 0) * 100).toFixed(1)}%`;
}

function formatDecimal(value) {
  return Number(value || 0).toFixed(3);
}

function signalClass(value) {
  return Number(value) >= 0 ? "positive" : "negative";
}

function predictionClass(value) {
  return value === "UP" ? "positive" : "negative";
}

function predictionLabel(value) {
  return value === "UP" ? "BULLISH" : "BEARISH";
}

export default function App() {
  const [query, setQuery] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const search = async (nextQuery = query) => {
    const cleanQuery = nextQuery.trim().toUpperCase();
    if (!cleanQuery || loading) return;

    setQuery(cleanQuery);
    setLoading(true);
    setData(null);
    setError("");

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/analyze?query=${encodeURIComponent(cleanQuery)}`
      );

      if (!res.ok) {
        throw new Error("Market service returned an error.");
      }

      const json = await res.json();
      setData(json);
    } catch {
      setError(
        "Backend is not running. Start FastAPI on 127.0.0.1:8000, then try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const rows = useMemo(() => {
    if (data?.type !== "nasdaq") return [];

    return Object.entries(data.data)
      .map(([ticker, values]) => ({ ticker, ...values }))
      .sort((a, b) => b.confidence - a.confidence);
  }, [data]);

  const keywordRows = useMemo(() => {
    if (data?.type !== "keyword") return [];

    return Object.entries(data.data)
      .map(([company, values]) => ({ company, ...values }))
      .sort((a, b) => b.mentions - a.mentions);
  }, [data]);

  const modeLabel = data?.type ? data.type.toUpperCase() : "READY";

  return (
    <div className="app-shell">
      <header className="terminal-header">
        <div className="brand-block">
          <div className="brand-mark">SA</div>
          <div>
            <p className="eyebrow">StockAI Workstation</p>
            <h1>Market Intelligence</h1>
          </div>
        </div>

        <div className="session-meta">
          <span className="status-dot" />
          <span>API 127.0.0.1:8000</span>
          <span className="divider" />
          <span>{modeLabel}</span>
        </div>
      </header>

      <main className="terminal-grid">
        <section className="command-panel" aria-label="Market command">
          <form
            className="command-row"
            onSubmit={(event) => {
              event.preventDefault();
              search();
            }}
          >
            <label htmlFor="query">Command</label>
            <input
              id="query"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ticker, NASDAQ, or keyword"
              autoComplete="off"
            />
            <button type="submit" disabled={loading}>
              {loading ? "Running" : "Analyze"}
            </button>
          </form>

          <div className="quick-strip" aria-label="Quick commands">
            {WATCHLIST.map((symbol) => (
              <button
                key={symbol}
                type="button"
                onClick={() => search(symbol)}
                disabled={loading}
              >
                {symbol}
              </button>
            ))}
          </div>
        </section>

        <section className="market-strip" aria-label="Market context">
          <div>
            <span>Coverage</span>
            <strong>20 NASDAQ names</strong>
          </div>
          <div>
            <span>Signal Engine</span>
            <strong>News + Trend</strong>
          </div>
          <div>
            <span>Confidence Sort</span>
            <strong>High to Low</strong>
          </div>
          <div>
            <span>Session</span>
            <strong>{loading ? "Processing" : "Open"}</strong>
          </div>
        </section>

        <section className="workspace">
          <div className="panel main-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Primary Output</p>
                <h2>{data ? "Analysis Result" : "Command Console"}</h2>
              </div>
              <span className="panel-code">{query || "NO QUERY"}</span>
            </div>

            {loading && (
              <div className="loading-block">
                <div className="scan-line" />
                <p>Processing market data...</p>
              </div>
            )}

            {error && <div className="alert">{error}</div>}

            {!data && !loading && !error && (
              <div className="empty-state">
                <p className="terminal-prompt">STOCKAI &gt; awaiting command</p>
                <p>
                  Enter a ticker for a single-name signal, NASDAQ for a market
                  scan, or a keyword for company mention analysis.
                </p>
              </div>
            )}

            {data?.type === "stock" && (
              <SingleStockResult ticker={data.ticker} values={data.data} />
            )}

            {data?.type === "nasdaq" && <NasdaqTable rows={rows} />}

            {data?.type === "keyword" && (
              <KeywordTable rows={keywordRows} keyword={data.keyword} />
            )}
          </div>

          <aside className="panel side-panel">
            <div className="panel-header tight">
              <div>
                <p className="eyebrow">Monitor</p>
                <h2>Desk Summary</h2>
              </div>
            </div>

            <div className="summary-list">
              <SummaryItem
                label="Last Query"
                value={query || "--"}
                subvalue={data?.type || "standby"}
              />
              <SummaryItem
                label="Bullish Signals"
                value={
                  data?.type === "nasdaq"
                    ? rows.filter((row) => row.prediction === "UP").length
                    : data?.type === "stock" && data.data.prediction === "UP"
                      ? 1
                      : 0
                }
                subvalue="current result"
              />
              <SummaryItem
                label="Negative Sentiment"
                value={
                  data?.type === "nasdaq"
                    ? rows.filter((row) => row.sentiment < 0).length
                    : data?.type === "keyword"
                      ? keywordRows.filter((row) => row.sentiment < 0).length
                      : data?.type === "stock" && data.data.sentiment < 0
                        ? 1
                        : 0
                }
                subvalue="items flagged"
              />
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}

function SingleStockResult({ ticker, values }) {
  return (
    <div className="stock-result">
      <div className="quote-tile">
        <span>Symbol</span>
        <strong>{ticker}</strong>
        <em className={predictionClass(values.prediction)}>
          {predictionLabel(values.prediction)}
        </em>
      </div>

      <div className="metric-grid">
        <MetricCard
          label="Confidence"
          value={formatPercent(values.confidence)}
          tone={predictionClass(values.prediction)}
        />
        <MetricCard
          label="Sentiment"
          value={formatDecimal(values.sentiment)}
          tone={signalClass(values.sentiment)}
        />
        <MetricCard
          label="Recent Trend"
          value={formatDecimal(values.trend)}
          tone={signalClass(values.trend)}
        />
      </div>
    </div>
  );
}

function NasdaqTable({ rows }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Ticker</th>
            <th>Signal</th>
            <th>Confidence</th>
            <th>Sentiment</th>
            <th>Trend</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.ticker}>
              <td className="symbol-cell">{row.ticker}</td>
              <td>
                <span className={`pill ${predictionClass(row.prediction)}`}>
                  {predictionLabel(row.prediction)}
                </span>
              </td>
              <td>{formatPercent(row.confidence)}</td>
              <td className={signalClass(row.sentiment)}>
                {formatDecimal(row.sentiment)}
              </td>
              <td className={signalClass(row.trend)}>{formatDecimal(row.trend)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function KeywordTable({ rows, keyword }) {
  if (!rows.length) {
    return (
      <div className="empty-state compact">
        <p className="terminal-prompt">SCAN {keyword} &gt; no company hits</p>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Company</th>
            <th>Mentions</th>
            <th>Sentiment</th>
            <th>Read</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.company}>
              <td className="symbol-cell">{row.company}</td>
              <td>{row.mentions}</td>
              <td className={signalClass(row.sentiment)}>
                {formatDecimal(row.sentiment)}
              </td>
              <td>
                <span className={`pill ${signalClass(row.sentiment)}`}>
                  {row.sentiment >= 0 ? "POSITIVE" : "NEGATIVE"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MetricCard({ label, value, tone }) {
  return (
    <div className="metric-card">
      <span>{label}</span>
      <strong className={tone}>{value}</strong>
    </div>
  );
}

function SummaryItem({ label, value, subvalue }) {
  return (
    <div className="summary-item">
      <span>{label}</span>
      <strong>{value}</strong>
      <em>{subvalue}</em>
    </div>
  );
}
