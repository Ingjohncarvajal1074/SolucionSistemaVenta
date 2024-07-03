using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using SistemaVenta.Entity;

namespace SistemaVenta.DAL.DBContext
{
    public partial class DBVENTAContext : DbContext
    {
        public DBVENTAContext()
        {
        }

        public DBVENTAContext(DbContextOptions<DBVENTAContext> options)
            : base(options)
        {
        }

        public virtual DbSet<Categoria> Categoria { get; set; } = null!;
        public virtual DbSet<Configuracion> Configuracions { get; set; } = null!;
        public virtual DbSet<DetalleVenta> DetalleVenta { get; set; } = null!;
        public virtual DbSet<Menu> Menus { get; set; } = null!;
        public virtual DbSet<Negocio> Negocios { get; set; } = null!;
        public virtual DbSet<NumeroCorrelativo> NumeroCorrelativos { get; set; } = null!;
        public virtual DbSet<Producto> Productos { get; set; } = null!;
        public virtual DbSet<Rol> Rols { get; set; } = null!;
        public virtual DbSet<RolMenu> RolMenus { get; set; } = null!;
        public virtual DbSet<TipoDocumentoVenta> TipoDocumentoVenta { get; set; } = null!;
        public virtual DbSet<Usuario> Usuarios { get; set; } = null!;
        public virtual DbSet<Venta> Venta { get; set; } = null!;

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Categoria>(entity =>
            {
                entity.ToTable("CATEGORIA");
                entity.HasKey(e => e.IdCategoria);

                entity.Property(e => e.IdCategoria).HasColumnName("IDCATEGORIA");

                entity.Property(e => e.Descripcion)
                    .HasMaxLength(50)
                    .IsUnicode(false)
                    .HasColumnName("DESCRIPCION");

                entity.Property(e => e.EsActivo).HasColumnName("ESACTIVO");

                entity.Property(e => e.FechaRegistro)
                    .HasColumnType("datetime")
                    .HasColumnName("FECHAREGISTRO");
            });

            modelBuilder.Entity<Configuracion>(entity =>
            {
                entity.ToTable("CONFIGURACION");               
                entity.HasNoKey();               

                entity.Property(e => e.Propiedad)
                    .HasMaxLength(50)
                    .IsUnicode(false)
                    .HasColumnName("PROPIEDAD");

                entity.Property(e => e.Recurso)
                    .HasMaxLength(50)
                    .IsUnicode(false)
                    .HasColumnName("RECURSO");

                entity.Property(e => e.Valor)
                    .HasMaxLength(60)
                    .IsUnicode(false)
                    .HasColumnName("VALOR");
            });

            modelBuilder.Entity<DetalleVenta>(entity =>
            {
                entity.ToTable("DETALLEVENTA");
                entity.HasKey(e => e.IdDetalleVenta);
                    
                entity.Property(e => e.IdDetalleVenta).HasColumnName("IDDETALLEVENTA");

                entity.Property(e => e.Cantidad).HasColumnName("CANTIDAD");

                entity.Property(e => e.CategoriaProducto)
                    .HasMaxLength(100)
                    .IsUnicode(false)
                    .HasColumnName("CATEGORIAPRODUCTO");

                entity.Property(e => e.DescripcionProducto)
                    .HasMaxLength(100)
                    .IsUnicode(false)
                    .HasColumnName("DESCRIPCIONPRODUCTO");

                entity.Property(e => e.IdProducto).HasColumnName("IDPRODUCTO");

                entity.Property(e => e.IdVenta).HasColumnName("IDVENTA");

                entity.Property(e => e.MarcaProducto)
                    .HasMaxLength(100)
                    .IsUnicode(false)
                    .HasColumnName("MARCAPRODUCTO");

                entity.Property(e => e.Precio)
                    .HasColumnType("decimal(10, 2)")
                    .HasColumnName("PRECIO");

                entity.Property(e => e.Total)
                    .HasColumnType("decimal(10, 2)")
                    .HasColumnName("TOTAL");

                entity.HasOne(d => d.IdVentaNavigation)
                    .WithMany(p => p.DetalleVenta)
                    .HasForeignKey(d => d.IdVenta);                    
            });

