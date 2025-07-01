#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Servidor Simple para Control de Vigilancia
Permite usar la aplicación offline sin necesidad de Node.js
"""

import http.server
import socketserver
import webbrowser
import os
import sys
from pathlib import Path

def main():
    # Configuración
    PORT = 8080
    DIRECTORY = os.getcwd()
    
    print("=" * 50)
    print("    SERVIDOR SIMPLE - CONTROL VIGILANCIA")
    print("=" * 50)
    print()
    
    # Verificar archivos necesarios
    required_files = ['index.html', 'app.js', 'styles.css', 'manifest.json']
    missing_files = []
    
    for file in required_files:
        if not os.path.exists(file):
            missing_files.append(file)
    
    if missing_files:
        print("❌ ERROR: Faltan archivos necesarios:")
        for file in missing_files:
            print(f"   - {file}")
        print()
        print("Asegúrate de estar en la carpeta correcta del proyecto.")
        input("Presiona Enter para salir...")
        return
    
    print("✅ Archivos verificados correctamente")
    print()
    
    # Cambiar al directorio del script
    os.chdir(DIRECTORY)
    
    # Crear servidor
    class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
        def end_headers(self):
            # Agregar headers para PWA
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
            self.send_header('Pragma', 'no-cache')
            self.send_header('Expires', '0')
            super().end_headers()
        
        def log_message(self, format, *args):
            # Log personalizado
            print(f"[{self.log_date_time_string()}] {format % args}")
    
    try:
        with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
            print(f"🚀 Servidor iniciado en puerto {PORT}")
            print(f"📁 Directorio: {DIRECTORY}")
            print()
            print("🌐 URLs disponibles:")
            print(f"   Local: http://localhost:{PORT}")
            print(f"   Red: http://[tu-ip]:{PORT}")
            print()
            print("📱 Para usar en móvil:")
            print("   1. Conecta tu móvil a la misma WiFi")
            print("   2. Ve a http://[ip-computadora]:8080")
            print("   3. Instala como PWA")
            print()
            print("💡 Para obtener tu IP, ejecuta 'ipconfig' en otra terminal")
            print()
            print("⏹️  Presiona Ctrl+C para detener el servidor")
            print("=" * 50)
            
            # Abrir navegador automáticamente
            try:
                webbrowser.open(f'http://localhost:{PORT}')
                print("🌐 Navegador abierto automáticamente")
            except:
                print("⚠️  No se pudo abrir el navegador automáticamente")
            
            print()
            
            # Mantener servidor corriendo
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print()
        print("⏹️  Servidor detenido por el usuario")
        print("¡Gracias por usar Control de Vigilancia!")
        
    except OSError as e:
        if e.errno == 48:  # Puerto en uso
            print(f"❌ ERROR: El puerto {PORT} está en uso")
            print("Intenta con otro puerto o cierra la aplicación que lo usa")
        else:
            print(f"❌ ERROR: {e}")
        
        input("Presiona Enter para salir...")

if __name__ == "__main__":
    main() 