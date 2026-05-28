import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import './App.css';

interface Ranking {
  id: number;
  count: number;
  created_at: string;
}

function App() {
  const [count, setCount] = useState(0);
  const [ranking, setRanking] = useState<Ranking[]>([]);
  const [showRanking, setShowRanking] = useState(false);
  const [loading, setLoading] = useState(false);

  const increment = () => setCount((prev) => prev + 1);
  const reset = () => setCount(0);

  const fetchRanking = async () => {
    const { data, error } = await supabase
      .from('rankings')
      .select('*')
      .order('count', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching ranking:', error);
    } else {
      setRanking(data || []);
    }
  };

  const finish = async () => {
    if (count > 0) {
      setLoading(true);
      const { error } = await supabase
        .from('rankings')
        .insert([{ count }]);

      if (error) {
        console.error('Error saving count:', error);
        alert('Erro ao salvar o contador. Verifique sua conexão e configurações do Supabase.');
      } else {
        await fetchRanking();
        setShowRanking(true);
        setCount(0);
      }
      setLoading(false);
    } else {
      await fetchRanking();
      setShowRanking(true);
    }
  };

  const backToCounter = () => {
    setShowRanking(false);
  };

  return (
    <div className="app-container">
      <h1 className="title">Contador de tá</h1>
      
      {!showRanking ? (
        <div className="counter-section">
          <div className="counter-display">
            <span className="count-number">{count}</span>
          </div>
          <div className="button-group">
            <button className="btn btn-increment" onClick={increment} disabled={loading}>
              Incrementar
            </button>
            <button className="btn btn-reset" onClick={reset} disabled={loading}>
              Resetar
            </button>
            <button className="btn btn-finish" onClick={finish} disabled={loading}>
              {loading ? 'Salvando...' : 'Finalizar'}
            </button>
          </div>
        </div>
      ) : (
        <div className="ranking-section">
          <h2>Top 5 Recordes</h2>
          <ul className="ranking-list">
            {ranking.length > 0 ? (
              ranking.map((item, index) => (
                <li key={item.id} className="ranking-item">
                  <span className="rank-pos">{index + 1}º</span>
                  <span className="rank-count">{item.count} tá's</span>
                  <span className="rank-date">
                    {new Date(item.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </li>
              ))
            ) : (
              <p>Nenhum recorde encontrado.</p>
            )}
          </ul>
          <button className="btn btn-back" onClick={backToCounter}>
            Voltar
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
