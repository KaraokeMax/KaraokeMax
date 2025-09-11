using System;
using System.Collections.Generic;
using System.Windows;
using KaraokeMax.Models;
using MySql.Data.MySqlClient;

namespace KaraokeMax.Services.Banco_de_Dados
{
    static class MusicaService
    {
        private static string connectionString = "server=mysql-karaokemax.alwaysdata.net;database=karaokemax_db;uid=430017;pwd=KaraokePucSecreto;";

        public static void InserirMusica(MusicaModel musica)
        {
            try
            {
                using (var connection = new MySqlConnection(connectionString))
                {
                    connection.Open();
                    string query = @"INSERT INTO Musicas 
                        (nome, id_artista, status, id_usuario) 
                        VALUES (@nome, @id_artista, @status, @id_usuario)";
                    using (var command = new MySqlCommand(query, connection))
                    {                       
                        command.Parameters.AddWithValue("@nome", musica.nome);
                        command.Parameters.AddWithValue("@id_artista", musica.idArtista);
                        command.Parameters.AddWithValue("@status", "CARREGANDO");
                        command.Parameters.AddWithValue("@id_usuario", musica.idUsuario);
                        command.ExecuteNonQuery();
                    }
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("Erro ao inserir música: " + ex.Message);
                throw;
            }
        }

        public static List<MusicaModel> SelecionarTodasMusicas()
        {
            try
            {
                var musicas = new List<MusicaModel>();
                using (var connection = new MySqlConnection(connectionString))
                {
                    connection.Open();
                    string query = @"SELECT m.id, m.nome, m.id_artista, m.caminho_voz, m.caminho_instrumentos, m.caminho_midi, m.duracaoSegundos, m.status, m.id_usuario, a.nome AS nomeArtista
                                     FROM Musicas m
                                     INNER JOIN Artistas a ON m.id_artista = a.id";
                    using (var command = new MySqlCommand(query, connection))
                    using (var reader = command.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            string id = reader["id"].ToString();
                            string nome = reader["nome"].ToString();
                            string idArtista = reader["id_artista"].ToString();
                            string caminhoVoz = reader["caminho_voz"].ToString();
                            string caminhoInstrumental = reader["caminho_instrumentos"].ToString();
                            string caminhoLetra = reader["caminho_midi"].ToString();
                            int duracaoSegundos = reader["duracaoSegundos"] != DBNull.Value ? Convert.ToInt32(reader["duracaoSegundos"]) : 0;
                            string status = reader["status"].ToString();
                            string idUsuario = reader["id_usuario"].ToString();
                            string nomeArtista = reader["nomeArtista"].ToString();

                            musicas.Add(new MusicaModel(id, nome, idArtista, caminhoVoz, caminhoInstrumental, caminhoLetra, duracaoSegundos, status, idUsuario, nomeArtista));
                        }
                    }
                }
                return musicas;
            }
            catch (Exception ex)
            {
                MessageBox.Show("Erro ao selecionar músicas: " + ex.Message);
                throw;
            }
        }
    }
}