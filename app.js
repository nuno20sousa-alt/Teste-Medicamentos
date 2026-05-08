const { useEffect, useMemo, useState } = React;const { = "Não disponível") {
  return String(value ?? "").trim() || fallback;
}

function foldText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function normalizeText(value) {
  return foldText(value).trim();
}

function includesNormalized(value, query) {
  const q = normalizeText(query);
  if (!q) return true;
  return normalizeText(value).includes(q);
}

function highlightNormalized(text, query) {
  const original = String(text ?? "");
  const q = normalizeText(query);

  if (!original || !q) return original;

  let normalized = "";
  const indexMap = [];

  for (let i = 0; i < original.length; i++) {
    const folded = foldText(original[i]);

    for (let j = 0; j < folded.length; j++) {
      normalized += folded[j];
      indexMap.push(i);
    }
  }

  const ranges = [];
  let searchFrom = 0;

  while (searchFrom <= normalized.length) {
    const foundAt = normalized.indexOf(q, searchFrom);
    if (foundAt === -1) break;

    const start = indexMap[foundAt];
    const end = (indexMap[foundAt + q.length - 1] ?? start) + 1;

    if (typeof start === "number" && typeof end === "number") {
      ranges.push([start, end]);
    }

    searchFrom = foundAt + Math.max(q.length, 1);
  }

  if (!ranges.length) return original;

  const merged = [];

  ranges.forEach(([start, end]) => {
    const last = merged[merged.length - 1];

    if (last && start <= last[1]) {
      last[1] = Math.max(last[1], end);
    } else {
      merged.push([start, end]);
    }
  });

  const parts = [];
  let cursor = 0;

  merged.forEach(([start, end], index) => {
    if (cursor < start) {
      parts.push(original.slice(cursor, start));
    }

    parts.push(
      <mark key={`mark-${index}`}>
        {original.slice(start, end)}
      </mark>
    );

    cursor = end;
  });

  if (cursor < original.length) {
    parts.push(original.slice(cursor));
  }

  return parts;
}

function uniqueValues(items, field) {
  return Array.from(
    new Set(
      items
        .map(item => valueOrFallback(item[field], ""))
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b, "pt", { sensitivity: "base" }));
}

