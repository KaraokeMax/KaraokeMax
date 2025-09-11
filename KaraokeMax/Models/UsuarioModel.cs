using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KaraokeMax.Models
{
    public class UsuarioModel
    {
        public String id { get; set; }
        public bool primeiroAcesso { get; set; }
        public String nome { get; set; }
        public String email { get; set; }
        public String senha { get; set; }
        public String tipo { get; set; } // admin convidado ou user

        public UsuarioModel(String id, bool primeiroAcesso, String nome, String email, String senha, String tipo)
        {
            this.id = id;
            this.primeiroAcesso = primeiroAcesso;
            this.nome = nome;
            this.email = email;
            this.senha = senha;
            this.tipo = tipo;
        }
    }
}
