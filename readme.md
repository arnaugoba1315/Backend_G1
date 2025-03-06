# Api proyecto EA

## Organización carpetas del proyecto
Tenim una carpeta src que serà la que es compilara. Dins d'aquesta carpeta tenim 6 carpetes. 
Config: tindrà el arxius de configuració tant de la base de dades, swagger, cors, etc.
Controllers: es defineixen les respostes del servidor.
Middleware
Models: definició dels models amb interfaces i schema.
Routes: es gestiona les peticions a la base de dades
Services:peticions a la base de dades


## Instalación de dependencias

Ejecuta los siguientes comandos para instalar todas las dependencias necesarias:

### Swagger

```bash
npm i swagger-jsdoc
npm i swagger-ui-express
npm i @types/swagger-jsdoc -D
npm i @types/swagger-ui-express -D
```

### Express

```bash
npm i express
npm i @types/express -D
```

### Mongoose

```bash
npm i mongoose
```

### Dotenv

```bash
npm i dotenv
```

### Nodemon

```bash
npm i nodemon -D
```

### TypeScript 

```bash
npm i typescript -D
npm i ts-node -D
npm i @types/node -D
```

### Otras dependencias

```bash
npm i glob
npm i lru-cache
```

## Scripts disponibles

- **Modo desarrollo con Nodemon:**
  ```bash
  npm run dev
  ```
  Ejecuta la aplicación y reinicia automáticamente al detectar cambios.

## Ejecutar sin necesidad de transpilar a JS

```bash
npm install ts-node --save-dev
```
Esto permite ejecutar TypeScript directamente sin necesidad de convertirlo a JavaScript manualmente.
