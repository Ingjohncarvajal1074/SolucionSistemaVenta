d.addEventListener("DOMContentLoaded", () => {
    $(".card-body").LoadingOverlay("show");
    F_getNegocioResponse();
})

async function F_getNegocioResponse() {
    try {
        const getNegocioResponse = await fetch(urlGetNegocio, {
            method: 'GET', // Reemplaza con el método HTTP deseado (GET, POST, PUT, DELETE)
            headers: {
                'Content-Type': 'application/json' // Indica el tipo de contenido del cuerpo de la petición
            },
        });
        $(".card-body").LoadingOverlay("hide");
        if (getNegocioResponse.ok) {
            $(".card-body").LoadingOverlay("hide");
            const resNe = await getNegocioResponse.json(); // Convierte la respuesta JSON       
            if (resNe.estado) {
                const objNe = resNe.objeto;                
                d.getElementById("txtNumeroDocumento").value = objNe.numeroDocumento;
                d.getElementById("txtRazonSocial").value = objNe.nombre;
                d.getElementById("txtCorreo").value = objNe.correo;
                d.getElementById("txtDireccion").value = objNe.direccion;
                d.getElementById("txTelefono").value = objNe.telefono;
                d.getElementById("txtImpuesto").value = objNe.porcentajeImpuesto;
                d.getElementById("txtSimboloMoneda").value = objNe.simboloMoneda;
                d.getElementById("imgLogo").setAttribute("src", objNe.urlLogo);

            } else {
                swal("Lo sentimos!", responseJson.mensaje, "error");
            }

        } else {
            throw new Error(`Error, ${getNegocioResponse.status}`);
        }
    } catch (e) {

    }
}
$("#btnGuardarCambios").click(function () {
    const inputs = $("input.input-validar").serializeArray();
    const inputsSinValor = inputs.filter((item) => item.value.trim() == "");
    if (inputsSinValor.length > 0) {
        const mensaje = `Debe completar el campo: </br>"${inputsSinValor[0].name}"`;
        toastr.error("", mensaje);
        $(`input[name="${inputsSinValor[0].name}"]`).focus();
        return;
    }
   
    const modelo = {
        numeroDocumento: d.getElementById("txtNumeroDocumento").value,
        nombre: d.getElementById("txtRazonSocial").value,
        correo: d.getElementById("txtCorreo").value,
        direccion: d.getElementById("txtDireccion").value,
        telefono: d.getElementById("txTelefono").value,
        porcentajeImpuesto: d.getElementById("txtImpuesto").value,
        simboloMoneda: d.getElementById("txtSimboloMoneda").value              
    }
    const inputLogo = d.getElementById("txtLogo");
    const formData = new FormData();
    formData.append("logo", inputLogo.files[0])
    formData.append("modelo", JSON.stringify(modelo))
    $(".card-body").LoadingOverlay("show");
    try {
        fetch(urlSaveNegocio, {
            method: 'POST', // Reemplaza con el método HTTP deseado (GET, POST, PUT, DELETE)
            body: formData
        })
            .then(response => {
                $(".card-body").LoadingOverlay("hide");
                return response.ok ? response.json() : Promise.reject(response);
            })
            .then(responseJson => {
                if (responseJson.estado) {
                    const objNe = responseJson.objeto;
                    d.getElementById("imgLogo").setAttribute("src", objNe.urlLogo);
                    //$("#modalData").modal("hide");
                    //swal("Listo!", "El usuario fue creado", "success");
                } else {
                    swal("Lo sentimos!", responseJson.mensaje, "error");
                }
            })
    } catch (e) {
        console.error(`Error: Mensaje = ${e.message} ${e.status}`);
    }
})