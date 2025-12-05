// ============================================
// Admin.js - Funcionalidad del panel administrativo
// ============================================

// Variables globales
let loginModal;
let allOrders = [];
let editOrderModal;
let viewOrderModal;

// Credenciales de administrador (Ya no se usan aquí, están en auth.js)
const ADMIN_CREDENTIALS = {
    user: 'admin',
    password: '1234'
};

// Ejecutar cuando el documento está listo
document.addEventListener('DOMContentLoaded', function() {
    loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
    editOrderModal = new bootstrap.Modal(document.getElementById('editOrderModal'));
    viewOrderModal = new bootstrap.Modal(document.getElementById('viewOrderModal'));
    
    // Verificar si hay sesión activa de admin o cliente
    const adminLoggedIn = sessionStorage.getItem('adminLoggedIn');
    const clientLoggedIn = sessionStorage.getItem('clientLoggedIn');
    
    // Si está logueado como cliente, redirigir
    if (clientLoggedIn === 'true') {
        showAlert('Acceso denegado. Esta es un área administrativa.', 'danger');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return;
    }
    
    if (adminLoggedIn === 'true') {
        showAdminContent();
    } else {
        loginModal.show();
    }
    
    // Event listeners
    document.getElementById('searchInput').addEventListener('input', filterOrders);
    document.getElementById('filterStatus').addEventListener('change', filterOrders);
});

// Función de login (removida - ahora es en auth.html)
function login() {
    // Esta función no se usa más
    // El login ahora se hace en auth.html
}

// Función de logout
function logout() {
    sessionStorage.removeItem('adminLoggedIn');
    window.location.href = 'auth.html';
}

// Mostrar contenido administrativo
function showAdminContent() {
    document.getElementById('adminContent').classList.remove('d-none');
    loadOrders();
}

// Cargar órdenes del localStorage
function loadOrders() {
    allOrders = JSON.parse(localStorage.getItem('rentalOrders')) || [];
    displayOrders(allOrders);
    updateStatistics();
}

