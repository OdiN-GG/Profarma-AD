# Guia: Implementando Segurança com Conta de Serviço na Automação do Active Directory

## Objetivo

Este documento detalha os passos necessários para elevar a segurança da ferramenta de automação do Active Directory, fazendo com que ela opere através de uma **Conta de Serviço** com permissões mínimas delegadas, em vez de depender das permissões do usuário logado na máquina.

Isso transforma a aplicação em uma ferramenta corporativa segura, auditável e independente.

---

## Conceitos Principais

* **Conta de Serviço:** Uma conta de usuário no AD criada especificamente para uma aplicação ou serviço, não para uma pessoa. Ela possui uma senha forte e longa e não tem privilégios de administrador.
* **Delegação de Controle:** Recurso do Active Directory que permite conceder permissões muito específicas para uma conta (como "resetar senhas") apenas em uma Unidade Organizacional (OU) determinada, sem a necessidade de dar permissões de administrador.

---

## Passo a Passo para Implementação

### Passo 1: Criação da Conta de Serviço no Active Directory

1.  Abra o console **"Usuários e Computadores do Active Directory"**.
2.  Navegue até uma OU apropriada para contas de serviço (ou crie uma).
3.  Clique com o botão direito -> **Novo** -> **Usuário**.
4.  Preencha os dados:
    * **Nome:** `Serviço de Automação AD`
    * **Nome de logon do usuário:** `svc_ad_automacao`
5.  Defina uma senha **muito longa, forte e complexa**. Guarde-a temporariamente.
6.  Nas opções de senha, marque:
    * `[✓] O usuário não pode alterar a senha`
    * `[✓] A senha nunca expira`
    * Desmarque `[ ] O usuário deve alterar a senha no próximo logon`.
7.  Conclua a criação. **Não adicione esta conta a nenhum grupo administrativo**.

### Passo 2: Delegação de Controle (Concedendo Permissões Mínimas)

1.  Ainda no console do AD, navegue até a OU "pai" onde os usuários que serão gerenciados se encontram (ex: `OU=PROFARMA`).
2.  Clique com o botão direito na OU e selecione **"Delegar Controle..."**.
3.  No assistente, clique em **Avançar**.
4.  Clique em **Adicionar...**, digite `svc_ad_automacao` e clique em **OK**. Depois, **Avançar**.
5.  Selecione a opção **"Criar uma tarefa personalizada para delegar"** e clique em **Avançar**.
6.  Selecione **"Apenas os seguintes objetos na pasta"**, marque **"Objetos de Usuário"** e clique em **Avançar**.
7.  Na lista de permissões, marque as caixas de seleção necessárias para suas automações. Para o reset de senha, a principal é:
    * **"Redefinir senha de usuário e forçar alteração de senha no próximo logon"**
8.  Se no futuro você for criar usuários, adicione também:
    * **"Criar, excluir e gerenciar contas de usuário"**
9.  Clique em **Avançar** e depois em **Concluir**.

### Passo 3: Armazenamento Seguro da Senha da Conta de Serviço

Vamos criar um arquivo com a senha criptografada.

1.  Na máquina onde o servidor Node.js irá rodar, abra um terminal **PowerShell como Administrador**.
2.  Execute o comando abaixo. Ele vai solicitar a senha e salvá-la de forma segura.

    ```powershell
    Read-Host -AsSecureString | ConvertFrom-SecureString | Out-File "C:\caminho\para\seu\projeto\cred.txt"
    ```
    *Substitua `C:\caminho\para\seu\projeto` pelo caminho real da sua pasta `automação-ad`.*

3.  Digite a senha da conta `svc_ad_automacao` quando solicitado e pressione Enter. O arquivo `cred.txt` será criado.

> **Nota de Segurança:** Este arquivo é criptografado para o usuário e o computador que o criaram. Se você mover a aplicação para outro servidor, precisará gerar um novo arquivo `cred.txt` nesse servidor.

### Passo 4: Atualização do Script PowerShell (`Reset-ADPassword.ps1`)

O script precisa ser modificado para carregar e usar as credenciais da conta de serviço em todos os comandos que interagem com o AD.

```powershell
# Reset-ADPassword.ps1 (Versão 4.0 - Execução Segura com Conta de Serviço)

[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)]
    [string]$Username,
    [Parameter(Mandatory=$true)]
    [string]$NewPassword,
    [Parameter(Mandatory=$false)]
    [string]$SearchOU
)

try {
    # --- CARREGAMENTO SEGURO DAS CREDENCIAIS ---
    # Altere o nome de usuário e o caminho do arquivo se necessário.
    $serviceAccountUser = "svc_ad_automacao@dist.grp.local" # Nome UPN da sua conta de serviço
    $encryptedPasswordPath = "C:\caminho\para\seu\projeto\cred.txt"
    
    $encryptedPassword = Get-Content $encryptedPasswordPath | ConvertTo-SecureString
    $credential = New-Object System.Management.Automation.PSCredential($serviceAccountUser, $encryptedPassword)
    # ---------------------------------------------

    $adUser = $null

    if (-not [string]::IsNullOrEmpty($SearchOU)) {
        # Adicionamos o parâmetro -Credential a todos os comandos do AD
        $adUser = Get-ADUser -Filter "SamAccountName -eq '$Username'" -SearchBase $SearchOU -Credential $credential -ErrorAction Stop
    }
    else {
        $adUser = Get-ADUser -Identity $Username -Credential $credential -ErrorAction Stop
    }

    if ($null -eq $adUser) {
        throw "O usuário '$Username' não foi encontrado na OU especificada ou no domínio."
    }

    $securePassword = ConvertTo-SecureString -String $NewPassword -AsPlainText -Force
    
    # Adicionamos o parâmetro -Credential aqui também
    Set-ADAccountPassword -Identity $adUser -NewPassword $securePassword -Reset -Credential $credential

    # E aqui
    Set-ADUser -Identity $adUser -ChangePasswordAtLogon $true -Credential $credential

    Write-Output "Senha para o usuário '$($adUser.SamAccountName)' foi resetada com sucesso."
}
catch {
    $errorMessage = "Erro ao processar o usuário '$Username'. Detalhes: $($_.Exception.Message)"
    Write-Error $errorMessage
    exit 1
}