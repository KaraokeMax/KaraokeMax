using NAudio.Wave;
using System.Linq;
using System;
using System.Collections.Generic;
using System.IO;
using System.Text.RegularExpressions;
using System.Windows;
using System.Windows.Media;
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
        private const float VolumeThreshold = 0.04f;

        private readonly Queue<double> _ultimasFrequencias = new Queue<double>();
        private const int TamanhoMediaMovel = 5;

        // ---- NOVO: alvo e afinação ----
        private int _notaAlvoMidi = -1;
        private double _notaAlvoFreq = 0.0;
        private const double ToleranciaCents = 35; // ajuste fino: 25-45 costuma ficar bom

        public MainWindow()
        {
            InitializeComponent();
            _timer = new DispatcherTimer();
            _timer.Interval = TimeSpan.FromMilliseconds(50);
            _timer.Tick += OnTick;

            // exemplos para testar rápido
            TxtAudio.Text = "C:\\Users\\TiagoToi\\Downloads\\instrumental_cidade_vizinha.wav";
            TxtLrc.Text = "C:\\Users\\TiagoToi\\Downloads\\with_notes.lrc";

            IniciarCapturaAudio();
        }

        private void IniciarCapturaAudio()
        {
            _waveIn = new WaveInEvent
            {
                DeviceNumber = 0,
                WaveFormat = new WaveFormat(SampleRate, 1),
                BufferMilliseconds = BufferMilliseconds
            };
            _waveIn.DataAvailable += OnDataAvailable;
            _waveIn.StartRecording();
        }

        private void OnDataAvailable(object sender, WaveInEventArgs e)
        {
            int bytesPerSample = 2;
            int sampleCount = e.BytesRecorded / bytesPerSample;
            if (sampleCount <= 0) return;

            float[] samples = new float[sampleCount];
            for (int i = 0; i < sampleCount; i++)
            {
                short sample = BitConverter.ToInt16(e.Buffer, i * bytesPerSample);
                samples[i] = sample / 32768f;
            }

            // RMS para gate de silêncio
            float rms = 0f;
            for (int i = 0; i < samples.Length; i++) rms += samples[i] * samples[i];
            rms = (float)Math.Sqrt(rms / Math.Max(1, samples.Length));

            if (rms < VolumeThreshold)
            {
                Dispatcher.Invoke(() =>
                {
                    TxtNota.Text = "";
                    TxtCents.Text = "";
                    AtualizaAfinacaoUI(null);
                });
                _ultimasFrequencias.Clear();
                return;
            }

            // Pitch
            double freq = DetectarFrequencia(samples, SampleRate);

            if (freq > 50 && freq < 2000)
            {
                _ultimasFrequencias.Enqueue(freq);
                if (_ultimasFrequencias.Count > TamanhoMediaMovel) _ultimasFrequencias.Dequeue();

                double freqMedia = _ultimasFrequencias.Average();
                string notaCantada = ConverterFrequenciaParaNota(freqMedia);

                // ---- NOVO: compara com alvo se disponível ----
                double? cents = null;
                if (_notaAlvoFreq > 0)
                {
                    cents = 1200.0 * Math.Log(freqMedia / _notaAlvoFreq, 2);
                }

                Dispatcher.Invoke(() =>
                {
                    TxtNota.Text = $"{notaCantada} ({freqMedia:0} Hz)";
                    if (cents.HasValue)
                    {
                        TxtCents.Text = $"{cents.Value:+0;-0;0} cents";
                        AtualizaAfinacaoUI(cents.Value);
                    }
                    else
                    {
                        TxtCents.Text = "";
                        AtualizaAfinacaoUI(null);
                    }
                });
            }
            else
            {
                Dispatcher.Invoke(() =>
                {
                    TxtNota.Text = "";
                    TxtCents.Text = "";
                    AtualizaAfinacaoUI(null);
                });
                _ultimasFrequencias.Clear();
            }
        }

        // Autocorrelação simples (rápida e estável o suficiente)
        private double DetectarFrequencia(float[] buffer, int sampleRate)
        {
            int minLag = sampleRate / 1000; // ~1000 Hz
            int maxLag = sampleRate / 50;   // ~50 Hz
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

            // pequena interpolação parabólica para afinar o pico
            // (opcional, melhora a estabilidade de cents)
            int l = bestLag - 1 >= minLag ? bestLag - 1 : bestLag;
            int r = bestLag + 1 < maxLag ? bestLag + 1 : bestLag;
            double cl = 0, cc = 0, cr = 0;
            for (int i = 0; i < buffer.Length - l; i++) cl += buffer[i] * buffer[i + l];
            for (int i = 0; i < buffer.Length - bestLag; i++) cc += buffer[i] * buffer[i + bestLag];
            for (int i = 0; i < buffer.Length - r; i++) cr += buffer[i] * buffer[i + r];

            double denom = (cl - 2 * cc + cr);
            double delta = denom != 0 ? 0.5 * (cl - cr) / denom : 0.0;
            double refinedLag = bestLag + Math.Max(-1, Math.Min(1, delta));

            return sampleRate / refinedLag;
        }

        private string ConverterFrequenciaParaNota(double freq)
        {
            string[] notas = { "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B" };
            double a4 = 440.0;
            int n = (int)Math.Round(12 * Math.Log(freq / a4, 2));
            int indiceSemitom = (n + 9) % 12;        // A4 é índice 9
            int oitava = 4 + ((n + 9) / 12);
            if (indiceSemitom < 0) { indiceSemitom += 12; oitava--; }
            return notas[indiceSemitom] + oitava;
        }

        // ---- NOVO: utilitários nota<->MIDI/frequência ----
        private static int? NotaParaMidi(string nota)
        {
            if (string.IsNullOrWhiteSpace(nota)) return null;
            nota = nota.Trim();

            // aceita C4, C#4, Db4
            var m = Regex.Match(nota, @"^([A-Ga-g])([#b]?)(-?\d+)$");
            if (!m.Success) return null;

            string letra = m.Groups[1].Value.ToUpper();
            string ac = m.Groups[2].Value;
            int oitava = int.Parse(m.Groups[3].Value);

            var baseIndex = new Dictionary<string, int> {
                { "C",0 }, { "D",2 }, { "E",4 }, { "F",5 }, { "G",7 }, { "A",9 }, { "B",11 }
            }[letra];

            int semis = baseIndex + (ac == "#" ? 1 : ac == "b" ? -1 : 0);
            int midi = (oitava + 1) * 12 + semis; // padrão MIDI
            return midi;
        }

        private static double MidiParaFrequencia(int midi)
        {
            return 440.0 * Math.Pow(2.0, (midi - 69) / 12.0);
        }

        private void BtnLoad_Click(object sender, RoutedEventArgs e)
        {
            String audioPath = TxtAudio.Text.Trim('"');
            String lrcPath = TxtLrc.Text.Trim('"');
            if (!File.Exists(audioPath) || !File.Exists(lrcPath))
            {
                MessageBox.Show("Informe caminhos válidos para o WAV e o LRC.");
                return;
            }

            Player.Source = new Uri(audioPath);

            var lrc = File.ReadAllText(lrcPath);
            _lines = ParseLrc(lrc);
            LstLyrics.ItemsSource = _lines;
            _currentIndex = -1;

            // limpa alvo e UI
            _notaAlvoMidi = -1;
            _notaAlvoFreq = 0;
            TxtNotaCorreta.Text = "";
            TxtCents.Text = "";
            AtualizaAfinacaoUI(null);
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

                // ---- NOVO: atualiza nota alvo da linha ----
                var linha = _lines[_currentIndex];
                var notaCorreta = linha.NotaCorreta;
                int? midi = NotaParaMidi(notaCorreta ?? "");
                if (midi.HasValue)
                {
                    _notaAlvoMidi = midi.Value;
                    _notaAlvoFreq = MidiParaFrequencia(_notaAlvoMidi);
                    TxtNotaCorreta.Text = $"Nota correta: {notaCorreta} ({_notaAlvoFreq:0} Hz)";
                }
                else
                {
                    _notaAlvoMidi = -1;
                    _notaAlvoFreq = 0;
                    TxtNotaCorreta.Text = "";
                }

                // reset feedback ao trocar de linha
                TxtCents.Text = "";
                AtualizaAfinacaoUI(null);
            }
        }

        private static List<LrcLine> ParseLrc(string lrcText)
        {
            var result = new List<LrcLine>();
            if (string.IsNullOrWhiteSpace(lrcText)) return result;

            var lines = lrcText.Replace("\r", "").Split('\n');
            var rxTagHeader = new Regex(@"^\[(ar|ti|al|by|offset):", RegexOptions.IgnoreCase);

            // Nota em QUALQUER posição (tolerante a espaços e unicode ♯/♭):
            // grupos: 1=letra, 2=acidente, 3=oitava
            var rxNotaToken = new Regex(
                @"<\s*([A-Ga-g])\s*([#♯bB♭]?)\s*(-?\d+)\s*>",
                RegexOptions.Compiled);

            foreach (var raw in lines)
            {
                var line = raw.TrimEnd(); // não faça Trim() total para não perder início com '['
                if (line.Length == 0) continue;
                if (rxTagHeader.IsMatch(line)) continue;

                // timestamps do INÍCIO
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
                if (stamps.Count == 0) continue;

                // resto da linha é texto + possíveis <notas> em qualquer lugar
                string text = line.Substring(Math.Min(i, line.Length)).Trim();

                // captura TODAS as notas; use a ÚLTIMA por segurança
                string notaCorreta = null;
                var matches = rxNotaToken.Matches(text);
                if (matches.Count > 0)
                {
                    var m = matches[matches.Count - 1];
                    string letra = m.Groups[1].Value.ToUpperInvariant(); // A..G
                    string ac = NormalizeAccidental(m.Groups[2].Value);  // "#", "b" ou ""
                    string oit = m.Groups[3].Value;                      // -?\d+
                    notaCorreta = $"{letra}{ac}{oit}";

                    // remove TODOS os tokens <nota> do texto visível
                    text = rxNotaToken.Replace(text, "").Trim();
                }

                // >>> NÃO descarte linhas sem texto se tem nota/alvo ou mesmo sem nota (karaokê instrumental/sustain)
                // Aceite se (há texto) OU (há nota) — desde que haja timestamp.
                if (text.Length == 0 && string.IsNullOrEmpty(notaCorreta))
                    text = ""; // fica vazio, mas mantém a linha (útil p/ barras/pausas)

                foreach (var s in stamps)
                    result.Add(new LrcLine { Time = s, Text = text, NotaCorreta = notaCorreta });
            }

            result.Sort((a, b) => a.Time.CompareTo(b.Time));
            return result;
        }

        private static string NormalizeAccidental(string raw)
        {
            if (string.IsNullOrEmpty(raw)) return "";
            raw = raw.Trim();
            // Unicode: U+266F (♯), U+266D (♭)
            if (raw == "♯") return "#";
            if (raw == "♭" || raw == "B") return "b"; // "B" pode vir do ToUpper acidentalmente
            if (raw == "#") return "#";
            if (raw == "b") return "b";
            return ""; // qualquer outra coisa, ignora
        }

        private static double? TryParseStamp(string s)
        {
            try
            {
                // aceita mm:ss, mm:ss.ms, mm:ss,ms
                s = s.Trim();
                var parts = s.Split(':');
                if (parts.Length != 2) return null;

                int mm = int.Parse(parts[0]);
                string secPart = parts[1];

                int ss;
                int ms = 0;

                // normaliza vírgula para ponto
                secPart = secPart.Replace(',', '.');

                if (secPart.Contains("."))
                {
                    var dot = secPart.IndexOf('.');
                    ss = int.Parse(secPart.Substring(0, dot));
                    var frac = secPart.Substring(dot + 1);

                    // pad right para 3 dígitos (ms)
                    if (frac.Length == 1) frac += "00";
                    else if (frac.Length == 2) frac += "0";
                    else if (frac.Length > 3) frac = frac.Substring(0, 3);

                    ms = int.Parse(frac);
                }
                else
                {
                    ss = int.Parse(secPart);
                }

                return mm * 60 + ss + ms / 1000.0;
            }
            catch { return null; }
        }


        private class LrcLine
        {
            public double Time { get; set; }
            public string Text { get; set; }
            public string NotaCorreta { get; set; }
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

        // ---- NOVO: feedback visual de afinação ----
        private void AtualizaAfinacaoUI(double? cents)
        {
            if (PgbAfinacao == null || LblAfinacao == null) return;

            if (!cents.HasValue)
            {
                PgbAfinacao.Value = 50; // centro
                PgbAfinacao.Foreground = new SolidColorBrush(Color.FromRgb(180, 180, 180));
                LblAfinacao.Text = "";
                return;
            }

            double c = Math.Max(-100, Math.Min(100, cents.Value)); // clamp para UI
            // mapeia -100..+100 cents => 0..100
            PgbAfinacao.Value = 50 + (c / 2.0);

            // cor: verde se dentro da tolerância; vermelho fora
            bool ok = Math.Abs(c) <= ToleranciaCents;
            PgbAfinacao.Foreground = ok
                ? new SolidColorBrush(Color.FromRgb(0, 160, 80))
                : new SolidColorBrush(Color.FromRgb(200, 60, 60));

            LblAfinacao.Text = ok
                ? "OK"
                : (c > 0 ? "AGUDO (+)" : "GRAVE (-)");
        }
    }
}