            modelBuilder.Entity<Menu>(entity =>
            {
                entity.ToTable("MENU");
                entity.HasKey(e => e.IdMenu);

                entity.Property(e => e.IdMenu).HasColumnName("IDMENU");

                entity.Property(e => e.Controlador)
                    .HasMaxLength(30)
                    .IsUnicode(false)
                    .HasColumnName("CONTROLADOR");

                entity.Property(e => e.Descripcion)
                    .HasMaxLength(30)
                    .IsUnicode(false)
                    .HasColumnName("DESCRIPCION");

                entity.Property(e => e.EsActivo).HasColumnName("ESACTIVO");

                entity.Property(e => e.FechaRegistro)
                    .HasColumnType("datetime")
                    .HasColumnName("FECHAREGISTRO");

                entity.Property(e => e.Icono)
                    .HasMaxLength(30)
                    .IsUnicode(false)
                    .HasColumnName("ICONO");

                entity.Property(e => e.IdMenuPadre).HasColumnName("IDMENUPADRE");

                entity.Property(e => e.PaginaAccion)
                    .HasMaxLength(30)
                    .IsUnicode(false)
                    .HasColumnName("PAGINAACCION");

                entity.HasOne(d => d.IdMenuPadreNavigation)
                    .WithMany(p => p.InverseIdMenuPadreNavigation)
                    .HasForeignKey(d => d.IdMenuPadre);
            });

            modelBuilder.Entity<Negocio>(entity =>
            {
                entity.ToTable("NEGOCIO");
                entity.HasKey(e => e.IdNegocio);                    

                entity.Property(e => e.IdNegocio)
                    .ValueGeneratedNever()
                    .HasColumnName("IDNEGOCIO");

                entity.Property(e => e.Correo)
                    .HasMaxLength(50)
                    .IsUnicode(false)
                    .HasColumnName("CORREO");

                entity.Property(e => e.Direccion)
                    .HasMaxLength(50)
                    .IsUnicode(false)
                    .HasColumnName("DIRECCION");

                entity.Property(e => e.Nombre)
                    .HasMaxLength(50)
                    .IsUnicode(false)
                    .HasColumnName("NOMBRE");

                entity.Property(e => e.NombreLogo)
                    .HasMaxLength(100)
                    .IsUnicode(false)
                    .HasColumnName("NOMBRELOGO");

                entity.Property(e => e.NumeroDocumento)
                    .HasMaxLength(50)
                    .IsUnicode(false)
                    .HasColumnName("NUMERODOCUMENTO");

                entity.Property(e => e.PorcentajeImpuesto)
                    .HasColumnType("decimal(10, 2)")
                    .HasColumnName("PORCENTAJEIMPUESTO");

                entity.Property(e => e.SimboloMoneda)
                    .HasMaxLength(5)
                    .IsUnicode(false)
                    .HasColumnName("SIMBOLOMONEDA");

                entity.Property(e => e.Telefono)
                    .HasMaxLength(50)
                    .IsUnicode(false)
                    .HasColumnName("TELEFONO");

                entity.Property(e => e.UrlLogo)
                    .HasMaxLength(500)
                    .IsUnicode(false)
                    .HasColumnName("URLLOGO");
            });

            modelBuilder.Entity<NumeroCorrelativo>(entity =>
            {
                entity.ToTable("NUMEROCORRELATIVO");
                entity.HasKey(e => e.IdNumeroCorrelativo);

                entity.Property(e => e.IdNumeroCorrelativo).HasColumnName("IDNUMEROCORRELATIVO");

                entity.Property(e => e.CantidadDigitos).HasColumnName("CANTIDADDIGITOS");

                entity.Property(e => e.FechaActualizacion)
                    .HasColumnType("datetime")
                    .HasColumnName("FECHAACTUALIZACION");

                entity.Property(e => e.Gestion)
                    .HasMaxLength(100)
                    .IsUnicode(false)
                    .HasColumnName("GESTION");

                entity.Property(e => e.UltimoNumero).HasColumnName("ULTIMONUMERO");
            });

