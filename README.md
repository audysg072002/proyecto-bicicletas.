# Proyecto Bicicletas — Node.js + Express + MongoDB + Auth + Despliegue

Entrega final del proyecto integrador. Suma sobre las entregas anteriores:
login social con Google (OAuth), validación de tokens de Facebook,
despliegue en la nube, MongoDB Atlas en producción, envío de emails con
Gmail SMTP en producción, y monitoreo con New Relic.

> **Nota 1 (email):** la guía original pedía SendGrid para el envío de
> emails en producción. SendGrid (y luego Brevo, como primer intento de
> reemplazo) bloquearon la verificación por SMS del número de teléfono del
> autor (error del lado de esos servicios, no del proyecto), así que se usa
> **Gmail** vía SMTP con una "contraseña de aplicación" — mismo patrón de
> integración (SMTP + variables de entorno), sin depender de un servicio
> externo nuevo.

> **Nota 2 (hosting):** la guía original pedía Heroku. Heroku eliminó su
> plan gratuito desde noviembre de 2022 — hoy pide tarjeta de crédito
> incluso para su plan más barato ($5/mes). Para no depender de un pago,
> se usa **Render.com**, que ofrece el mismo tipo de despliegue (conectas
> tu repo de GitHub y se publica solo) con un plan gratuito real, sin
> tarjeta. El código no depende de Heroku en ningún lado — usa
> `process.env.PORT` como cualquier proveedor esperaría, así que funciona
> igual en cualquiera de los dos.

## Requisitos cubiertos (esta entrega)

1. App publicada en la nube (Render, en vez de Heroku — ver Nota 2 arriba).
2. Usuario creado y visible en Mongo Atlas (visor web o Compass).
3. Variables de entorno `NODE_ENV=production` y `MONGO_URI=<conexión de Atlas>`.
4. Localmente sigue usando Mongo local (nada cambia en tu máquina).
5. En producción, la app usa Mongo Atlas automáticamente (por `NODE_ENV=production`).
6. Localmente, los emails se siguen enviando por Ethereal (sin cambios).
7. En producción, los emails se envían por Gmail vía SMTP (sustituto de SendGrid — ver Nota 1).
8. `User.findOneOrCreateByGoogle` en `models/user.js`.
9. Validación de token de Facebook: `POST /api/auth/facebook`.
10. `require('newrelic')` como primera línea de `app.js`.

---

## Parte 1 — Lo que ya funciona sin hacer nada extra

Todo lo de las entregas anteriores (Mongo local, tests, login normal, JWT)
sigue funcionando exactamente igual en tu máquina, sin tocar nada. Lo nuevo
de esta entrega (Google, Facebook, Gmail SMTP, New Relic, Atlas) solo se
activa si configuras las variables de entorno correspondientes — si no las
pones, el proyecto corre igual que antes, sin errores.

---

## Parte 2 — Cuentas que necesitas crear (gratis, sin tarjeta)

### 2.1 MongoDB Atlas (base de datos en la nube) ✅ ya hecho

Cluster creado, red abierta a `0.0.0.0/0`, y ya tienes tu `MONGO_URI`.

### 2.2 Google OAuth (login con Google) ✅ ya hecho

App publicada, credenciales creadas. Cuando tengas la URL real de Render
(Parte 3), vuelve a "Clientes" en Google Cloud y agrega esa URL + `/auth/google/callback`
a "Authorized redirect URIs" (además de la de `localhost`).

### 2.3 Facebook App (para validar tokens) ✅ ya hecho

Ya tienes tu app y un token de prueba del Graph API Explorer.

### 2.4 Gmail SMTP (emails en producción) ✅ ya hecho

Ya tienes tu contraseña de aplicación de 16 caracteres.

### 2.5 New Relic (monitoreo) ✅ ya hecho

Ya tienes tu License Key.

### 2.6 Render (hosting)

1. Ve a https://render.com/ → "Get Started" → puedes registrarte
   directamente con tu cuenta de GitHub (más rápido, y de una vez conecta
   el acceso a tus repos).
2. No pide tarjeta para el plan gratis ("Free").

---

## Parte 3 — Desplegar a Render

1. En el dashboard de Render, dale **"New +"** → **"Web Service"**.
2. Conecta tu repositorio de GitHub (`audysg072002/proyecto-bicicletas.`)
   — si no aparece en la lista, dale "Configure account" para darle acceso.
3. Configura:
   - **Name**: lo que quieras, ej. `proyecto-bicicletas`
   - **Branch**: `main`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: **Free**
