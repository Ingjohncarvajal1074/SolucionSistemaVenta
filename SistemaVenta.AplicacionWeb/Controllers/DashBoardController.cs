using Microsoft.AspNetCore.Mvc;

using SistemaVenta.AplicacionWeb.Models.ViewModels;
using SistemaVenta.AplicacionWeb.Utilidades.Response;
using SistemaVenta.BLL.Interfaces;

namespace SistemaVenta.AplicacionWeb.Controllers
{   

    public class DashBoardController : Controller
    {
        private readonly IDashBoardService _dashBoardServicio;
        public DashBoardController(IDashBoardService dashBoardServicio)
        {
            _dashBoardServicio = dashBoardServicio;
        }

        public IActionResult Index()
        {
            return View();
        }
        [HttpGet]
        public async Task<IActionResult> ObtenerResumen()
        {
            GenericResponse<VMDashBoard> gResponse = new GenericResponse<VMDashBoard>();
            try
            {
                VMDashBoard vMDashBoard = new VMDashBoard
                {
                    TotalVentas = await _dashBoardServicio.TotalVentasUltimaSemana(),
                    TotalIngresos = await _dashBoardServicio.TotalIngresosUltimaSemana(),
                    TotalProductos = await _dashBoardServicio.TotalProductos(),
                    TotalCategorias = await _dashBoardServicio.TotalCategorias(),                    
                };

                List<VMVentasSemana> listaVentasSemana = new List<VMVentasSemana>();
                List<VMProductosSemana> listaProductosSemana = new List<VMProductosSemana>();

                foreach (KeyValuePair<string, int> item in await _dashBoardServicio.VentasUltimaSemana())
                {
                    listaVentasSemana.Add(new VMVentasSemana
                    {
                        Fecha = item.Key,
                        Total = item.Value
                    });                    
                }

                foreach (KeyValuePair<string, int> item in await _dashBoardServicio.ProductosTopUltimaSemana())
                {
                    listaProductosSemana.Add(new VMProductosSemana
                    {
                        Producto = item.Key,
                        Cantidad = item.Value
                    });
                }

                vMDashBoard.VentasUltimaSemana = listaVentasSemana;
                vMDashBoard.ProductosTopUltimaSemana = listaProductosSemana;

                gResponse.Estado = true;
                gResponse.Objeto = vMDashBoard;
            }
            catch (Exception ex)
            {
                gResponse.Estado = false;
                gResponse.Mensaje = ex.Message;
            }
            return StatusCode(StatusCodes.Status200OK, gResponse);
        }
    }
}
