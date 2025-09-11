using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;
using System.Windows;
using KaraokeMax.Models;
using MySql.Data.MySqlClient; 

namespace KaraokeMax.Services.Banco_de_Dados
{
    static class ArtistaService
    {
        private static string connectionString = "server=mysql-karaokemax.alwaysdata.net;database=karaokemax_db;uid=430017;pwd=KaraokePucSecreto;";

        public static void CriarArtista(String nome)
        {
            try
            {
                using (var connection = new MySqlConnection(connectionString))
                {
                    connection.Open();
                    string query = "INSERT INTO Artistas (nome) VALUES (@nome)";
                    using (var command = new MySqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@nome", nome);
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

        public static List<ArtistaModel> SelecionarTodosArtistas()
        {
            try
            {
                var artistas = new List<ArtistaModel>();
                using (var connection = new MySqlConnection(connectionString))
                {
                    connection.Open();
                    string query = "SELECT id, nome, qtdMusicas FROM Artistas";
                    using (var command = new MySqlCommand(query, connection))
                    using (var reader = command.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            string id = reader["id"].ToString();
                            string nome = reader["nome"].ToString();
                            int qtdMusicas = reader["qtdMusicas"] != DBNull.Value ? Convert.ToInt32(reader["qtdMusicas"]) : 0;
                            artistas.Add(new ArtistaModel(id, nome, qtdMusicas));
                        }
                    }
                }
                return artistas;
            }
            catch (Exception ex)
            {
                MessageBox.Show("Erro ao selecionar artistas: " + ex.Message);
                throw;
            }
        }

        public static void ExcluirArtistaPorId(string id)
        {       
            try
            {
                using (var connection = new MySqlConnection(connectionString))
                {
                    connection.Open();
                    string query = "DELETE FROM Artistas WHERE id = @id";
                    using (var command = new MySqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@id", id);
                        command.ExecuteNonQuery();
                    }
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("Erro ao excluir artista: " + ex.Message);
                throw;
            }
        }
    }
}
