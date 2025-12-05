// ============================================
// App.js - Funcionalidad de la página principal
// ============================================

// Variables globales
let currentPrice = 0;
let isClientLoggedIn = false;
let currentClientData = null;

// Obtener precio actual del servicio
function openRentalModal(serviceName, price) {
    currentPrice = price;
    document.getElementById('serviceName').value = serviceName;
    document.getElementById('totalPrice').value = price;
    document.getElementById('rentalHours').value = 1;
    
    // Limpiar otros campos
    document.getElementById('notes').value = '';
    
    // Verificar si el cliente está logueado
    checkClientLogin();
    
    // Mostrar el modal
    const modal = new bootstrap.Modal(document.getElementById('rentalModal'));
    modal.show();
}

// Verificar si el cliente está logueado
function checkClientLogin() {
    const isLoggedIn = sessionStorage.getItem('clientLoggedIn');
    const clientName = sessionStorage.getItem('clientName');
    const clientEmail = sessionStorage.getItem('clientEmail');
    
    const guestFields = document.getElementById('guestClientFields');
    const emailField = document.getElementById('guestEmailField');
    const phoneField = document.getElementById('guestPhoneField');
    const registeredInfo = document.getElementById('registeredClientInfo');
    
    if (isLoggedIn === 'true') {
        // Ocultar campos de cliente invitado
        guestFields.style.display = 'none';
        emailField.style.display = 'none';
        phoneField.style.display = 'none';
        
        // Mostrar información del cliente registrado
        registeredInfo.style.display = 'block';
        document.getElementById('registeredClientName').textContent = clientName;
        document.getElementById('registeredClientEmail').textContent = clientEmail;
        
        isClientLoggedIn = true;
    } else {
        // Mostrar campos para cliente invitado
        guestFields.style.display = 'block';
        emailField.style.display = 'block';
        phoneField.style.display = 'block';
        registeredInfo.style.display = 'none';
        
        // Limpiar campos
        document.getElementById('clientName').value = '';
        document.getElementById('clientEmail').value = '';
        document.getElementById('clientPhone').value = '';
        
        isClientLoggedIn = false;
    }
}

// Actualizar precio total cuando cambian las horas
document.addEventListener('input', function(e) {
    if (e.target.id === 'rentalHours') {
        const hours = parseInt(e.target.value) || 1;
        const total = currentPrice * hours;
        document.getElementById('totalPrice').value = total.toLocaleString('es-CO');
    }
});

// Función para enviar el formulario de alquiler
function submitRental() {
    const form = document.getElementById('rentalForm');
    const rentalDate = document.getElementById('rentalDate').value;
    
    // Validar fecha
    if (!rentalDate) {
        showAlert('Por favor selecciona una fecha de entrega', 'warning');
        return;
    }
    
    let clientName, clientEmail, clientPhone, clientId;
    
    if (isClientLoggedIn) {
        // Datos del cliente registrado
        clientName = sessionStorage.getItem('clientName');
        clientEmail = sessionStorage.getItem('clientEmail');
        clientPhone = sessionStorage.getItem('clientPhone') || 'No proporcionado';
        clientId = parseInt(sessionStorage.getItem('clientId'));
    } else {
        // Datos del cliente invitado
        clientName = document.getElementById('clientName').value.trim();
        clientEmail = document.getElementById('clientEmail').value.trim();
        clientPhone = document.getElementById('clientPhone').value.trim();
        
        if (!clientName || !clientEmail || !clientPhone) {
            showAlert('Por favor completa todos los campos requeridos', 'warning');
            return;
        }
        
        clientId = null;
    }

    // Recopilar datos
    const rentalData = {
        id: Date.now(),
        clientId: clientId,
        clientName: clientName,
        clientEmail: clientEmail,
        clientPhone: clientPhone,
        serviceName: document.getElementById('serviceName').value,
        rentalDate: rentalDate,
        hours: parseInt(document.getElementById('rentalHours').value),
        totalPrice: currentPrice * parseInt(document.getElementById('rentalHours').value),
        notes: document.getElementById('notes').value,
        status: 'pendiente',
        createdAt: new Date().toLocaleString('es-CO')
    };

    // Obtener órdenes existentes del localStorage
    let orders = JSON.parse(localStorage.getItem('rentalOrders')) || [];
    
    // Agregar nueva orden
    orders.push(rentalData);
    
    // Guardar en localStorage
    localStorage.setItem('rentalOrders', JSON.stringify(orders));

    // Mostrar mensaje de éxito
    showAlert('Pedido registrado exitosamente ✓', 'success');
    
    // Limpiar formulario
    form.reset();
    document.getElementById('totalPrice').value = 0;
    
    // Cerrar modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('rentalModal'));
    modal.hide();
}

// Función para mostrar alertas
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.setAttribute('role', 'alert');
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Insertar alerta en el top del body
    document.body.insertBefore(alertDiv, document.body.firstChild);
    
    // Auto-cerrar después de 4 segundos
    setTimeout(() => {
        alertDiv.remove();
    }, 4000);
}

