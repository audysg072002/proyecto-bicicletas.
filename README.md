# Proyecto Bicicletas — Node.js + Express + MongoDB

Proyecto integrador de las guías prácticas del curso. Implementa un servidor
Node.js con Express que expone una API REST para administrar bicicletas,
persistidas en MongoDB a través de Mongoose, con un mapa interactivo que
muestra su ubicación y una suite de tests con Jasmine.

## Requisitos cubiertos (esta entrega)

1. Base de datos MongoDB local llamada `red_bicicletas`, conectada con Mongoose.
2. CRUD completo (crear, leer, actualizar, borrar) sobre esa base.
3. Modelo `Bicicleta` (`models/bicicleta.js`) conectado a MongoDB vía Mongoose.
4. Carpeta `spec/models` con los tests del modelo.
5. Archivo `spec/bicicleta_api_test.spec.js` con un test por cada operación de la API.
6. Todos los tests pasan al correr `npm test` (usan una base separada `testdb`, no la real).
7. Endpoints probados con Postman, y bicicletas visibles en Mongo Compass.

## Requisitos previos

- Node.js instalado.
- **MongoDB Community Server** instalado y corriendo localmente (puerto por defecto `27017`).
  Descárgalo de https://www.mongodb.com/try/download/community
- (Opcional pero recomendado) **MongoDB Compass**, para ver visualmente las
  colecciones — normalmente se instala junto con MongoDB Community.

## Instalación

```bash
npm install
```

## Antes de correr el proyecto: levanta MongoDB

En Windows, si instalaste MongoDB como servicio, ya debería estar corriendo
solo. Si no, ábrelo manualmente (en una terminal aparte, y déjala abierta):

```bash
mongod
```

## Ejecución del servidor

```bash
npm start         # producción, con node
npm run devstart   # desarrollo, con nodemon (recarga automática)
```

El servidor queda disponible en `http://localhost:3000` y se conecta
automáticamente a la base local `red_bicicletas`.

- `/` — mensaje de bienvenida de Express
- `/mapa` — mapa interactivo con las bicicletas
- `/api/bicicletas` — API JSON de bicicletas

## Endpoints de la API (para probar con Postman)

| Método | Ruta                      | Descripción                       |
|--------|---------------------------|------------------------------------|
| GET    | `/api/bicicletas`         | Lista todas las bicicletas         |
| GET    | `/api/bicicletas/:id`     | Obtiene una bicicleta por id       |
| POST   | `/api/bicicletas/create`  | Crea una bicicleta nueva           |
| PUT    | `/api/bicicletas/:id`     | Actualiza una bicicleta existente  |
| DELETE | `/api/bicicletas/:id`     | Elimina una bicicleta              |

Ejemplo de body para `POST /api/bicicletas/create`:

```json
{
  "color": "verde",
  "modelo": "urbana",
  "lat": 14.0750,
  "lng": -87.1950
}
```

El `id` ya no se manda a mano: MongoDB genera un `_id` automáticamente al
crear el documento.

## Ver los datos en Mongo Compass

1. Abre MongoDB Compass y conéctate a `mongodb://localhost:27017`.
2. Crea/verifica que exista la base `red_bicicletas`.
3. Con el servidor corriendo, crea un par de bicicletas desde Postman
   (`POST /api/bicicletas/create`, dos veces con datos distintos).
4. En Compass, entra a `red_bicicletas` → colección `bicicletas` — ahí deberías
   ver los documentos recién creados.

## Tests (Jasmine)

```bash
npm test
```

Esto corre Jasmine contra una base de datos separada (`testdb`), para no
tocar tus datos reales de `red_bicicletas`. Incluye:

- `spec/models/bicicletaSpec.js` — tests del modelo `Bicicleta` con
  persistencia real en Mongo (crear, listar, buscar por id, eliminar).
- `spec/bicicleta_api_test.spec.js` — un test por cada endpoint de la API
  (`GET`, `POST /create`, `GET /:id`, `PUT /:id`, `DELETE /:id`), usando la
  librería `request` contra un servidor de prueba levantado en el puerto 3900.

**Importante:** MongoDB debe estar corriendo (`mongod`) para que los tests
pasen — Jasmine se conecta a `mongodb://localhost/testdb` automáticamente.

## Estructura del proyecto

```
proyecto-bicicletas/
├── bin/www                       # arranque del servidor
├── config/database.js            # conexión a MongoDB con Mongoose
├── models/bicicleta.js           # modelo Mongoose de Bicicleta
├── routes/
│   ├── index.js                  # página de bienvenida
│   ├── mapa.js                   # vista del mapa
│   └── api/bicicletas.js         # API REST (CRUD sobre MongoDB)
├── spec/
│   ├── support/jasmine.json      # configuración de Jasmine
│   ├── helpers/env.helper.js     # fuerza NODE_ENV=test (usa testdb)
│   ├── models/bicicletaSpec.js   # tests del modelo con persistencia
│   └── bicicleta_api_test.spec.js # tests de la API (uno por endpoint)
├── views/                        # plantillas EJS
├── public/                       # estáticos (CSS, JS del cliente)
├── app.js
└── package.json
```

## Autor

Audy — Ingeniería en Sistemas / Computación, CEUTEC, Tegucigalpa, Honduras.
