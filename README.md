# 🛡️ Control de Vigilancia - PWA

Sistema completo de control de servicio de personal de vigilancia optimizado para móviles. Aplicación Web Progresiva (PWA) que permite gestionar asistencia, personal, reportes y planillas mensuales desde cualquier dispositivo.

## ✨ Características Principales

### 📱 **Optimizado para Móviles**
- **PWA (Progressive Web App)**: Instálala como una app nativa
- **Responsive Design**: Funciona perfectamente en smartphones y tablets
- **Gestos táctiles**: Navegación con swipe entre vistas
- **Offline**: Funciona sin conexión a internet
- **Accesibilidad**: Compatible con lectores de pantalla

### 🎯 **Funcionalidades**

#### 📊 **Dashboard**
- Resumen en tiempo real del personal
- Estadísticas del día (presentes, ausentes, vacaciones)
- Vista rápida de registros de hoy

#### 📅 **Control de Asistencia**
- Registro diario de asistencia
- Estados: Presente, Ausente, Vacaciones, Estrés, Llegada Tarde, Accidente, Cambio de Guardia
- Observaciones detalladas
- Cambios de guardia con compañeros

#### 👥 **Gestión de Personal**
- Agregar, editar y eliminar empleados
- Información completa: Nombre, ID, Cargo, Teléfono
- Historial de registros

#### 📋 **Reportes**
- Generación de reportes por período
- Estadísticas detalladas por empleado
- Exportación a Excel y PDF
- Resúmenes por estado de asistencia

#### 🗓️ **Planilla Mensual**
- Vista tipo Excel de novedades mensuales
- Códigos de especificación (G, gr, CM, 28, V, CP, EST, CG, A26)
- Exportación a Excel, PDF e imagen
- Leyenda de códigos incluida

## 🚀 Instalación y Uso

### 📱 **Instalación en Móvil**

#### **Android (Chrome)**
1. Abre la aplicación en Chrome
2. Toca el menú (⋮) → "Instalar aplicación"
3. Confirma la instalación
4. La app aparecerá en tu pantalla de inicio

#### **iPhone (Safari)**
1. Abre la aplicación en Safari
2. Toca el botón compartir (📤)
3. Selecciona "Añadir a pantalla de inicio"
4. Confirma la instalación

#### **Accesos Directos**
Una vez instalada, puedes usar los accesos directos:
- **Dashboard**: Vista principal con estadísticas
- **Asistencia**: Registro rápido de asistencia
- **Personal**: Gestión de empleados

### 💻 **Uso en Computadora**

1. **Iniciar el servidor**:
   ```bash
   npm start
   ```

2. **Abrir en navegador**:
   - Local: `http://localhost:8081`
   - Red local: `http://[tu-ip]:8081`

3. **Acceder desde móvil**:
   - Conecta tu móvil a la misma red WiFi
   - Abre el navegador y ve a `http://[ip-computadora]:8081`

## 📱 **Funcionalidades Móviles**

### **Gestos Táctiles**
- **Swipe izquierda/derecha**: Navegar entre vistas
- **Tap largo**: Acciones contextuales
- **Pinch to zoom**: En la planilla mensual

### **Optimizaciones Móviles**
- **Sin zoom automático**: Inputs optimizados para móviles
- **Botones táctiles**: Tamaño mínimo de 44px
- **Navegación sticky**: Header y menú siempre visibles
- **Modo offline**: Datos guardados localmente

### **Accesibilidad**
- **Lectores de pantalla**: Compatible con VoiceOver y TalkBack
- **Navegación por teclado**: Todas las funciones accesibles
- **Contraste alto**: Texto legible en cualquier condición
- **Etiquetas ARIA**: Descripciones para elementos interactivos

## 📊 **Códigos de Planilla**

| Código | Descripción | Color |
|--------|-------------|-------|
| **G** | Guardia Fija 10hs | Verde |
| **gr** | Guardia Rotativa | Azul |
| **CM** | Carpeta Médica | Rosa |
| **28** | Ausente | Rojo |
| **V** | Vacaciones | Verde claro |
| **CP** | Compensatorios | Naranja |
| **EST** | Estrés | Amarillo |
| **CG** | Cambios de Guardia | Púrpura |
| **A26** | Artículo 26 | Verde azulado |

## 🔧 **Configuración Avanzada**

### **Puerto Personalizado**
Si el puerto 8081 está ocupado:
```bash
# Cambiar puerto en package.json
"start": "http-server -p 8082 -c-1"
```

### **Iconos Personalizados**
Reemplaza los archivos en la carpeta `icons/`:
- `icon-16x16.png` a `icon-512x512.png`
- Formato PNG recomendado
- Fondos transparentes para mejor integración

### **Tema Personalizado**
Modifica los colores en `styles.css`:
```css
:root {
    --primary-color: #2196F3;
    --secondary-color: #1976D2;
    --success-color: #4CAF50;
    --danger-color: #f44336;
}
```

## 📱 **Compatibilidad**

### **Navegadores Soportados**
- ✅ Chrome 67+
- ✅ Safari 11.1+
- ✅ Firefox 67+
- ✅ Edge 79+
- ✅ Samsung Internet 8.2+

### **Dispositivos**
- ✅ iPhone (iOS 11.3+)
- ✅ Android (Chrome 67+)
- ✅ iPad/Tablets
- ✅ Computadoras (Windows, Mac, Linux)

## 🔒 **Seguridad y Privacidad**

- **Datos locales**: Toda la información se guarda en el dispositivo
- **Sin servidor**: No se envían datos a servidores externos
- **Exportación segura**: Los archivos se generan localmente
- **Sin tracking**: No se recopilan datos de uso

## 📞 **Soporte**

### **Problemas Comunes**

#### **La app no se instala**
- Verifica que uses HTTPS o localhost
- Asegúrate de que el Service Worker esté registrado
- Reinicia el navegador

#### **No funciona offline**
- Verifica que el Service Worker esté activo
- Limpia la caché del navegador
- Reinstala la aplicación

#### **Iconos no aparecen**
- Verifica que los archivos estén en la carpeta `icons/`
- Los iconos deben ser PNG
- Reinicia la aplicación

#### **Datos se pierden**
- Los datos se guardan en localStorage
- No borres los datos del navegador
- Usa la función de exportación para respaldos

### **Contacto**
Para soporte técnico o sugerencias:
- Revisa la consola del navegador para errores
- Verifica la conexión a internet
- Reinicia la aplicación

## 🚀 **Próximas Funcionalidades**

- [ ] Sincronización en la nube
- [ ] Notificaciones push
- [ ] Modo oscuro automático
- [ ] Backup automático
- [ ] Múltiples ubicaciones
- [ ] Reportes avanzados
- [ ] Integración con sistemas externos

## 📄 **Licencia**

Este proyecto es de uso libre para sistemas de vigilancia y control de personal.

---

**¡Tu sistema de control de vigilancia está listo para usar en cualquier dispositivo! 📱✨** 