// Validar que la fecha no sea en el pasado
document.addEventListener('change', function(e) {
    if (e.target.id === 'rentalDate') {
        const selectedDate = new Date(e.target.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            showAlert('Por favor, selecciona una fecha futura', 'warning');
            e.target.value = '';
        }
    }
});

// Evento para cuando el documento está listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('Página principal cargada');
    updateNavbarByUserType();
});

// Actualizar navbar según tipo de usuario
function updateNavbarByUserType() {
    const clientLoggedIn = sessionStorage.getItem('clientLoggedIn');
    const adminLoggedIn = sessionStorage.getItem('adminLoggedIn');
    
    const clientMenu = document.getElementById('clientMenuDropdown');
    const adminMenu = document.getElementById('adminMenuDropdown');
    const authLinks = document.getElementById('clientAuthLinks');
    
    if (clientLoggedIn === 'true') {
        // Cliente logueado
        const clientName = sessionStorage.getItem('clientName');
        clientMenu.style.display = 'block';
        adminMenu.style.display = 'none';
        authLinks.style.display = 'none';
        document.getElementById('clientNameNav').textContent = clientName || 'Mi Cuenta';
    } else if (adminLoggedIn === 'true') {
        // Admin logueado
        clientMenu.style.display = 'none';
        adminMenu.style.display = 'block';
        authLinks.style.display = 'none';
    } else {
        // No logueado
        clientMenu.style.display = 'none';
        adminMenu.style.display = 'none';
        authLinks.style.display = 'block';
    }
}

// Logout desde cualquier parte
function logoutFromIndex() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        sessionStorage.removeItem('clientLoggedIn');
        sessionStorage.removeItem('clientId');
        sessionStorage.removeItem('clientName');
        sessionStorage.removeItem('clientEmail');
        sessionStorage.removeItem('adminLoggedIn');
        location.reload();
    }
}

// ============================================
// Funcionalidad Galería de Fotos
// ============================================

let currentGalleryService = '';

// Abrir modal de galería
function openGalleryModal(serviceName) {
    currentGalleryService = serviceName;
    
    const descriptions = {
        'Lavadora Básica': 'Lavadora Básica - Lavado normal (40 min), Lavado rápido (20 min), Lavado delicado (50 min), Prelavado automático, Centrifugado variable. Perfecto para uso doméstico regular.',
        'Lavadora Premium': 'Lavadora Premium - Lavado automático (35 min), Eco mode (25 min), Lavado intenso (60 min), Detección inteligente de carga, Dosificación automática. Tecnología de punta para mayor eficiencia.',
        'Lavadora Deluxe': 'Lavadora Deluxe - IA Smart Wash (30 min), Steam & Refresh (40 min), Vapor desinfectante, Control de humedad, 20+ programas especiales. La máxima experiencia en lavado inteligente.',
        'Secadora Estándar': 'Secadora Estándar - Secado normal (45 min), Secado suave (60 min), Control de temperatura, Sensor de humedad. Secado rápido y confiable para toda tu ropa.',
        'Combo Pack Premium': 'Combo Pack Premium - Lavadora Premium + Secadora Estándar juntas, Descuento especial, Instalación incluida. Solución completa con máximas ventajas.',
        'Servicio Técnico': 'Servicio Técnico Premium - Atención prioritaria, Diagnóstico gratuito, Repuestos originales, Garantía de servicio. Mantenimiento y reparación especializados.'
    };

    const images = {
        'Lavadora Básica': 'img/lavadora Basica.png',
        'Lavadora Premium': 'img/lavadora Premium.png',
        'Lavadora Deluxe': 'img/lavadora Deluxe.png',
        'Secadora Estándar': 'img/Secador estandar.png',
        'Combo Pack Premium': 'img/combo pack premium.png',
        'Servicio Técnico': 'img/servicio tecnico premium.png'
    };
    
    document.getElementById('galleryModalTitle').textContent = serviceName;
    document.getElementById('galleryModalName').textContent = serviceName;
    document.getElementById('galleryModalDescription').textContent = descriptions[serviceName] || 'Servicio de calidad premium.';
    
    // Actualizar imagen dinámicamente
    const imgContainer = document.getElementById('galleryModalImage');
    const imgPath = images[serviceName] || 'img/lavadora Basica.png';
    imgContainer.innerHTML = `<img src="${imgPath}" alt="${serviceName}" style="width: 100%;height: 100%;object-fit: contain;">`;
}

// Actualizar modal de alquiler desde galería
function updateRentalFromGallery() {
    const prices = {
        'Lavadora Básica': 5000,
        'Lavadora Premium': 8000,
        'Lavadora Deluxe': 12000,
        'Secadora Estándar': 4000,
        'Combo Pack Premium': 26500,
        'Servicio Técnico': 15000
    };
    
    openRentalModal(currentGalleryService, prices[currentGalleryService] || 0);
}

// Filtrar galería
document.addEventListener('DOMContentLoaded', function() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            
            // Actualizar botón activo
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Filtrar items
            galleryItems.forEach(item => {
                const category = item.getAttribute('data-category');
                
                if (filter === 'all' || category === filter) {
                    item.classList.remove('hidden');
                    item.style.display = 'block';
                } else {
                    item.classList.add('hidden');
                    item.style.display = 'none';
                }
            });
        });
    });
});