4. Antes de darle "Create", baja hasta "Environment Variables" y agrega
   TODAS estas (botón "Add Environment Variable" para cada una):

   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `MONGO_URI` | tu cadena de Atlas completa |
   | `JWT_SECRET` | cualquier texto largo random |
   | `SESSION_SECRET` | otro texto largo random distinto |
   | `EMAIL_HOST` | `smtp.gmail.com` |
   | `EMAIL_USER` | tu correo de Gmail |
   | `EMAIL_PASS` | tu contraseña de aplicación (16 caracteres) |
   | `EMAIL_FROM` | `"Proyecto Bicicletas" <tu-correo@gmail.com>` |
   | `GOOGLE_CLIENT_ID` | tu Client ID de Google |
   | `GOOGLE_CLIENT_SECRET` | tu Client Secret de Google |
   | `GOOGLE_CALLBACK_URL` | (déjalo pendiente, ver paso 6) |
   | `NEW_RELIC_LICENSE_KEY` | tu License Key de New Relic |

5. Dale **"Create Web Service"**. Render va a clonar tu repo, correr
   `npm install` y `npm start` solo — espera unos minutos a que el log
   diga algo como "Servidor corriendo en http://localhost:10000" (Render
   asigna el puerto solo, vía `PORT`, ya lo maneja el código).
6. Cuando termine, Render te da una URL como
   `https://proyecto-bicicletas-xxxx.onrender.com`. Con esa URL real:
   - Edita la variable `GOOGLE_CALLBACK_URL` en Render y ponle
     `https://proyecto-bicicletas-xxxx.onrender.com/auth/google/callback`
   - Ve a Google Cloud → Credentials → tu cliente OAuth → agrega esa misma
     URL a "Authorized redirect URIs".
   - Guarda en ambos lados. Render redepliega solo al guardar la variable.

**Nota sobre el plan gratis de Render:** tu app "duerme" tras 15 minutos
sin tráfico, y el primer request después de eso tarda unos 30-60 segundos
en responder mientras despierta — es normal, no es un error.

## Verificar el punto 2 (usuario visible en Atlas)

1. Con la app ya desplegada, ve a `https://tu-app.onrender.com/register`
   y crea una cuenta.
2. En Mongo Atlas, ve a tu cluster → "Browse Collections" (el visor web) —
   deberías ver la base `red_bicicletas` con la colección `users` y tu
   documento ahí. También puedes conectar MongoDB Compass directamente a
   tu `MONGO_URI` de Atlas en vez de `localhost` para verlo igual.

## Verificar el punto 7 (Gmail SMTP en producción)

Al registrarte en la app YA DESPLEGADA (no en local), el correo de
bienvenida debería llegar de verdad al buzón que usaste (revisa spam la
primera vez). En local, sigue llegando por Ethereal como antes — es la
variable `NODE_ENV` la que decide cuál usar.

## Verificar el punto 9 (token de Facebook)

En Postman, `POST https://tu-app.onrender.com/api/auth/facebook`
(o en local, `http://localhost:3000/api/auth/facebook`) con body:
```json
{ "accessToken": "el-token-que-copiaste-del-Graph-API-Explorer" }
```
Con un token válido, te devuelve un JWT igual que el login normal — ese
JWT lo puedes usar en `/api/bicicletas` exactamente igual que antes.

## Verificar el punto 10 (New Relic)

Entra a https://one.newrelic.com/ y busca tu app ("Proyecto Bicicletas")
en la lista de "APM" — después de que Render reciba algo de tráfico
(entra a un par de páginas de tu app desplegada), deberían empezar a
aparecer datos ahí en unos minutos.

---

## Estructura del proyecto (agregado en esta entrega)

```
proyecto-bicicletas/
├── newrelic.js                # config de New Relic
├── Procfile                    # start command alternativo (no obligatorio en Render)
├── config/
│   ├── database.js            # Mongo local (dev/test) o Atlas (producción)
│   ├── mailer.js               # Ethereal (dev) o Gmail SMTP (producción)
│   └── passport.js             # + estrategia de Google
├── models/user.js              # + googleId, facebookId, findOneOrCreateByGoogle/Facebook
└── routes/
    ├── auth.js                 # + /auth/google, /auth/google/callback
    └── api/auth.js             # + POST /api/auth/facebook
```

## Autor

Audy — Ingeniería en Sistemas / Computación, CEUTEC, Tegucigalpa, Honduras.
