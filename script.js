const savedPasswords = [];

function toggleDarkMode() {
  const body = document.body;
  const icon = document.getElementById('themeIcon');
  body.classList.toggle('dark');
  const dark = body.classList.contains('dark');
  localStorage.setItem('mrclave-theme', dark ? 'dark' : 'light');
  icon.textContent = dark ? '☀️' : '🌙';
}

function loadTheme() {
  const theme = localStorage.getItem('mrclave-theme');
  if (theme === 'dark') {
    document.body.classList.add('dark');
    document.getElementById('themeIcon').textContent = '☀️';
  }
}

function generatePassword() {
  const length = parseInt(document.getElementById('length').value);
  const useUpper = document.getElementById('uppercase').checked;
  const useLower = document.getElementById('lowercase').checked;
  const useNumbers = document.getElementById('numbers').checked;
  const useSymbols = document.getElementById('symbols').checked;

  let charset = '';
  if (useUpper) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (useLower) charset += 'abcdefghijklmnopqrstuvwxyz';
  if (useNumbers) charset += '0123456789';
  if (useSymbols) charset += '!@#$%^&*()_+[]{}|;:,.<>?';

  if (!charset.length) {
    alert('Selecciona al menos una opción de caracteres.');
    return;
  }

  const array = new Uint32Array(length);
  window.crypto.getRandomValues(array);

  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset[array[i] % charset.length];
  }

  document.getElementById('passwordOutput').textContent = password;

  const entropy = (Math.log2(charset.length) * length).toFixed(2);
  document.getElementById('entropyOutput').textContent = `Entropía: ${entropy} bits`;

  const fill = document.getElementById('strengthFill');
  const strength = document.getElementById('strengthOutput');

  let barWidth = 0;
  let level = 'weak';
  if (entropy < 50) {
    barWidth = 33;
    level = 'weak';
    strength.textContent = 'Seguridad: Débil';
  } else if (entropy < 80) {
    barWidth = 66;
    level = 'medium';
    strength.textContent = 'Seguridad: Media';
  } else {
    barWidth = 100;
    level = 'strong';
    strength.textContent = 'Seguridad: Fuerte';
  }

  fill.style.width = `${barWidth}%`;
  fill.parentElement.className = `strength ${level}`;

  savedPasswords.push({ password, entropy });
  updateHistory();
}

function copyPassword() {
  const password = document.getElementById('passwordOutput').textContent;
  if (!password) return;
  navigator.clipboard.writeText(password)
    .then(() => alert('Contraseña copiada'))
    .catch(() => alert('Error al copiar'));
}

function exportCSV() {
  if (!savedPasswords.length) return alert('No hay contraseñas generadas.');
  let csv = 'Contraseña,Entropía\n';
  savedPasswords.forEach(p => {
    csv += `"${p.password}",${p.entropy}\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'contrasenas_mrclave.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function updateHistory() {
  const table = document.querySelector('#historyTable tbody');
  table.innerHTML = '';
  savedPasswords.slice().reverse().forEach(p => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${p.password}</td>
      <td>${p.entropy}</td>
      <td><button class="copy-mini" onclick="navigator.clipboard.writeText('${p.password}')">Copiar</button></td>
    `;
    table.appendChild(row);
  });
}

// Ejecutar al cargar
window.onload = loadTheme;
