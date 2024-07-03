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
    public class CategoriaService : ICategoriaService
    {
        private readonly IGenericRepository<Categoria> _repositorio;

        public CategoriaService(IGenericRepository<Categoria> repositorio)
        {
            _repositorio = repositorio;
        }

        public async Task<List<Categoria>> Lista()
        {
            try
            {
                IQueryable<Categoria> query = await _repositorio.Consultar();
                return query.ToList();
            }
            catch (Exception ex)
            {
                throw ex.InnerException;
            }
            
           
        }

        public async Task<Categoria> Crear(Categoria entidad)
        {
            try
            {
                Categoria categoria_creada = await _repositorio.Crear(entidad);
                if (categoria_creada.IdCategoria == 0)
                    throw new TaskCanceledException("No se pudo crear la categoria");
                return categoria_creada;
            }
            catch (Exception ex)
            {
                throw ex.InnerException;
            }
        }

        public async Task<Categoria> Editar(Categoria entidad)
        {
            Categoria categoria_encontrada = await _repositorio.Obtener(c => c.IdCategoria == entidad.IdCategoria);
            categoria_encontrada.Descripcion = entidad.Descripcion;
            categoria_encontrada.EsActivo = entidad.EsActivo;

            bool respuesta = await _repositorio.Editar(categoria_encontrada);

            if (!respuesta)
                throw new TaskCanceledException("No se pudo modificar la categoria");

            return categoria_encontrada;
        }

        public async Task<bool> Eliminar(int idCategoria)
        {
            try
            {
                Categoria categoria_encontrada = await _repositorio.Obtener(c => c.IdCategoria == idCategoria);
                if (categoria_encontrada == null)
                    throw new TaskCanceledException("Categoria no existe");

                bool respuesta = await _repositorio.Eliminar(categoria_encontrada);
                return respuesta;
            }
            catch (Exception ex)
            {

                throw;
            }
        }

    }
}
