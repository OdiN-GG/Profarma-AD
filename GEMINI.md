# Gemini Context: automacao-ad

## Project Description

This project is a web-based tool for automating Active Directory (AD) tasks, with an initial focus on resetting user passwords. It consists of a React frontend (`automacao-ad-ui`) and a Node.js (Fastify) backend (`automacao-ad-api`).

The backend API serves as a bridge between the web interface and a PowerShell script (`Reset-ADPassword.ps1`) that interacts directly with Active Directory.

## Core Technologies

-   **Frontend (`automacao-ad-ui`):**
    -   React
    -   TypeScript
    -   Vite
    -   CSS

-   **Backend (`automacao-ad-api`):**
    -   Node.js
    -   Fastify
    -   PowerShell

-   **Target Environment:**
    -   Windows Server with Active Directory

## Architecture

1.  **Frontend:** The React application provides a form for users (likely IT support staff) to enter a username, a new temporary password, and select the user's location (OU) from dropdowns. It includes client-side validation for the new password.

2.  **Backend:** The Fastify server exposes a single API endpoint (`/api/reset-password`). It receives the data from the frontend and constructs a command to execute the `Reset-ADPassword.ps1` script.

3.  **PowerShell Script:** This script is the core of the AD interaction. It takes the username and new password as arguments, finds the user in the specified OU, resets their password, and forces a password change on the next logon.

## Security Model

The project's security is detailed in `GUIA_SEGURANCA_AD.md`. The key principles are:

-   **Service Account:** The application should not run with the permissions of the logged-in user. Instead, a dedicated, non-privileged Active Directory service account (`svc_ad_automacao`) is used.
-   **Delegation of Control:** The service account is granted the minimum necessary permissions (e.g., "Reset Password") only on specific Organizational Units (OUs) using AD's "Delegation of Control" feature.
-   **Credential Management:** The service account's password is encrypted and stored in a file (`cred.txt`) on the server. The PowerShell script is responsible for loading and using these credentials for all AD operations.

## Key Files

-   `automacao-ad-ui/src/App.tsx`: The main React component containing the password reset form.
-   `automacao-ad-ui/src/components/PasswordValidator.tsx`: A React component for validating password complexity.
-   `automacao-ad-api/server.js`: The Node.js/Fastify backend server.
-   `automacao-ad-api/scripts/Reset-ADPassword.ps1`: The PowerShell script that performs the AD password reset.
-   `GUIA_SEGURANCA_AD.md`: The security guide for the project.
