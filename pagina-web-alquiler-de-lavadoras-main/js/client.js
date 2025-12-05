// ============================================
// Client.js - Panel del Cliente
// ============================================

let currentClient = null;
let clientOrders = [];

// Ejecutar cuando el documento está listo
document.addEventListener('DOMContentLoaded', function() {
    checkClientSession();
    loadClientProfile();
    loadClientOrders();
});

// Verificar sesión del cliente
function checkClientSession() {
    const isLoggedIn = sessionStorage.getItem('clientLoggedIn');
    
    if (isLoggedIn !== 'true') {
        window.location.href = 'auth.html';
        return;
    }
    
    const clientId = parseInt(sessionStorage.getItem('clientId'));
    const clientName = sessionStorage.getItem('clientName');
    
    // Actualizar navbar
    document.getElementById('userNameNav').textContent = clientName || 'Mi Cuenta';
}

// Cargar perfil del cliente
function loadClientProfile() {
    const clientId = parseInt(sessionStorage.getItem('clientId'));
    let clients = JSON.parse(localStorage.getItem('clients')) || [];
    
    currentClient = clients.find(c => c.id === clientId);
    
    if (!currentClient) {
        window.location.href = 'auth.html';
        return;
    }
    
    // Mostrar datos del perfil
    document.getElementById('profileName').textContent = currentClient.name;
    document.getElementById('profileEmail').textContent = currentClient.email;
    document.getElementById('profilePhone').textContent = currentClient.phone;
    document.getElementById('profileDate').textContent = currentClient.createdAt;
    
    updateClientStats();
}

// Cargar pedidos del cliente
function loadClientOrders() {
    const clientId = parseInt(sessionStorage.getItem('clientId'));
    let allOrders = JSON.parse(localStorage.getItem('rentalOrders')) || [];
    
    // Filtrar por correo del cliente actual (por si el cliente hizo pedidos antes de registrarse)
    clientOrders = allOrders.filter(order => 
        order.clientEmail === currentClient.email || order.clientId === clientId
    );
    
    displayClientOrders(clientOrders);
}

// Mostrar pedidos del cliente en la tabla
function displayClientOrders(orders) {
    const table = document.getElementById('clientOrdersTable');
    
    if (orders.length === 0) {
        table.innerHTML = `
            <tr class="text-center">
                <td colspan="8" class="py-4 text-muted">
                    <i class="fas fa-inbox fa-2x mb-2 d-block"></i>
                    No tienes pedidos registrados
                </td>
            </tr>
        `;
        return;
    }
    
    table.innerHTML = orders.map(order => `
        <tr>
            <td>
                <small class="text-muted">#${order.id}</small>
            </td>
            <td>
                ${order.serviceName}
            </td>
            <td>
                <small>${order.rentalDate}</small>
            </td>
            <td>
                ${order.hours}h
            </td>
            <td>
                <strong>$${order.totalPrice.toLocaleString('es-CO')}</strong>
            </td>
            <td>
                <span class="badge badge-${order.status}">
                    ${formatStatus(order.status)}
                </span>
            </td>
            <td>
                <small class="text-muted">${order.createdAt}</small>
            </td>
            <td>
                <button class="btn btn-sm" style="background-color: #A7D3E8; color: #2C5C84; border-color: #2C5C84;" onclick="viewOrderDetails('${order.id}')">
                    <i class="fas fa-eye"></i> Ver
                </button>
            </td>
        </tr>
    `).join('');
}

// Formatear estado
function formatStatus(status) {
    const statusMap = {
        'pendiente': 'Pendiente',
        'confirmado': 'Confirmado',
        'en_progreso': 'En Progreso',
        'completado': 'Completado',
        'cancelado': 'Cancelado'
    };
    return statusMap[status] || status;
}

