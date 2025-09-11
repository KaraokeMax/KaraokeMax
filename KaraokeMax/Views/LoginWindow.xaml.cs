using System;
using System.Text.RegularExpressions;
using System.Windows;
using System.Windows.Input;
using KaraokeMax.Models;
using KaraokeMax.Services.Banco_de_Dados;
using System.Windows.Controls;
using System.Windows.Media.Imaging;
using KaraokeMax.Views;

namespace KaraokeMax
{
    public partial class LoginWindow : Window
    {
        private bool _isPasswordVisible = false;
        private bool _isSyncing = false; // Flag para evitar loop

        public LoginWindow()
        {
            InitializeComponent();
        }

        private void PasswordBox_PasswordChanged(object sender, RoutedEventArgs e)
        {
            if (_isSyncing) return;
            _isSyncing = true;
            PasswordTextBox.Text = PasswordBox.Password;
            _isSyncing = false;
        }

        private void PasswordTextBox_TextChanged(object sender, TextChangedEventArgs e)
        {
            if (_isSyncing) return;
            _isSyncing = true;
            PasswordBox.Password = PasswordTextBox.Text;
            _isSyncing = false;
        }

        private void ShowPasswordButton_Click(object sender, RoutedEventArgs e)
        {
            _isPasswordVisible = !_isPasswordVisible;
            if (_isPasswordVisible)
            {
                PasswordTextBox.Visibility = Visibility.Visible;
                PasswordBox.Visibility = Visibility.Collapsed;
                EyeIcon.Text = "🔒";
                PasswordTextBox.Focus();

                // Garante que o cursor vá para o final após o foco
                PasswordTextBox.CaretIndex = PasswordTextBox.Text.Length;
                PasswordTextBox.SelectionStart = PasswordTextBox.Text.Length;
                PasswordTextBox.SelectionLength = 0;
            }
            else
            {
                PasswordTextBox.Visibility = Visibility.Collapsed;
                PasswordBox.Visibility = Visibility.Visible;
                EyeIcon.Text = "👁"; 
                PasswordBox.Focus();
            }
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
                        AlterarSenhaWindow alterarSenhaWindow = new AlterarSenhaWindow(usuario);
                        this.Close();
                        alterarSenhaWindow.Show();
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

        private void CloseButton_Click(object sender, RoutedEventArgs e)
        {
            this.Close();
        }
    }
}
