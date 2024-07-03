//Declaracion de variables
const MODELO_BASE = {
    idUsuario: 0,
    nombre: "",
    correo: "",
    telefono: "",
    idRol: 0,
    esActivo: 1,
    urlFoto: ""
}
const $btnNuevo = d.getElementById("btnNuevo");
const $btnGuardar = d.getElementById("btnGuardar");
let tablaData = "", quitarEnfoque = "", filaSeleccionada = "";

//Carga del DOM
d.addEventListener("DOMContentLoaded", () => {
    F_getRolesAll();
    F_getUsuariosAll();    
})

//Funciones
async function F_getRolesAll() {
    try {
        const getRolesresponse = await fetch(urlGetRoles, {
            method: 'GET', // Reemplaza con el método HTTP deseado (GET, POST, PUT, DELETE)
            headers: {
                'Content-Type': 'application/json' // Indica el tipo de contenido del cuerpo de la petición
            },
        });
        if (getRolesresponse.ok) {
            const resRoles = await getRolesresponse.json(); // Convierte la respuesta JSON       
            if (resRoles.length > 0) {
                resRoles.forEach((item) => {
                    $("#cboRol").append(
                        $("<option>").val(item.idRol).text(item.descripcion)
                    )
                });
            }

        } else {
            throw new Error(`Error, ${getRolesresponse.status}`);
        }
    } catch (e) {

    }
}
async function F_getUsuariosAll() {
    try {
        const response = await fetch(urlGetUsuarios, {
            method: 'GET', // Reemplaza con el método HTTP deseado (GET, POST, PUT, DELETE)
            headers: {
                'Content-Type': 'application/json' // Indica el tipo de contenido del cuerpo de la petición
            },
        });
        if (response.ok) {
            const res = await response.json(); // Convierte la respuesta JSON       
            CargarTablaUser(res.data);

        } else {
            throw new Error(`Error, ${response.status}`);            
        }
    } catch (e) {
        console.error(`Error: Mensaje = ${e.message} ${e.status}`);
    }
}
async function CargarTablaUser(objParam) {
    if (objParam != null) {
    tablaData = $('#tbdata').DataTable({
            destroy: true,
            responsive: true,
            "data": objParam,
            "columns": [
                { "data": "idUsuario", "visible": false, "searchable": false },
                {
                    "data": "urlFoto", render: function (data) {
                        return `<img style="height:60px" src=${data} class="rounded mx-auto d-block"/>`;
                    }
                },
                { "data": "nombre" },
                { "data": "correo" },
                { "data": "telefono" },
                { "data": "nombreRol" },
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
                    filename: 'Reporte Usuarios',
                    exportOptions: {
                        columns: [2, 3, 4, 5, 6]
                    }
                }, 'pageLength'
            ],
            language: {
                url: "https://cdn.datatables.net/plug-ins/1.11.5/i18n/es-ES.json"
            },
        });
    }
   
}
async function MostrarModalUser(modelo = MODELO_BASE) {
    $("#txtId").val(modelo.idUsuario);
    $("#txtNombre").val(modelo.nombre);
    $("#txtCorreo").val(modelo.correo);
    $("#txtTelefono").val(modelo.telefono);
    $("#cboRol").val(modelo.idRol == 0 ? $("#cboRol option:first").val() : modelo.idRol);
    $("#cboEstado").val(modelo.esActivo);
    $("#txtFoto").val("");
    $("#imgUsuario").attr("src", modelo.urlFoto);

    $("#modalData").modal("show");
}

//Eventos
$btnNuevo.addEventListener("click", () => {    
    MostrarModalUser();
})
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
    modelo["idUsuario"] = $("#txtId").val(); 
    modelo["nombre"] = $("#txtNombre").val(); 
    modelo["correo"] = $("#txtCorreo").val(); 
    modelo["telefono"] = $("#txtTelefono").val(); 
    modelo["idRol"] = $("#cboRol").val(); 
    modelo["esActivo"] = $("#cboEstado").val();

    const inputFoto = d.getElementById("txtFoto");
    const formData = new FormData();
    formData.append("foto", inputFoto.files[0]);
    formData.append("modelo", JSON.stringify(modelo));

    $("#modalData").find("div.modal-content").LoadingOverlay("show");
    if (modelo.idUsuario == 0) {
        try {
            fetch(urlSaveUser, {
                method: 'POST', // Reemplaza con el método HTTP deseado (GET, POST, PUT, DELETE)
                body: formData
            })
                .then(response => {
                    $("#modalData").find("div.modal-content").LoadingOverlay("hide");
                    return response.ok ? response.json() : Promise.reject(response);
                })
                .then(responseJson => {
                    if (responseJson.estado) {
                        F_getUsuariosAll();
                        //tablaData.row.add(responseJson.Objeto).draw(false);
                        $("#modalData").modal("hide");
                        swal("Listo!", "El usuario fue creado", "success");
                    } else {
                        swal("Lo sentimos!", responseJson.mensaje, "error");
                    }
                })
        } catch (e) {
            console.error(`Error: Mensaje = ${e.message} ${e.status}`);
        }
       
    } else {
        try {
            fetch(urlEditUser, {
                method: 'PUT', // Reemplaza con el método HTTP deseado (GET, POST, PUT, DELETE)
                body: formData
            })
                .then(response => {
                    $("#modalData").find("div.modal-content").LoadingOverlay("hide");
                    return response.ok ? response.json() : Promise.reject(response);
                })
                .then(responseJson => {
                    if (responseJson.estado) {
                        F_getUsuariosAll();
                        //tablaData.row(filaSeleccionada).data(responseJson.objeto).draw(false);
                        filaSeleccionada = null;
                        $("#modalData").modal("hide");
                        swal("Listo!", "El usuario fue modificado", "success");
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
    MostrarModalUser(data);
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
        text: `Eliminar el usuario "${data.nombre}"`,
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
                    fetch(`${urlDeleteUser}?idUsuario=${data.idUsuario}`, {
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
                                swal("Listo!", "El usuario fue eliminado", "success");
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