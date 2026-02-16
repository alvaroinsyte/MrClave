const savedPasswords = [];

// Cargar tema al iniciar
function loadTheme() {
  const theme = localStorage.getItem('mrclave-theme');
  if (theme === 'dark') {
    document.body.classList.add('dark');
    document.getElementById('themeIcon').textContent = '☀️';
  }
}

// Alternar modo oscuro
function toggleDarkMode() {
  const body = document.body;
  const icon = document.getElementById('themeIcon');
  body.classList.toggle('dark');
  const dark = body.classList.contains('dark');
  localStorage.setItem('mrclave-theme', dark ? 'dark' : 'light');
  icon.textContent = dark ? '☀️' : '🌙';
}

// Mostrar notificación toast
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}

// Actualizar display de longitud del slider
function updateLengthDisplay() {
  const lengthInput = document.getElementById('length');
  const lengthDisplay = document.getElementById('lengthDisplay');
  
  lengthInput.addEventListener('input', (e) => {
    lengthDisplay.textContent = e.target.value;
  });
}

// Generar contraseña
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
  if (useSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

  if (!charset.length) {
    showToast('⚠️ Selecciona al menos una opción de caracteres');
    return;
  }

  // Generar contraseña usando crypto API
  const array = new Uint32Array(length);
  window.crypto.getRandomValues(array);

  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset[array[i] % charset.length];
  }

  // Actualizar output con animación
  const passwordOutput = document.getElementById('passwordOutput');
  passwordOutput.style.opacity = '0';
  
  setTimeout(() => {
    passwordOutput.textContent = password;
    passwordOutput.style.transition = 'opacity 0.3s ease';
    passwordOutput.style.opacity = '1';
  }, 150);

  // Calcular entropía
  const entropy = (Math.log2(charset.length) * length).toFixed(2);
  document.getElementById('entropyOutput').textContent = `${entropy} bits`;

  // Actualizar barra de seguridad
  updateStrengthBar(entropy);

  // Guardar en historial
  savedPasswords.push({ password, entropy, timestamp: new Date().toLocaleString() });
  updateHistory();
  
  // Mostrar notificación
  showToast('✅ Contraseña generada exitosamente');
}

// Actualizar barra de seguridad
function updateStrengthBar(entropy) {
  const fill = document.getElementById('strengthFill');
  const strength = document.getElementById('strengthOutput');

  let barWidth = 0;
  let level = 'weak';
  let text = 'Débil';

  if (entropy < 50) {
    barWidth = 33;
    level = 'weak';
    text = 'Débil';
  } else if (entropy < 80) {
    barWidth = 66;
    level = 'medium';
    text = 'Media';
  } else {
    barWidth = 100;
    level = 'strong';
    text = 'Fuerte';
  }

  strength.textContent = text;
  fill.style.width = `${barWidth}%`;
  fill.className = `strength-bar ${level}`;
}

// Copiar contraseña
function copyPassword() {
  const password = document.getElementById('passwordOutput').textContent;
  
  if (!password || password === 'Genera tu primera contraseña') {
    showToast('⚠️ No hay contraseña para copiar');
    return;
  }
  
  navigator.clipboard.writeText(password)
    .then(() => {
      showToast('📋 Contraseña copiada al portapapeles');
      
      // Animación del botón
      const copyBtn = document.querySelector('.copy-icon-btn');
      copyBtn.style.transform = 'scale(1.2)';
      setTimeout(() => {
        copyBtn.style.transform = 'scale(1)';
      }, 200);
    })
    .catch(() => {
      showToast('❌ Error al copiar la contraseña');
    });
}

// Exportar a CSV
function exportCSV() {
  if (!savedPasswords.length) {
    showToast('⚠️ No hay contraseñas para exportar');
    return;
  }
  
  let csv = 'Contraseña,Entropía (bits),Fecha y Hora\n';
  savedPasswords.forEach(p => {
    csv += `"${p.password}",${p.entropy},"${p.timestamp}"\n`;
  });
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.href = url;
  link.download = `contrasenas_mrclave_${Date.now()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  showToast('📄 CSV exportado exitosamente');
}

// Actualizar historial
function updateHistory() {
  const emptyState = document.getElementById('emptyState');
  const tableWrapper = document.getElementById('historyTableWrapper');
  const clearBtn = document.getElementById('clearBtn');
  const tbody = document.querySelector('#historyTable tbody');
  
  if (savedPasswords.length === 0) {
    emptyState.style.display = 'block';
    tableWrapper.style.display = 'none';
    clearBtn.style.display = 'none';
  } else {
    emptyState.style.display = 'none';
    tableWrapper.style.display = 'block';
    clearBtn.style.display = 'block';
    
    tbody.innerHTML = '';
    
    // Mostrar las últimas 10 contraseñas (más recientes primero)
    const recentPasswords = savedPasswords.slice(-10).reverse();
    
    recentPasswords.forEach((p, index) => {
      const row = document.createElement('tr');
      row.style.animation = `fadeIn 0.3s ease ${index * 0.05}s both`;
      
      row.innerHTML = `
        <td>
          <div style="font-family: 'Monaco', monospace; word-break: break-all;">
            ${p.password}
          </div>
        </td>
        <td>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span>${p.entropy}</span>
            <span style="font-size: 0.7rem; color: #9ca3af;">bits</span>
          </div>
        </td>
        <td>
          <button class="copy-mini" onclick="copyFromHistory('${p.password.replace(/'/g, "\\'")}')">
            📋 Copiar
          </button>
        </td>
      `;
      
      tbody.appendChild(row);
    });
  }
}

// Copiar desde el historial
function copyFromHistory(password) {
  navigator.clipboard.writeText(password)
    .then(() => {
      showToast('📋 Contraseña copiada del historial');
    })
    .catch(() => {
      showToast('❌ Error al copiar');
    });
}

// Limpiar historial
function clearHistory() {
  if (!savedPasswords.length) return;
  
  if (confirm('¿Estás seguro de que deseas eliminar todo el historial?')) {
    savedPasswords.length = 0;
    updateHistory();
    showToast('🗑️ Historial eliminado');
  }
}

// Generar contraseña al presionar Enter en el input de longitud
function setupEnterKey() {
  const lengthInput = document.getElementById('length');
  lengthInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      generatePassword();
    }
  });
}

// Atajos de teclado
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + G = Generar
    if ((e.ctrlKey || e.metaKey) && e.key === 'g') {
      e.preventDefault();
      generatePassword();
    }
    
    // Ctrl/Cmd + C = Copiar (cuando el foco no está en un input)
    if ((e.ctrlKey || e.metaKey) && e.key === 'c' && 
        !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      const password = document.getElementById('passwordOutput').textContent;
      if (password && password !== 'Genera tu primera contraseña') {
        e.preventDefault();
        copyPassword();
      }
    }
  });
}

// Animación de entrada para las opciones
function animateOptions() {
  const options = document.querySelectorAll('.option-card');
  options.forEach((option, index) => {
    option.style.animation = `fadeInUp 0.4s ease ${index * 0.1}s both`;
  });
}

// Inicialización
window.onload = function() {
  loadTheme();
  updateLengthDisplay();
  setupEnterKey();
  setupKeyboardShortcuts();
  animateOptions();
  
  // Generar una contraseña de ejemplo al cargar
  setTimeout(() => {
    generatePassword();
  }, 500);
};

// Prevenir que el usuario cierre accidentalmente si hay contraseñas no exportadas
window.addEventListener('beforeunload', (e) => {
  if (savedPasswords.length > 0) {
    e.preventDefault();
    e.returnValue = '';
  }
});
