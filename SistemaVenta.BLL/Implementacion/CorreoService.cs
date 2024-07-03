using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
//using MailKit.Net.Smtp;
//using MimeKit;
using System.Net;
using System.Net.Mail;
using SistemaVenta.BLL.Interfaces;
using SistemaVenta.DAL.Interfaces;
using SistemaVenta.Entity;

namespace SistemaVenta.BLL.Implementacion
{
    public class CorreoService : ICorreoService
    {
        private readonly IGenericRepository<Configuracion> _repositorio;

        public CorreoService(IGenericRepository<Configuracion> repositorio)
        {
            _repositorio = repositorio;
        }
        public async Task<bool> EnviarCorreo(string CorreoDestino, string Asunto, string Mensaje)
        {
            try
            {
                IQueryable<Configuracion> query = await _repositorio.Consultar(c => c.Recurso.Equals("Servicio_Correo"));

                Dictionary<string, string> Config = query.ToDictionary(keySelector: c => c.Propiedad, elementSelector: c => c.Valor);

                var credenciales = new NetworkCredential(Config["correo"], Config["clave"]);

                var correo = new MailMessage()
                {
                    From = new MailAddress(Config["correo"], Config["alias"]),
                    Subject = Asunto,
                    Body = Mensaje,
                    IsBodyHtml = true
                };

                correo.To.Add(new MailAddress(CorreoDestino));

                var clienteServidor = new SmtpClient()
                {
                    Host = Config["host"],
                    Port = int.Parse(Config["puerto"]),
                    Credentials = credenciales,
                    DeliveryMethod = SmtpDeliveryMethod.Network,
                    UseDefaultCredentials = false,
                    EnableSsl = true
                };

                clienteServidor.Send(correo);
                return true;
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        //public async Task<bool> EnviarCorreo(string recipientEmail, string subject, string body)
        //{
        //    try
        //    {
        //        var emailAddress = "andreita599@gmail.com"; // Tu dirección de correo electrónico de Gmail
        //        var emailPassword = "Miclave.2024"; // Tu contraseña de Gmail

        //        var email = new MimeMessage();
        //        email.From.Add(MailboxAddress.Parse(emailAddress));
        //        email.To.Add(MailboxAddress.Parse(recipientEmail));
        //        email.Subject = subject;
        //        email.Body = new TextPart(MimeKit.Text.TextFormat.Html) { Text = body };

        //        using var smtp = new SmtpClient();
        //        smtp.Connect("smtp.gmail.com", 587, MailKit.Security.SecureSocketOptions.StartTls);
        //        smtp.Authenticate(emailAddress, emailPassword);
        //        await smtp.SendAsync(email);
        //        smtp.Disconnect(true);
        //        return true;
        //    }
        //    catch (Exception ex)
        //    {
        //        return false;
        //    }

        //}
    }
}
