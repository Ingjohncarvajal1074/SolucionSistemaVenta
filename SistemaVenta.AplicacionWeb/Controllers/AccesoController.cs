using Microsoft.AspNetCore.Mvc;

using SistemaVenta.AplicacionWeb.Models.ViewModels;
using SistemaVenta.BLL.Interfaces;
using SistemaVenta.Entity;

using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;


namespace SistemaVenta.AplicacionWeb.Controllers
{
    public class AccesoController : Controller
    {
        private readonly IUsuarioService _usuarioServicio;

        public AccesoController(IUsuarioService usuarioServicio)
        {
            _usuarioServicio = usuarioServicio;
        }

        public IActionResult Login()
        {
            ClaimsPrincipal claimUser = HttpContext.User;
            if (claimUser.Identity.IsAuthenticated)
            {
                return RedirectToAction("Index", "Home");
            }
            return View();
        }
        [HttpPost]
        public async Task<IActionResult> Login(VMUsuarioLogin modelo)
        {
            if (string.IsNullOrWhiteSpace(modelo.Correo) || string.IsNullOrWhiteSpace(modelo.Clave))
            {
                ModelState.AddModelError(string.Empty, "El correo y la clave son obligatorios.");
                return View(modelo);
            }

            Usuario usuario_encontrado = await _usuarioServicio.ObtenerPorCredenciales(modelo.Correo, modelo.Clave);
            if (usuario_encontrado == null)
            {
                ViewData["Mensaje"] = "Consulte al administrador problemas con su Usuario o contraseña";
                return View();  
            }
            ViewData["Mensaje"] = null;

            List<Claim> claims = new List<Claim>()
            {
                new Claim(ClaimTypes.Name, usuario_encontrado.Nombre ?? string.Empty),
                new Claim(ClaimTypes.NameIdentifier, usuario_encontrado.IdUsuario.ToString()),
                new Claim(ClaimTypes.Role, usuario_encontrado.IdRol.ToString()),
                new Claim("UrlFoto", usuario_encontrado.UrlFoto),
            };

            ClaimsIdentity claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);

            AuthenticationProperties properties = new AuthenticationProperties()
            {
                AllowRefresh = true,
                IsPersistent = modelo.MantenerSesion,
            };

            await HttpContext.SignInAsync(
                CookieAuthenticationDefaults.AuthenticationScheme,
                new ClaimsPrincipal(claimsIdentity),
                properties
                );


            return RedirectToAction("Index", "Home");
        }
        public IActionResult RestablecerClave()
        {
            
            return View();
        }
        [HttpPost]
        public async Task<IActionResult> RestablecerClave(VMUsuarioLogin modelo)
        {
            try
            {
                string urlPlantillaCorreo = $"{this.Request.Scheme}://{this.Request.Host}/Plantilla/RestablecerClave?clave=[clave]";
                bool resultado = await _usuarioServicio.RestablecerClave(modelo.Correo, urlPlantillaCorreo);

                if (resultado)
                {
                    ViewData["Mensaje"] = "Listo su contraseña fue restablecida. Revise su correo";
                    ViewData["MensajeError"] = null;

                }
                else
                {
                    ViewData["Mensaje"] = null;
                    ViewData["MensajeError"] = "No se pudo enviar correo.";
                }
               
            }
            catch (Exception ex)
            {
                ViewData["Mensaje"] = null;
                ViewData["MensajeError"] = ex.Message;
            }
            return View();
        }
    }
}
