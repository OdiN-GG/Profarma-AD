// src/App.tsx (Versão com Validador de Senha)

import React, { useState } from 'react';
import './App.css';
import { PasswordValidator } from './components/PasswordValidator'; // 1. IMPORTAMOS O COMPONENTE

function App() {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [ou, setOu] = useState<string>(''); // Mantivemos a lógica de OU dos dropdowns
  
  // (Assumindo que você manteve as listas de filiais/setores do passo anterior)
  const filiais = [{ label: 'Filial Goiás', value: 'OU=Filial Goias,OU=PROFARMA' }];
  const setores = [{ label: 'Não especifica', value: '' }, { label: 'RH', value: 'OU=rh' }];
  const dominioBase = 'DC=dist,DC=grp,DC=local';
  const [filialSelecionada, setFilialSelecionada] = useState<string>(filiais[0].value);
  const [setorSelecionado, setSetorSelecionado] = useState<string>(setores[0].value);

  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState<boolean>(false);
  const [isPasswordValid, setIsPasswordValid] = useState<boolean>(false); // 2. NOVO ESTADO

  const handleSubmit = async (event: React.FormEvent) => {
    // ... (A lógica do handleSubmit continua exatamente a mesma de antes)
    event.preventDefault();
    setMessage('Processando...');
    setIsError(false);

    let ouCompleta = '';
    if (setorSelecionado) {
      ouCompleta = `${setorSelecionado},${filialSelecionada},${dominioBase}`;
    } else {
      ouCompleta = `${filialSelecionada},${dominioBase}`;
    }

    const body = { username, newPassword: password, ou: ouCompleta };
    
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
        <h1>Profarma Reset de Senha - AD</h1>
        <form onSubmit={handleSubmit}>
          {/* ... campos de username e dropdowns ... */}
          <div className="form-group">
            <label htmlFor="username">Nome de Usuário (ex: joao.silva):</label>
            <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="newPassword">Nova Senha Provisória:</label>
            <input type="password" id="newPassword" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          
          {/* 3. ADICIONAMOS O COMPONENTE DE VALIDAÇÃO AQUI */}
          <PasswordValidator 
            password_to_check={password} 
            username_to_check={username}
            onValidationChange={setIsPasswordValid}
          />

          <div className="form-group">
            <label htmlFor="filial">Filial:</label>
            <select id="filial" value={filialSelecionada} onChange={(e) => setFilialSelecionada(e.target.value)}>
                {filiais.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="setor">Setor:</label>
            <select id="setor" value={setorSelecionado} onChange={(e) => setSetorSelecionado(e.target.value)}>
                {setores.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          {/* 4. O BOTÃO AGORA É DESABILITADO SE A SENHA NÃO FOR VÁLIDA */}
          <button type="submit" disabled={!isPasswordValid}>
            Resetar Senha
          </button>
        </form>
        {message && <div className={`response-message ${isError ? 'error' : 'success'}`}>{message}</div>}
      </div>
    </div>
  );
}

export default App;