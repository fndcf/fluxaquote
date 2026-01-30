import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :root {
    --primary: #059669;
    --primary-dark: #047857;
    --primary-light: #10B981;
    --secondary: #0F172A;
    --secondary-light: #1E293B;
    --background: #F5F5F5;
    --surface: #FFFFFF;
    --text-primary: #0F172A;
    --text-secondary: #666666;
    --text-light: #999999;
    --success: #4CAF50;
    --warning: #FFC107;
    --error: #F44336;
    --info: #2196F3;
    --border: #E0E0E0;
    --shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: var(--background);
    color: var(--text-primary);
    line-height: 1.6;
  }

  button {
    cursor: pointer;
    font-family: inherit;
  }

  input, textarea, select {
    font-family: inherit;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  ul, ol {
    list-style: none;
  }
`;
