﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SistemaVenta.Entity
{
   
    public partial class Categoria
    {
        public Categoria()
        {
            Productos = new HashSet<Producto>();
        }       
        public int IdCategoria { get; set; }        
        public string? Descripcion { get; set; }       
        public bool? EsActivo { get; set; }       
        public DateTime? FechaRegistro { get; set; }

        public virtual ICollection<Producto> Productos { get; set; }
    }
}
