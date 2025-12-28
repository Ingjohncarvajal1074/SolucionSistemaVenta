let $btnGuardar = d.getElementById("btnGuardarCambios");
let $btnCambiarClave = d.getElementById("btnCambiarClave");
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
            $("#txtTelefono").val(r.telefono);
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
    let telefono = d.getElementById("txtTelefono");
    let mensaje = "campo vacio";
    if (correo.value.trim() == "") {
        toastr.warning("", mensaje);
        correo.focus();
    }
    if (telefono.value.trim() == "") {
        toastr.warning("", mensaje);
        telefono.focus();
    }

    swal({
        title: "¿Desea guardar los cambios3?",       
        type: "warning",
        showCancelButton: true,
        confirmButtonClass: "btn-primary",
        confirmButtonText: "Si",
        cancelButtonText: "No",
        closeOnConfirm: false,
        closeOnCancel: true,
    },
        function (respuesta) {
            if (respuesta) {
                $(".showSweetAlert").LoadingOverlay("show");

                const modelo = {
                    correo : $("#txtCorreo").val().trim(),
                    telefono : $("#txtTelefono").val().trim()
                }

                try {
                    fetch(urlInsPerfil, {
                        method: 'POST', // Reemplaza con el método HTTP deseado (GET, POST, PUT, DELETE)
                        headers: { "Content-Type": "application/json; charset=utf-8" },
                        body: JSON.stringify(modelo)
                    })
                        .then(response => {
                            $(".showSweetAlert").LoadingOverlay("hide");
                            return response.ok ? response.json() : Promise.reject(response);
                        })
                        .then(responseJson => {
                            if (responseJson.estado) {                                
                                swal("Listo!", "Los cambios fueron guardados", "success");
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

$btnCambiarClave.addEventListener("click", () => {
    const inputs = $("input.input-validar").serializeArray();
    const inputsSinValor = inputs.filter((item) => item.value.trim() == "");
    if (inputsSinValor.length > 0) {
        const mensaje = `Debe completar el campo: </br>"${inputsSinValor[0].name}"`;
        toastr.error("", mensaje);
        $(`input[name="${inputsSinValor[0].name}"]`).focus();
        return;
    }
    if ($("#txtClaveNueva").val().trim() != $("#txtConfirmarClave").val().trim()) {       
        toastr.warning("", "Las contraseñas no coinciden");
        return;
    }
    let modelo = {
        claveActual: $("#txtClaveActual").val().trim(),
        claveNueva: $("#txtClaveNueva").val().trim()
    }
    try {
        fetch(urlUpdClave, {
            method: 'POST', // Reemplaza con el método HTTP deseado (GET, POST, PUT, DELETE)
            headers: { "Content-Type": "application/json; charset=utf-8" },
            body: JSON.stringify(modelo)
        })
            .then(response => {
                $(".showSweetAlert").LoadingOverlay("hide");
                return response.ok ? response.json() : Promise.reject(response);
            })
            .then(responseJson => {
                if (responseJson.estado) {
                    swal("Listo!", "Su contraseña fue actualizada", "success");
                    const inputs = $("input.input-validar").serializeArray();
                    inputs.forEach(item => {
                        $(`input[name="${item.name}"]`).val("");
                    });
                } else {
                    swal("Lo sentimos!", responseJson.mensaje, "error");
                }
            })
    } catch (e) {
        console.error(`Error: Mensaje = ${e.message} ${e.status}`);
    }
})