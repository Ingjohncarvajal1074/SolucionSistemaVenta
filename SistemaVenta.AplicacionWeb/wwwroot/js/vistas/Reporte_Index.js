
let $btnBuscar = d.getElementById("btnBuscar");

$btnBuscar.addEventListener("click", async () => {
    // Validaciones de fecha
    if ($("#txtFechaInicio").val().trim() == "" || $("#txtFechaFin").val().trim() == "") {
        toastr.warning("", "Debe ingresar fecha inicio y fecha fin");
        return;
    }

    // Validación adicional para asegurar que fecha inicio sea menor que fecha fin
    var fechaInicio = $("#txtFechaInicio").datepicker('getDate');
    var fechaFin = $("#txtFechaFin").datepicker('getDate');

    if (fechaInicio && fechaFin && fechaInicio >= fechaFin) {
        toastr.error("", "La fecha inicio debe ser anterior a la fecha fin");
        return;
    }

    try {
        // Mostrar loading overlay
        $(".card-body").find("div.row").LoadingOverlay("show");

        // Obtener valores de las fechas en formato string
        const fechaInicioStr = $("#txtFechaInicio").val().trim();
        const fechaFinStr = $("#txtFechaFin").val().trim();

        // Llamar a la función para obtener los datos
        await F_getVentasFechas(fechaInicioStr, fechaFinStr);

        toastr.success("", "Reporte generado exitosamente");

    } catch (error) {
        console.error('Error al buscar:', error);
        toastr.error("", "Error al generar el reporte");
    }
});

d.addEventListener("DOMContentLoaded", () => {
    // Código a ejecutar cuando el DOM esté completamente cargado
    $.datepicker.setDefaults($.datepicker.regional["es"]);
    $("#txtFechaInicio").datepicker({
        dateFormat: "dd/mm/yy",
        onSelect: function(selectedDate) {
            // Establece la fecha mínima del datepicker de fecha fin
            var fechaInicio = $(this).datepicker('getDate');
            if (fechaInicio) {
                // Agregar un día a la fecha de inicio para evitar que sean iguales
                var fechaMinimaFin = new Date(fechaInicio.getTime() + (24 * 60 * 60 * 1000));
                $("#txtFechaFin").datepicker("option", "minDate", fechaMinimaFin);
                
                // Validar si la fecha fin actual es menor que la nueva fecha inicio
                var fechaFinActual = $("#txtFechaFin").datepicker('getDate');
                if (fechaFinActual && fechaFinActual <= fechaInicio) {
                    $("#txtFechaFin").val('');
                    toastr.info("", "Por favor, seleccione una nueva fecha fin que sea posterior a la fecha inicio");
                }
            }
        }
    });
    
    $("#txtFechaFin").datepicker({
        dateFormat: "dd/mm/yy",
        onSelect: function(selectedDate) {
            // Establece la fecha máxima del datepicker de fecha inicio
            var fechaFin = $(this).datepicker('getDate');
            if (fechaFin) {
                // Restar un día a la fecha de fin para evitar que sean iguales
                var fechaMaximaInicio = new Date(fechaFin.getTime() - (24 * 60 * 60 * 1000));
                $("#txtFechaInicio").datepicker("option", "maxDate", fechaMaximaInicio);
            }
        }
    });
});

async function F_getVentasFechas(fechaInicio, fechaFin) {
    try {
        // Construir la URL con los parámetros de fecha
        const url = `${urlF_getVentasFechas}?fechaInicio=${encodeURIComponent(fechaInicio)}&fechaFin=${encodeURIComponent(fechaFin)}`;

        const getResponse = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });

        if (getResponse.ok) {
            const res = await getResponse.json();
            CargarTbVentas(res.data);
        } else {
            throw new Error(`Error del servidor: ${getResponse.status}`);
        }
    } catch (e) {
        console.error('Error en la petición:', e);
        toastr.error("", `Error al obtener los datos: ${e.message}`);
        throw new Error(`Error: ${e}`);
    } finally {
        // Ocultar loading overlay
        $(".card-body").find("div.row").LoadingOverlay("hide");
    }
}

async function CargarTbVentas(objParam) {
    if (objParam != null) {
        tablaData = $('#tbdata').DataTable({
            destroy: true,
            responsive: true,
            "data": objParam,
            "columns": [              
                { "data": "fechaRegistro" },
                { "data": "numeroVenta" },
                { "data": "tipoDocumento" },
                { "data": "documentoCliente" },
                { "data": "nombreCliente" },
                { "data": "subTotalVenta" },
                { "data": "impuestoTotalVenta" },
                { "data": "totalVenta" },
                { "data": "producto" },
                { "data": "cantidad" },
                { "data": "precio" },
                { "data": "total" },       
            ],
            error: function (xhr, error, thrown) {
                console.error('Error loading data:', error);
            },
            order: [[0, "desc"]],
            dom: "Bfrtip",
            buttons: [
                {
                    text: 'Exportar Excel',
                    extend: 'excelHtml5',
                    title: '',
                    filename: 'Reporte Ventas',                   
                }, 'pageLength'
            ],
            language: {
                url: "https://cdn.datatables.net/plug-ins/1.11.5/i18n/es-ES.json"
            },
        });
    }
}