# MRL Woodworking — Sitio + Panel de Administración

Sitio web bilingüe (Español/Inglés) de MRL Woodworking Inc. con un panel de
administración real en `/admin`. Todo lo que el admin cambia (contacto,
colores, logo, hero, servicios, galería, reseñas, redes sociales) se guarda
en una base de datos y se ve para **todos** los visitantes del sitio, desde
cualquier dispositivo.

Al entrar por primera vez, el visitante elige Español o English en una
pantalla de bienvenida; la elección se recuerda para sus próximas visitas y
puede cambiarse en cualquier momento con el botón ES/EN del menú.

## Arquitectura

```
mrl-woodworking/
├── server/                    Backend (Express)
│   ├── index.js                punto de entrada: API + sirve /admin y el sitio estático
│   ├── routes/                  definición de endpoints (uno por recurso)
│   ├── controllers/             lógica de cada endpoint
│   ├── middleware/requireAuth.js   protege create/update/delete con JWT
│   └── lib/                     prisma client + firma/verificación de JWT
├── prisma/
│   ├── schema.prisma            modelos: Settings, HeroSlide, Service, Project, Review
│   ├── seed.js                  carga el contenido original la primera vez
│   └── migrations/
├── public/
│   ├── index.html               sitio público — lee todo desde la API
│   ├── admin.html                panel de administración, página completa en /admin
│   ├── css/style.css             estilos del sitio público (colores como variables CSS)
│   ├── css/admin.css             estilos del panel de administración
│   └── js/
│       ├── i18n.js               diccionario de textos fijos (ES/EN) del sitio público
│       ├── site.js               lógica del sitio público (incluye selección de idioma)
│       └── admin.js              lógica del panel de administración
├── .env                         configuración local (no se sube a git)
└── package.json
```

## Qué es editable desde `/admin`

El panel está agrupado en tres secciones en el menú lateral:

| Grupo | Pestaña | Qué controla |
|---|---|---|
| Contenido bilingüe | Hero | Agregar, editar o eliminar los slides de la portada (texto en ES y EN) |
| | Servicios | Agregar, editar o eliminar servicios — descripción corta (tarjeta) y detallada (modal), en ambos idiomas |
| | Galería | Subir varias fotos a la vez y luego editar título, categoría y descripción de cada una (ambos idiomas) |
| | Nosotros | Imágenes, años de experiencia, estadísticas y los dos párrafos de presentación (ES/EN) |
| | Reseñas | Agregar, editar o eliminar reseñas de clientes (texto y etiqueta en ambos idiomas) |
| Diseño | Colores | Paleta de marca (primario, secundario, acento, oscuro) |
| | Logo | Imagen del logo (si no hay, se muestra el nombre en texto) |
| Configuración | Contacto | Teléfono, email, dirección, WhatsApp, horario (ES/EN), mapa |
| | Social | Facebook, Instagram, YouTube |

Los campos que ve el visitante (títulos, descripciones, textos de reseñas,
horario, párrafos de "Nosotros") tienen un input en español 🇪🇸 y otro en
inglés 🇺🇸 uno junto al otro — el sitio muestra el que corresponda según el
idioma que haya elegido cada visitante. Los datos que no dependen del idioma
(teléfono, imágenes, colores, categoría interna del tamaño de galería) tienen
un solo campo.

Hero, Servicios, Galería y Reseñas se guardan al instante por cada
elemento (agregar/guardar/eliminar). El resto de pestañas comparten un único
botón "Guardar Cambios".

### Subir muchas fotos a la galería de una vez

En la pestaña Galería, el botón "Seleccionar fotos" permite elegir una o
varias imágenes a la vez. Cada una se comprime y se sube automáticamente,
creando un proyecto nuevo (sin título todavía, ya visible en el sitio) por
cada foto. Después, edita el título, la categoría y la descripción
(opcional) de cada tarjeta y presiona "Guardar proyecto" para completarla.

### Compresión de imágenes

Cada imagen que subes en el admin se comprime en el navegador antes de
guardarse: se prueba a distintas calidades y, si aun así pesa más de ~300KB,
se reduce el ancho y se vuelve a intentar, hasta caber en ese límite (o
llegar a un ancho mínimo de 480px). Así puedes subir muchas fotos a la
galería sin que la base de datos crezca demasiado.

### Galería con "Ver más"

El sitio público solo muestra 8 proyectos a la vez; si hay más, aparece un
botón "Ver más" / "Load More" que revela 8 más cada vez que se presiona. Los
filtros por categoría reinician ese conteo.

## Cómo probarlo localmente

Requiere Node.js 18+.

```bash
npm install
cp .env.example .env
npx prisma migrate dev --name init
npm run dev
```

Abre `http://localhost:3000` para el sitio y `http://localhost:3000/admin`
para el panel de administración. La base de datos es un archivo SQLite
(`prisma/dev.db`) — no necesitas instalar ningún motor de base de datos.

El seed (contenido original del sitio) se carga automáticamente la primera
vez que corres `prisma migrate dev`. Para volver a cargarlo en una base
vacía manualmente: `npm run seed`.

**Login del panel de admin** (`/admin`):
- Correo: `admin@mrlwoodworking.com`
- Contraseña: `Mrlcompany26`

Para borrar tu elección de idioma y volver a ver la pantalla de bienvenida
del sitio, borra `mrl_lang` de `localStorage` en las herramientas de
desarrollador del navegador (o abre el sitio en una ventana de incógnito).

(configurable en `.env` → `ADMIN_EMAIL` / `ADMIN_PASSWORD`, reinicia el
servidor tras cambiarlos)

