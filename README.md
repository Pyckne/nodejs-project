🛒 Proyecto eCommerce Backend con Node.js + MongoDB
Este proyecto es un backend profesionalizado para una tienda online, implementado con Node.js, Express, MongoDB y Handlebars. Incluye autenticación JWT, roles (user/admin), gestión de productos, carritos y flujo de compra con generación de tickets.

🔐 Roles definidos
Administrador (rol: admin)

Usuarios registrados (rol: user)

🚀 Flujo de pruebas con Postman
📌 1. Login
POST /api/auth/login
Body (JSON):

json
Copiar
{
  "email": "admin@example.com",
  "password": "admin123"
}
📌 Copiar el token JWT desde la cookie token devuelta.

🔐 ADMIN - Flujo de Productos
✅ Incluir el JWT en la pestaña "Cookies" de Postman para cada request protegida.

🆕 Crear producto
POST /api/products
Body (JSON):

json
Copiar
{
  "title": "Corset rojo",
  "description": "Corset ajustado de encaje",
  "price": 12000,
  "stock": 8,
  "category": "corsets",
  "thumbnails": [],
  "code": "CRS101"
}
🔄 Actualizar producto
PUT /api/products/:pid
Body (JSON):

json
Copiar
{
  "price": 11000,
  "stock": 10
}
🗑 Eliminar producto
DELETE /api/products/:pid

👤 USER - Flujo de compra
1. Login como user
POST /api/auth/login
(usar otro email como user registrado)

2. Crear carrito (si no existe)
POST /api/carts

3. Agregar producto al carrito
POST /api/carts/:cid/products/:pid

4. Finalizar compra
POST /api/carts/:cid/purchase
✔ Genera un ticket si hay stock disponible.

🌐 Flujo completo desde el navegador
1. Login
Ir a: http://localhost:8080/login
✔ Ingresar con email y contraseña

👑 Rol ADMIN
Ir a: http://localhost:8080/home
Acciones disponibles:

🔁 Ir a /realtimeproducts para:

➕ Agregar producto (formulario dinámico)

🗑 Eliminar producto (por ID)

Actualización en tiempo real con WebSocket

🚪 Logout: envía POST a /api/auth/signout (vía formulario)

👤 Rol USER
Ir a: http://localhost:8080/home

Acciones:

📥 Agregar productos al carrito

🛒 Ver carrito: /carts/:cid

✅ Finalizar compra → genera ticket

🚪 Logout: también desde /api/auth/signout

🛠 Tecnologías
Node.js + Express

MongoDB + Mongoose + Paginación

Handlebars (vistas dinámicas por rol)

Passport-JWT + cookies httpOnly

DTO, DAO, Repository Pattern

Validación de stock y generación de ticket

WebSocket con Socket.io para realtime

✅ Estado del proyecto
 Rutas protegidas por rol

 JWT y cookies seguras

 Flujo completo user y admin

 Ticket funcional con stock

 Testeado con Postman y navegador

 Vistas condicionales por rol