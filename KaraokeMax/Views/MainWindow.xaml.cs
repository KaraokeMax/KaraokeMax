using NAudio.Wave;
using System.Linq;
using System;
using System.Collections.Generic;
using System.IO;
using System.Text.RegularExpressions;
using System.Windows;
using System.Windows.Threading;

namespace KaraokeMax
{
    public partial class MainWindow : Window
    {
        private readonly DispatcherTimer _timer;
        private List<LrcLine> _lines = new List<LrcLine>();
        private int _currentIndex = -1;

        private WaveInEvent _waveIn;
        private const int SampleRate = 44100;
        private const int BufferMilliseconds = 50;
        private const float VolumeThreshold = 0.04f; // Threshold para considerar o volume como "silencioso"

        private readonly Queue<double> _ultimasFrequencias = new Queue<double>();
        private const int TamanhoMediaMovel = 5; // Ajuste para mais/menos suavização

        public MainWindow()
        {
            InitializeComponent();
            _timer = new DispatcherTimer();
            _timer.Interval = TimeSpan.FromMilliseconds(50); // ~20 fps
            _timer.Tick += OnTick;

            // exemplos para testar rápido
            TxtAudio.Text = "C:\\Users\\TiagoToi\\Downloads\\@coldplay - Fix You (Lyrics) [bzRMneypG04]Instrumental.wav";
            TxtLrc.Text = "C:\\Users\\TiagoToi\\OneDrive - Taxcel\\Documentos\\Puc\\KaraokeMax\\KaraokeMax\\bin\\Debug\\musicas\\Coldplay\\Fix You\\lyrics.lrc";

            // Inicializa captura de áudio
            IniciarCapturaAudio();
        }

        private void IniciarCapturaAudio()
        {
            _waveIn = new WaveInEvent();
            _waveIn.DeviceNumber = 0;
            _waveIn.WaveFormat = new WaveFormat(SampleRate, 1);
            _waveIn.BufferMilliseconds = BufferMilliseconds;
            _waveIn.DataAvailable += OnDataAvailable;
            _waveIn.StartRecording();
        }

        private void OnDataAvailable(object sender, WaveInEventArgs e)
        {
            // Converte bytes para amostras de float
            int bytesPerSample = 2;
            int sampleCount = e.BytesRecorded / bytesPerSample;
            float[] samples = new float[sampleCount];
            for (int i = 0; i < sampleCount; i++)
            {
                short sample = BitConverter.ToInt16(e.Buffer, i * bytesPerSample);
                samples[i] = sample / 32768f;
            }

            // Calcula o volume RMS
            float rms = 0f;
            for (int i = 0; i < samples.Length; i++)
                rms += samples[i] * samples[i];
            rms = (float)Math.Sqrt(rms / samples.Length);

            if (rms < VolumeThreshold)
            {
                Dispatcher.Invoke(() => TxtNota.Text = "");
                _ultimasFrequencias.Clear(); // Limpa histórico se ficou em silêncio
                return;
            }

            double freq = DetectarFrequencia(samples, SampleRate);

            // Só considera frequências dentro do intervalo vocal
            if (freq > 50 && freq < 2000)
            {
                _ultimasFrequencias.Enqueue(freq);
                if (_ultimasFrequencias.Count > TamanhoMediaMovel)
                    _ultimasFrequencias.Dequeue();

                double freqMedia = _ultimasFrequencias.Average();
                string nota = ConverterFrequenciaParaNota(freqMedia);
                Dispatcher.Invoke(() => TxtNota.Text = nota + $" ({freqMedia:0} Hz)");
            }
            else
            {
                Dispatcher.Invoke(() => TxtNota.Text = "");
                _ultimasFrequencias.Clear(); // Limpa histórico se saiu do range
            }
        }

        // Algoritmo simples de autocorrelação para pitch detection
        private double DetectarFrequencia(float[] buffer, int sampleRate)
        {
            int minLag = sampleRate / 1000; // 1000 Hz
            int maxLag = sampleRate / 50;   // 50 Hz
            double maxCorr = 0;
            int bestLag = 0;

            for (int lag = minLag; lag < maxLag; lag++)
            {
                double corr = 0;
                for (int i = 0; i < buffer.Length - lag; i++)
                    corr += buffer[i] * buffer[i + lag];
                if (corr > maxCorr)
                {
                    maxCorr = corr;
                    bestLag = lag;
                }
            }
            if (bestLag == 0) return 0;
            return sampleRate / (double)bestLag;
        }

        // Converte frequência para nota musical
        private string ConverterFrequenciaParaNota(double freq)
        {
            string[] notas = { "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B" };
            double a4 = 440.0;
            int n = (int)Math.Round(12 * Math.Log(freq / a4, 2));
            int notaIndex = (n + 9) % 12;
            int oitava = 4 + ((n + 9) / 12);
            if (notaIndex < 0) { notaIndex += 12; oitava--; }
            return notas[notaIndex] + oitava;
        }

