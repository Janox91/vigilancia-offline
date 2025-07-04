// --- Códigos de la planilla mensual ---
const PLANILLA_CODES = [
    { code: 'G', label: 'Guardia Fija', colorClass: 'planilla-G' },
    { code: 'gr', label: 'Guardia Rotativa', colorClass: 'planilla-gr' },
    { code: 'CM', label: 'Carpeta Médica', colorClass: 'planilla-CM' },
    { code: '28', label: 'Ausente', colorClass: 'planilla-28' },
    { code: 'V', label: 'Vacaciones', colorClass: 'planilla-V' },
    { code: 'CP', label: 'Compensatorios', colorClass: 'planilla-CP' },
    { code: 'EST', label: 'Estrés', colorClass: 'planilla-EST' },
    { code: 'CG', label: 'Cambios de Guardia', colorClass: 'planilla-CG' },
    { code: 'A26', label: 'Artículo 26', colorClass: 'planilla-A26' }
];

// --- Chart.js: Gráfica de asistencia mensual ---
function renderAsistenciaChart(employees, attendance) {
    if (!window.Chart) return;
    const ctx = document.getElementById('asistenciaChart');
    if (!ctx) return;
    // Calcular totales del mes actual
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const daysInMonth = new Date(year, month, 0).getDate();
    const statusKeys = ['presente','ausente','vacaciones','llegada-tarde','carpeta-medica','cambio-guardia','estres'];
    const statusLabels = ['Presente','Ausente','Vacaciones','Llegada Tarde','Carpeta Médica','Cambio Guardia','Estrés'];
    const statusColors = [
        '#2e7d32','#c62828','#1976d2','#f9a825','#c2185b','#7b1fa2','#f57c00'
    ];
    const totals = Array(statusKeys.length).fill(0);
    employees.forEach(emp => {
        for(let d=1; d<=daysInMonth; d++){
            const dateStr = `${year}-${month}-${d.toString().padStart(2,'0')}`;
            const rec = attendance[emp.id]?.[dateStr];
            if(rec){
                const idx = statusKeys.indexOf(rec.status);
                if(idx>=0) totals[idx]++;
            }
        }
    });
    // Destruir gráfico anterior si existe
    if(window._asistenciaChart) window._asistenciaChart.destroy();
    window._asistenciaChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: statusLabels,
            datasets: [{
                label: 'Registros',
                data: totals,
                backgroundColor: statusColors,
                borderColor: statusColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                title: { display: false }
            },
            scales: {
                y: { beginAtZero: true, ticks: { precision:0 } }
            }
        }
    });
}

// --- Porcentaje de asistencia por empleado y por turno ---
function renderAsistenciaPorcentajes(employees, attendance) {
    const empleadoDiv = document.getElementById('asistenciaPorEmpleado');
    const turnoDiv = document.getElementById('asistenciaPorTurno');
    if (!empleadoDiv || !turnoDiv) return;
    // Mes actual
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const daysInMonth = new Date(year, month, 0).getDate();
    // Por empleado
    let htmlEmp = '<table style="width:100%;border-collapse:collapse;font-size:0.95em;"><thead><tr><th style="text-align:left;padding:0.3em 0.7em;">Empleado</th><th style="text-align:center;padding:0.3em 0.7em;">Turno</th><th style="text-align:center;padding:0.3em 0.7em;">% Asistencia</th></tr></thead><tbody>';
    employees.forEach(emp => {
        let presentes = 0;
        for(let d=1; d<=daysInMonth; d++){
            const dateStr = `${year}-${month}-${d.toString().padStart(2,'0')}`;
            const rec = attendance[emp.id]?.[dateStr];
            if(rec && rec.status === 'presente') presentes++;
        }
        const porcentaje = daysInMonth > 0 ? Math.round((presentes/daysInMonth)*100) : 0;
        htmlEmp += `<tr><td style='padding:0.3em 0.7em;'>${emp.name}</td><td style='padding:0.3em 0.7em;text-align:center;'>${emp.turno||'-'}</td><td style='padding:0.3em 0.7em;text-align:center;'>${porcentaje}%</td></tr>`;
    });
    htmlEmp += '</tbody></table>';
    empleadoDiv.innerHTML = htmlEmp;
    // Por turno
    const turnos = ['Día','Tarde','Noche','SADOFE'];
    let htmlTurno = '<table style="width:100%;border-collapse:collapse;font-size:0.95em;"><thead><tr><th style="text-align:left;padding:0.3em 0.7em;">Turno</th><th style="text-align:center;padding:0.3em 0.7em;">% Asistencia</th></tr></thead><tbody>';
    turnos.forEach(turno => {
        const empleadosTurno = employees.filter(e => e.turno === turno);
        let totalPresentes = 0;
        let totalPosibles = empleadosTurno.length * daysInMonth;
        empleadosTurno.forEach(emp => {
            for(let d=1; d<=daysInMonth; d++){
                const dateStr = `${year}-${month}-${d.toString().padStart(2,'0')}`;
                const rec = attendance[emp.id]?.[dateStr];
                if(rec && rec.status === 'presente') totalPresentes++;
            }
        });
        const porcentaje = totalPosibles > 0 ? Math.round((totalPresentes/totalPosibles)*100) : 0;
        htmlTurno += `<tr><td style='padding:0.3em 0.7em;'>${turno}</td><td style='padding:0.3em 0.7em;text-align:center;'>${porcentaje}%</td></tr>`;
    });
    htmlTurno += '</tbody></table>';
    turnoDiv.innerHTML = htmlTurno;
}

// Aplicación de Control de Vigilancia
class VigilanciaApp {
    constructor() {
        this.employees = this.loadFromStorage('employees') || [];
        this.attendance = this.loadFromStorage('attendance') || {};
        this.currentView = 'dashboard';
        this.editingEmployeeId = null;
        // Variables para gestos táctiles
        this.startX = 0;
        this.startY = 0;
        this.endX = 0;
        this.endY = 0;
        
        // Configuración de login
        this.isLoggedIn = this.loadFromStorage('isLoggedIn') || false;
        this.loginPassword = 'upa16'; // Contraseña por defecto
        
        this.init();
    }

