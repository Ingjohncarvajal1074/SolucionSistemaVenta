using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using System.Security.Claims;

namespace SistemaVenta.AplicacionWeb.Utilidades.ViewComponents
{
    public class MenuUsuarioViewComponent : ViewComponent
    {
        public async Task<IViewComponentResult> InvokeAsync()
        {
            ClaimsPrincipal claimUser = HttpContext.User;

            string urlFotoUsuario = "";
            string nombreUsuario = "";
            if (claimUser.Identity.IsAuthenticated)
            {
                nombreUsuario = claimUser.Claims.Where(c => c.Type == ClaimTypes.Name).Select(c => c.Value).FirstOrDefault();
                urlFotoUsuario = ((ClaimsIdentity)claimUser.Identity).FindFirst("UrlFoto").Value;
            }

            ViewData["UrlFotoUsuario"] = urlFotoUsuario;
            ViewData["NombreUsuario"] = nombreUsuario;

            return View();
        }
    }
}
