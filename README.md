[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/ujanwRJ4)
# driver

Aplicación **Driver** del [Proyecto IAW 2026](https://iaw-2026.github.io/proyecto/) — comisión `fixnow`.

Esta app corresponde al rol del conductor en el proyecto de tipo **A (Transporte)**.

# App de Profesional.

**https://driver-fixnow.vercel.app/**

Brinda toda la funcionalidad correspondiente al mismo, permitiendo la creación de su cuenta, notificandole de la creación de nuevas solicitudes de trabajo y permitiendole aceptarlas.
También le permite consultar por solicitudes de trabajo programadas para fechas futuras, así como acceder a su historial de trabajos y las reseñas que le dejaron sus clientes.

**Nota:** El trabajo simulado SIEMPRE tiene GAS como tipo de servicio, por lo que solo puede ser visto por un profesional con ese oficio


## **__Falta implementar:__**

### **Endpoints:**
    Cancelación de un request por parte del cliente dentro de /api/[job_id].
    Autenticación en los endpoints (tanto internos como expuestos).
    Discutir y agregar los endpoints necesarios para el flujo definidos en la etapa-1

### **Conexiones con otras APIs:** (Etapa 3)
    Hacer fetch de los trabajos realizados a Client App.
    Hacer fetch de los trabajos programados a Client App.
    Hacer fetch de las reseñas a Reviews App.
    Redirección al dashboard de Payments App para el historial de pagos.
    Notificar a Client App que un profesional acepto el trabajo.
    Notificar a Client App que un profesional canceló el trabajo.
    Notificar a Client App de la completación de un trabajo, actualizando el precio y descripción.
    Hacer que las notificaciones aparezcan cuando se llaman a los endpoints correspondientes.

### **Home:**
    Posibilidad de que un profesional cancele el trabajo luego de aceptarlo.
    Notificar a Client App en el caso anterior.
    Implementar filtro y búsqueda.

### **Historial:**
    Boton dentro de un trabajo que redireccione a la orden de pago del mismo.
    Implementar búsqueda y filtros en el historial.
    Adecuar los campos y variables a nombres más apropiados (ej: Servicio -> Descripción).

### **Trabajos Programados:**
    Implementar la funcionalidad para aceptar los trabajos programados.
    Implementar la funcionalidad de darse de baja de un trabajo programado.
    Notificar a Client App en el caso anterior.
    Implementar filtro y búsqueda.

### **Varios:**
    Refinar la notificación de trabajos en base a la posición y radio de los profesionales.
    Permitir que un profesional tenga más de un oficio.

---

Enunciado completo: <https://iaw-2026.github.io/proyecto/>
