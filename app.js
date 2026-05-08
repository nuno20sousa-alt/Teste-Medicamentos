const { useState, useEffect } = React;

function highlight(text, query) {
  if (!query) return text;
  const regex = new RegExp(`(${query})`, "gi");
  return text.split(regex).map((p, i) =>
    regex.test(p) ? <mark key={i}>{p}</mark> : p
  );
}

function App() {
  const [medicamentos, setMedicamentos] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // filtros
  const [onlyNome, setOnlyNome] = useState(false);
  const [comercializado, setComercializado] = useState(false);
  const [generico, setGenerico] = useState(false);
  const [estadoAIM, setEstadoAIM] = useState("");
  const [formaFarmaceutica, setFormaFarmaceutica] = useState("");
  const [showFilters, setShowFilters] = useState(true);

  const [expanded, setExpanded] = useState(null);

  // ligar search do hero ao estado React
  useEffect(() => {
    const input = document.getElementById("heroSearch");
    input.addEventListener("input", e => setQuery(e.target.value));
    return () => input.removeEventListener("input", () => {});
  }, []);

  useEffect(() => {
    fetch("./medicamentos.json")
      .then(r => r.json())
      .then(data => {
        setMedicamentos(data);
        setLoading(false);
      })
      .catch(e => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  const formasFarmaceuticas = Array.from(
    new Set(
      medicamentos.map(m => m["Forma Farmacêutica"]).filter(Boolean)
    )
  ).sort();

  const filtrosAtivos =
    (onlyNome ? 1 : 0) +
    (comercializado ? 1 : 0) +
    (generico ? 1 : 0) +
    (estadoAIM ? 1 : 0) +
    (formaFarmaceutica ? 1 : 0);

  const limparFiltros = () => {
    setOnlyNome(false);
    setComercializado(false);
    setGenerico(false);
    setEstadoAIM("");
    setFormaFarmaceutica("");
  };

  const q = query.toLowerCase().trim();

  const resultados = medicamentos.filter(m => {
    const nome = (m["Nome do Medicamento"] || "").toLowerCase();
    const dci = (m["Substância Ativa/DCI"] || "").toLowerCase();

    const textoOK = onlyNome
      ? nome.includes(q)
      : nome.includes(q) || dci.includes(q);

    if (!textoOK) return false;
    if (comercializado && m["Comercialização"] !== "Comercializado") return false;
    if (generico && m["Genérico"] !== "Sim") return false;
    if (estadoAIM && m["Estado da AIM"] !== estadoAIM) return false;
    if (formaFarmaceutica && m["Forma Farmacêutica"] !== formaFarmaceutica) return false;

    return true;
  });

  if (loading) return <div className="empty">A carregar medicamentos…</div>;
  if (error) return <div className="empty">Erro: {error}</div>;

  return (
    <>
      <div className="filters-panel">
        <div className="filters-header" onClick={() => setShowFilters(!showFilters)}>
          <span>Filtros</span>
          <div className="filters-meta">
            {filtrosAtivos > 0 && <span className="badge">{filtrosAtivos}</span>}
            {filtrosAtivos > 0 && (
              <button className="clear-btn" onClick={limparFiltros}>
                Limpar
              </button>
            )}
            <span>{showFilters ? "▴" : "▾"}</span>
          </div>
        </div>

        {showFilters && (
          <>
            <div className="filters-group">
              <div className="filters-group-title">Âmbito</div>
              <div
                className={`chip ${onlyNome ? "active" : ""}`}
                onClick={() => setOnlyNome(!onlyNome)}
              >
                Só nome do medicamento
              </div>
            </div>

            <div className="filters-group">
              <div className="filters-group-title">Estado</div>
              <div className="chips">
                <div
                  className={`chip ${comercializado ? "active" : ""}`}
                  onClick={() => setComercializado(!comercializado)}
                >
                  📦 Comercializado
                </div>
                <div
                  className={`chip ${generico ? "active" : ""}`}
                  onClick={() => setGenerico(!generico)}
                >
                  🧪 Genérico
                </div>
              </div>
            </div>

            <div className="filters-group">
              <div className="filters-group-title">Estado da AIM</div>
              <select value={estadoAIM} onChange={e => setEstadoAIM(e.target.value)}>
                <option value="">Todos</option>
                <option value="Autorizado">Autorizado</option>
                <option value="Suspenso">Suspenso</option>
                <option value="Revogado">Revogado</option>
              </select>
            </div>

            <div className="filters-group">
              <div className="filters-group-title">Forma Farmacêutica</div>
              <select
                value={formaFarmaceutica}
                onChange={e => setFormaFarmaceutica(e.target.value)}
              >
                <option value="">Todas</option>
                {formasFarmaceuticas.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>

      <div className="results-info">
        {resultados.length} resultado(s)
      </div>

      {resultados.map((m, i) => {
        const open = expanded === i;
        return (
          <div
            key={i}
            className={`card ${open ? "open" : ""}`}
            onClick={() => setExpanded(open ? null : i)}
          >
            <div className="card-header">
              <strong>{highlight(m["Nome do Medicamento"], q)}</strong>
              <span className="chevron">{open ? "▼" : "▶"}</span>
            </div>
            <span>{highlight(m["Substância Ativa/DCI"], q)}</span>

            {open && (
              <div className="card-details">
                <p><b>Forma:</b> {m["Forma Farmacêutica"]}</p>
                <p><b>Dosagem:</b> {m["Dosagem"]}</p>
                <p><b>Titular AIM:</b> {m["Titular de AIM"]}</p>
                <p><b>Genérico:</b> {m["Genérico"]}</p>
                <p><b>Estado AIM:</b> {m["Estado da AIM"]}</p>
                <p><b>Comercialização:</b> {m["Comercialização"]}</p>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);