            modelBuilder.Entity<Producto>(entity =>
            {
                entity.ToTable("PRODUCTO");
                entity.HasKey(e => e.IdProducto);

                entity.Property(e => e.IdProducto).HasColumnName("IDPRODUCTO");

                entity.Property(e => e.CodigoBarra)
                    .HasMaxLength(50)
                    .IsUnicode(false)
                    .HasColumnName("CODIGOBARRA");

                entity.Property(e => e.Descripcion)
                    .HasMaxLength(100)
                    .IsUnicode(false)
                    .HasColumnName("DESCRIPCION");

                entity.Property(e => e.EsActivo).HasColumnName("ESACTIVO");

                entity.Property(e => e.FechaRegistro)
                    .HasColumnType("datetime")
                    .HasColumnName("FECHAREGISTRO");

                entity.Property(e => e.IdCategoria).HasColumnName("IDCATEGORIA");

                entity.Property(e => e.Marca)
                    .HasMaxLength(50)
                    .IsUnicode(false)
                    .HasColumnName("MARCA");

                entity.Property(e => e.NombreImagen)
                    .HasMaxLength(100)
                    .IsUnicode(false)
                    .HasColumnName("NOMBREIMAGEN");

                entity.Property(e => e.Precio)
                    .HasColumnType("decimal(10, 2)")
                    .HasColumnName("PRECIO");

                entity.Property(e => e.Stock).HasColumnName("STOCK");

                entity.Property(e => e.UrlImagen)
                    .HasMaxLength(500)
                    .IsUnicode(false)
                    .HasColumnName("URLIMAGEN");

                entity.HasOne(d => d.IdCategoriaNavigation)
                    .WithMany(p => p.Productos)
                    .HasForeignKey(d => d.IdCategoria);
                    
            });

            modelBuilder.Entity<Rol>(entity =>
            {
                entity.ToTable("ROL");
                entity.HasKey(e => e.IdRol);

                entity.Property(e => e.IdRol).HasColumnName("IDROL");

                entity.Property(e => e.Descripcion)
                    .HasMaxLength(30)
                    .IsUnicode(false)
                    .HasColumnName("DESCRIPCION");

                entity.Property(e => e.EsActivo).HasColumnName("ESACTIVO");

                entity.Property(e => e.FechaRegistro)
                    .HasColumnType("datetime")
                    .HasColumnName("FECHAREGISTRO");
                    
            });
            
            modelBuilder.Entity<RolMenu>(entity =>
            {
                entity.ToTable("ROLMENU");
                entity.HasKey(e => e.IdRolMenu);                    


                entity.Property(e => e.IdRolMenu).HasColumnName("IDROLMENU");

                entity.Property(e => e.EsActivo).HasColumnName("ESACTIVO");

                entity.Property(e => e.FechaRegistro)
                    .HasColumnType("datetime")
                    .HasColumnName("FECHAREGISTRO");

                entity.Property(e => e.IdMenu).HasColumnName("IDMENU");

                entity.Property(e => e.IdRol).HasColumnName("IDROL");

                entity.HasOne(d => d.IdMenuNavigation)
                    .WithMany(p => p.RolMenus)
                    .HasForeignKey(d => d.IdMenu);

                entity.HasOne(d => d.IdRolNavigation)
                    .WithMany(p => p.RolMenus)
                    .HasForeignKey(d => d.IdRol);
            });

            modelBuilder.Entity<TipoDocumentoVenta>(entity =>
            {
                entity.ToTable("TIPODOCUMENTOVENTA");
                entity.HasKey(e => e.IdTipoDocumentoVenta);

                entity.Property(e => e.IdTipoDocumentoVenta).HasColumnName("IDTIPODOCUMENTOVENTA");

                entity.Property(e => e.Descripcion)
                    .HasMaxLength(50)
                    .IsUnicode(false)
                    .HasColumnName("DESCRIPCION");

                entity.Property(e => e.EsActivo).HasColumnName("ESACTIVO");

                entity.Property(e => e.FechaRegistro)
                    .HasColumnType("datetime")
                    .HasColumnName("FECHAREGISTRO");
            });

