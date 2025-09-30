# Reset-ADPassword.ps1 (Versão 3.0 - Correção de Parâmetros)

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
    # Inicializa a variável do usuário como nula
    $adUser = $null

    # Verifica se a OU foi fornecida para decidir como procurar o usuário
    if (-not [string]::IsNullOrEmpty($SearchOU)) {
        # Se a OU foi fornecida, usa -Filter e -SearchBase
        $adUser = Get-ADUser -Filter "SamAccountName -eq '$Username'" -SearchBase $SearchOU -ErrorAction Stop
    }
    else {
        # Se nenhuma OU foi fornecida, usa -Identity (mais rápido para busca global)
        $adUser = Get-ADUser -Identity $Username -ErrorAction Stop
    }

    # Se, após a busca, o usuário não for encontrado, lança um erro
    if ($null -eq $adUser) {
        throw "O usuário '$Username' não foi encontrado na OU especificada ou no domínio."
    }

    # O restante do script permanece o mesmo
    $securePassword = ConvertTo-SecureString -String $NewPassword -AsPlainText -Force
    Set-ADAccountPassword -Identity $adUser -NewPassword $securePassword -Reset
    Set-ADUser -Identity $adUser -ChangePasswordAtLogon $true

    Write-Output "Senha para o usuário '$($adUser.SamAccountName)' foi resetada com sucesso."
}
catch {
    # A mensagem de erro agora será mais específica, vinda do próprio comando ou do 'throw'
    $errorMessage = "Erro ao processar o usuário '$Username'. Detalhes: $($_.Exception.Message)"
    Write-Error $errorMessage
    exit 1
}