function SearchHero({ query, setQuery }) {
  return (
    <div className="hero">
      <div className="hero-content">
        <div className="hero-kicker">🇵🇹 Base local de medicamentos</div>

        <h1>Consulta de Medicamentos</h1>

        <p>
          Pesquisa profissional por nome comercial ou substância ativa (DCI),
          com filtros rápidos e resultados optimizados para utilização em
          desktop e telemóvel.
        </p>

        <div className="hero-search">
          <span className="hero-search-icon">🔍</span>

          <input
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Ex: Cystagon, Mercaptamina, Brufen, Paracetamol…"
            aria-label="Pesquisar medicamento"
            autoComplete="off"
          />

          {query && (
            <button type="button" onClick={() => setQuery("")}>
              Limpar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryCards({ total, filtered, genericCount, formCount }) {
  return (
    <div className="summary-grid">
      <div className="summary-card">
        <div className="summary-label">Total carregado</div>
        <div className="summary-value">{total}</div>
      </div>

      <div className="summary-card">
        <div className="summary-label">Resultados</div>
        <div className="summary-value">{filtered}</div>
      </div>

      <div className="summary-card">
        <div className="summary-label">Genéricos</div>
        <div className="summary-value">{genericCount}</div>
      </div>

      <div className="summary-card">
        <div className="summary-label">Formas</div>
        <div className="summary-value">{formCount}</div>
      </div>
    </div>
  );
}

function FiltersPanel({
  onlyNome,
  setOnlyNome,
  comercializado,
  setComercializado,
  generico,
  setGenerico,
  estadoAIM,
  setEstadoAIM,
  formaFarmaceutica,
  setFormaFarmaceutica,
  formasFarmaceuticas,
  filtrosAtivos,
  limparFiltros,
  showFilters,
  setShowFilters
}) {
  return (
    <div className="filters-panel">
      <div
        className="filters-header"
        onClick={() => setShowFilters(!showFilters)}
      >
        <div className="filters-title">
          <span>⚙️</span>
          <span>Filtros</span>
        </div>

        <div className="filters-meta">
          {filtrosAtivos > 0 && (
            <span className="badge">{filtrosAtivos}</span>
          )}

          {filtrosAtivos > 0 && (
            <button
              type="button"
              className="clear-btn"
              onClick={event => {
                event.stopPropagation();
                limparFiltros();
              }}
            >
              Limpar filtros
            </button>
          )}

          <span>{showFilters ? "▴" : "▾"}</span>
        </div>
      </div>

      {showFilters && (
        <div className="filters-content">
          <div className="filters-group full">
            <div className="filters-group-title">Âmbito da pesquisa</div>

            <div className="chips">
              <button
                type="button"
                className={`chip ${onlyNome ? "active" : ""}`}
                onClick={() => setOnlyNome(!onlyNome)}
              >
                Só nome do medicamento
              </button>
            </div>
          </div>

          <div className="filters-group full">
            <div className="filters-group-title">Filtros rápidos</div>

            <div className="chips">
              <button
                type="button"
                className={`chip ${comercializado ? "active" : ""}`}
                onClick={() => setComercializado(!comercializado)}
              >
                📦 Comercializado
              </button>

              <button
                type="button"
                className={`chip ${generico ? "active" : ""}`}
                onClick={() => setGenerico(!generico)}
              >
                🧪 Genérico
              </button>
            </div>
          </div>

          <div className="filters-group">
            <div className="filters-group-title">Estado da AIM</div>

            <select
              value={estadoAIM}
              onChange={event => setEstadoAIM(event.target.value)}
            >
              <option value="">Todos</option>
              <option value="Autorizado">Autorizado</option>
              <option value="Suspenso">Suspenso</option>
              <option value="Revogado">Revogado</option>
            </select>
          </div>

          <div className="filters-group">
            <div className="filters-group-title">Forma farmacêutica</div>

            <select
              value={formaFarmaceutica}
              onChange={event => setFormaFarmaceutica(event.target.value)}
            >
              <option value="">Todas</option>

              {formasFarmaceuticas.map(forma => (
                <option key={forma} value={forma}>
                  {forma}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}

function MedicineCard({ medicamento, query, isOpen, onToggle }) {
  const nome = valueOrFallback(medicamento["Nome do Medicamento"]);
  const dci = valueOrFallback(
    medicamento["Substância Ativa/DCI"],
    "DCI não disponível"
  );
  const forma = valueOrFallback(medicamento["Forma Farmacêutica"]);
  const dosagem = valueOrFallback(medicamento["Dosagem"]);
  const titular = valueOrFallback(medicamento["Titular de AIM"]);
  const generico = valueOrFallback(medicamento["Genérico"]);
  const estado = valueOrFallback(medicamento["Estado da AIM"]);
  const comercializacao = valueOrFallback(medicamento["Comercialização"]);

  return (
    <article
      className={`card ${isOpen ? "open" : ""}`}
      onClick={onToggle}
      tabIndex="0"
      onKeyDown={event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onToggle();
        }
      }}
    >
      <div className="card-header">
        <div className="card-title">
          <div className="medicine-name">
            {highlightNormalized(nome, query)}
          </div>

          <span className="medicine-dci">
            {highlightNormalized(dci, query)}
          </span>
        </div>

        <span className="chevron">{isOpen ? "▼" : "▶"}</span>
      </div>

      <div className="card-badges">
        <span className={`pill ${generico === "Sim" ? "green" : ""}`}>
          {generico === "Sim" ? "Genérico" : "Não genérico"}
        </span>

        <span className="pill blue">{forma}</span>
        <span className="pill amber">{dosagem}</span>
      </div>

      {isOpen && (
        <div className="card-details">
          <div className="detail-item">
            <span className="detail-label">Forma farmacêutica</span>
            <span className="detail-value">{forma}</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Dosagem</span>
            <span className="detail-value">{dosagem}</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Titular de AIM</span>
            <span className="detail-value">{titular}</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Genérico</span>
            <span className="detail-value">{generico}</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Estado da AIM</span>
            <span className="detail-value">{estado}</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Comercialização</span>
            <span className="detail-value">{comercializacao}</span>
          </div>
        </div>
      )}
    </article>
  );
}

function App() {
  const [medicamentos, setMedicamentos] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [onlyNome, setOnlyNome] = useState(false);
  const [comercializado, setComercializado] = useState(false);
  const [generico, setGenerico] = useState(false);
  const [estadoAIM, setEstadoAIM] = useState("");
  const [formaFarmaceutica, setFormaFarmaceutica] = useState("");
  const [showFilters, setShowFilters] = useState(true);

  const [expandedId, setExpandedId] = useState(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    let isMounted = true;

    fetch("./medicamentos.json")
      .then(response => {
        if (!response.ok) {
          throw new Error(
            `Não foi possível carregar medicamentos.json (${response.status})`
          );
        }

        return response.json();
      })
      .then(data => {
        if (!isMounted) return;

        if (!Array.isArray(data)) {
          throw new Error(
            "O ficheiro medicamentos.json deve conter um array de medicamentos."
          );
        }

        setMedicamentos(data);
        setLoading(false);
      })
      .catch(err => {
        if (!isMounted) return;

        setError(err.message || "Erro inesperado ao carregar os dados.");
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
    setExpandedId(null);
  }, [
    query,
    onlyNome,
    comercializado,
    generico,
    estadoAIM,
    formaFarmaceutica
  ]);

  const formasFarmaceuticas = useMemo(
    () => uniqueValues(medicamentos, "Forma Farmacêutica"),
    [medicamentos]
  );

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

  const resultados = useMemo(() => {
    const q = normalizeText(query);

    return medicamentos.filter(medicamento => {
      const nome = medicamento["Nome do Medicamento"];
      const dci = medicamento["Substância Ativa/DCI"];

      const textoOK =
        !q ||
        (onlyNome
          ? includesNormalized(nome, q)
          : includesNormalized(nome, q) || includesNormalized(dci, q));

      if (!textoOK) return false;

      if (
        comercializado &&
        medicamento["Comercialização"] !== "Comercializado"
      ) {
        return false;
      }

      if (generico && medicamento["Genérico"] !== "Sim") {
        return false;
      }

      if (estadoAIM && medicamento["Estado da AIM"] !== estadoAIM) {
        return false;
      }

      if (
        formaFarmaceutica &&
        medicamento["Forma Farmacêutica"] !== formaFarmaceutica
      ) {
        return false;
      }

      return true;
    });
  }, [
    medicamentos,
    query,
    onlyNome,
    comercializado,
    generico,
    estadoAIM,
    formaFarmaceutica
  ]);

  const visibleResults = resultados.slice(0, visibleCount);
  const hasMoreResults = visibleCount < resultados.length;

  const genericCount = useMemo(
    () =>
      medicamentos.filter(
        medicamento => medicamento["Genérico"] === "Sim"
      ).length,
    [medicamentos]
  );

  if (loading) {
    return (
      <div className="app-shell">
        <SearchHero query={query} setQuery={setQuery} />

        <main className="app">
          <div className="empty">A carregar medicamentos…</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-shell">
        <SearchHero query={query} setQuery={setQuery} />

        <main className="app">
          <div className="empty">
            <strong>Erro ao carregar dados</strong>
            <br />
            {error}
            <br />
            <br />
            Confirma que estás a abrir a app através de{" "}
            <code>python -m http.server</code> e que o ficheiro{" "}
            <code>medicamentos.json</code> está na mesma pasta.
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <SearchHero query={query} setQuery={setQuery} />

      <main className="app">
        <SummaryCards
          total={medicamentos.length}
          filtered={resultados.length}
          genericCount={genericCount}
          formCount={formasFarmaceuticas.length}
        />

        <FiltersPanel
          onlyNome={onlyNome}
          setOnlyNome={setOnlyNome}
          comercializado={comercializado}
          setComercializado={setComercializado}
          generico={generico}
          setGenerico={setGenerico}
          estadoAIM={estadoAIM}
          setEstadoAIM={setEstadoAIM}
          formaFarmaceutica={formaFarmaceutica}
          setFormaFarmaceutica={setFormaFarmaceutica}
          formasFarmaceuticas={formasFarmaceuticas}
          filtrosAtivos={filtrosAtivos}
          limparFiltros={limparFiltros}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
        />

        <div className="results-toolbar">
          <div>
            A mostrar <strong>{visibleResults.length}</strong> de{" "}
            <strong>{resultados.length}</strong> resultado(s)
          </div>

          <div className="results-hint">
            Pesquisa sem acentos suportada. Ex: <strong>acido</strong>{" "}
            encontra <strong>Ácido</strong>.
          </div>
        </div>

        {resultados.length === 0 ? (
          <div className="empty">
            Não foram encontrados medicamentos com os critérios seleccionados.
          </div>
        ) : (
          <>
            <section className="results-list" aria-label="Resultados da pesquisa">
              {visibleResults.map((medicamento, index) => {
                const stableId = [
                  medicamento["Nome do Medicamento"] || "med",
                  medicamento["Substância Ativa/DCI"] || "dci",
                  medicamento["Forma Farmacêutica"] || "forma",
                  medicamento["Dosagem"] || "dosagem",
                  index
                ].join("-");

                const isOpen = expandedId === stableId;

                return (
                  <MedicineCard
                    key={stableId}
                    medicamento={medicamento}
                    query={query}
                    isOpen={isOpen}
                    onToggle={() => setExpandedId(isOpen ? null : stableId)}
                  />
                );
              })}
            </section>

            {hasMoreResults && (
              <div className="load-more-wrap">
                <button
                  type="button"
                  className="load-more-btn"
                  onClick={() =>
                    setVisibleCount(count => count + PAGE_SIZE)
                  }
                >
                  Ver mais resultados
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

const PAGE_SIZE = 50;
