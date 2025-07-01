# 🛡️ Control de Vigilancia - Uso Offline Completo

## 📱 **Cómo usar la aplicación SIN INTERNET**

### **Opción 1: PWA Offline (Recomendada)**

#### **Paso 1: Preparar los archivos**
1. Copia TODA la carpeta del proyecto a tu móvil
2. O transfiere los archivos por USB/cable
3. Los archivos necesarios son:
   - `index.html`
   - `app.js`
   - `styles.css`
   - `manifest.json`
   - `sw.js`
   - `offline-setup.html`
   - Carpeta `icons/` (opcional)

#### **Paso 2: Instalar en móvil**
1. **Android**: 
   - Abre Chrome
   - Ve a `file:///ruta/a/tu/carpeta/index.html`
   - Menú → "Instalar aplicación"

2. **iPhone**:
   - Abre Safari
   - Ve a `file:///ruta/a/tu/carpeta/index.html`
   - Compartir → "Añadir a pantalla de inicio"

### **Opción 2: Servidor Local Simple**

#### **Método 1: Python (más fácil)**
```bash
# En la carpeta del proyecto
python -m http.server 8080
```

#### **Método 2: Node.js**
```bash
# Instalar http-server globalmente
npm install -g http-server

# Ejecutar
http-server -p 8080
```

#### **Método 3: Live Server (VS Code)**
1. Instala la extensión "Live Server"
2. Click derecho en `index.html`
3. "Open with Live Server"

### **Opción 3: APK Real (Para uso completamente offline)**

#### **Método 1: PWA Builder (Recomendado)**
1. Ve a: https://www.pwabuilder.com/
2. Sube tu carpeta del proyecto
3. Genera APK automáticamente
4. Descarga e instala en Android

#### **Método 2: Bubblewrap**
```bash
# Instalar herramientas
npm install -g @bubblewrap/cli

# Crear APK
bubblewrap init --manifest ./manifest.json
bubblewrap build
```

#### **Método 3: TWA (Trusted Web Activity)**
1. Usa Android Studio
2. Crea proyecto TWA
3. Apunta a tu PWA
4. Genera APK

## 🔧 **Configuración para Uso Offline**

### **Verificar que funcione offline:**
1. Instala la PWA
2. Desconecta internet
3. Abre la aplicación
4. Debería funcionar normalmente

### **Datos guardados localmente:**
- ✅ Personal registrado
- ✅ Asistencia diaria
- ✅ Reportes generados
- ✅ Configuraciones

### **Exportación offline:**
- ✅ Excel (CSV)
- ✅ PDF (impresión)
- ✅ Imagen (planilla)

## 📋 **Archivos Necesarios para Offline**

```
control-vigilancia/
├── index.html          # Página principal
├── app.js             # Lógica de la aplicación
├── styles.css         # Estilos
├── manifest.json      # Configuración PWA
├── sw.js             # Service Worker (offline)
├── offline-setup.html # Página de instalación
├── package.json       # Configuración del proyecto
├── README.md         # Documentación
└── icons/            # Iconos (opcional)
    ├── icon-16x16.png
    ├── icon-32x32.png
    ├── icon-192x192.png
    └── icon-512x512.png
```

## 🚀 **Instalación Rápida**

### **Para Android:**
1. Copia la carpeta a tu móvil
2. Abre Chrome
3. Ve a `file:///ruta/control-vigilancia/index.html`
4. Instala como PWA

### **Para iPhone:**
1. Copia la carpeta a tu iPhone
2. Abre Safari
3. Ve a `file:///ruta/control-vigilancia/index.html`
4. Añade a pantalla de inicio

### **Para Computadora:**
1. Abre `index.html` en el navegador
2. Instala como PWA desde el menú

## ⚠️ **Importante**

### **Ventajas del uso offline:**
- ✅ No necesitas internet
- ✅ Datos seguros en tu dispositivo
- ✅ Funciona en cualquier lugar
- ✅ No hay costos de servidor
- ✅ Privacidad total

### **Limitaciones:**
- ❌ No sincronización entre dispositivos
- ❌ No backup automático en la nube
- ❌ No actualizaciones automáticas

### **Recomendaciones:**
- Haz respaldos regulares exportando los datos
- Usa la función de exportación para guardar información importante
- Considera usar múltiples dispositivos para redundancia

## 🔄 **Actualizaciones**

### **Para actualizar la aplicación:**
1. Descarga los nuevos archivos
2. Reemplaza los archivos existentes
3. Recarga la aplicación
4. Los datos se mantienen

### **Para migrar datos:**
1. Exporta todos los datos desde la app antigua
2. Instala la nueva versión
3. Importa los datos exportados

## 📞 **Soporte Offline**

### **Si la app no funciona offline:**
1. Verifica que el Service Worker esté activo
2. Limpia la caché del navegador
3. Reinstala la aplicación
4. Asegúrate de que todos los archivos estén presentes

### **Si los datos se pierden:**
1. Los datos están en localStorage
2. No borres los datos del navegador
3. Usa la función de exportación para respaldos
4. Considera hacer respaldos regulares

---

**¡Tu aplicación de control de vigilancia está lista para usar completamente offline! 🛡️📱** 