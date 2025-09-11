using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;
using System.Windows;
using KaraokeMax.Models;
using MySql.Data.MySqlClient;

namespace KaraokeMax.Services.Banco_de_Dados
{
    static class UsuarioService
    {
        private static string connectionString = "server=mysql-karaokemax.alwaysdata.net;database=karaokemax_db;uid=430017;pwd=KaraokePucSecreto;";
        public static void CriarUsuario(String nome, String email, String tipo)
        {
            try
            {
                using (var connection = new MySqlConnection(connectionString))
                {
                    connection.Open();
                    string query = "INSERT INTO Usuarios (nome, email, tipo) VALUES (@nome, @email, @tipo)";
                    using (var command = new MySqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@nome", nome);
                        command.Parameters.AddWithValue("@email", email);
                        command.Parameters.AddWithValue("@tipo", tipo);
                        command.ExecuteNonQuery();
                    }
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("Erro ao criar artista: " + ex.Message);
                throw;
            }
        }

    }
}
