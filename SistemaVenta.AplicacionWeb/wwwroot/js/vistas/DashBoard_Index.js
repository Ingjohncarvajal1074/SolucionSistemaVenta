//Carga del DOM
d.addEventListener("DOMContentLoaded", () => {
    F_getTipoDocVenta();
})
async function F_getTipoDocVenta() {
    $("div.container-fluid").LoadingOverlay("show");
    try {
        const response = await fetch(urlObtenerResumen, {
            method: 'GET', // Reemplaza con el método HTTP deseado (GET, POST, PUT, DELETE)
            headers: {
                'Content-Type': 'application/json' // Indica el tipo de contenido del cuerpo de la petición
            },
        });
        if (response.ok) {
            $("div.container-fluid").LoadingOverlay("hide");
            const res = await response.json(); // Convierte la respuesta JSON       
            if (res.estado) {
                let r = res.objeto;
                $("#totalVenta").text(r.totalVentas);
                $("#totalIngresos").text(r.totalIngresos);
                $("#totalProductos").text(r.totalProductos);
                $("#totalCategorias").text(r.totalCategorias);

                //obtener textos y valores para nuestro grafico de barras
                let barchart_labels, barchart_data;

                if (r.ventasUltimaSemana.length > 0) {
                    barchart_labels = r.ventasUltimaSemana.map((item) => { return item.fecha });
                    barchart_data = r.ventasUltimaSemana.map((item) => { return item.total });
                } else {
                    barchart_labels = ["sin resultados"];
                    barchart_data = [0];
                }
                //obtener textos y valores para nuestro grafico de pie
                let piechart_labels, piechart_data;

                if (r.productosTopUltimaSemana.length > 0) {
                    piechart_labels = r.productosTopUltimaSemana.map((item) => { return item.producto });
                    piechart_data = r.productosTopUltimaSemana.map((item) => { return item.cantidad });
                } else {
                    piechart_labels = ["sin resultados"];
                    piechart_data = [0];
                }
                // Bar Chart Example
                let controlVenta = document.getElementById("charVentas");
                let myBarChart = new Chart(controlVenta, {
                    type: 'bar',
                    data: {
                        labels: barchart_labels,
                        datasets: [{
                            label: "Cantidad",
                            backgroundColor: "#4e73df",
                            hoverBackgroundColor: "#2e59d9",
                            borderColor: "#4e73df",
                            data: barchart_data,
                        }],
                    },
                    options: {
                        maintainAspectRatio: false,
                        legend: {
                            display: false
                        },
                        scales: {
                            xAxes: [{
                                gridLines: {
                                    display: false,
                                    drawBorder: false
                                },
                                maxBarThickness: 50,
                            }],
                            yAxes: [{
                                ticks: {
                                    min: 0,
                                    maxTicksLimit: 5
                                }
                            }],
                        },
                    }
                });
                // Pie Chart Example
                let controlProducto = document.getElementById("charProductos");
                let myPieChart = new Chart(controlProducto, {
                    type: 'doughnut',
                    data: {
                        labels: piechart_labels,
                        datasets: [{
                            data: piechart_data,
                            backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc', "#FF785B"],
                            hoverBackgroundColor: ['#2e59d9', '#17a673', '#2c9faf', "#FF5733"],
                            hoverBorderColor: "rgba(234, 236, 244, 1)",
                        }],
                    },
                    options: {
                        maintainAspectRatio: false,
                        tooltips: {
                            backgroundColor: "rgb(255,255,255)",
                            bodyFontColor: "#858796",
                            borderColor: '#dddfeb',
                            borderWidth: 1,
                            xPadding: 15,
                            yPadding: 15,
                            displayColors: false,
                            caretPadding: 10,
                        },
                        legend: {
                            display: true
                        },
                        cutoutPercentage: 80,
                    },
                });



            } else {
                console.log("error");
            }
          

        } else {
            $("div.container-fluid").LoadingOverlay("hide");
            throw new Error(`Error, ${response.status}`);
        }
    } catch (e) {
        $("div.container-fluid").LoadingOverlay("hide");
        console.error(`Error: Mensaje = ${e.message} ${e.status}`);
    }
}