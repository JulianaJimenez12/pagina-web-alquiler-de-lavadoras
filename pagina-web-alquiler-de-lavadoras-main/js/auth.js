// ============================================
// Auth.js - Autenticación de Clientes y Admin
// ============================================

// Credenciales de administrador
const ADMIN_CREDENTIALS = {
    user: 'admin',
    password: '1234'
};

// Cambiar entre tabs de login y registro
function switchTab(tab) {
    // Ocultar todos los tabs
    document.querySelectorAll('.form-tab').forEach(el => {
        el.classList.remove('active');
    });
    
    // Desactivar todos los botones
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Mostrar el tab seleccionado
    document.getElementById(tab).classList.add('active');
    
    // Activar el botón
    event.target.closest('.tab-btn').classList.add('active');
    
    // Limpiar alertas
    document.getElementById('authAlert').innerHTML = '';
}

// Manejar login de cliente
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    // Obtener clientes del localStorage
    let clients = JSON.parse(localStorage.getItem('clients')) || [];
    
    // Buscar cliente
    const client = clients.find(c => c.email === email);
    
    if (!client) {
        showAuthAlert('El correo no está registrado', 'danger');
        return;
    }
    
    if (client.password !== password) {
        showAuthAlert('Contraseña incorrecta', 'danger');
        return;
    }
    
    // Guardar sesión de cliente
    sessionStorage.setItem('clientLoggedIn', 'true');
    sessionStorage.setItem('clientId', client.id);
    sessionStorage.setItem('clientName', client.name);
    sessionStorage.setItem('clientEmail', client.email);
    
    // Limpiar sesión de admin si existe
    sessionStorage.removeItem('adminLoggedIn');
    
    // Redirigir al index
    showAuthAlert('¡Bienvenido! Redirigiendo...', 'success');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

// Manejar registro
function handleRegister(event) {
    event.preventDefault();
    
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const phone = document.getElementById('registerPhone').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerPasswordConfirm').value;
    
    // Validaciones
    if (password !== confirmPassword) {
        showAuthAlert('Las contraseñas no coinciden', 'danger');
        return;
    }
    
    // Obtener clientes existentes
    let clients = JSON.parse(localStorage.getItem('clients')) || [];
    
    // Verificar si el email ya existe
    if (clients.find(c => c.email === email)) {
        showAuthAlert('El correo ya está registrado', 'danger');
        return;
    }
    
    // Crear nuevo cliente
    const newClient = {
        id: Date.now(),
        name: name,
        email: email,
        phone: phone,
        password: password, // En producción, esto debe ser hasheado
        createdAt: new Date().toLocaleString('es-CO')
    };
    
    // Agregar cliente
    clients.push(newClient);
    localStorage.setItem('clients', JSON.stringify(clients));
    
    // Guardar sesión automáticamente
    sessionStorage.setItem('clientLoggedIn', 'true');
    sessionStorage.setItem('clientId', newClient.id);
    sessionStorage.setItem('clientName', newClient.name);
    sessionStorage.setItem('clientEmail', newClient.email);
    
    // Limpiar sesión de admin si existe
    sessionStorage.removeItem('adminLoggedIn');
    
    showAuthAlert('¡Cuenta creada exitosamente! Redirigiendo...', 'success');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

// Manejar login de admin
function handleAdminLogin(event) {
    event.preventDefault();
    
    const user = document.getElementById('adminUser').value.trim();
    const password = document.getElementById('adminPassword').value;
    
    if (user === ADMIN_CREDENTIALS.user && password === ADMIN_CREDENTIALS.password) {
        // Guardar sesión de admin
        sessionStorage.setItem('adminLoggedIn', 'true');
        
        // Limpiar sesión de cliente si existe
        sessionStorage.removeItem('clientLoggedIn');
        sessionStorage.removeItem('clientId');
        sessionStorage.removeItem('clientName');
        sessionStorage.removeItem('clientEmail');
        
        // Redirigir al panel admin
        showAuthAlert('¡Acceso concedido! Redirigiendo...', 'success');
        setTimeout(() => {
            window.location.href = 'admin.html';
        }, 1500);
    } else {
        showAuthAlert('Usuario o contraseña de administrador incorrectos', 'danger');
        document.getElementById('adminPassword').value = '';
    }
}

// Mostrar alerta
function showAuthAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.setAttribute('role', 'alert');
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const container = document.getElementById('authAlert');
    container.innerHTML = '';
    container.appendChild(alertDiv);
}

// Verificar si hay sesión activa al cargar
document.addEventListener('DOMContentLoaded', function() {
    const clientLoggedIn = sessionStorage.getItem('clientLoggedIn');
    const adminLoggedIn = sessionStorage.getItem('adminLoggedIn');
    
    if (clientLoggedIn === 'true') {
        window.location.href = 'index.html';
    } else if (adminLoggedIn === 'true') {
        window.location.href = 'admin.html';
    }
});
