using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using SistemaVenta.BLL.Interfaces;
using SistemaVenta.AplicacionWeb.Models.ViewModels;

namespace SistemaVenta.AplicacionWeb.Utilidades.ViewComponents
{
    public class MenuViewComponent: ViewComponent
    {
        private readonly IMenuService _menuServicio;
        private readonly IMapper _mapper;
        public MenuViewComponent(IMenuService menuService, IMapper mapper)
        {
            _menuServicio = menuService;
            _mapper = mapper;
        }
        public async Task<IViewComponentResult> InvokeAsync()
        {
            ClaimsPrincipal claimUser = HttpContext.User;
            List<VMMenu> listaMenus = new List<VMMenu>();

            if (claimUser.Identity.IsAuthenticated)
            {
                string idUsuario = claimUser.Claims.Where(c => c.Type == ClaimTypes.NameIdentifier).Select(c => c.Value).FirstOrDefault();
                listaMenus = _mapper.Map<List<VMMenu>>(await _menuServicio.ObtenerMenus(int.Parse(idUsuario)));
            }else
            {
                listaMenus = new List<VMMenu>();
            }
            return View(listaMenus);
        }

    }
}