    init() {
        // Verificar login antes de inicializar
        if (!this.isLoggedIn) {
            this.setupLogin();
            return;
        }
        
        this.setupEventListeners();
        this.setupDateInputs();
        this.updateDashboard();
        this.renderEmployees();
        this.renderAttendance();
        this.renderPlanillaLeyenda();
        this.renderPlanilla();
        this.setupLibroView();
        
        // Ocultar pantalla de carga
        const loadingScreen = document.getElementById('appLoading');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
            setTimeout(() => loadingScreen.style.display = 'none', 300);
        }
    }

    setupLogin() {
        const loginForm = document.getElementById('loginForm');
        const loginPassword = document.getElementById('loginPassword');
        const togglePassword = document.getElementById('togglePassword');
        const loginError = document.getElementById('loginError');
        const loginOverlay = document.getElementById('loginOverlay');

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        if (togglePassword) {
            togglePassword.addEventListener('click', () => {
                this.togglePasswordVisibility();
            });
        }

        // Permitir login con Enter
        if (loginPassword) {
            loginPassword.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleLogin();
                }
            });
        }
    }

    handleLogin() {
        const loginPassword = document.getElementById('loginPassword');
        const loginError = document.getElementById('loginError');
        const loginOverlay = document.getElementById('loginOverlay');

        if (loginPassword && loginPassword.value === this.loginPassword) {
            // Login exitoso
            this.isLoggedIn = true;
            this.saveToStorage('isLoggedIn', true);
            
            // Ocultar overlay de login
            if (loginOverlay) {
                loginOverlay.style.display = 'none';
            }
            
            // Inicializar la aplicación
            this.setupEventListeners();
            this.setupDateInputs();
            this.updateDashboard();
            this.renderEmployees();
            this.renderAttendance();
            this.renderPlanillaLeyenda();
            this.renderPlanilla();
            this.setupLibroView();
            
            // Ocultar pantalla de carga
            const loadingScreen = document.getElementById('appLoading');
            if (loadingScreen) {
                loadingScreen.classList.add('hidden');
                setTimeout(() => loadingScreen.style.display = 'none', 300);
            }
            
            this.showFeedbackMessage('¡Bienvenido al sistema de vigilancia!', 'success');
        } else {
            // Login fallido
            if (loginError) {
                loginError.style.display = 'block';
            }
            if (loginPassword) {
                loginPassword.value = '';
                loginPassword.focus();
            }
        }
    }

    togglePasswordVisibility() {
        const loginPassword = document.getElementById('loginPassword');
        const eyeIcon = document.getElementById('eyeIcon');
        const eyeOpen = document.getElementById('eyeOpen');

        if (loginPassword && eyeIcon && eyeOpen) {
            if (loginPassword.type === 'password') {
                loginPassword.type = 'text';
                eyeOpen.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 48 48" fill="none">
                        <path d="M24 4C12 4 2 12 2 24s10 20 22 20 22-8 22-20S36 4 24 4z" stroke="black" stroke-width="4"/>
                        <path d="M24 12c-6.6 0-12 5.4-12 12s5.4 12 12 12 12-5.4 12-12-5.4-12-12-12z" stroke="black" stroke-width="4"/>
                        <path d="M24 18c-3.3 0-6 2.7-6 6s2.7 6 6 6 6-2.7 6-6-2.7-6-6-6z" stroke="black" stroke-width="4"/>
                        <line x1="6" y1="6" x2="42" y2="42" stroke="black" stroke-width="4"/>
                    </svg>
                `;
            } else {
                loginPassword.type = 'password';
                eyeOpen.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 48 48" fill="none">
                        <ellipse cx="24" cy="24" rx="20" ry="13" stroke="black" stroke-width="4"/>
                        <circle cx="24" cy="24" r="7" stroke="black" stroke-width="4"/>
                    </svg>
                `;
            }
        }
    }

    logout() {
        this.isLoggedIn = false;
        this.saveToStorage('isLoggedIn', false);
        location.reload();
    }

    setupEventListeners() {
        try {
            console.log('🔧 Configurando event listeners...');
            
            // Navegación
            const navBtns = document.querySelectorAll('.nav-btn');
            console.log(`Navegación: ${navBtns ? navBtns.length : 0} botones encontrados`);
            
            if (navBtns && navBtns.length > 0) {
                navBtns.forEach((btn, index) => {
                    try {
                        if (btn && btn.dataset && btn.dataset.view) {
                            btn.addEventListener('click', (e) => {
                                this.switchView(e.target.dataset.view);
                            });
                            console.log(`✅ Botón de navegación ${index + 1} configurado`);
                        } else {
                            console.log(`⚠️ Botón de navegación ${index + 1} sin dataset.view`);
                        }
                    } catch (error) {
                        console.error(`❌ Error en botón de navegación ${index + 1}:`, error);
                    }
                });
            }

            // Función helper para agregar event listeners de forma segura
            const safeAddEventListener = (elementId, eventType, handler, description) => {
                try {
                    const element = document.getElementById(elementId);
                    if (element && typeof element.addEventListener === 'function') {
                        element.addEventListener(eventType, handler);
                        console.log(`✅ ${description} configurado`);
                        return true;
                    } else {
                        console.log(`⚠️ ${description} no encontrado o no válido`);
                        return false;
                    }
                } catch (error) {
                    console.error(`❌ Error configurando ${description}:`, error);
                    return false;
                }
            };

            // Botones del header
            safeAddEventListener('addEmployeeBtn', 'click', () => this.openEmployeeModal(), 'Botón Agregar Personal');
            safeAddEventListener('exportBtn', 'click', () => this.exportData(), 'Botón Exportar');
            safeAddEventListener('logoutBtn', 'click', () => this.logout(), 'Botón Logout');

            // Formularios
            safeAddEventListener('employeeForm', 'submit', (e) => {
                e.preventDefault();
                this.saveEmployee();
            }, 'Formulario de Personal');

            safeAddEventListener('attendanceForm', 'submit', (e) => {
                e.preventDefault();
                this.saveAttendance();
            }, 'Formulario de Asistencia');

            // Botones de cerrar modales
            safeAddEventListener('closeModal', 'click', () => this.closeEmployeeModal(), 'Botón Cerrar Modal Personal');
            safeAddEventListener('cancelModal', 'click', () => this.closeEmployeeModal(), 'Botón Cancelar Modal Personal');
            safeAddEventListener('closeAttendanceModal', 'click', () => this.closeAttendanceModal(), 'Botón Cerrar Modal Asistencia');
            safeAddEventListener('cancelAttendanceModal', 'click', () => this.closeAttendanceModal(), 'Botón Cancelar Modal Asistencia');

            // Select de estado de asistencia
            safeAddEventListener('attendanceStatus', 'change', (e) => {
                this.handleAttendanceStatusChange(e.target.value);
            }, 'Select Estado Asistencia');

            // Botones adicionales
            safeAddEventListener('addNewEmployeeBtn', 'click', () => this.openEmployeeModal(), 'Botón Agregar Nuevo Personal');
            safeAddEventListener('generateReportBtn', 'click', () => this.generateReport(), 'Botón Generar Reporte');

            // Cerrar modales al hacer clic fuera
            window.addEventListener('click', (e) => {
                if (e.target && e.target.classList && e.target.classList.contains('modal')) {
                    this.closeEmployeeModal();
                    this.closeAttendanceModal();
                }
            });

            // Planilla mensual
            safeAddEventListener('planillaMonth', 'change', () => this.renderPlanilla(), 'Input Mes Planilla');

            // Gestos táctiles para móviles
            // this.setupTouchGestures(); // Desactivado para que solo funcione con click
            
            // Filtros de empleados
            const searchInput = document.getElementById('employeeSearch');
            const turnoFilter = document.getElementById('employeeTurnoFilter');
            if (searchInput) searchInput.addEventListener('input', () => this.renderEmployees());
            if (turnoFilter) turnoFilter.addEventListener('change', () => this.renderEmployees());
            
            console.log('✅ Configuración de event listeners completada');
            
        } catch (error) {
            console.error('❌ Error en setupEventListeners:', error);
            console.error('Stack trace:', error.stack);
        }
    }

    // setupTouchGestures() {
    //     try {
    //         document.addEventListener('touchstart', (e) => {
    //             if (e.touches && e.touches.length > 0) {
    //                 this.startX = e.touches[0].clientX;
    //                 this.startY = e.touches[0].clientY;
    //             }
    //         }, false);

    //         document.addEventListener('touchend', (e) => {
    //             if (e.changedTouches && e.changedTouches.length > 0) {
    //                 this.endX = e.changedTouches[0].clientX;
    //                 this.endY = e.changedTouches[0].clientY;
    //                 this.handleSwipe();
    //             }
    //         }, false);

    //         // Prevenir zoom en inputs
    //         const inputs = document.querySelectorAll('input, select, textarea');
    //         if (inputs && inputs.length > 0) {
    //             inputs.forEach(input => {
    //                 if (input) {
    //                     input.addEventListener('touchstart', (e) => {
    //                         if (e.target) {
    //                             e.target.style.fontSize = '16px'; // Prevenir zoom en iOS
    //                         }
    //                     });
    //                 }
    //             });
    //         }
    //     } catch (error) {
    //         console.error('❌ Error en setupTouchGestures:', error);
    //     }
    // }

    handleSwipe() {
        const minSwipeDistance = 50;
        const deltaX = this.endX - this.startX;
        const deltaY = this.endY - this.startY;

        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
            // Navegación horizontal
            const views = ['dashboard', 'attendance', 'employees', 'reports', 'planilla'];
            const currentIndex = views.indexOf(this.currentView);
            
            if (deltaX > 0 && currentIndex > 0) {
                // Swipe derecha - vista anterior
                this.switchView(views[currentIndex - 1]);
            } else if (deltaX < 0 && currentIndex < views.length - 1) {
                // Swipe izquierda - vista siguiente
                this.switchView(views[currentIndex + 1]);
            }
        }
    }

    setupDateInputs() {
        const today = new Date().toISOString().split('T')[0];
        
        // Fecha de asistencia
        const attendanceDate = document.getElementById('attendanceDate');
        if (attendanceDate) {
            attendanceDate.value = today;
            attendanceDate.addEventListener('change', () => {
                this.renderAttendance();
            });
        }

        // Fechas de reporte
        const reportStartDate = document.getElementById('reportStartDate');
        const reportEndDate = document.getElementById('reportEndDate');
        
        if (reportStartDate && reportEndDate) {
            // Establecer fechas por defecto (último mes)
            const lastMonth = new Date();
            lastMonth.setMonth(lastMonth.getMonth() - 1);
            reportStartDate.value = lastMonth.toISOString().split('T')[0];
            reportEndDate.value = today;
        }

        // Mes de planilla
        const planillaMonth = document.getElementById('planillaMonth');
        if (planillaMonth) {
            const currentMonth = new Date().toISOString().slice(0, 7);
            planillaMonth.value = currentMonth;
        }
    }

    switchView(viewName) {
        // Actualizar navegación
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeBtn = document.querySelector(`[data-view="${viewName}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        // Actualizar vistas
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });
        const targetView = document.getElementById(viewName);
        if (targetView) {
            targetView.classList.add('active');
        }

        this.currentView = viewName;

        // Actualizar contenido según la vista
        switch(viewName) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'attendance':
                this.renderAttendance();
                break;
            case 'employees':
                this.renderEmployees();
                break;
            case 'reports':
                this.renderReports();
                break;
            case 'planilla':
                this.renderPlanillaLeyenda();
                this.renderPlanilla();
                break;
        }
    }

    // Gestión de empleados
    openEmployeeModal(employeeId = null) {
        this.editingEmployeeId = employeeId;
        const modal = document.getElementById('employeeModal');
        const form = document.getElementById('employeeForm');
        const title = document.getElementById('modalTitle');

        if (employeeId) {
            const employee = this.employees.find(emp => emp.id === employeeId);
            if (employee) {
                title.textContent = 'Editar Personal';
                document.getElementById('employeeName').value = employee.name;
                document.getElementById('employeePosition').value = employee.position;
                document.getElementById('employeePhone').value = employee.phone || '';
                document.getElementById('employeeTurno').value = employee.turno || '';
            }
        } else {
            title.textContent = 'Agregar Personal';
            form.reset();
        }

        modal.style.display = 'block';
    }

    closeEmployeeModal() {
        document.getElementById('employeeModal').style.display = 'none';
        this.editingEmployeeId = null;
    }

    showFeedbackMessage(message, type = 'success') {
        const el = document.getElementById('feedbackMessage');
        if (!el) return;
        el.textContent = message;
        el.style.display = 'block';
        el.style.background = type === 'success' ? '#d4f7dc' : '#ffd6d6';
        el.style.color = type === 'success' ? '#1b5e20' : '#b71c1c';
        el.style.border = type === 'success' ? '2px solid #43a047' : '2px solid #e53935';
        setTimeout(() => { el.style.display = 'none'; }, 3000);
    }

    saveEmployee() {
        const name = document.getElementById('employeeName').value.trim();
        const position = document.getElementById('employeePosition').value.trim();
        const phone = document.getElementById('employeePhone').value.trim();
        const turno = document.getElementById('employeeTurno').value;

        if (!name || !position) {
            alert('Por favor complete los campos obligatorios');
            return;
        }

        if (this.editingEmployeeId) {
            // Editar empleado existente
            const index = this.employees.findIndex(emp => emp.id === this.editingEmployeeId);
            if (index !== -1) {
                this.employees[index] = {
                    ...this.employees[index],
                    name,
                    position,
                    phone,
                    turno
                };
            }
        } else {
            // Agregar nuevo empleado
            const newEmployee = {
                id: Date.now().toString(),
                name,
                position,
                phone,
                turno,
                createdAt: new Date().toISOString()
            };
            this.employees.push(newEmployee);
        }

        this.saveToStorage('employees', this.employees);
        this.closeEmployeeModal();
        this.renderEmployees();
        this.updateDashboard();
        this.renderAttendance();
        this.showFeedbackMessage(this.editingEmployeeId ? 'Empleado actualizado correctamente.' : 'Empleado agregado correctamente.', 'success');
    }

    deleteEmployee(employeeId) {
        const employee = this.employees.find(emp => emp.id === employeeId);
        if (!employee) return;
        if (confirm(`¿Está seguro de que desea eliminar a ${employee.name}? Esta acción no se puede deshacer y eliminará todos sus registros de asistencia.`)) {
            this.employees = this.employees.filter(emp => emp.id !== employeeId);
            // Eliminar asistencias asociadas
            Object.keys(this.attendance).forEach(key => {
                if (key.startsWith(employeeId + '_')) delete this.attendance[key];
            });
            this.saveToStorage('employees', this.employees);
            this.saveToStorage('attendance', this.attendance);
            this.renderEmployees();
            this.updateDashboard();
            this.renderAttendance();
            this.showFeedbackMessage('Empleado y registros eliminados correctamente.', 'success');
        } else {
            this.showFeedbackMessage('Eliminación cancelada.', 'error');
        }
    }

    renderEmployees() {
        const container = document.getElementById('employeesList');
        if (!container) return;
        // Filtros
        const search = document.getElementById('employeeSearch')?.value.trim().toLowerCase() || '';
        const turno = document.getElementById('employeeTurnoFilter')?.value || '';
        let filtered = this.employees;
        if (search) {
            filtered = filtered.filter(emp =>
                emp.name.toLowerCase().includes(search) ||
                (emp.position && emp.position.toLowerCase().includes(search))
            );
        }
        if (turno) {
            filtered = filtered.filter(emp => emp.turno === turno);
        }
        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="summary-item">
                    <p>No hay personal que coincida con la búsqueda o filtro.</p>
                </div>
            `;
            return;
        }
        container.innerHTML = filtered.map(employee => `
            <div class="employee-card">
                <div class="employee-card-header">
                    <div class="employee-card-name">${employee.name}</div>
                    <div class="employee-card-actions">
                        <button class="btn-primary btn-small" onclick="app.openEmployeeModal('${employee.id}')">
                            ✏️ Editar
                        </button>
                        <button class="btn-danger btn-small" onclick="app.deleteEmployee('${employee.id}')">
                            🗑️ Eliminar
                        </button>
                        <button class="btn-secondary btn-small" onclick="app.abrirLibroEmpleado('${employee.id}')">
                            📖 Ver libro
                        </button>
                    </div>
                </div>
                <div class="employee-card-details">
                    <div><strong>Cargo:</strong> ${employee.position}</div>
                    ${employee.phone ? `<div><strong>Teléfono:</strong> ${employee.phone}</div>` : ''}
                    <div><strong>Turno:</strong> ${employee.turno || '-'}</div>
                    <div><strong>Registrado:</strong> ${new Date(employee.createdAt).toLocaleDateString()}</div>
                </div>
            </div>
        `).join('');
    }

    // Gestión de asistencia
    openAttendanceModal(employeeId, date) {
        const employee = this.employees.find(emp => emp.id === employeeId);
        if (!employee) return;

        const modal = document.getElementById('attendanceModal');
        const existingRecord = this.getAttendanceRecord(employeeId, date);

        // Llenar el formulario con datos existentes si los hay
        if (existingRecord) {
            document.getElementById('attendanceStatus').value = existingRecord.status;
            document.getElementById('shiftChangeType').value = existingRecord.shiftChangeType || 'solo';
            document.getElementById('companionName').value = existingRecord.companionId || '';
            document.getElementById('observations').value = existingRecord.observations || '';
            document.getElementById('shiftChangeStart').value = existingRecord.shiftChangeStart || '';
            document.getElementById('shiftChangeEnd').value = existingRecord.shiftChangeEnd || '';
        } else {
            document.getElementById('attendanceForm').reset();
        }

        // Llenar opciones de compañeros
        const companionSelect = document.getElementById('companionName');
        if (companionSelect) {
            companionSelect.innerHTML = '<option value="">Seleccionar compañero...</option>';
            this.employees
                .filter(emp => emp.id !== employeeId)
                .forEach(emp => {
                    companionSelect.innerHTML += `<option value="${emp.id}">${emp.name}</option>`;
                });
        }

        // Guardar datos para el guardado
        modal.dataset.employeeId = employeeId;
        modal.dataset.date = date;

        modal.style.display = 'block';
    }

    closeAttendanceModal() {
        document.getElementById('attendanceModal').style.display = 'none';
    }

    handleAttendanceStatusChange(status) {
        const shiftChangeGroup = document.getElementById('shiftChangeGroup');
        const companionGroup = document.getElementById('companionGroup');
        const shiftChangeDatesGroup = document.getElementById('shiftChangeDatesGroup');

        if (shiftChangeGroup && companionGroup) {
            if (status === 'cambio-guardia') {
                shiftChangeGroup.style.display = 'block';
                companionGroup.style.display = 'block';
            } else {
                shiftChangeGroup.style.display = 'none';
                companionGroup.style.display = 'none';
            }
        }
        if (shiftChangeDatesGroup) {
            shiftChangeDatesGroup.style.display = (status === 'cambio-guardia') ? 'block' : 'none';
        }
    }

    saveAttendance() {
        const modal = document.getElementById('attendanceModal');
        const employeeId = modal.dataset.employeeId;
        const date = modal.dataset.date;
        const status = document.getElementById('attendanceStatus').value;
        const shiftChangeType = document.getElementById('shiftChangeType').value;
        const companionId = document.getElementById('companionName').value;
        const observations = document.getElementById('observations').value.trim();
        const shiftChangeStart = document.getElementById('shiftChangeStart').value;
        const shiftChangeEnd = document.getElementById('shiftChangeEnd').value;

        if (!employeeId || !date || !status) {
            alert('Por favor complete todos los campos obligatorios');
            return;
        }

        const record = {
            employeeId,
            date,
            status,
            observations,
            timestamp: new Date().toISOString()
        };

        if (status === 'cambio-guardia') {
            record.shiftChangeType = shiftChangeType;
            if (shiftChangeType === 'con-companero' && companionId) {
                record.companionId = companionId;
            }
            record.shiftChangeStart = shiftChangeStart;
            record.shiftChangeEnd = shiftChangeEnd;
        }

        this.setAttendanceRecord(employeeId, date, record);
        this.saveToStorage('attendance', this.attendance);
        
        this.closeAttendanceModal();
        this.renderAttendance();
        this.updateDashboard();
        this.showFeedbackMessage('Asistencia guardada correctamente.', 'success');
    }

    getAttendanceRecord(employeeId, date) {
        return this.attendance[`${employeeId}_${date}`];
    }

    setAttendanceRecord(employeeId, date, record) {
        this.attendance[`${employeeId}_${date}`] = record;
    }

    renderAttendance() {
        const date = document.getElementById('attendanceDate')?.value;
        const container = document.getElementById('attendanceList');
        if (!container || !date) return;
        
        if (this.employees.length === 0) {
            container.innerHTML = `
                <div class="summary-item">
                    <p>No hay personal registrado. Agregue personal primero.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.employees.map(employee => {
            const record = this.getAttendanceRecord(employee.id, date);
            const status = record ? record.status : 'no-registrado';
            
            return `
                <div class="attendance-item">
                    <div class="employee-info">
                        <div class="employee-name">${employee.name}</div>
                        <div class="employee-id">${employee.position}</div>
                    </div>
                    <div class="attendance-status status-${status}">
                        ${this.getStatusText(status)}
                    </div>
                    <div class="attendance-actions">
                        <button class="btn-primary btn-small" onclick="app.openAttendanceModal('${employee.id}', '${date}')">
                            ${record ? '✏️ Editar' : '📝 Registrar'}
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    getStatusText(status) {
        const statusTextMap = {
            'sin-asignar': 'Sin asignar',
            'presente': 'Presente',
            'ausente': 'Ausente',
            'vacaciones': 'Vacaciones',
            'estres': 'Estrés',
            'cambio-guardia': 'Cambio de Guardia',
            'llegada-tarde': 'Llegada Tarde',
            'carpeta-medica': 'Carpeta Médica',
            'accidente': 'Carpeta Médica',
            'A26': 'Artículo 26'
        };
        return statusTextMap[status] || status;
    }

    // Dashboard
    updateDashboard() {
        const today = new Date().toISOString().split('T')[0];
        
        const totalEmployeesEl = document.getElementById('totalEmployees');
        if (totalEmployeesEl) totalEmployeesEl.textContent = this.employees.length;
        
        const todayStats = this.getTodayStats(today);
        const presentTodayEl = document.getElementById('presentToday');
        if (presentTodayEl) presentTodayEl.textContent = todayStats.present;
        
        const absentTodayEl = document.getElementById('absentToday');
        if (absentTodayEl) absentTodayEl.textContent = todayStats.absent;
        
        const vacationTodayEl = document.getElementById('vacationToday');
        if (vacationTodayEl) vacationTodayEl.textContent = todayStats.vacation;

        const a26TodayEl = document.getElementById('a26Today');
        if (a26TodayEl) {
            let a26Value = todayStats.a26;
            if (typeof a26Value !== 'number' || isNaN(a26Value)) a26Value = 0;
            a26TodayEl.textContent = a26Value;
        }

        this.renderTodaySummary(today);
        // --- Gráfica de asistencia mensual ---
        renderAsistenciaChart(this.employees, this.attendance);
        renderAsistenciaPorcentajes(this.employees, this.attendance);
    }

    getTodayStats(date) {
        const stats = { present: 0, absent: 0, vacation: 0, a26: 0, other: 0 };
        
        this.employees.forEach(employee => {
            const record = this.getAttendanceRecord(employee.id, date);
            if (record) {
                switch(record.status) {
                    case 'presente':
                        stats.present++;
                        break;
                    case 'ausente':
                        stats.absent++;
                        break;
                    case 'vacaciones':
                        stats.vacation++;
                        break;
                    case 'A26':
                        stats.a26++;
                        break;
                    default:
                        stats.other++;
                }
            }
        });

        return stats;
    }

    renderTodaySummary(date) {
        const container = document.getElementById('todaySummary');
        if (!container) return;
        
        const todayRecords = [];

        this.employees.forEach(employee => {
            const record = this.getAttendanceRecord(employee.id, date);
            if (record) {
                todayRecords.push({ employee, record });
            }
        });

        if (todayRecords.length === 0) {
            container.innerHTML = `
                <div class="summary-item">
                    <p>No hay registros de asistencia para hoy.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = todayRecords.map(({ employee, record }) => {
            let details = `${employee.name} - ${this.getStatusText(record.status)}`;
            
            if (record.status === 'cambio-guardia' && record.shiftChangeType) {
                details += ` (${record.shiftChangeType === 'solo' ? 'Solo' : 'Con Compañero'})`;
            }
            
            if (record.observations) {
                details += ` - ${record.observations}`;
            }

            return `
                <div class="summary-item">
                    <div>${details}</div>
                    <small>${new Date(record.timestamp).toLocaleTimeString()}</small>
                </div>
            `;
        }).join('');
    }

    // Reportes
    renderReports() {
        const container = document.getElementById('reportResults');
        if (!container) return;
        // Llenar select de empleados
        const select = document.getElementById('reportEmployeeSelect');
        if (select) {
            select.innerHTML = '<option value="">Todos</option>' + this.employees.map(emp => `<option value="${emp.id}">${emp.name}</option>`).join('');
        }
        container.innerHTML = `
            <div class="summary-item">
                <p>Seleccione un rango de fechas y haga clic en "Generar Reporte" para ver los resultados.</p>
            </div>
        `;
    }

    generateReport() {
        const startDate = document.getElementById('reportStartDate')?.value;
        const endDate = document.getElementById('reportEndDate')?.value;
        const employeeId = document.getElementById('reportEmployeeSelect')?.value;
        if (!startDate || !endDate) {
            alert('Por favor seleccione un rango de fechas');
            return;
        }
        let report = this.generateAttendanceReport(startDate, endDate);
        if (employeeId) {
            // Filtrar solo el empleado seleccionado
            report.employees = report.employees.filter(e => e.id === employeeId);
            // Recalcular resumen general solo para ese empleado
            report.summary.byStatus = {};
            report.summary.totalRecords = 0;
            report.employees.forEach(emp => {
                Object.keys(emp.totals).forEach(status => {
                    if (!report.summary.byStatus[status]) report.summary.byStatus[status] = 0;
                    report.summary.byStatus[status] += emp.totals[status];
                    report.summary.totalRecords += emp.totals[status];
                });
            });
        }
        this.displayReport(report);
    }

    generateAttendanceReport(startDate, endDate) {
        const report = {
            period: { start: startDate, end: endDate },
            employees: [],
            summary: {
                totalDays: 0,
                totalRecords: 0,
                byStatus: {}
            }
        };

        // Calcular días totales
        const start = new Date(startDate);
        const end = new Date(endDate);
        const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        report.summary.totalDays = daysDiff;

        // Generar reporte por empleado
        this.employees.forEach(employee => {
            const employeeReport = {
                id: employee.id,
                name: employee.name,
                position: employee.position,
                attendance: {},
                totals: {
                    presente: 0,
                    ausente: 0,
                    vacaciones: 0,
                    estres: 0,
                    'llegada-tarde': 0,
                    accidente: 0,
                    'cambio-guardia': 0,
                    'carpeta_medica': 0,
                    'carpeta-medica': 0,
                    'A26': 0,
                    'no-registrado': 0
                }
            };

            // Contar asistencia por día
            for (let i = 0; i < daysDiff; i++) {
                const currentDate = new Date(start);
                currentDate.setDate(start.getDate() + i);
                const dateStr = currentDate.toISOString().split('T')[0];
                
                const record = this.getAttendanceRecord(employee.id, dateStr);
                const status = record ? record.status : 'no-registrado';
                
                employeeReport.attendance[dateStr] = {
                    status,
                    observations: record ? record.observations : '',
                    timestamp: record ? record.timestamp : null
                };
                
                if (!(status in employeeReport.totals)) {
                    employeeReport.totals[status] = 0;
                }
                employeeReport.totals[status]++;
                report.summary.totalRecords++;
            }

            report.employees.push(employeeReport);
        });

        // Calcular resumen por estado
        report.employees.forEach(emp => {
            Object.keys(emp.totals).forEach(status => {
                if (!report.summary.byStatus[status]) {
                    report.summary.byStatus[status] = 0;
                }
                report.summary.byStatus[status] += emp.totals[status];
            });
        });

        return report;
    }

    displayReport(report) {
        const container = document.getElementById('reportResults');
        if (!container) return;
        let html = `
            <div class="report-header">
                <h3>Reporte de Vigilancia</h3>
                <p><strong>Período:</strong> ${new Date(report.period.start).toLocaleDateString()} - ${new Date(report.period.end).toLocaleDateString()}</p>
                <p><strong>Total de días:</strong> ${report.summary.totalDays}</p>
            </div>
            <div class="report-summary">
                <h4>Resumen General</h4>
                <div class="summary-grid">
        `;
        // Mostrar todos los estados relevantes, incluyendo Artículo 26 aunque sea 0
        const estadosResumen = ['presente','ausente','vacaciones','estres','llegada-tarde','carpeta-medica','cambio-guardia','A26'];
        estadosResumen.forEach(status => {
            if (status === 'sin-asignar' || status === 'no-registrado') return;
            const count = report.summary.byStatus[status] || 0;
            html += `
                <div class="summary-stat">
                    <span class="stat-label">${status === 'A26' ? 'Artículo 26' : this.getStatusText(status)}:</span>
                    <span class="stat-value">${count}</span>
                </div>
            `;
        });
        html += `
                </div>
            </div>
            <div class="report-details">
                <h4>Detalle por Empleado</h4>
        `;
        report.employees.forEach(employee => {
            html += `
                <div class="employee-report">
                    <h5>${employee.name} (${employee.position})</h5>
                    <div class="employee-totals">
            `;
            Object.entries(employee.totals).forEach(([status, count]) => {
                if (count > 0 && status !== 'no-registrado') {
                    html += `
                        <span class="total-item">
                            ${this.getStatusText(status)}: ${count}
                        </span>
                    `;
                }
            });
            html += `
                    </div>
                </div>
            `;
        });
        html += `
            </div>
            <div class="report-actions">
                <button class="btn-primary" onclick="app.exportReportToPDF(app.lastReport)">🗎 Exportar a PDF</button>
            </div>
        `;
        container.innerHTML = html;
        this.lastReport = report;
    }

    // Planilla Mensual
    renderPlanillaLeyenda() {
        const container = document.getElementById('planillaLeyenda');
        if (!container) return;

        let html = '<h4>Leyenda de Especificaciones:</h4><div class="leyenda-grid">';
        PLANILLA_CODES.forEach(code => {
            html += `
                <div class="leyenda-item ${code.colorClass}">
                    <span class="leyenda-code">${code.code}</span>
                    <span class="leyenda-label">${code.label}</span>
                </div>
            `;
        });
        html += '</div>';
        container.innerHTML = html;
    }

    renderPlanilla() {
        const monthInput = document.getElementById('planillaMonth');
        if (!monthInput || !monthInput.value) return;

        const [year, month] = monthInput.value.split('-');
        const monthName = new Date(year, month - 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
        
        // --- NUEVO: Selector múltiple de empleados ---
        const selectorDiv = document.getElementById('planillaEmployeeSelector');
        if (selectorDiv) {
            selectorDiv.innerHTML = this.employees.map(emp => `
                <label style="display:flex;align-items:center;gap:0.2rem;">
                    <input type="checkbox" class="planilla-employee-checkbox" value="${emp.id}" checked> ${emp.name}
                </label>
            `).join('');
        }
        // Obtener IDs seleccionados
        let selectedIds = this.employees.map(e => e.id);
        if (selectorDiv) {
            const checked = selectorDiv.querySelectorAll('.planilla-employee-checkbox:checked');
            selectedIds = Array.from(checked).map(cb => cb.value);
            // Actualizar tabla al cambiar selección
            selectorDiv.querySelectorAll('.planilla-employee-checkbox').forEach(cb => {
                cb.onchange = () => this.renderPlanilla();
            });
        }

        const container = document.getElementById('planillaTable');
        if (!container) return;

        // Generar días del mes
        const daysInMonth = new Date(year, month, 0).getDate();
        let html = `
            <thead>
                <tr>
                    <th>Personal</th>
                    <th>Turno</th>
        `;
        for (let day = 1; day <= daysInMonth; day++) {
            html += `<th>${day}</th>`;
        }
        html += '</tr></thead><tbody>';

        this.employees.filter(emp => selectedIds.includes(emp.id)).forEach(employee => {
            html += `<tr><td>${employee.name}</td><td>${employee.turno || ''}</td>`;
            for (let day = 1; day <= daysInMonth; day++) {
                const dateStr = `${year}-${month.padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                const record = this.getAttendanceRecord(employee.id, dateStr);
                const code = this.getPlanillaCode(record);
                html += `<td class="${code.colorClass}">${code.code}</td>`;
            }
            html += `</tr>`;
        });
        html += '</tbody>';
        container.innerHTML = html;

        // Actualizar título con el mes
        const planillaHeader = document.querySelector('.planilla-header h2');
        if (planillaHeader) {
            planillaHeader.textContent = `Planilla Mensual de Novedades - ${monthName}`;
        }
    }

    getPlanillaCode(record) {
        if (!record) return { code: '-', colorClass: 'planilla-sin-asignar' };
        
        const statusMap = {
            'sin-asignar': { code: '-', colorClass: 'planilla-sin-asignar' },
            'presente': { code: 'G', colorClass: 'planilla-G' },
            'ausente': { code: '28', colorClass: 'planilla-28' },
            'vacaciones': { code: 'V', colorClass: 'planilla-V' },
            'estres': { code: 'EST', colorClass: 'planilla-EST' },
            'cambio-guardia': { code: 'CG', colorClass: 'planilla-CG' },
            'llegada-tarde': { code: '28', colorClass: 'planilla-28' },
            'carpeta-medica': { code: 'CM', colorClass: 'planilla-CM' },
            'A26': { code: 'A26', colorClass: 'planilla-A26' }
        };
        return statusMap[record.status] || { code: '-', colorClass: 'planilla-sin-asignar' };
    }

    // Exportación de planilla
    async exportPlanillaExcel() {
        try {
            const plantillaInput = document.getElementById('plantillaExcel');
            if (!plantillaInput || !plantillaInput.files || plantillaInput.files.length === 0) {
                alert('Por favor selecciona la plantilla Excel antes de exportar.');
                plantillaInput?.focus();
                return;
            }
            const file = plantillaInput.files[0];
            const reader = new FileReader();
            reader.onload = async (e) => {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const ws = workbook.Sheets[sheetName];
                const monthInput = document.getElementById('planillaMonth');
                if (!monthInput || !monthInput.value) {
                    alert('Seleccione un mes para exportar');
                    return;
                }
                const [year, month] = monthInput.value.split('-');
                const daysInMonth = new Date(year, month, 0).getDate();
                // Encabezados: Personal, Turno, 1, 2, ..., n
                const headers = ['Personal', 'Turno'];
                for (let day = 1; day <= daysInMonth; day++) {
                    headers.push(day.toString());
                }
                // Escribir encabezados en la primera fila
                for (let col = 0; col < headers.length; col++) {
                    const cell = XLSX.utils.encode_cell({ r: 0, c: col });
                    ws[cell] = { t: 's', v: headers[col] };
                }
                // Escribir datos de empleados
                this.employees.forEach((employee, idx) => {
                    const row = [
                        employee.name,
                        (employee.turno === 'SADOFE' ? 'SADOFE' : (employee.turno || ''))
                    ];
                    for (let day = 1; day <= daysInMonth; day++) {
                        const dateStr = `${year}-${month.padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                        const record = this.getAttendanceRecord(employee.id, dateStr);
                        const code = this.getPlanillaCode(record);
                        row.push(code.code);
                    }
                    // Escribir fila en la hoja (idx+1 porque 0 es encabezado)
                    for (let col = 0; col < row.length; col++) {
                        const cell = XLSX.utils.encode_cell({ r: idx + 1, c: col });
                        ws[cell] = { t: 's', v: row[col] };
                    }
                });
                // Actualizar rango de la hoja
                ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: this.employees.length, c: headers.length - 1 } });
                // Descargar archivo
                XLSX.writeFile(workbook, `planilla-vigilancia-${year}-${month}.xlsx`);
                this.showFeedbackMessage('Planilla exportada correctamente.', 'success');
            };
            reader.readAsArrayBuffer(file);
        } catch (error) {
            console.error('Error al exportar a Excel:', error);
            this.showFeedbackMessage('Error al exportar a Excel.', 'error');
            alert('Error al exportar a Excel. Verifique su conexión a internet.');
        }
    }

    // Exportación de datos
    exportData() {
        const data = {
            employees: this.employees,
            attendance: this.attendance,
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `control-vigilancia-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.showFeedbackMessage('Datos exportados correctamente.', 'success');
    }

    exportReportToPDF(report) {
        // Implementación básica de PDF usando window.print()
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Reporte de Vigilancia</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        .header { text-align: center; margin-bottom: 30px; }
                        .summary { margin-bottom: 30px; }
                        .employee { margin-bottom: 20px; border-bottom: 1px solid #ccc; padding-bottom: 10px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Reporte de Control de Vigilancia</h1>
                        <p>Período: ${new Date(report.period.start).toLocaleDateString()} - ${new Date(report.period.end).toLocaleDateString()}</p>
                    </div>
                    <div class="summary">
                        <h2>Resumen General</h2>
                        <table>
                            <tr><th>Estado</th><th>Cantidad</th></tr>
                            ${(() => {
                                const shown = new Set();
                                return Object.entries(report.summary.byStatus)
                                    .filter(([status]) => status !== 'sin-asignar' && status !== 'no-registrado')
                                    .filter(([status]) => {
                                        if (status === 'carpeta_medica' || status === 'carpeta-medica') {
                                            if (shown.has('carpeta-medica')) return false;
                                            shown.add('carpeta-medica');
                                            return true;
                                        }
                                        if (status === 'A26') {
                                            if (shown.has('A26')) return false;
                                            shown.add('A26');
                                            return true;
                                        }
                                        if (shown.has(status)) return false;
                                        shown.add(status);
                                        return true;
                                    })
                                    .map(([status, count]) =>
                                        `<tr><td>${status === 'presente' ? 'Presente' : (status === 'A26' ? 'Artículo 26' : (status === 'carpeta_medica' || status === 'carpeta-medica' ? 'Carpeta Médica' : this.getStatusText(status)))}</td><td>${count}</td></tr>`
                                    ).join('');
                            })()}
                        </table>
                    </div>
                    <div class="details">
                        <h2>Detalle por Empleado</h2>
                        ${report.employees.map(employee => `
                            <div class="employee">
                                <h3>${employee.name} (${employee.position})</h3>
                                <table>
                                    <tr><th>Estado</th><th>Cantidad</th></tr>
                                    ${(() => {
                                        const shown = new Set();
                                        return Object.entries(employee.totals)
                                            .filter(([status, count]) => count > 0 && status !== 'no-registrado')
                                            .filter(([status]) => {
                                                if (status === 'carpeta_medica' || status === 'carpeta-medica') {
                                                    if (shown.has('carpeta-medica')) return false;
                                                    shown.add('carpeta-medica');
                                                    return true;
                                                }
                                                if (status === 'A26') {
                                                    if (shown.has('A26')) return false;
                                                    shown.add('A26');
                                                    return true;
                                                }
                                                if (shown.has(status)) return false;
                                                shown.add(status);
                                                return true;
                                            })
                                            .map(([status, count]) =>
                                                `<tr><td>${status === 'presente' ? 'Guardias realizadas' : (status === 'A26' ? 'Artículo 26' : (status === 'carpeta_medica' || status === 'carpeta-medica' ? 'Carpeta Médica' : this.getStatusText(status)))}</td><td>${count}</td></tr>`
                                            ).join('');
                                    })()}
                                </table>
                            </div>
                        `).join('')}
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }

    async exportPlanillaIMG() {
        try {
            if (typeof html2canvas === 'undefined') {
                await new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
                    script.onload = resolve;
                    script.onerror = reject;
                    document.head.appendChild(script);
                });
            }
            const monthInput = document.getElementById('planillaMonth');
            if (!monthInput || !monthInput.value) {
                alert('Seleccione un mes para exportar');
                return;
            }
            const [year, month] = monthInput.value.split('-');
            const monthName = new Date(year, month - 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
            // Solo exportar la tabla filtrada
            const tablaContainer = document.querySelector('.planilla-table-container');
            if (!tablaContainer) {
                alert('No se encontró la tabla de la planilla.');
                return;
            }
            const tabla = tablaContainer.querySelector('.planilla-table');
            if (tabla) {
                tabla.style.border = '1.5px solid #333';
                tabla.style.borderCollapse = 'collapse';
                tabla.querySelectorAll('th, td').forEach(cell => {
                    cell.style.border = '1.5px solid #333';
                });
            }
            const canvas = await html2canvas(tablaContainer, { scale: 2 });
            const link = document.createElement('a');
            link.download = `planilla-vigilancia-${monthName}.png`;
            link.href = canvas.toDataURL();
            link.click();
        } catch (error) {
            console.error('Error al exportar como imagen:', error);
            alert('Error al exportar como imagen. Verifique su conexión a internet.');
        }
    }

    // Almacenamiento local
    saveToStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error('Error al guardar en localStorage:', error);
        }
    }

    loadFromStorage(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error al cargar desde localStorage:', error);
            return null;
        }
    }

    // Lógica para el Libro de Novedades
    abrirLibroEmpleado(employeeId) {
        this.switchView('libro');
        // Seleccionar el año actual por defecto
        const year = document.getElementById('libroYear')?.value || (new Date().getFullYear().toString());
        this.selectedLibroEmpleadoId = employeeId;
        this.renderLibroEmpleadoSelector(employeeId);
        this.renderLibroHistorial(employeeId, year);
    }
    setupLibroView() {
        // Llenar años disponibles
        const yearSelect = document.getElementById('libroYear');
        if (yearSelect) {
            const years = [];
            const now = new Date();
            for(let y=now.getFullYear(); y>=now.getFullYear()-5; y--) years.push(y);
            yearSelect.innerHTML = years.map(y=>`<option value="${y}">${y}</option>`).join('');
        }
        // Buscar empleados
        const searchInput = document.getElementById('libroEmpleadoSearch');
        if (searchInput) searchInput.addEventListener('input', () => this.renderLibroEmpleadoSelector());
        if (yearSelect) yearSelect.addEventListener('change', () => this.renderLibroEmpleadoSelector());
        this.renderLibroEmpleadoSelector();
    }
    renderLibroEmpleadoSelector(selectedId) {
        const container = document.getElementById('libroEmpleadoSelector');
        const search = document.getElementById('libroEmpleadoSearch')?.value.trim().toLowerCase() || '';
        const year = document.getElementById('libroYear')?.value || (new Date().getFullYear().toString());
        let filtered = this.employees;
        if (search) {
            filtered = filtered.filter(emp => emp.name.toLowerCase().includes(search));
        }
        if (filtered.length === 0) {
            container.innerHTML = '<div class="summary-item">No hay empleados que coincidan.</div>';
            document.getElementById('libroHistorial').innerHTML = '';
            document.getElementById('libroResumen').innerHTML = '';
            return;
        }
        if (typeof this.selectedLibroEmpleadoId === 'undefined') this.selectedLibroEmpleadoId = null;
        container.innerHTML = filtered.map(emp =>
            `<button class="btn-primary btn-small" style="margin:0.2em 0.5em 0.2em 0;${this.selectedLibroEmpleadoId===emp.id?'background:#1976D2;color:#fff;':''}" onclick="app.toggleLibroEmpleado('${emp.id}', '${year}')">${emp.name}</button>`
        ).join('');
        // Si hay uno seleccionado, mostrar su historial
        if (this.selectedLibroEmpleadoId) this.renderLibroHistorial(this.selectedLibroEmpleadoId, year);
    }
    toggleLibroEmpleado(employeeId, year) {
        if (this.selectedLibroEmpleadoId === employeeId) {
            // Cerrar
            this.selectedLibroEmpleadoId = null;
            document.getElementById('libroHistorial').innerHTML = '';
            document.getElementById('libroResumen').innerHTML = '';
        } else {
            // Abrir
            this.selectedLibroEmpleadoId = employeeId;
            this.renderLibroEmpleadoSelector(employeeId);
        }
    }
    renderLibroHistorial(employeeId, year) {
        const historialDiv = document.getElementById('libroHistorial');
        const resumenDiv = document.getElementById('libroResumen');
        const empleado = this.employees.find(e=>e.id===employeeId);
        if (!empleado) {
            historialDiv.innerHTML = '<div class="summary-item">Empleado no encontrado.</div>';
            resumenDiv.innerHTML = '';
            return;
        }
        // Recolectar todas las novedades del año
        let rows = [];
        let totales = {};
        for(let m=1;m<=12;m++){
            const daysInMonth = new Date(year, m, 0).getDate();
            for(let d=1;d<=daysInMonth;d++){
                const dateStr = `${year}-${m.toString().padStart(2,'0')}-${d.toString().padStart(2,'0')}`;
                const rec = this.attendance[`${employeeId}_${dateStr}`];
                if(rec){
                    const status = rec.status;
                    totales[status] = (totales[status]||0)+1;
                    let obs = rec.observations||'';
                    if (status === 'cambio-guardia') {
                        let compName = '';
                        if (rec.companionId) {
                            const comp = this.employees.find(e=>e.id===rec.companionId);
                            compName = comp ? comp.name : '';
                        }
                        obs = `Tipo: ${rec.shiftChangeType==='con-companero'?'Con Compañero':'Solo'}` + (compName?`<br>Compañero: ${compName}`:'') + (rec.shiftChangeStart?`<br>Fecha cambio: ${rec.shiftChangeStart}`:'') + (rec.shiftChangeEnd?`<br>Fecha devolución: ${rec.shiftChangeEnd}`:'');
                    }
                    rows.push({
                        fecha: dateStr,
                        status: this.getStatusText(status),
                        observaciones: obs
                    });
                }
            }
        }
        if (rows.length === 0) {
            historialDiv.innerHTML = '<div class="summary-item">No hay novedades registradas para este año.</div>';
            resumenDiv.innerHTML = '';
            return;
        }
        // Tabla de historial
        let html = `<table style='width:100%;border-collapse:collapse;font-size:0.97em;'><thead><tr><th style='padding:0.3em 0.7em;'>Fecha</th><th style='padding:0.3em 0.7em;'>Estado</th><th style='padding:0.3em 0.7em;'>Observaciones</th></tr></thead><tbody>`;
        rows.forEach(r=>{
            html += `<tr><td style='padding:0.3em 0.7em;'>${r.fecha}</td><td style='padding:0.3em 0.7em;'>${r.status}</td><td style='padding:0.3em 0.7em;'>${r.observaciones}</td></tr>`;
        });
        html += '</tbody></table>';
        historialDiv.innerHTML = `<h4 style='margin-bottom:0.7em;'>${empleado.name} (${empleado.position||''})</h4>`+html;
        // Resumen
        let totalRegistros = rows.length;
        let resumenHtml = `<h4 style='margin-bottom:0.5em;'>Resumen anual</h4><ul style='padding-left:1.2em;'>`;
        Object.entries(totales).forEach(([status, count])=>{
            resumenHtml += `<li>${this.getStatusText(status)}: <b>${count}</b> (${Math.round((count/totalRegistros)*100)}%)</li>`;
        });
        resumenHtml += `</ul><div style='margin-top:1em;font-size:0.95em;color:#555;'>Total de novedades: <b>${totalRegistros}</b></div>`;
        resumenDiv.innerHTML = resumenHtml;
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Esperar un poco más para asegurar que todo esté cargado
    setTimeout(() => {
        try {
            // Verificar que los elementos principales existan antes de inicializar
            const mainContainer = document.querySelector('.app-container');
            if (!mainContainer) {
                console.error('❌ Error: No se encontró el contenedor principal .app-container');
                return;
            }
            
            window.app = new VigilanciaApp();
            console.log('✅ Aplicación inicializada correctamente');
        } catch (error) {
            console.error('❌ Error al inicializar la aplicación:', error);
            console.error('Stack trace:', error.stack);
        }
    }, 200);
});

// Registrar Service Worker para PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Verificar si estamos en un contexto válido para Service Workers
        if (window.location.protocol === 'file:') {
            console.log('⚠️ Service Worker no disponible: Abriendo desde archivo local');
            console.log('💡 Para usar todas las funciones, ejecuta el servidor Python y abre http://localhost:8080');
            return;
        }
        
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('✅ SW registrado: ', registration);
            })
            .catch(registrationError => {
                console.log('❌ SW registro falló: ', registrationError);
                // Mostrar mensaje amigable en la consola
                if (registrationError.message.includes('URL protocol')) {
                    console.log('💡 Para usar todas las funciones, ejecuta el servidor Python y abre http://localhost:8080');
                }
            });
    });
}