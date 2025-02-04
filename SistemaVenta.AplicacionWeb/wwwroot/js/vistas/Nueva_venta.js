let valorImpuesto = 0;
//Carga del DOM
d.addEventListener("DOMContentLoaded", () => {
    F_getTipoDocVenta();
    F_getNegocio();
    F_BuscarProducto();
})
async function F_getTipoDocVenta() {
    try {
        const response = await fetch(urlF_getTipoDocVenta, {
            method: 'GET', // Reemplaza con el método HTTP deseado (GET, POST, PUT, DELETE)
            headers: {
                'Content-Type': 'application/json' // Indica el tipo de contenido del cuerpo de la petición
            },
        });
        if (response.ok) {
            const res = await response.json(); // Convierte la respuesta JSON       
           
            if (res.length > 0) {
                res.forEach((item) => {
                    $("#cboTipoDocumentoVenta").append(
                        $("<option>").val(item.idTipoDocumentoVenta).text(item.descripcion)
                    )
                });
            }

        } else {
            throw new Error(`Error, ${response.status}`);
        }
    } catch (e) {
        console.error(`Error: Mensaje = ${e.message} ${e.status}`);
    }
}
async function F_getNegocio() {
    try {
        const response = await fetch(urlF_getNegocio, {
            method: 'GET', // Reemplaza con el método HTTP deseado (GET, POST, PUT, DELETE)
            headers: {
                'Content-Type': 'application/json' // Indica el tipo de contenido del cuerpo de la petición
            },
        });
        if (response.ok) {
            const res = await response.json(); // Convierte la respuesta JSON       

            if (res.estado) {
                const dor = res.objeto;                
                $("#inputGroupSubTotal").text(`Subtotal - ${dor.simboloMoneda}`);
                $("#inputGroupIGV").text(`Iva(${dor.porcentajeImpuesto}% - ${dor.simboloMoneda})`);
                $("#inputGroupTotal").text(`Total - ${dor.simboloMoneda}`);

                valorImpuesto = parseFloat(dor.porcentajeImpuesto);
            }

        } else {
            throw new Error(`Error, ${response.status}`);
        }
    } catch (e) {
        console.error(`Error: Mensaje = ${e.message} ${e.status}`);
    }
}
async function F_BuscarProducto() {
    try {
        $("#cboBuscarProducto").select2({
            ajax: {
                url: urlF_BuscarProducto,
                dataType: 'json',
                contentType: "application/json; charset=utf-8",
                delay: 250,
                data: function (params) {
                    return {
                        busqueda: params.term
                    };
                },
                processResults: function (data,) {                    
                    
                    return {
                        results: data.map((item) => (
                            {
                                id: item.idProducto,
                                text: item.descripcion,
                                marca: item.marca,
                                categoria: item.nombreCategoria,
                                urlImagen: item.urlImagen,
                                precio: parseFloat(item.precio),
                            }
                        ))                       
                    };
                }                
            },
            language: "es",
            placeholder: 'Buscar producto...',
            minimumInputLength: 1,
            templateResult: formatoResultados            
        });
    } catch (e) {
        console.error(`Error: Mensaje = ${e.message} ${e.status}`);
    }
}
function formatoResultados(data) {
    if (data.loading) {
        return data.text;
    }
    var contenedor = $(
        `<table width="100%">
        <tr>
            <td style="width: 60px;">
                <img src="${data.urlImagen}" alt="objeto" style="height: 60px;width: 60px;margin-right: 10px;">
            </td>
            <td>
                <p style="font-weight: bolder;margin: 2px;">${data.marca}</p>
                <p style="margin: 2px;">${data.text}</p>
            </td>
        </tr>
    </table>`
    );
    return contenedor;
}
$(document).on("select2:open", function () {
    document.querySelector(".select2-search__field").focus();
})
let productosParaVenta = [];
$("#cboBuscarProducto").on("select2:select", (e) => {
    const data = e.params.data;
    let productoEncontrado = productosParaVenta.filter((item) => item.idProducto === data.id);
    if (productoEncontrado.length > 0) {
        $("#cboBuscarProducto").val("").trigger("change");
        toastr.warning("Producto ya se encuentra en la lista", "Advertencia");
        return false;
    }

    swal({
        title: data.marca,
        text: data.text,
        imagenUrl: data.urlImagen,
        type: "input",
        showCancelButton: true,       
        closeOnConfirm: false,
        inputPlaceholder: "Ingrese Cantidad",
    },
        function (valor) {
            if (valor === false) return false;
            if (valor === "") {
                swal.showInputError("Debe ingresar una cantidad");
                return false
            }
            if (isNaN(valor)) {
                swal.showInputError("Debe ingresar un número");
                return false
            }
            if (parseInt(valor) <= 0) {
                swal.showInputError("Debe ingresar un número mayor a 0");
                return false
            }
            let producto = {
                idProducto: data.id.toString(),
                marca: data.marca,
                descripcionProducto: data.text,
                categoriaProducto: data.categoria,
                cantidad: valor.toString(),
                precio: data.precio.toString(),                
                total: (parseFloat(data.precio) * parseInt(valor)).toString()
            }

            productosParaVenta.push(producto);
            MostrarProductoPrecios();
            $("#cboBuscarProducto").val("").trigger("change");
            swal.close();
        }
    )
})
function MostrarProductoPrecios() {
    let total = 0, igv = 0, subTotal = 0, porcentaje = valorImpuesto / 100; //onclick="EliminarProducto(${item.idProducto})
    $("#tbProducto tbody").empty();
    productosParaVenta.forEach((item) => {
        let fila = `<tr>
         <td>
            <button id="${item.idProducto}" class="btn btn-danger btn-eliminar btn-sm">
                    <i class="fas fa-trash-alt"></i>
            </button>
         </td>
         <td>${item.descripcionProducto}</td>
         <td>${item.cantidad}</td>
         <td>${item.precio}</td>
         <td>${item.total}</td>
        </tr>`;
        $("#tbProducto tbody").append(fila);
        total += parseFloat(item.total);
    });
    subTotal = total / (1 + porcentaje);
    igv = total - subTotal;
    $("#txtSubTotal").val(subTotal.toFixed(2));
    $("#txtIGV").val(igv.toFixed(2));
    $("#txtTotal").val(total.toFixed(2));

}
$(document).on("click", "button .btn-eliminar", function () {
    const _idproducto = parseInt($(this).attr("id"));
    productosParaVenta = productosParaVenta.filter((item) => item.idProducto !== parseInt(_idproducto));
    MostrarProductoPrecios();
})
function TerminarVenta() {
    if (productosParaVenta.length < 1) {
        toastr.warning("Debe agregar productos a la venta", "Advertencia");
        return false;
    }
    const vmDetalleVenta = productosParaVenta;
    const venta = {
        idTipoDocumentoVenta: $("#cboTipoDocumentoVenta").val(),
        documentoCliente: $("#txtDocumentoCliente").val(),
        nombreCliente: $("#txtNombreCliente").val(),         
        subTotal: $("#txtSubTotal").val(),
        impuestoTotal: $("#txtIGV").val(),
        total: $("#txtTotal").val(),
        DetalleVenta: vmDetalleVenta
    }
    $("#btnTerminarVenta").LoadingOverlay("show");
    
    fetch(urlF_RegistrarVenta, {
        method: 'POST', // Reemplaza con el método HTTP deseado (GET, POST, PUT, DELETE)
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify(venta)
    })
        .then(response => response.json())
        .then(data => {
            if (data.estado) {
                //toastr.success(data.mensaje, "Éxito");
                swal("Registrado!", data.mensaje, "success")
                LimpiarFormulario();
                MostrarProductoPrecios();
            } else {
                swal("Lo sentimos!", data.mensaje, "error")
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        })
        .finally(() => {
            $("#btnTerminarVenta").LoadingOverlay("hide");
        });
}
function LimpiarFormulario() {
    $("#cboTipoDocumentoVenta").val("0");
    $("#txtDocumentoCliente").val("");
    $("#txtNombreCliente").val("");
    $("#txtSubTotal").val("0.00");
    $("#txtIGV").val("0.00");
    $("#txtTotal").val("0.00");
    $("#tbProducto tbody").empty();
    productosParaVenta = [];
}
