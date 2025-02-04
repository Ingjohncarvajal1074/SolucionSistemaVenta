const MODELO_BASE = {
    idProducto: 0,
    codigoBarra: "",
    marca: "",
    nombreCategoria: "",
    idCategoria: 0,
    descripcion: "",
    stock: 0,
    urlImagen: "",
    precio: "",
    esActivo: 1,
}
// Cadena de conexion "ConexionOracle": "User ID=USR_SGP; Password=Policia2016; Data Source=172.28.18.38:1521/TELEPOL_TEST; Max Pool Size=5000; PERSIST SECURITY INFO=True;"

d.addEventListener("DOMContentLoaded", () => {
    F_getCategorias();
    F_getProductos();
})
async function F_getCategorias() {
    try {
        const response = await fetch(urlGetCategorias, {
            method: 'GET', // Reemplaza con el método HTTP deseado (GET, POST, PUT, DELETE)
            headers: {
                'Content-Type': 'application/json' // Indica el tipo de contenido del cuerpo de la petición
            },
        });
        if (response.ok) {
            const resCategorias = await response.json(); // Convierte la respuesta JSON       
            if (resCategorias.data.length > 0) {
                resCategorias.data.forEach((item) => {
                    $("#cboCategoria").append(
                        $("<option>").val(item.idCategoria).text(item.descripcion)
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
async function F_getProductos() {
    try {
        const response = await fetch(urlGetProductos, {
            method: 'GET', // Reemplaza con el método HTTP deseado (GET, POST, PUT, DELETE)
            headers: {
                'Content-Type': 'application/json' // Indica el tipo de contenido del cuerpo de la petición
            },
        });
        if (response.ok) {
            const res = await response.json(); // Convierte la respuesta JSON       
            CargarTabla(res.data);

        } else {
            throw new Error(`Error, ${response.status}`);
        }
    } catch (e) {
        console.error(`Error: Mensaje = ${e.message} ${e.status}`);
    }
}
async function CargarTabla(objParam) {
    if (objParam != null) {
        tablaData = $('#tbdata').DataTable({
            destroy: true,
            responsive: true,
            "data": objParam,
            "columns": [
                { "data": "idProducto", "visible": false, "searchable": false },
                {
                    "data": "urlImagen", render: function (data) {
                        return `<img style="height:60px" src=${data} class="rounded mx-auto d-block"/>`;
                    }
                },
                { "data": "codigoBarra" },
                { "data": "marca" },
                { "data": "descripcion" },
                { "data": "nombreCategoria" },
                { "data": "stock" },                
                { "data": "precio" },                
                {
                    "data": "esActivo", render: function (data) {
                        if (data == 1)
                            return `<span class="badge badge-info">Activo</span>`;
                        else
                            return `<span class="badge badge-danger">No Activo</span>`;

                    }
                },
                {
                    "defaultContent": '<button class="btn btn-primary btn-editar btn-sm mr-2"><i class="fas fa-pencil-alt"></i></button>' +
                        '<button class="btn btn-danger btn-eliminar btn-sm"><i class="fas fa-trash-alt"></i></button>',
                    "orderable": false,
                    "searchable": false,
                    "width": "80px"
                }
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
                    filename: 'Reporte Productos',
                    exportOptions: {
                        columns: [2,3,4,5,6]
                    }
                }, 'pageLength'
            ],
            language: {
                url: "https://cdn.datatables.net/plug-ins/1.11.5/i18n/es-ES.json"
            },
        });
    }

}
async function MostrarModal(modelo = MODELO_BASE) {
    $("#txtId").val(modelo.idProducto);
    $("#txtCodigoBarra").val(modelo.codigoBarra);
    $("#txtMarca").val(modelo.marca);
    $("#txtDescripcion").val(modelo.descripcion);
    $("#cboCategoria").val(modelo.idCategoria == 0 ? $("#cboRol option:first").val() : modelo.idCategoria);
    $("#txtStock").val(modelo.stock);
    $("#txtPrecio").val(modelo.precio);
    $("#cboEstado").val(modelo.esActivo);
    $("#txtImagen").val("");
    $("#imgProducto").attr("src", modelo.urlImagen);

    $("#modalData").modal("show");

}
$("#btnNuevo").on("click", () => {   
    MostrarModal();
})
$("#btnGuardar").on("click", () => {
    const inputs = $("input.input-validar").serializeArray();
    const inputsSinValor = inputs.filter((item) => item.value.trim() == "");
    if (inputsSinValor.length > 0) {
        const mensaje = `Debe completar el campo: </br>"${inputsSinValor[0].name}"`;
        toastr.error("", mensaje);
        $(`input[name="${inputsSinValor[0].name}"]`).focus();
        return;
    }
        
    const modelo = structuredClone(MODELO_BASE);
    modelo["idProducto"] = $("#txtId").val();
    modelo["codigoBarra"] = $("#txtCodigoBarra").val();
    modelo["marca"] = $("#txtMarca").val();
    modelo["descripcion"] = $("#txtDescripcion").val();
    modelo["idCategoria"] = $("#cboCategoria").val();
    modelo["stock"] = $("#txtStock").val();
    modelo["precio"] = $("#txtPrecio").val();
    modelo["esActivo"] = $("#cboEstado").val();

    const inputFoto = d.getElementById("txtImagen");
    const formData = new FormData();
    formData.append("imagen", inputFoto.files[0]);
    formData.append("modelo", JSON.stringify(modelo));

    $("#modalData").find("div.modal-content").LoadingOverlay("show");
    if (modelo.idProducto == 0) {
        try {
            fetch(urlSaveProducto, {
                method: 'POST', // Reemplaza con el método HTTP deseado (GET, POST, PUT, DELETE)
                body: formData
            })
                .then(response => {
                    $("#modalData").find("div.modal-content").LoadingOverlay("hide");
                    return response.ok ? response.json() : Promise.reject(response);
                })
                .then(responseJson => {
                    if (responseJson.estado) {
                        F_getProductos();
                        //tablaData.row.add(responseJson.Objeto).draw(false);
                        $("#modalData").modal("hide");
                        swal("Listo!", "El producto fue creado", "success");
                    } else {
                        swal("Lo sentimos!", responseJson.mensaje, "error");
                    }
                })
        } catch (e) {
            console.error(`Error: Mensaje = ${e.message} ${e.status}`);
        }

    } else {
        try {
            fetch(urlEditProducto, {
                method: 'PUT', // Reemplaza con el método HTTP deseado (GET, POST, PUT, DELETE)
                body: formData
            })
                .then(response => {
                    $("#modalData").find("div.modal-content").LoadingOverlay("hide");
                    return response.ok ? response.json() : Promise.reject(response);
                })
                .then(responseJson => {
                    if (responseJson.estado) {
                        F_getProductos();
                        //tablaData.row(filaSeleccionada).data(responseJson.objeto).draw(false);
                        filaSeleccionada = null;
                        $("#modalData").modal("hide");
                        swal("Listo!", "El producto fue modificado", "success");
                    } else {
                        swal("Lo sentimos!", responseJson.mensaje, "error");
                    }
                })
        } catch (e) {
            console.error(`Error: Mensaje = ${e.message} ${e.status}`);
        }
    }

})

$("#tbdata tbody").on("click", ".btn-editar", function () {
    if ($(this).closest("tr").hasClass("child")) {
        filaSeleccionada = $(this).closest("tr").prev();
    } else {
        filaSeleccionada = $(this).closest("tr");
    }
    const data = tablaData.row(filaSeleccionada).data();
    MostrarModal(data);
})
$("#tbdata tbody").on("click", ".btn-eliminar", function () {
    let fila = "";
    if ($(this).closest("tr").hasClass("child")) {
        fila = $(this).closest("tr").prev();
    } else {
        fila = $(this).closest("tr");
    }
    const data = tablaData.row(fila).data();
    swal({
        title: "¿Estas seguro?",
        text: `Eliminar el producto "${data.descripcion}"`,
        type: "warning",
        showCancelButton: true,
        confirmButtonClass: "btn-danger",
        confirmButtonText: "Si, eliminar",
        cancelButtonText: "No, cancelar",
        closeOnConfirm: false,
        closeOnCancel: true,
    },
        function (respuesta) {
            if (respuesta) {
                $(".showSweetAlert").LoadingOverlay("show");
                try {
                    fetch(`${urlDeleteProducto}?IdProducto=${data.idProducto}`, {
                        method: 'DELETE', // Reemplaza con el método HTTP deseado (GET, POST, PUT, DELETE)                       
                    })
                        .then(response => {
                            $(".showSweetAlert").LoadingOverlay("hide");
                            return response.ok ? response.json() : Promise.reject(response);
                        })
                        .then(responseJson => {
                            if (responseJson.estado) {
                                //F_getUsuariosAll();
                                tablaData.row(fila).remove().draw();
                                swal("Listo!", "El producto fue eliminado", "success");
                            } else {
                                swal("Lo sentimos!", responseJson.mensaje, "error");
                            }
                        })
                } catch (e) {
                    console.error(`Error: Mensaje = ${e.message} ${e.status}`);
                }
            }
        }
    )
})