// Mostrar órdenes en la tabla
function displayOrders(orders) {
    const table = document.getElementById('ordersTable');
    
    if (orders.length === 0) {
        table.innerHTML = `
            <tr class="text-center">
                <td colspan="9" class="py-4 text-muted">
                    <i class="fas fa-inbox fa-2x mb-2 d-block"></i>
                    No hay pedidos registrados
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
                <strong>${order.clientName}</strong>
            </td>
            <td>
                ${order.serviceName}
            </td>
            <td>
                ${order.clientPhone}
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
                <div class="btn-group btn-group-sm" role="group">
                    <button class="btn" style="background-color: #A7D3E8; color: #2C5C84; border-color: #2C5C84;" onclick="viewOrder('${order.id}')" title="Ver detalles">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn" style="background-color: #F2F6F9; color: #2C5C84; border-color: #2C5C84;" onclick="editOrder('${order.id}')" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn" style="background-color: #2C5C84; color: white; border-color: #2C5C84;" onclick="deleteOrder('${order.id}')" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Formatear nombre del estado
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

// Ver detalles de la orden
function viewOrder(orderId) {
    const order = allOrders.find(o => o.id == orderId);
    
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
                <p><strong>Cliente:</strong></p>
                <p class="text-muted">${order.clientName}</p>
            </div>
        </div>
        
        <div class="row mb-3">
            <div class="col-6">
                <p><strong>Correo:</strong></p>
                <p class="text-muted">${order.clientEmail}</p>
            </div>
            <div class="col-6">
                <p><strong>Teléfono:</strong></p>
                <p class="text-muted">${order.clientPhone}</p>
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
                <p><strong>Creado:</strong></p>
                <p class="text-muted"><small>${order.createdAt}</small></p>
            </div>
        </div>
    `;
    
    document.getElementById('orderDetails').innerHTML = detailsHtml;
    viewOrderModal.show();
}

// Editar orden
function editOrder(orderId) {
    const order = allOrders.find(o => o.id == orderId);
    
    if (!order) return;
    
    document.getElementById('editOrderId').value = order.id;
    document.getElementById('editClientName').value = order.clientName;
    document.getElementById('editClientEmail').value = order.clientEmail;
    document.getElementById('editClientPhone').value = order.clientPhone;
    document.getElementById('editOrderStatus').value = order.status;
    document.getElementById('editNotes').value = order.notes || '';
    
    editOrderModal.show();
}

// Guardar cambios de la orden
function saveEditOrder() {
    const orderId = parseInt(document.getElementById('editOrderId').value);
    const orderIndex = allOrders.findIndex(o => o.id == orderId);
    
    if (orderIndex === -1) return;
    
    allOrders[orderIndex].clientName = document.getElementById('editClientName').value;
    allOrders[orderIndex].clientEmail = document.getElementById('editClientEmail').value;
    allOrders[orderIndex].clientPhone = document.getElementById('editClientPhone').value;
    allOrders[orderIndex].status = document.getElementById('editOrderStatus').value;
    allOrders[orderIndex].notes = document.getElementById('editNotes').value;
    
    localStorage.setItem('rentalOrders', JSON.stringify(allOrders));
    
    showAlert('Pedido actualizado exitosamente', 'success');
    editOrderModal.hide();
    loadOrders();
}

// Eliminar orden
function deleteOrder(orderId) {
    if (confirm('¿Estás seguro de que deseas eliminar este pedido?')) {
        allOrders = allOrders.filter(o => o.id != orderId);
        localStorage.setItem('rentalOrders', JSON.stringify(allOrders));
        
        showAlert('Pedido eliminado exitosamente', 'success');
        loadOrders();
    }
}

// Filtrar órdenes
function filterOrders() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('filterStatus').value;
    
    let filtered = allOrders;
    
    // Filtro de búsqueda
    if (searchTerm) {
        filtered = filtered.filter(order => 
            order.clientName.toLowerCase().includes(searchTerm) ||
            order.clientPhone.includes(searchTerm) ||
            order.clientEmail.toLowerCase().includes(searchTerm)
        );
    }
    
    // Filtro de estado
    if (statusFilter) {
        filtered = filtered.filter(order => order.status === statusFilter);
    }
    
    displayOrders(filtered);
}

// Actualizar estadísticas
function updateStatistics() {
    const totalOrders = allOrders.length;
    const activeOrders = allOrders.filter(o => 
        o.status === 'confirmado' || o.status === 'en_progreso'
    ).length;
    const pendingOrders = allOrders.filter(o => o.status === 'pendiente').length;
    const totalRevenue = allOrders.reduce((sum, o) => sum + o.totalPrice, 0);
    
    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('activeOrders').textContent = activeOrders;
    document.getElementById('pendingOrders').textContent = pendingOrders;
    document.getElementById('totalRevenue').textContent = '$' + totalRevenue.toLocaleString('es-CO');
}

// Limpiar todos los datos
function clearAllOrders() {
    if (confirm('¿ESTÁS SEGURO? Esto eliminará TODOS los pedidos del sistema. Esta acción no se puede deshacer.')) {
        if (confirm('Confirma que deseas eliminar todos los pedidos')) {
            localStorage.removeItem('rentalOrders');
            allOrders = [];
            displayOrders([]);
            updateStatistics();
            showAlert('Todos los pedidos han sido eliminados', 'warning');
        }
    }
}

// Función para mostrar alertas
function showAlert(message, type = 'info') {
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

// Permitir login con Enter
document.addEventListener('keypress', function(event) {
    if (event.key === 'Enter' && document.getElementById('adminPassword')) {
        const passwordInput = document.getElementById('adminPassword');
        if (document.activeElement === passwordInput || document.activeElement === document.getElementById('adminUser')) {
            login();
        }
    }
});
