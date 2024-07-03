using SistemaVenta.Entity;

namespace SistemaVenta.AplicacionWeb.Models.ViewModels
{
    public class VMCategorias
    {
        public int IdCategoria { get; set; }

        public string? Descripcion { get; set; }

        public int esActivo { get; set; }

    }
}
