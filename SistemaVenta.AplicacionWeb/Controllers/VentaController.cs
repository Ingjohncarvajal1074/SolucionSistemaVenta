using Microsoft.AspNetCore.Mvc;

using AutoMapper;
using SistemaVenta.AplicacionWeb.Models.ViewModels;
using SistemaVenta.AplicacionWeb.Utilidades.Response;
using SistemaVenta.BLL.Interfaces;
using SistemaVenta.Entity;

using DinkToPdf;
using DinkToPdf.Contracts;

namespace SistemaVenta.AplicacionWeb.Controllers
{
    public class VentaController : Controller
    {
        private readonly ITipoDocumentoVentaService _tipoDocumentoVentaServicio;
        private readonly IVentaService _ventaServicio;
        private readonly IMapper _mapper;
        private readonly IConverter _converter;

        public VentaController(ITipoDocumentoVentaService tipoDocumentoVentaServicio, IVentaService ventaServicio, IMapper mapper, IConverter converter)
        {
            _tipoDocumentoVentaServicio = tipoDocumentoVentaServicio;
            _ventaServicio = ventaServicio;
            _mapper = mapper;
            _converter = converter;
        }


        public IActionResult NuevaVenta()
        {
            return View();
        }

        public IActionResult HistorialVenta()
        {
            return View();
        }
        [HttpGet]
        public async Task<IActionResult> ListaTipoDocumentoVenta()
        {
            List<VMTipoDocumentoVenta> vmListaTipoDocumentos = _mapper.Map<List<VMTipoDocumentoVenta>>(await _tipoDocumentoVentaServicio.Lista());
            return StatusCode(StatusCodes.Status200OK, vmListaTipoDocumentos);
        }
        [HttpGet]
        public async Task<IActionResult> ObtenerProductos(string busqueda)
        {
            List<VMProducto> vmListaProductos = _mapper.Map<List<VMProducto>>(await _ventaServicio.ObtenerProductos(busqueda));
            return StatusCode(StatusCodes.Status200OK, vmListaProductos);
        }
        [HttpPost]
        public async Task<IActionResult> RegistrarVenta([FromBody]VMVenta modelo)
        {
            GenericResponse<VMVenta> gResponse = new GenericResponse<VMVenta>();

            try
            {
                modelo.IdUsuario = 1;
                modelo.FechaRegistro = DateTime.Now.ToString();
                Venta ventaCreada = await _ventaServicio.Registrar(_mapper.Map<Venta>(modelo));
                modelo = _mapper.Map<VMVenta>(ventaCreada);

                gResponse.Estado = true;
                gResponse.Objeto = modelo;
                gResponse.Mensaje = $"Numero de Venta: {modelo.NumeroVenta}";

            }
            catch (Exception ex)
            {
                gResponse.Estado = false;
                gResponse.Mensaje = ex.Message;
            }

            
            return StatusCode(StatusCodes.Status200OK, gResponse);
        }
        [HttpGet]
        public async Task<IActionResult> Historial(string numeroVenta, string fechaInicio, string fechaFin)
        {
            try
            {
                List<VMVenta> vmHistorialVenta = _mapper.Map<List<VMVenta>>(await _ventaServicio.Historial(numeroVenta, fechaInicio, fechaFin));
                return StatusCode(StatusCodes.Status200OK, vmHistorialVenta);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status404NotFound, "error");               
            }
           
        }
        public IActionResult MostrarPDFVenta(string numeroVenta)
        {
            //Esto es para obtener la url de nuestra plantilla de la vista
            string urlPlantillaVista = $"{this.Request.Scheme}://{this.Request.Host}/Plantilla/PDFVenta?numeroVenta={numeroVenta}";
            
            var client = new HttpClient();
            var html = client.GetStringAsync(urlPlantillaVista);
            
            var pdf = new HtmlToPdfDocument()
            {
                GlobalSettings = new GlobalSettings() {                   
                    PaperSize = PaperKind.Letter,
                    Orientation = Orientation.Portrait,

                },
                Objects = {
                    new ObjectSettings()
                    {
                        
                        HtmlContent = html.Result,
                        WebSettings = new WebSettings
                        {
                            DefaultEncoding = "utf-8",
                        },
                    }
                }
            };
            var archivoPDF = _converter.Convert(pdf);

            if (archivoPDF == null || archivoPDF.Length == 0)
            {
                return StatusCode(500, "Error al generar el PDF");
            }
            else
            {
                return File(archivoPDF, "application/pdf");
            }

           
            
        }
    }
}
