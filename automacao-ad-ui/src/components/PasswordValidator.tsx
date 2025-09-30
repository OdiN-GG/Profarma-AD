// src/components/PasswordValidator.tsx

import React, { useEffect, useState } from 'react';

// Definimos as propriedades que o componente vai receber
interface PasswordValidatorProps {
  password_to_check: string;
  username_to_check: string;
  onValidationChange: (isValid: boolean) => void;
}

// Estilos para os ícones de check
const checkStyle = { color: 'green', marginRight: '8px' };
const crossStyle = { color: 'red', marginRight: '8px' };

export function PasswordValidator({ password_to_check, username_to_check, onValidationChange }: PasswordValidatorProps) {
  // Estados para cada regra de validação
  const [checks, setChecks] = useState({
    length: false,
    hasUpper: false,
    hasLower: false,
    hasNumber: false,
    hasSymbol: false,
    notContainsUsername: true,
  });

  useEffect(() => {
    // --- LÓGICA DE VALIDAÇÃO ---
    const length = password_to_check.length >= 8;
    const hasUpper = /[A-Z]/.test(password_to_check);
    const hasLower = /[a-z]/.test(password_to_check);
    const hasNumber = /[0-9]/.test(password_to_check);
    const hasSymbol = /[^A-Za-z0-9]/.test(password_to_check);
    
    let notContainsUsername = true;
    if (username_to_check) {
        notContainsUsername = !password_to_check.toLowerCase().includes(username_to_check.toLowerCase());
    }

    // Contamos quantos dos critérios de complexidade foram atendidos
    const complexityScore = [hasUpper, hasLower, hasNumber, hasSymbol].filter(Boolean).length;

    // A senha é válida se tiver o comprimento certo E atender a 3 critérios de complexidade E não contiver o username
    const isOverallValid = length && complexityScore >= 3 && notContainsUsername;

    // Atualizamos o estado e notificamos o componente pai
    setChecks({ length, hasUpper, hasLower, hasNumber, hasSymbol, notContainsUsername });
    onValidationChange(isOverallValid);

  }, [password_to_check, username_to_check, onValidationChange]); // Roda a validação sempre que a senha ou username mudam

  const complexityScore = [checks.hasUpper, checks.hasLower, checks.hasNumber, checks.hasSymbol].filter(Boolean).length;

  return (
    <div className="validator-list">
      <ul>
        <li className={checks.length ? 'valid' : 'invalid'}>
          <span style={checks.length ? checkStyle : crossStyle}>{checks.length ? '✓' : '✗'}</span>
          Mínimo de 8 caracteres
        </li>
        <li className={complexityScore >= 3 ? 'valid' : 'invalid'}>
            <span style={complexityScore >= 3 ? checkStyle : crossStyle}>{complexityScore >= 3 ? '✓' : '✗'}</span>
            Atender a 3 de 4: Maiúscula, minúscula, número, símbolo
        </li>
        <li className={checks.notContainsUsername ? 'valid' : 'invalid'}>
            <span style={checks.notContainsUsername ? checkStyle : crossStyle}>{checks.notContainsUsername ? '✓' : '✗'}</span>
            Não pode conter o nome de usuário
        </li>
      </ul>
    </div>
  );
}