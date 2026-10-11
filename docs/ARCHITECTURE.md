# Arquitetura da suíte

## Organização

- `CMakeLists.txt`: fixa JUCE 8.0.6 e inclui cada produto.
- `plugins/onde-e-que-eu-to/`: primeiro plugin, com frontend React, processador/editor JUCE, assets e testes.
- `shared/`: reservado para código comprovadamente compartilhado por dois ou mais produtos; não contém abstrações vazias.
- `scripts/`: build, execução e instalação local.
- `build/linux/`: dependências e artefatos gerados, nunca versionados.

## Onde é que eu tô?

O target interno é `OndeEQueEuTo`, o bundle físico é `OndeEQueEuTo.vst3` e o nome apresentado ao host é `Onde é que eu tô?`. Fabricante `JOJO-TOOLS`, versão nativa `0.1.0`, manufacturer code `Jotl` e plugin code `Oeqt`.

O `AudioProcessor` aceita layouts mono→mono e estéreo→estéreo. Primeiro aplica `mainOutputGain` ao sinal recebido e, em seguida, mistura as vozes de referência. Assim, a síntese não substitui o áudio real da DAW. Os comandos de notas chegam por um FIFO de capacidade fixa e nenhuma WebView é acessada pela thread de áudio.

O APVTS contém `notesOutputGain` e `mainOutputGain`, ambos de −12 a +12 dB, padrão 0 dB. O estado é serializado pelo host.

## WebView

O CMake executa a build Vite e incorpora todos os arquivos de `dist/` por `juce_add_binary_data`. O ResourceProvider serve HTML, JavaScript, CSS e fontes sem servidor ou internet. `JOJO_USE_VITE_DEV_SERVER=ON` troca explicitamente a origem por `http://localhost:5173`.

O frontend mantém `MockBridge` no navegador. Dentro do JUCE, `JuceBridge` envia eventos de parâmetros, notas, escalas, stop e links externos. Mudanças de automação do host retornam ao frontend pelo evento `parameterChanged`.

## Git

O `.git` da raiz é um mount vazio e somente leitura neste ambiente. O frontend migrado conserva seu `.git` aninhado, que também não possui commits nem remote. Nenhum metadado foi apagado. A normalização para um único repositório deve ser feita apenas quando a raiz Git for gravável e após backup explícito.

## Plataformas

Linux usa WebKitGTK 4.1. Windows exigirá WebView2 e uma build própria; macOS exigirá validação WKWebView, assinatura e notarização. Nenhuma dessas plataformas é considerada validada sem build e teste locais.
