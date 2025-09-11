using KaraokeMax.Models;
using System.Windows;
using KaraokeMax.Services.Banco_de_Dados;

namespace KaraokeMax.Views
{
    public partial class AlterarSenhaWindow : Window
    {
        private UsuarioModel _usuario;

        public AlterarSenhaWindow(UsuarioModel usuario)
        {
            InitializeComponent();
            _usuario = usuario;
        }

        private void AlterarSenhaButton_Click(object sender, RoutedEventArgs e)
        {
            var novaSenha = NovaSenhaBox.Password;
            var confirmarSenha = ConfirmarSenhaBox.Password;

            if (string.IsNullOrWhiteSpace(novaSenha) || string.IsNullOrWhiteSpace(confirmarSenha))
            {
                MessageBox.Show("Preencha todos os campos.", "Atenção", MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }

            if (novaSenha != confirmarSenha)
            {
                MessageBox.Show("As senhas não coincidem.", "Atenção", MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }

            UsuarioService.AlterarSenhaPrimeiroAcesso(_usuario.id, novaSenha);
            this.Close();
        }
    }
}
