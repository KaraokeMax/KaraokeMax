using System;
using System.Text.RegularExpressions;
using System.Windows;
using System.Windows.Input;
using KaraokeMax.Models;
using KaraokeMax.Services.Banco_de_Dados;

namespace KaraokeMax
{
    public partial class LoginWindow : Window
    {
        public LoginWindow()
        {
            InitializeComponent();
        }

        private void LoginButton_Click(object sender, RoutedEventArgs e)
        {
            var email = EmailBox.Text?.Trim();
            var pass = PasswordBox.Password;

            if (string.IsNullOrWhiteSpace(email))
            {
                MessageBox.Show("Digite seu e-mail.", "Atenção", MessageBoxButton.OK, MessageBoxImage.Warning);
                EmailBox.Focus();
                return;
            }
            if (string.IsNullOrWhiteSpace(pass))
            {
                MessageBox.Show("Digite sua senha.", "Atenção", MessageBoxButton.OK, MessageBoxImage.Warning);
                PasswordBox.Focus();
                return;
            }

            try
            {
                UsuarioModel usuario = UsuarioService.VerificaLogin(email, pass);
                if (usuario != null)
                {
                    if (usuario.primeiroAcesso)
                    {

                    }
                    else
                    {

                    }
                }
                else
                {
                    MessageBox.Show("Credenciais inválidas.", "Erro", MessageBoxButton.OK, MessageBoxImage.Error);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Erro ao autenticar: {ex.Message}", "Erro", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void PasswordBox_KeyDown(object sender, KeyEventArgs e)
        {
            if (e.Key == Key.Enter)
            {
                LoginButton_Click(LoginButton, new RoutedEventArgs());
            }
        }

        private void Forgot_Click(object sender, RoutedEventArgs e)
        {
            MessageBox.Show("Redirecionar para recuperação de senha.", "Esqueci a senha",
                            MessageBoxButton.OK, MessageBoxImage.Information);
        }

        private void CreateAccount_Click(object sender, RoutedEventArgs e)
        {
            MessageBox.Show("Redirecionar para cadastro.", "Criar conta",
                            MessageBoxButton.OK, MessageBoxImage.Information);
        }

        private void CloseButton_Click(object sender, RoutedEventArgs e)
        {
            this.Close();
        }
    }
}
