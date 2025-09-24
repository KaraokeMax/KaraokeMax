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
                MessageBox.Show("Erro ao criar usuário: " + ex.Message);
                throw;
            }
        }

        public static void AlterarSenhaPrimeiroAcesso(string id, string novaSenha)
        {
            try
            {
                using (var connection = new MySqlConnection(connectionString))
                {
                    connection.Open();
                    string query = "UPDATE Usuarios SET senha = @senha, primeiroAcesso = false WHERE id = @id";
                    using (var command = new MySqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@senha", novaSenha);
                        command.Parameters.AddWithValue("@id", id);
                        command.ExecuteNonQuery();
                    }
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("Erro ao alterar senha: " + ex.Message);
                throw;
            }
        }

        public static UsuarioModel VerificaLogin(string email, string senha)
        {
            try
            {
                using (var connection = new MySqlConnection(connectionString))
                {
                    connection.Open();
                    string query = "SELECT * FROM Usuarios WHERE email = @email AND senha = @senha";
                    using (var command = new MySqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@email", email);
                        command.Parameters.AddWithValue("@senha", senha);
                        using (var reader = command.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                return new UsuarioModel(
                                    reader["id"].ToString(),
                                    Convert.ToBoolean(reader["primeiroAcesso"]),
                                    reader["nome"].ToString(),
                                    reader["email"].ToString(),
                                    reader["senha"].ToString(),
                                    reader["tipo"].ToString()
                                );
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("Erro ao buscar usuário: " + ex.Message);
                throw;
            }
            return null;
        }

        public static void CriaSenha(String idUsuario, String novaSenha)
        {
            try
            {
                using (var connection = new MySqlConnection(connectionString))
                {
                    connection.Open();
                    string query = "UPDATE Usuarios SET senha = @senha, primeiroAcesso = false WHERE id = @id";
                    using (var command = new MySqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@senha", novaSenha);
                        command.Parameters.AddWithValue("@id", idUsuario);
                        command.ExecuteNonQuery();
                    }
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("Erro ao criar senha: " + ex.Message);
                throw;
            }
        }

        public static void DeletarUsuario(string id)
        {
            try
            {
                using (var connection = new MySqlConnection(connectionString))
                {
                    connection.Open();
                    string query = "DELETE FROM Usuarios WHERE id = @id";
                    using (var command = new MySqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@id", id);
                        command.ExecuteNonQuery();
                    }
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("Erro ao deletar usuário: " + ex.Message);
                throw;
            }
        }
    }
}