// Ver detalles del pedido
function viewOrderDetails(orderId) {
    const order = clientOrders.find(o => o.id == orderId);
    
    if (!order) return;
    
    const detailsHtml = `
        <div class="row mb-3">
            <div class="col-6">
                <p><strong>ID Pedido:</strong></p>
                <p class="text-muted">#${order.id}</p>
            </div>
            <div class="col-6">
                <p><strong>Estado:</strong></p>
                <span class="badge badge-${order.status}">
                    ${formatStatus(order.status)}
                </span>
            </div>
        </div>
        
        <hr>
        
        <div class="row mb-3">
            <div class="col-12">
                <p><strong>Servicio:</strong></p>
                <p class="text-muted">${order.serviceName}</p>
            </div>
        </div>
        
        <div class="row mb-3">
            <div class="col-6">
                <p><strong>Fecha de Entrega:</strong></p>
                <p class="text-muted">${order.rentalDate}</p>
            </div>
            <div class="col-6">
                <p><strong>Cantidad de Horas:</strong></p>
                <p class="text-muted">${order.hours}h</p>
            </div>
        </div>
        
        <hr>
        
        <div class="row mb-3">
            <div class="col-12">
                <p><strong>Precio Total:</strong></p>
                <p class="text-muted"><strong style="font-size: 1.2em; color: #2C5C84;">$${order.totalPrice.toLocaleString('es-CO')}</strong></p>
            </div>
        </div>
        
        ${order.notes ? `
        <hr>
        <div class="row mb-3">
            <div class="col-12">
                <p><strong>Notas:</strong></p>
                <p class="text-muted">${order.notes}</p>
            </div>
        </div>
        ` : ''}
        
        <hr>
        
        <div class="row">
            <div class="col-12">
                <p><strong>Fecha de Creación:</strong></p>
                <p class="text-muted"><small>${order.createdAt}</small></p>
            </div>
        </div>
    `;
    
    document.getElementById('orderDetailsContent').innerHTML = detailsHtml;
    const modal = new bootstrap.Modal(document.getElementById('orderDetailsModal'));
    modal.show();
}

// Filtrar pedidos por estado
function filterClientOrders() {
    const statusFilter = document.getElementById('filterStatus').value;
    
    let filtered = clientOrders;
    
    if (statusFilter) {
        filtered = clientOrders.filter(order => order.status === statusFilter);
    }
    
    displayClientOrders(filtered);
}

// Actualizar estadísticas del cliente
function updateClientStats() {
    const totalOrders = clientOrders.length;
    const completedOrders = clientOrders.filter(o => o.status === 'completado').length;
    const activeOrders = clientOrders.filter(o => 
        o.status === 'confirmado' || o.status === 'en_progreso'
    ).length;
    const totalSpent = clientOrders.reduce((sum, o) => sum + o.totalPrice, 0);
    
    document.getElementById('clientTotalOrders').textContent = totalOrders;
    document.getElementById('clientCompletedOrders').textContent = completedOrders;
    document.getElementById('clientActiveOrders').textContent = activeOrders;
    document.getElementById('clientTotalSpent').textContent = '$' + totalSpent.toLocaleString('es-CO');
    
    // Datos en el perfil
    document.getElementById('profileTotalOrders').textContent = totalOrders;
    document.getElementById('profileTotalSpent').textContent = '$' + totalSpent.toLocaleString('es-CO');
}

// Mostrar tab
function showTab(tabName) {
    // Ocultar todos los tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('d-none');
    });
    
    // Desactivar todos los botones
    document.querySelectorAll('.nav-link').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Mostrar el tab seleccionado
    document.getElementById(tabName).classList.remove('d-none');
    
    // Activar el botón
    document.getElementById(tabName + '-tab').classList.add('active');
}

// Cambiar contraseña
function handleChangePassword(event) {
    event.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmNewPassword').value;
    
    // Validar contraseña actual
    if (currentPassword !== currentClient.password) {
        showClientAlert('La contraseña actual es incorrecta', 'danger');
        return;
    }
    
    // Validar que las nuevas contraseñas coincidan
    if (newPassword !== confirmPassword) {
        showClientAlert('Las nuevas contraseñas no coinciden', 'danger');
        return;
    }
    
    // Validar que sea diferente
    if (newPassword === currentPassword) {
        showClientAlert('La nueva contraseña debe ser diferente', 'warning');
        return;
    }
    
    // Actualizar contraseña
    let clients = JSON.parse(localStorage.getItem('clients')) || [];
    const clientIndex = clients.findIndex(c => c.id === currentClient.id);
    
    if (clientIndex !== -1) {
        clients[clientIndex].password = newPassword;
        currentClient.password = newPassword;
        localStorage.setItem('clients', JSON.stringify(clients));
        
        showClientAlert('Contraseña actualizada exitosamente', 'success');
        document.getElementById('changePasswordForm').reset();
    }
}

// Mostrar alerta
function showClientAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.setAttribute('role', 'alert');
    alertDiv.style.position = 'fixed';
    alertDiv.style.top = '70px';
    alertDiv.style.right = '20px';
    alertDiv.style.zIndex = '9999';
    alertDiv.style.minWidth = '300px';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 4000);
}

// Logout
function logoutClient() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        sessionStorage.removeItem('clientLoggedIn');
        sessionStorage.removeItem('clientId');
        sessionStorage.removeItem('clientName');
        sessionStorage.removeItem('clientEmail');
        window.location.href = 'auth.html';
    }
}