        private void BtnLoad_Click(object sender, RoutedEventArgs e)
        {
            String audioPath = TxtAudio.Text.TrimStart('"').TrimEnd('"');
            String lrcPath = TxtLrc.Text.TrimStart('"').TrimEnd('"');
            if (!File.Exists(audioPath) || !File.Exists(lrcPath))
            {
                MessageBox.Show("Informe caminhos válidos para o WAV e o LRC.");
                return;
            }

            // carrega audio
            Player.Source = new Uri(audioPath);

            // carrega e parseia LRC
            var lrc = File.ReadAllText(lrcPath);
            _lines = ParseLrc(lrc);
            LstLyrics.ItemsSource = _lines; 
            _currentIndex = -1;
        }

        private void BtnPlay_Click(object sender, RoutedEventArgs e)
        {
            if (Player.Source == null)
            {
                MessageBox.Show("Carregue primeiro o áudio e a letra.");
                return;
            }
            Player.Play();
            _timer.Start();
        }

        private void BtnPause_Click(object sender, RoutedEventArgs e)
        {
            _timer.Stop();
            Player.Pause();
        }

        private void OnTick(object sender, EventArgs e)
        {
            if (_lines.Count == 0 || Player.NaturalDuration.HasTimeSpan == false) return;

            double t = Player.Position.TotalSeconds;

            // encontra a última linha com tempo <= t (busca linear simples; para listas grandes, use busca binária)
            int idx = _currentIndex;
            if (idx < 0 || idx >= _lines.Count || _lines[idx].Time > t)
                idx = 0;

            while (idx + 1 < _lines.Count && _lines[idx + 1].Time <= t)
                idx++;

            if (idx != _currentIndex)
            {
                _currentIndex = idx;
                LstLyrics.SelectedIndex = idx;
                LstLyrics.ScrollIntoView(LstLyrics.SelectedItem);
            }

            // Exibe a nota correta da linha atual
            if (_currentIndex >= 0 && _currentIndex < _lines.Count)
            {
                var notaCorreta = _lines[_currentIndex].NotaCorreta;
                Dispatcher.Invoke(() => TxtNotaCorreta.Text = !string.IsNullOrEmpty(notaCorreta) ? $"Nota correta: {notaCorreta}" : "");
            }
            else
            {
                Dispatcher.Invoke(() => TxtNotaCorreta.Text = "");
            }
        }

        private static List<LrcLine> ParseLrc(string lrcText)
        {
            var result = new List<LrcLine>();
            if (string.IsNullOrWhiteSpace(lrcText)) return result;

            var lines = lrcText.Replace("\r", "").Split('\n');
            var rxTag = new Regex(@"^\[(ar|ti|al|by|offset):", RegexOptions.IgnoreCase);

            foreach (var raw in lines)
            {
                var line = raw.Trim();
                if (line.Length == 0) continue;
                if (rxTag.IsMatch(line)) continue;

                int i = 0;
                var stamps = new List<double>();
                while (i < line.Length && line[i] == '[')
                {
                    int j = line.IndexOf(']', i);
                    if (j < 0) break;
                    var stamp = line.Substring(i + 1, j - i - 1);
                    double? sec = TryParseStamp(stamp);
                    if (sec.HasValue) stamps.Add(sec.Value);
                    i = j + 1;
                }

                // NOVO: tenta capturar a nota correta se vier no formato <nota>texto
                string notaCorreta = null;
                string text = line.Substring(Math.Min(i, line.Length)).Trim();
                if (text.StartsWith("<") && text.Contains(">"))
                {
                    int endNota = text.IndexOf('>');
                    notaCorreta = text.Substring(1, endNota - 1);
                    text = text.Substring(endNota + 1).Trim();
                }

                if (stamps.Count == 0 || text.Length == 0) continue;

                foreach (var s in stamps)
                    result.Add(new LrcLine { Time = s, Text = text, NotaCorreta = notaCorreta });
            }

            result.Sort((a, b) => a.Time.CompareTo(b.Time));
            return result;
        }

        private static double? TryParseStamp(string s)
        {
            // mm:ss | mm:ss.xx | mm:ss.xxx
            try
            {
                var parts = s.Split(':');
                if (parts.Length != 2) return null;
                int mm = int.Parse(parts[0]);
                int ss;
                int ms = 0;
                if (parts[1].Contains("."))
                {
                    var dot = parts[1].IndexOf('.');
                    ss = int.Parse(parts[1].Substring(0, dot));
                    var frac = parts[1].Substring(dot + 1);
                    if (frac.Length == 1) frac += "00";
                    else if (frac.Length == 2) frac += "0";
                    else if (frac.Length > 3) frac = frac.Substring(0, 3);
                    ms = int.Parse(frac);
                }
                else
                {
                    ss = int.Parse(parts[1]);
                }
                return mm * 60 + ss + ms / 1000.0;
            }
            catch { return null; }
        }

        private class LrcLine
        {
            public double Time { get; set; }
            public string Text { get; set; }
            public string NotaCorreta { get; set; } // NOVO CAMPO
            public override string ToString() => Text;
        }

        protected override void OnClosed(EventArgs e)
        {
            base.OnClosed(e);
            if (_waveIn != null)
            {
                _waveIn.StopRecording();
                _waveIn.Dispose();
            }
        }
    }
}
