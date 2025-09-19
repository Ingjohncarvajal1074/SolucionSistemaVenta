let $btnGuardar = d.getElementById("btnGuardarCambios");
d.addEventListener("DOMContentLoaded", () => {
    $(".container-fluid").LoadingOverlay("show");
    F_getUsuario();
})
async function F_getUsuario() {
    try {
        const response = await fetch(urlGetUsuario, {
            method: 'GET', // Reemplaza con el método HTTP deseado (GET, POST, PUT, DELETE)
            headers: {
                'Content-Type': 'application/json' // Indica el tipo de contenido del cuerpo de la petición
            },
        });
        if (response.ok) {
            $(".container-fluid").LoadingOverlay("hide");
            const res = await response.json(); // Convierte la respuesta JSON
            const r = res.objeto;
            $("#imgFoto").attr("src", r.urlFoto);
            $("#txtNombre").val(r.nombre);
            $("#txtCorreo").val(r.correo);
            $("#txTelefono").val(r.telefono);
            $("#txtRol").val(r.nombreRol);

            

        } else {
            $(".container-fluid").LoadingOverlay("hide");
            throw new Error(`Error, ${response.status}`);
        }
    } catch (e) {
        $(".container-fluid").LoadingOverlay("hide");
        console.error(`Error: Mensaje = ${e.message} ${e.status}`);
    }
}
$btnGuardar.addEventListener("click", () => {

    let correo = d.getElementById("txtCorreo");
    let telefono = d.getElementById("txTelefono");
    let mensaje = "campo vacio";
    if (correo.value.trim() == "") {
        toastr.warning("", mensaje);
        correo.focus();
    }
    if (telefono.value.trim() == "") {
        toastr.warning("", mensaje);
        telefono.focus();
    }


    /*
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
    }*/

})