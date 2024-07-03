using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Microsoft.EntityFrameworkCore;
using SistemaVenta.BLL.Interfaces;
using SistemaVenta.DAL.Interfaces;
using SistemaVenta.Entity;


namespace SistemaVenta.BLL.Implementacion
{
    public class ProductoService : IProductoService
    {
        private readonly IGenericRepository<Producto> _repositorio;
        private readonly IFireBaseService _firebaseServicio;       

        public ProductoService(IGenericRepository<Producto> repositorio, IFireBaseService firebaseServicio)
        {
            _repositorio = repositorio;
            _firebaseServicio = firebaseServicio;           
        }
        public async Task<List<Producto>> Lista()
        {
            IQueryable<Producto> query = await _repositorio.Consultar();
            return query.Include(c => c.IdCategoriaNavigation).ToList();
        }

        public async Task<Producto> Crear(Producto entidad, Stream imagen = null, string NombreImagen = "")
        {
            Producto producto_existe = await _repositorio.Obtener(p => p.CodigoBarra == entidad.CodigoBarra);

            if (producto_existe != null)
                throw new TaskCanceledException("El codigo de barra ya existe");

            try
            {
                entidad.NombreImagen = NombreImagen;
                if (imagen != null)
                {
                    string urlImage = await _firebaseServicio.SubirStorage(imagen, "carpeta_producto", NombreImagen);
                    entidad.UrlImagen = urlImage;
                }
                Producto producto_creado = await _repositorio.Crear(entidad);
                if (producto_creado.IdProducto == 0)
                    throw new TaskCanceledException("No se pudo crear el producto");

                IQueryable<Producto> query = await _repositorio.Consultar(p => p.IdProducto == producto_creado.IdProducto);
                producto_creado = query.Include(c => c.IdCategoriaNavigation).First();
                return producto_creado;
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        public async Task<Producto> Editar(Producto entidad, Stream imagen = null, string nombreImagen = "")
        {
            Producto producto_existe = await _repositorio.Obtener(p => p.CodigoBarra == entidad.CodigoBarra && p.IdProducto != entidad.IdProducto);

            if (producto_existe != null)
                throw new TaskCanceledException("El codigo de barra ya existe y esta asociado a otro producto");

            try
            {
                IQueryable<Producto> queryProducto = await _repositorio.Consultar(p => p.IdProducto == entidad.IdProducto);
                Producto editarProducto = queryProducto.First();
                editarProducto.CodigoBarra = entidad.CodigoBarra;
                editarProducto.Marca = entidad.Marca;
                editarProducto.Descripcion = entidad.Descripcion;
                editarProducto.IdCategoria = entidad.IdCategoria;
                editarProducto.Stock = entidad.Stock;
                editarProducto.Precio = entidad.Precio;
                editarProducto.EsActivo = entidad.EsActivo;

                if (string.IsNullOrEmpty(editarProducto.NombreImagen))
                {
                    editarProducto.NombreImagen = nombreImagen;
                }                

                if (imagen != null)
                {
                    string urlImagen = await _firebaseServicio.SubirStorage(imagen, "carpeta_producto", editarProducto.NombreImagen);
                    editarProducto.UrlImagen = urlImagen;
                }

                bool respuesta = await _repositorio.Editar(editarProducto);
                if(!respuesta)
                    throw new TaskCanceledException("No se pudo modificar el producto");

                Producto productoEditado = queryProducto.Include(c => c.IdCategoriaNavigation).First();

                return productoEditado;  
            }
            catch (Exception ex)
            {
                throw;
            }

        }

        public async Task<bool> Eliminar(int idProducto)
        {
            try
            {
                Producto productoEncontrado = await _repositorio.Obtener(p => p.IdProducto == idProducto);

                if(productoEncontrado == null)
                    throw new TaskCanceledException("El producto NO existe");

                string nombreImagen = productoEncontrado.NombreImagen;
                bool respuesta = await _repositorio.Eliminar(productoEncontrado);

                if (respuesta)
                    await _firebaseServicio.EliminarStorage("carpeta_producto", nombreImagen);

                return true;
            }
            catch (Exception ex)
            {

                throw;
            }
        }

    }
}
