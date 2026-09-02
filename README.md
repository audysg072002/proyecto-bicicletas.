# Proyecto Bicicletas — Node.js + Express

Proyecto integrador de las guías prácticas del curso. Implementa un servidor
Node.js con Express que expone una API REST para administrar una colección
de bicicletas en memoria, y un mapa interactivo que muestra su ubicación.

## Requisitos cubiertos

1. Proyecto Node.js creado y versionado con Git.
2. Librerías configuradas con NPM (express, ejs, morgan, nodemon, etc).
3. Mensaje de bienvenida de Express en la ruta `/`.
4. Mapa centrado en una ciudad (Tegucigalpa, Honduras) en la ruta `/mapa`.
5. Marcadores en el mapa indicando la ubicación de cada bicicleta.
6. Script `devstart` en `package.json` (además de `start`) que levanta el
   servidor con `nodemon`.
7. Un par de bicicletas precargadas en la colección en memoria, con
   ubicaciones cercanas al centro del mapa.
8. Colección/modelo de bicicleta (`models/bicicleta.js`).
9. Endpoints de la API listos para probarse con Postman.

## Instalación

```bash
npm install
```

## Ejecución

```bash
npm start        # producción, con node
npm run devstart  # desarrollo, con nodemon (recarga automática)
```

El servidor queda disponible en `http://localhost:3000`.

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
  "id": 3,
  "color": "verde",
  "modelo": "urbana",
  "lat": 14.0750,
  "lng": -87.1950
}
```

## Estructura del proyecto

```
proyecto-bicicletas/
├── bin/www              # arranque del servidor
├── models/bicicleta.js  # modelo + colección en memoria
├── routes/
│   ├── index.js         # página de bienvenida
│   ├── mapa.js           # vista del mapa
│   └── api/bicicletas.js # API REST (CRUD)
├── views/                # plantillas EJS
├── public/                # estáticos (CSS, JS del cliente)
├── app.js
└── package.json
```

## Autor

Audy — Ingeniería en Sistemas / Computación, CEUTEC, Tegucigalpa, Honduras.
