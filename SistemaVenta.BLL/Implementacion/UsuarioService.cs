using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.EntityFrameworkCore;
using System.Net;
using System.Text;
using SistemaVenta.BLL.Interfaces;
using SistemaVenta.DAL.Interfaces;
using SistemaVenta.Entity;
using SistemaVenta.DAL.DBContext;

namespace SistemaVenta.BLL.Implementacion
{
    public class UsuarioService : IUsuarioService
    {
        private readonly IGenericRepository<Usuario> _repository;
        private readonly IGenericRepository<Rol> _repository2;
        private readonly IFireBaseService _fireBaseService;
        private readonly IUtilidadesService _utilidadesService;
        private readonly ICorreoService _correoService;
        private readonly DBVENTAContext _dbcontext;

        public UsuarioService
            (
                IGenericRepository<Usuario> repository,               
                IFireBaseService fireBaseService,
                IUtilidadesService utilidadesService,
                ICorreoService correoService
            )
        {
            _repository = repository;
            _fireBaseService = fireBaseService;
            _utilidadesService = utilidadesService;
            _correoService = correoService;

        }

        public async Task<List<Usuario>> Lista()
        {
            try
            {
                IQueryable<Usuario> query = await _repository.Consultar();
                return query.Include(r => r.IdRolNavigation).ToList();
                //return query.ToList();
            }
            catch (Exception ex)
            {
                throw ex;
            }

        }

        public async Task<Usuario> Crear(Usuario entidad, Stream Foto = null, string NombreFoto = "", string UrlPlantillaCorreo = "")
        {
            Usuario usuario_existe = await _repository.Obtener(u => u.Correo == entidad.Correo);
            if (usuario_existe != null)
                throw new TaskCanceledException("El correo ya existe");
            try
            {
                string clave_generada = _utilidadesService.GenerarClave();
                entidad.Clave = _utilidadesService.ConvertirSha256(clave_generada);
                entidad.NombreFoto = NombreFoto;
                if (Foto != null)
                {
                    string urlFoto = await _fireBaseService.SubirStorage(Foto, "carpeta_usuario", NombreFoto);
                    entidad.UrlFoto = urlFoto;
                }

                Usuario usuario_creado = await _repository.Crear(entidad);
                if (usuario_creado.IdUsuario == 0)
                    throw new TaskCanceledException("El correo ya existe");
                if (UrlPlantillaCorreo != "")
                {
                    UrlPlantillaCorreo = UrlPlantillaCorreo.Replace("[correo]", usuario_creado.Correo).Replace("[clave]", clave_generada);
                    string htmlCorreo = "";

                    HttpWebRequest request = (HttpWebRequest)WebRequest.Create(UrlPlantillaCorreo);
                    HttpWebResponse response = (HttpWebResponse)request.GetResponse();

                    if (response.StatusCode == HttpStatusCode.OK)
                    {
                        using (Stream dataStream = response.GetResponseStream()) 
                        {
                            StreamReader readerStream = null;
                            if (response.CharacterSet == null)
                            {
                                readerStream = new StreamReader(dataStream);
                            }
                            else
                            {
                                readerStream = new StreamReader(dataStream, Encoding.GetEncoding(response.CharacterSet));
                            }

                            htmlCorreo = readerStream.ReadToEnd();
                            response.Close();
                            readerStream.Close();
                        }
                    }
                    if (htmlCorreo != "")
                    {
                        //await _correoService.EnviarCorreo(usuario_creado.Correo, "Cuenta Creada", htmlCorreo);
                    }
                }
                IQueryable<Usuario> query = await _repository.Consultar(u => u.IdUsuario == usuario_creado.IdUsuario);
                usuario_creado = query.Include(r=> r.IdRolNavigation).First();
                usuario_creado.Clave = clave_generada;

                return usuario_creado;
            }
            catch (Exception ex)
            {
                throw new TaskCanceledException($"No se pudo crear el usuario {ex.Message}");
            }
        }

