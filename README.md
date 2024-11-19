# platanus-hack-front

### Pasos para ejecutar el proyecto
```
# Cambiar a la version de node
nvm use 20.0

# Instalar las dependencias
npm i

# Correr el proyecto
npm run dev
```

El servidor estará disponible en http://localhost:3000.

<br />
<br />

---
---
<br />
<br />



### Configuración del proyecto

### App Router

El proyecto utiliza el App Router, una funcionalidad moderna de Next.js que permite trabajar con rutas definidas dentro de la carpeta app/. Esto mejora la modularidad y facilita el desarrollo con características como layouts compartidos y React Server Components.

Ejemplo de estructura de archivos:
```
app/
├── layout.js        # Layout principal, compartido por todas las rutas
├── page.js          # Página raíz ("/")
├── about/
│   ├── page.js      # Página "about" ("/about")
├── contact/
│   ├── page.js      # Página "contact" ("/contact")
│   ├── layout.js    # Layout específico para la ruta "contact"
```

### Alias de importación

El proyecto usa el alias @ para facilitar las importaciones desde la raíz del proyecto. Por ejemplo:

```
import Button from '@/components/Button';
```

### Variables de entorno (.env)

```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

<br />
<br />

---
---

<br />
<br />



## A modo resumen

- Rutas: Agrega nuevas rutas en la carpeta app/. Usa un archivo page.js para definir el contenido de cada página.

- Componentes compartidos: Ubícalos en la carpeta components/. Usa el alias @ para importarlos fácilmente.

- Layouts: Si necesitas un diseño consistente entre páginas, utiliza un archivo layout.js en la ruta correspondiente.


### Ejemplo: Añadiendo una nueva página

Si quieres crear una página para /team:
1. Crea la carpeta app/team/.
2. Agrega un archivo page.js con el siguiente contenido:

```
export default function TeamPage() {

    return (
        <div>
            <h1>Meet the Team!</h1>
        </div>
    );
}
```
