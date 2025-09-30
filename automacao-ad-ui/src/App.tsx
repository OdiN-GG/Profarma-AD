// src/App.tsx (Versão com lógica para 'Não especifica')

import React, { useState } from 'react';
import './App.css';

// Sua lista está perfeita, vamos usá-la!
const filiais = [
  { label: 'Filial Goiás', value: 'OU=Filial Goias,OU=PROFARMA' },
  { label: 'Filial São Paulo', value: 'OU=Filial SP,OU=PROFARMA' },
  { label: 'Filial Rio de Janeiro', value: 'OU=Filial RJ,OU=PROFARMA' },
];

const setores = [
  { label: 'Não especifica', value: '' }, // Perfeito!
  { label: 'RH', value: 'OU=rh' },
  { label: 'Financeiro', value: 'OU=financeiro' },
  { label: 'TI', value: 'OU=ti' },
  { label: 'Custos', value: 'OU=custo' },
];

const dominioBase = 'DC=dist,DC=grp,DC=local';

function App() {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [filialSelecionada, setFilialSelecionada] = useState<string>(filiais[0].value);
  const [setorSelecionado, setSetorSelecionado] = useState<string>(setores[0].value);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState<boolean>(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('Processando...');
    setIsError(false);

    // --- LÓGICA CORRIGIDA PARA MONTAR O CAMINHO (DN) ---
    let ouCompleta = '';
    if (setorSelecionado) { // Se o setorSelecionado NÃO for uma string vazia
      // Monta o caminho com o setor
      ouCompleta = `${setorSelecionado},${filialSelecionada},${dominioBase}`;
    } else { // Se for uma string vazia (opção 'Não especifica')
      // Monta o caminho SEM o setor
      ouCompleta = `${filialSelecionada},${dominioBase}`;
    }
    // ----------------------------------------------------

    const body = {
      username: username,
      newPassword: password,
      ou: ouCompleta,
    };
    
    try {
      const response = await fetch('http://localhost:3000/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Ocorreu um erro.');
      setMessage(result.details);
    } catch (error: any) {
      setIsError(true);
      setMessage(error.message);
    }
  };

  return (
    <div className="App">
      <div className="form-container">
        <h1>Ferramenta de Reset de Senha - AD</h1>
        <form onSubmit={handleSubmit}>
          {/* O resto do seu formulário continua exatamente igual */}
          <div className="form-group">
            <label htmlFor="username">Nome de Usuário (ex: joao.silva):</label>
            <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="newPassword">Nova Senha Provisória:</label>
            <input type="password" id="newPassword" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="filial">Filial:</label>
            <select id="filial" value={filialSelecionada} onChange={(e) => setFilialSelecionada(e.target.value)}>
              {filiais.map((filial) => (
                <option key={filial.value} value={filial.value}>
                  {filial.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="setor">Setor:</label>
            <select id="setor" value={setorSelecionado} onChange={(e) => setSetorSelecionado(e.target.value)}>
              {setores.map((setor) => (
                <option key={setor.value} value={setor.value}>
                  {setor.label}
                </option>
              ))}
            </select>
          </div>
          <button type="submit">Resetar Senha</button>
        </form>

        {message && (
          <div className={`response-message ${isError ? 'error' : 'success'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;