## Cómo funciona el CRUD

Cada recurso sigue el mismo patrón REST:

- `GET /api/<recurso>` — público, lo usa el sitio para pintar el contenido.
- `POST /api/<recurso>` — crea (requiere login).
- `PUT /api/<recurso>/:id` — edita (requiere login). `Settings` es una fila
  única, así que su `PUT` es `/api/settings` sin id.
- `DELETE /api/<recurso>/:id` — elimina (requiere login).

Recursos: `projects`, `hero-slides`, `services`, `reviews`, `settings`.

El login (`POST /api/auth/login`) devuelve un token JWT que el navegador
guarda en `sessionStorage` y envía como `Authorization: Bearer <token>` en
cada petición de escritura. Sin token válido, el servidor rechaza la
petición con 401 — los `GET` son las únicas rutas públicas.

## Formulario de contacto

El sitio tiene un formulario (sección "Nuestra Ubicación") que envía un
correo a `mrlwoodworkinginc@gmail.com` a través de `POST /api/contact`
(pública, sin login). Usa Nodemailer con el servicio de Gmail.

**Para activarlo**, edita `.env`:

```
EMAIL_USER="mrlwoodworkinginc@gmail.com"
EMAIL_PASS="xxxxxxxxxxxxxxxx"
CONTACT_EMAIL="mrlwoodworkinginc@gmail.com"
```

`EMAIL_PASS` **no** es la contraseña normal de la cuenta de Gmail — Google
exige una "contraseña de aplicación":

1. Entra a esa cuenta de Gmail y activa la verificación en 2 pasos en
   [myaccount.google.com/security](https://myaccount.google.com/security).
2. Genera una contraseña de aplicación en
   [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords).
3. Pega esos 16 caracteres (sin espacios) en `EMAIL_PASS` y reinicia el
   servidor.

Mientras `EMAIL_USER`/`EMAIL_PASS` no estén configurados, el formulario
sigue funcionando (valida los campos) pero al enviar muestra un error claro
en vez de intentar mandar el correo. Tiene un campo trampa (honeypot)
invisible para reducir spam de bots.

## Desplegar en Vercel

El proyecto ya está preparado para Vercel: usa Postgres (no SQLite, que no
funciona en funciones serverless por no tener disco persistente) y trae un
`vercel.json` que enruta todo a `server/index.js` como una función Node.

Pasos:

1. **Importar el repo**: en [vercel.com/new](https://vercel.com/new), elige
   este repositorio de GitHub. Framework Preset: "Other" (Vercel lo detecta
   solo gracias a `vercel.json`).

2. **Agregar la base de datos**: en el proyecto ya creado, pestaña
   **Storage → Create Database → Postgres** (Neon). Esto agrega
   automáticamente la variable `DATABASE_URL` (o similar, revisa el nombre
   exacto que use) a tu proyecto en Vercel.
   - Si el nombre de la variable que crea no es exactamente `DATABASE_URL`,
     agrégala tú mismo en **Settings → Environment Variables** apuntando al
     mismo valor, porque `prisma/schema.prisma` espera `DATABASE_URL`.

3. **Agregar el resto de variables de entorno** (Settings → Environment
   Variables), una por una — mismos nombres que en `.env.example`:
   - `JWT_SECRET` — una cadena aleatoria larga, distinta a la de ejemplo.
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD` — login del panel `/admin`.
   - `EMAIL_USER` / `EMAIL_PASS` / `CONTACT_EMAIL` — para que funcione el
     formulario de contacto (ver sección de arriba para la contraseña de
     aplicación de Gmail).

4. **Crear las tablas en la base de datos**: la primera vez, corre esto en
   tu máquina (con Node instalado), apuntando a esa misma base:
   Si `DATABASE_URL` quedó marcada como **Sensitive** en Vercel, ni el
   dashboard ni `vercel env pull` te dejan ver su valor real — así que las
   tablas se crean automáticamente en el propio despliegue: el script
   `postinstall` de `package.json` corre `prisma db push` (sincroniza el
   esquema) y `node prisma/seed.js` (carga el contenido inicial, solo si la
   base está vacía) en cada instalación. No tienes que hacer nada extra,
   basta con que el deploy termine bien.

   Si en cambio sí tienes el `DATABASE_URL` real a mano (por ejemplo porque
   lo marcaste como no-sensible, o tienes tu propia base Postgres), puedes
   hacerlo desde tu PC en vez de depender del postinstall:
   ```bash
   npm install
   # Pega el DATABASE_URL en tu .env local
   npx prisma migrate dev --name init
   npm run seed
   ```

   > **Nota:** correr `prisma db push` en cada deploy es práctico para
   > arrancar rápido, pero sincroniza el esquema automáticamente sin pedir
   > confirmación (`--accept-data-loss`). Una vez el sitio esté estable y
   > con contenido real, conviene quitar `prisma db push` del
   > `postinstall` y pasar a migraciones controladas
   > (`prisma migrate dev` en local + `prisma migrate deploy` en el build)
   > para no arriesgar datos por accidente en un cambio de esquema futuro.

5. **Deploy**: Vercel despliega automáticamente con cada push a la rama
   principal. Tu sitio queda en la URL que te da Vercel (o tu dominio propio
   si lo conectas en Settings → Domains), y el panel en `/admin` de esa
   misma URL.

Cambia `JWT_SECRET` y `ADMIN_PASSWORD` por valores propios (no los de este
repo) antes de darle la URL a nadie más.