        public async Task<Usuario> Editar(Usuario entidad, Stream Foto = null, string NombreFoto = "")
        {
            Usuario usuario_existe = await _repository.Obtener(u => u.Correo == entidad.Correo && u.IdUsuario != entidad.IdUsuario);
            if (usuario_existe != null)
                throw new TaskCanceledException("El correo ya existe");
            try
            {
                IQueryable<Usuario> queryUsuario = await _repository.Consultar(u=> u.IdUsuario == entidad.IdUsuario);
                Usuario usuario_editar = queryUsuario.First();

                usuario_editar.Nombre = entidad.Nombre;
                usuario_editar.Correo = entidad.Correo;
                usuario_editar.Telefono = entidad.Telefono;
                usuario_editar.IdRol = entidad.IdRol;
                usuario_editar.EsActivo = entidad.EsActivo;

                if (string.IsNullOrEmpty(usuario_editar.NombreFoto))
                {
                    usuario_editar.NombreFoto = NombreFoto;
                }
                if (Foto != null)
                {
                    string urlFoto = await _fireBaseService.SubirStorage(Foto, "carpeta_usuario", usuario_editar.NombreFoto);
                    usuario_editar.UrlFoto = urlFoto;
                }

                bool respuesta = await _repository.Editar(usuario_editar);
                if (!respuesta)
                {
                    throw new TaskCanceledException("No se pudo modificar el usuario");
                }
                Usuario usuario_editado = queryUsuario.Include(r=> r.IdRolNavigation).First();
                return usuario_editado;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public async Task<bool> Eliminar(int IdUsuario)
        {
            try
            {
                Usuario usuario_encontrado = await _repository.Obtener(u => u.IdUsuario == IdUsuario);
                if (usuario_encontrado == null)
                    throw new TaskCanceledException("El usuario no existe");

                string nombreFoto = usuario_encontrado.NombreFoto;
                bool respuesta = await _repository.Eliminar(usuario_encontrado);
                if (respuesta)
                    await _fireBaseService.EliminarStorage("carpeta_usuario", nombreFoto);
               
                return true;
            }
            catch (Exception)
            {
                throw;
            }
        }
        public async Task<Usuario> ObtenerPorCredenciales(string correo, string clave)
        {
            string clave_encriptada = _utilidadesService.ConvertirSha256(clave);
            Usuario usuario_encontrado = await _repository.Obtener(u => u.Correo.Equals(correo) && u.Clave.Equals(clave_encriptada));
            return usuario_encontrado;
        }

        public async Task<Usuario> ObtenerPorId(int idUsuario)
        {
            IQueryable<Usuario> query = await _repository.Consultar(u => u.IdUsuario == idUsuario);
            Usuario resultado = query.Include(r=> r.IdRolNavigation).FirstOrDefault();
            return resultado;
        }
        public async Task<bool> GuardarPerfil(Usuario entidad)
        {
            try
            {
                Usuario usuario_encontrado = await _repository.Obtener(u => u.IdUsuario == entidad.IdUsuario);
                if (usuario_encontrado == null)
                    throw new TaskCanceledException("El usuario no existe");

                usuario_encontrado.Correo = entidad.Correo;
                usuario_encontrado.Telefono = entidad.Telefono;

                bool respuesta = await _repository.Editar(usuario_encontrado);
                return respuesta;
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<bool> CambiarClave(int idUsuario, string ClaveActual, string ClaveNueva)
        {
            try
            {
                Usuario usuario_encontrado = await _repository.Obtener(u => u.IdUsuario == idUsuario);

                if (usuario_encontrado == null)
                    throw new TaskCanceledException("El usuario no existe");

                if (usuario_encontrado.Clave != _utilidadesService.ConvertirSha256(ClaveActual))
                    throw new TaskCanceledException("La contraseña ingresada como actual no es correcta");

                usuario_encontrado.Clave = _utilidadesService.ConvertirSha256(ClaveNueva);
                bool respuesta = await _repository.Editar(usuario_encontrado);
                return respuesta;
            }
            catch (Exception)
            {

                throw;
            }
        }
        public async Task<bool> RestablecerClave(string Correo, string UrlPlantillaCorreo)
        {
            try
            {
                Usuario usuario_encontrado = await _repository.Obtener(u => u.Correo == Correo);
                if (usuario_encontrado == null)
                    throw new TaskCanceledException("No encontramos ningun usuario asociado al correo");

                string clave_generada = _utilidadesService.GenerarClave();
                usuario_encontrado.Clave = _utilidadesService.ConvertirSha256(clave_generada);

                UrlPlantillaCorreo = UrlPlantillaCorreo.Replace("[clave]", clave_generada);
                string htmlCorreo = "";

                HttpWebRequest request = (HttpWebRequest)WebRequest.Create(UrlPlantillaCorreo);
                HttpWebResponse response = (HttpWebResponse)request.GetResponse();

                if (response.StatusCode == HttpStatusCode.OK)
                {
                    using (Stream dataStream = response.GetResponseStream())
                    {
                        StreamReader readerStream = null;

                        if (response.CharacterSet == null)                        
                            readerStream = new StreamReader(dataStream);                        
                        else
                            readerStream = new StreamReader(dataStream, Encoding.GetEncoding(response.CharacterSet));
                        

                        htmlCorreo = readerStream.ReadToEnd();
                        response.Close();
                        readerStream.Close();
                    }
                }

                bool correo_enviado = false;

                if (htmlCorreo != "")
                    correo_enviado = await _correoService.EnviarCorreo(Correo, "Contraseña Restablecida", htmlCorreo);

                if(!correo_enviado)
                    throw new TaskCanceledException("Tenemos problemas . Por favor itentalo mas tarde");

                bool respuesta = await _repository.Editar(usuario_encontrado);
                return respuesta;
            }
            catch (Exception) { throw; }
        }
    }
}
