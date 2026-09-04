# Proyecto Bicicletas — Node.js + Express + MongoDB + Autenticación

Proyecto integrador de las guías prácticas del curso. API REST de bicicletas
persistida en MongoDB (Mongoose), con mapa interactivo, tests con Jasmine, y
un sistema completo de autenticación: registro con verificación por email,
login con sesiones (Passport local) para las vistas del navegador, y
autenticación con JWT (Passport JWT) para proteger la API.

## Requisitos cubiertos (esta entrega)

1. Modelo `User` con `email`, `password` (hasheado), `passwordResetToken`,
   `passwordResetTokenExpires`, `verificado`.
2. Modelo `Token` con referencia al usuario (`_userId`), el token, y `createdAt`.
3. Envío de email en el flujo de registro.
4. Email de bienvenida con link de verificación de cuenta.
5. Vistas de login, registro, recuperar contraseña y elegir nueva contraseña.
6. `serializeUser` / `deserializeUser` definidas en `config/passport.js`.
7. Manejo de credenciales correctas e incorrectas (mensajes con connect-flash).
8. `/mapa` protegida: si escribes esa URL sin haber iniciado sesión, te
   redirige a `/login`.
9. `POST /api/auth/login` — con credenciales correctas devuelve un JWT.
10. La API de bicicletas (`/api/bicicletas`) exige ese JWT — sin token o con
    uno inválido responde 401 con un mensaje de error; con un token válido
    responde normalmente.

## Requisitos previos

- Node.js instalado.
- MongoDB Community Server corriendo localmente (ver entrega anterior del README).

## Instalación

```bash
npm install
```

## Variables de entorno (opcionales)

El proyecto funciona "de fábrica" con valores por defecto, pero en un
proyecto real esto NO se debe dejar así — se pondría en variables de entorno:

- `JWT_SECRET` — clave para firmar los tokens JWT.
- `SESSION_SECRET` — clave para las cookies de sesión.
- `EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_PORT` — si quieres que los
  emails salgan de una cuenta real (por ejemplo Gmail con una "contraseña de
  aplicación"). **Si no las defines**, el proyecto genera automáticamente una
  cuenta de prueba de Ethereal y te imprime en la consola del servidor un
  link para "ver" el correo como si hubiera llegado a un inbox — no necesitas
  configurar nada para que el flujo de email funcione y sea revisable.

## Ejecución

```bash
npm start
npm run devstart   # con nodemon
```

## Flujo de autenticación (vistas, en el navegador)

1. Ve a `http://localhost:3000/register`, crea una cuenta.
2. En la consola del servidor va a aparecer un link de Ethereal — ábrelo en
   el navegador, ahí "ves" el correo de bienvenida con el link de
   verificación. Haz clic en ese link (el que dice `/verify/<token>`, no el
   de Ethereal) para marcar tu cuenta como verificada.
3. Ve a `http://localhost:3000/login` e inicia sesión con esa cuenta.
4. Si intentas ir a `http://localhost:3000/mapa` **sin** haber iniciado
   sesión, te va a redirigir solo a `/login` — así se prueba el punto 8 de
   la guía.
5. `/forgot-password` y `/reset-password/:token` siguen la misma lógica
   (revisa la consola para el link de Ethereal del correo de recuperación).

## Flujo de autenticación (API, con Postman)

**1. Obtener el token** — `POST http://localhost:3000/api/auth/login`

Body (raw JSON):
```json
{ "email": "tu-email@registrado.com", "password": "tu-password" }
```
Respuesta con credenciales correctas (status 200):
```json
{ "token": "eyJhbGciOiJIUzI1NiIs..." }
```
Con credenciales incorrectas: status 401 y un mensaje de error.

**2. Usar el token en la API de bicicletas**

En Postman, pestaña **Authorization** → tipo **Bearer Token** → pega el
token que te devolvió el login. O manualmente en **Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

Prueba `GET http://localhost:3000/api/bicicletas`:
- **Sin** ese header (o con un token inválido) → status 401 con un mensaje
  de error, sin datos.
- **Con** el header correcto → status 200 con la lista de bicicletas.

Los demás endpoints (`POST /create`, `GET/PUT/DELETE /:id`) funcionan igual
que antes, pero ahora TODOS exigen ese mismo header `Authorization`.

## Tests (Jasmine)

```bash
npm test
```

El archivo `spec/bicicleta_api_test.spec.js` ahora crea un usuario de
prueba, obtiene su JWT automáticamente, y lo usa en cada request —
incluye además un test que confirma el 401 cuando no se manda token.

## Estructura del proyecto (agregado en esta entrega)

```
proyecto-bicicletas/
├── config/
│   ├── database.js
│   ├── passport.js          # estrategias local (sesión) y JWT + serialize/deserialize
│   └── mailer.js            # envío de emails (Ethereal o SMTP real)
├── middleware/
│   └── auth.js              # ensureAuthenticated (vistas) y requireJWT (API)
├── models/
│   ├── bicicleta.js
│   ├── user.js               # email, password, passwordResetToken(+Expires), verificado
│   └── token.js               # token de verificación de cuenta
├── routes/
│   ├── auth.js                # login, registro, verificación, recuperar password
│   └── api/
│       ├── auth.js            # POST /api/auth/login -> JWT
│       └── bicicletas.js      # protegida con JWT
├── views/auth/
│   ├── login.ejs
│   ├── register.ejs
│   ├── forgot-password.ejs
│   └── reset-password.ejs
└── spec/bicicleta_api_test.spec.js  # ahora incluye login + token en cada test
```

## Autor

Audy — Ingeniería en Sistemas / Computación, CEUTEC, Tegucigalpa, Honduras.