            modelBuilder.Entity<Usuario>(entity =>
            {
                entity.ToTable("USUARIO");
                entity.HasKey(e => e.IdUsuario);

                entity.Property(e => e.IdUsuario).HasColumnName("IDUSUARIO");

                entity.Property(e => e.Clave)
                    .HasMaxLength(100)
                    .IsUnicode(false)
                    .HasColumnName("CLAVE");

                entity.Property(e => e.Correo)
                    .HasMaxLength(50)
                    .IsUnicode(false)
                    .HasColumnName("CORREO");

                entity.Property(e => e.EsActivo).HasColumnName("ESACTIVO");

                entity.Property(e => e.FechaRegistro)
                    .HasColumnType("datetime")
                    .HasColumnName("FECHAREGISTRO");                   

                entity.Property(e => e.IdRol).HasColumnName("IDROL");

                entity.Property(e => e.Nombre)
                    .HasMaxLength(50)
                    .IsUnicode(false)
                    .HasColumnName("NOMBRE");

                entity.Property(e => e.NombreFoto)
                    .HasMaxLength(100)
                    .IsUnicode(false)
                    .HasColumnName("NOMBREFOTO");

                entity.Property(e => e.Telefono)
                    .HasMaxLength(50)
                    .IsUnicode(false)
                    .HasColumnName("TELEFONO");

                entity.Property(e => e.UrlFoto)
                    .HasMaxLength(500)
                    .IsUnicode(false)
                    .HasColumnName("URLFOTO");

                entity.HasOne(d => d.IdRolNavigation)
                    .WithMany(p => p.Usuarios)
                    .HasForeignKey(d => d.IdRol);
                    
            });

            modelBuilder.Entity<Venta>(entity =>
            {
                entity.ToTable("VENTA");
                entity.HasKey(e => e.IdVenta);                    

                entity.Property(e => e.IdVenta).HasColumnName("IDVENTA");

                entity.Property(e => e.DocumentoCliente)
                    .HasMaxLength(10)
                    .IsUnicode(false)
                    .HasColumnName("DOCUMENTOCLIENTE");

                entity.Property(e => e.FechaRegistro)
                    .HasColumnType("datetime")
                    .HasColumnName("FECHAREGISTRO");                    

                entity.Property(e => e.IdTipoDocumentoVenta).HasColumnName("IDTIPODOCUMENTOVENTA");

                entity.Property(e => e.IdUsuario).HasColumnName("IDUSUARIO");

                entity.Property(e => e.ImpuestoTotal)
                    .HasColumnType("decimal(10, 2)")
                    .HasColumnName("IMPUESTOTOTAL");

                entity.Property(e => e.NombreCliente)
                    .HasMaxLength(20)
                    .IsUnicode(false)
                    .HasColumnName("NOMBRECLIENTE");

                entity.Property(e => e.NumeroVenta)
                    .HasMaxLength(6)
                    .IsUnicode(false)
                    .HasColumnName("NUMEROVENTA");

                entity.Property(e => e.SubTotal)
                    .HasColumnType("decimal(10, 2)")
                    .HasColumnName("SUBTOTAL");

                entity.Property(e => e.Total)
                      .HasColumnType("decimal(10, 2)")
                       .HasColumnName("TOTAL");

                entity.HasOne(d => d.IdTipoDocumentoVentaNavigation)
                    .WithMany(p => p.Venta)
                    .HasForeignKey(d => d.IdTipoDocumentoVenta);                    

                entity.HasOne(d => d.IdUsuarioNavigation)
                    .WithMany(p => p.Venta)
                    .HasForeignKey(d => d.IdUsuario);
                    
            });

            OnModelCreatingPartial(modelBuilder);
        }

        partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
    }
}
