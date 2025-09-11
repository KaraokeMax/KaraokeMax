using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KaraokeMax.Models
{
    class ArtistaModel
    {
        public String id { get; set; }
        public String nome { get; set; }
        public int quantidadeMusicas { get; set; }

        public ArtistaModel(String id, String nome, int quantidadeMusicas)
        {
            this.id = id;
            this.nome = nome;
            this.quantidadeMusicas = quantidadeMusicas;
        }
    }
}
