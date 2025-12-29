using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using SistemaVenta.BLL.Interfaces;
using SistemaVenta.DAL.Interfaces;
using SistemaVenta.Entity;

namespace SistemaVenta.BLL.Implementacion
{
    public class MenuService : IMenuService
    {
        private readonly IGenericRepository<Menu> _repositorioMenu;
        private readonly IGenericRepository<RolMenu> _repositorioRolMenu;
        private readonly IGenericRepository<Usuario> _repositorioUsuario;

        public MenuService(IGenericRepository<Menu> repositorioMenu, IGenericRepository<RolMenu> repositorioRolMenu, IGenericRepository<Usuario> repositorioUsuario)
        {
            _repositorioMenu = repositorioMenu;
            _repositorioRolMenu = repositorioRolMenu;
            _repositorioUsuario = repositorioUsuario;
        }

        public async Task<List<Menu>> ObtenerMenus(int idUsuario)
        {
            IQueryable<Usuario> tbUsuario = await _repositorioUsuario.Consultar();
            IQueryable<RolMenu> tbRolMenu = await _repositorioRolMenu.Consultar();
            IQueryable<Menu> tbMenu = await _repositorioMenu.Consultar();

            IQueryable<Menu> menuPadre = (from usuario in tbUsuario
                                                join rolMenu in tbRolMenu on usuario.IdRol equals rolMenu.IdRol
                                                join menu in tbMenu on rolMenu.IdMenu equals menu.IdMenu
                                                join mpadre in tbMenu on menu.IdMenuPadre equals mpadre.IdMenu
                                                where usuario.IdUsuario == idUsuario && rolMenu.EsActivo == true && menu.EsActivo == true && usuario.EsActivo == true
                                          select mpadre).Distinct().AsQueryable();

            IQueryable<Menu> menuHijos = (from usuario in tbUsuario
                                               join rolMenu in tbRolMenu on usuario.IdRol equals rolMenu.IdRol
                                               join menu in tbMenu on rolMenu.IdMenu equals menu.IdMenu
                                               where menu.IdMenu != menu.IdMenuPadre && rolMenu.EsActivo == true && menu.EsActivo == true && usuario.EsActivo == true
                                               select menu).Distinct().AsQueryable();

            List<Menu> listaMenu = (from mpadre in menuPadre
                                    select new Menu()
                                    {
                                        Descripcion = mpadre.Descripcion,
                                        Icono = mpadre.Icono,
                                        Controlador = mpadre.Controlador,
                                        PaginaAccion = mpadre.PaginaAccion,
                                        InverseIdMenuPadreNavigation = (from mhijo in menuHijos
                                                                        where mhijo.IdMenuPadre == mpadre.IdMenu
                                                                        select mhijo).ToList()
                                    }).ToList();
            return listaMenu;
           
        }
    }
}
