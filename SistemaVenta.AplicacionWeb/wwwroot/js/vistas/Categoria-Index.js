const MODELO_BASE = {
    idCategoria: 0,
    descripcion: "",
    esActivo: 1
}
const $btnNuevo = d.getElementById("btnNuevo");
const $btnGuardar = d.getElementById("btnGuardar");

//Carga del DOM
d.addEventListener("DOMContentLoaded", () => {
    F_getCategoriasAll();
})
async function F_getCategoriasAll() {
    try {
        const getCatResponse = await fetch(urlGetCategorias, {
            method: 'GET', // Reemplaza con el método HTTP deseado (GET, POST, PUT, DELETE)
            headers: {
                'Content-Type': 'application/json' // Indica el tipo de contenido del cuerpo de la petición
            },
        });
        if (getCatResponse.ok) {            
            const res = await getCatResponse.json(); // Convierte la respuesta JSON       
            CargarTablaCategoria(res.data);
        } else {
            throw new Error(`Error, ${getCatResponse.status}`);
        }
    } catch (e) {
        throw new Error(`Error, ${e}`);
    }
}
async function CargarTablaCategoria(objParam) {
    if (objParam != null) {
        tablaData = $('#tbdata').DataTable({
            destroy: true,
            responsive: true,
            "data": objParam,
            "columns": [
                { "data": "idCategoria", "visible": false, "searchable": false },               
                { "data": "descripcion" },               
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
                    filename: 'Reporte Categorias',
                    exportOptions: {
                        columns: [1, 2]
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
    $("#txtId").val(modelo.idCategoria);
    $("#txtDescripcion").val(modelo.descripcion);    
    $("#cboEstado").val(modelo.esActivo);   

    $("#modalData").modal("show");
}
$btnNuevo.addEventListener("click", (e) => {
    MostrarModal();
});
$btnGuardar.addEventListener("click", () => {

    const inputs = $("input.input-validar").serializeArray();
    const inputsSinValor = inputs.filter((item) => item.value.trim() == "");
    if (inputsSinValor.length > 0) {
        const mensaje = `Debe completar el campo: </br>"${inputsSinValor[0].name}"`;
        toastr.error("", mensaje);
        $(`input[name="${inputsSinValor[0].name}"]`).focus();
        return;
    }

    const modelo = structuredClone(MODELO_BASE);
    modelo["idCategoria"] = $("#txtId").val();
    modelo["descripcion"] = $("#txtDescripcion").val();   
    modelo["esActivo"] = $("#cboEstado").val();

    $("#modalData").find("div.modal-content").LoadingOverlay("show");
    if (modelo.idCategoria == 0) {
        try {
            fetch(urlSaveCategoria, {
                method: 'POST', // Reemplaza con el método HTTP deseado (GET, POST, PUT, DELETE)
                headers: {"Content-Type":"application/json; charset=utf-8"},
                body: JSON.stringify(modelo)
            })
                .then(response => {
                    $("#modalData").find("div.modal-content").LoadingOverlay("hide");
                    return response.ok ? response.json() : Promise.reject(response);
                })
                .then(responseJson => {
                    if (responseJson.estado) {
                        F_getCategoriasAll();                        
                        $("#modalData").modal("hide");
                        swal("Listo!", "La categoria fue creada", "success");
                    } else {
                        swal("Lo sentimos!", responseJson.mensaje, "error");
                    }
                })
        } catch (e) {
            console.error(`Error: Mensaje = ${e.message} ${e.status}`);
        }

    } else {
        try {
            fetch(urlEditCategoria, {
                method: 'PUT', // Reemplaza con el método HTTP deseado (GET, POST, PUT, DELETE)
                headers: { "Content-Type": "application/json; charset=utf-8" },
                body: JSON.stringify(modelo)
            })
                .then(response => {
                    $("#modalData").find("div.modal-content").LoadingOverlay("hide");
                    return response.ok ? response.json() : Promise.reject(response);
                })
                .then(responseJson => {
                    if (responseJson.estado) {
                        F_getCategoriasAll(); 
                        //tablaData.row(filaSeleccionada).data(responseJson.objeto).draw(false);
                        filaSeleccionada = null;
                        $("#modalData").modal("hide");
                        swal("Listo!", "La categoria fue modificada", "success");
                    } else {
                        swal("Lo sentimos!", responseJson.mensaje, "error");
                    }
                })
        } catch (e) {
            console.error(`Error: Mensaje = ${e.message} ${e.status}`);
        }
    }

})
let filaSeleccionada = "";
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
        text: `Eliminar la categoria "${data.descripcion}"`,
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
                    fetch(`${urlDeleteCategoria}?idCategoria=${data.idCategoria}`, {
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
                                swal("Listo!", "La categoria fue eliminada", "success");
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