const VISTA_BUSQUEDA = {
    busquedaFecha: () => {
        $("#txtFechaInicio").val("");
        $("#txtFechaFin").val("");
        $("#txtNumeroVenta").val("");

        $(".busqueda-fecha").show();
        $(".busqueda-venta").hide();
    }, busquedaVenta: () => {
        $("#txtNumeroVenta").val("");
        $("#txtFechaInicio").val("");
        $("#txtFechaFin").val("");

        $(".busqueda-fecha").hide();
        $(".busqueda-venta").show();
    }
}
$(document).ready(() => {
    VISTA_BUSQUEDA.busquedaFecha();
    $.datepicker.setDefaults($.datepicker.regional["es"]);
    $("#txtFechaInicio").datepicker({
        dateFormat: "dd/mm/yy"
    });
    $("#txtFechaFin").datepicker({
        dateFormat: "dd/mm/yy"
    });
});
$("#cboBuscarPor").change(() => {
    if ($("#cboBuscarPor").val() == "fecha") {
        VISTA_BUSQUEDA.busquedaFecha();
    } else {
        VISTA_BUSQUEDA.busquedaVenta();
    }
});
$("#btnBuscar").click(() => {
    if ($("#cboBuscarPor").val() == "fecha") {
        if ($("#txtFechaInicio").val().trim() == "" || $("#txtFechaFin").val().trim() == "") {
            toastr.warning("", "Debe ingresar fecha inicio y fecha fin")
            return;
        }
    } else {
        if ($("#txtNumeroVenta").val().trim() == "") {
            toastr.warning("", "Debe ingresar numero de venta")
            return;
        }
    }
    let numeroVenta = $("#txtNumeroVenta").val();
    let fechaInicio = $("#txtFechaInicio").val();
    let fechaFin = $("#txtFechaFin").val();

    $(".card-body").find("div.row").LoadingOverlay("show");
    F_getVentaDetalle(numeroVenta, fechaInicio, fechaFin);
   
});
async function F_getVentaDetalle(_numeroVenta, _fechaInicio, _fechaFin) {
    try {
        const response = await fetch(`${urlGetHistorialVenta}?numeroVenta=${_numeroVenta}&fechaInicio=${_fechaInicio}&fechaFin=${_fechaFin}`, {
            method: 'GET', // Reemplaza con el método HTTP deseado (GET, POST, PUT, DELETE)
            headers: {
                'Content-Type': 'application/json' // Indica el tipo de contenido del cuerpo de la petición
            },
        });
        $(".card-body").find("div.row").LoadingOverlay("hide");
        if (response.ok) {
            const res = await response.json(); // Convierte la respuesta JSON
            if (res.length > 0) {                
                $("#tbventa tbody").html("");
                res.forEach((venta) => {
                    $("#tbventa tbody").append(
                        $("<tr>").append(
                            $("<td>").text(venta.fechaRegistro),
                            $("<td>").text(venta.numeroVenta),
                            $("<td>").text(venta.tipoDocumentoVenta),
                            $("<td>").text(venta.documentoCliente),
                            $("<td>").text(venta.nombreCliente),
                            $("<td>").text(venta.total),
                            $("<td>").append(
                                $("<button>").addClass("btn btn-info btn-sm").append(
                                    $("<i>").addClass("fas fa-eye")
                                ).data("venta", venta)
                            )
                        )
                    )
                });

            } else {
                swal("Lo sentimos!", "Ocurrio un error", "error");
            }
        } else {
            throw new Error(`Error, ${response.status}`);
        }
    } catch (e) {
        console.log(e);
    }
}
$("#tbventa tbody").on("click", ".btn-info", function () {
    let d = $(this).data("venta");    

    $("#txtFechaRegistro").val(d.fechaRegistro);
    $("#txtNumVenta").val(d.numeroVenta);    
    $("#txtUsuarioRegistro").val(d.usuario);
    $("#txtTipoDocumento").val(d.tipoDocumentoVenta);
    $("#txtDocumentoCliente").val(d.documentoCliente);
    $("#txtNombreCliente").val(d.nombreCliente);    
    $("#txtSubTotal").val(d.subTotal);
    $("#txtIGV").val(d.impuestoTotal);
    $("#txtTotal").val(d.total);
        
    $("#tbProductos tbody").html("");
    d.detalleVenta.forEach((item) => {
        $("#tbProductos tbody").append(
            $("<tr>").append(
                $("<td>").text(item.descripcionProducto),                
                $("<td>").text(item.cantidad),                
                $("<td>").text(item.precio),
                $("<td>").text(item.total)
            )
        )
    });
    $("#linkImprimir").attr("href", `${urlImprimirVenta}?numeroVenta=${d.numeroVenta}`);
    $("#modalData").modal("show");
});