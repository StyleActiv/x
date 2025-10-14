// Sistema de gestión de pedidos
class OrderSystem {
    constructor() {
        this.orders = JSON.parse(localStorage.getItem('orders')) || [];
        this.users = JSON.parse(localStorage.getItem('users')) || [];
    }

    // Registrar un nuevo usuario
    registerUser(userData) {
        const userId = `user_${Date.now()}`;
        const newUser = {
            id: userId,
            ...userData,
            createdAt: new Date().toISOString()
        };
        
        this.users.push(newUser);
        this._saveUsers();
        return { success: true, userId, user: newUser };
    }

    // Buscar usuario por email
    getUserByEmail(email) {
        return this.users.find(user => user.email === email);
    }

    // Crear un nuevo pedido
    createOrder(orderData) {
        const orderId = `order_${Date.now()}`;
        const newOrder = {
            id: orderId,
            ...orderData,
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        
        this.orders.push(newOrder);
        this._saveOrders();
        return { success: true, orderId, order: newOrder };
    }

    // Obtener pedidos de un usuario
    getOrdersByUserId(userId) {
        return this.orders.filter(order => order.userId === userId);
    }

    // Guardar usuarios en localStorage
    _saveUsers() {
        localStorage.setItem('users', JSON.stringify(this.users));
    }

    // Guardar pedidos en localStorage
    _saveOrders() {
        localStorage.setItem('orders', JSON.stringify(this.orders));
    }
}

// Instancia global del sistema de pedidos
const orderSystem = new OrderSystem();

// Procesar un nuevo pedido
function processReservation(event) {
    event.preventDefault();
    console.log("Procesando pedido...");
    
    const form = document.getElementById('reservation-form');
    const name = form.querySelector('#reservation-name').value;
    const phone = form.querySelector('#reservation-phone').value;
    const email = form.querySelector('#reservation-email').value;
    const address = form.querySelector('#reservation-address').value;
    const notes = form.querySelector('#reservation-notes').value;
    
    // Validación adicional para el nombre (solo letras)
    if (!/^[A-Za-zÁáÉéÍíÓóÚúÑñ\s]+$/.test(name)) {
        alert('El nombre solo debe contener letras y espacios');
        return;
    }
    
    if (!name || !phone || !email || !address) {
        showNotification('Por favor completa todos los campos obligatorios');
        return;
    }
    
    // Buscar si el usuario ya existe
    let user = orderSystem.getUserByEmail(email);
    let userId;
    
    if (!user) {
        // Registrar nuevo usuario
        const result = orderSystem.registerUser({
            name,
            email,
            phone,
            address
        });
        
        if (result.success) {
            userId = result.userId;
            user = result.user;
        } else {
            showNotification('Error al registrar usuario');
            return;
        }
    } else {
        userId = user.id;
    }
    
    // Obtener productos del carrito
    let cartItems = getCartItems();
    let total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Crear pedido
    const orderResult = orderSystem.createOrder({
        userId,
        items: cartItems,
        total,
        shippingAddress: address,
        notes,
        paymentStatus: 'pending'
    });
    
    if (orderResult.success) {
        // Mostrar confirmación
        showOrderConfirmation(orderResult.order);
        
        // Limpiar carrito
        clearCart();
        updateCartCount();
        
        // Cerrar modal
        closeReservationModal();
    } else {
        showNotification('Error al procesar el pedido');
    }
}

// Mostrar confirmación de pedido
function showOrderConfirmation(order) {
    showNotification('¡Pedido registrado con éxito! Número de pedido: ' + order.id.substring(6));
    
    // Mostrar alerta adicional para confirmar al usuario
    alert('¡Pedido registrado con éxito!\nNúmero de pedido: ' + order.id.substring(6) + 
          '\n\nTu información ha sido guardada en nuestra base de datos.');
}

// Función para cerrar el modal de reserva
function closeReservationModal() {
    const modal = document.getElementById('reservation-modal');
    if (modal) {
        modal.classList.remove('show');
        // Asegurarse que el modal se oculte correctamente
        modal.style.display = 'none';
    }
}