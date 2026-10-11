# JOJO-TOOLS VST Suite

**Dont pay, just play!**

Monorepositório da coleção de plugins musicais **JOJO-TOOLS**. O primeiro produto é **Onde é que eu tô?**, um efeito educacional para explorar escalas e modos, visualizar notas no braço da guitarra ou do baixo e ouvir referências musicais no navegador, no aplicativo Standalone ou em uma DAW compatível com VST3.

**Repositório:** https://github.com/IllanSpala/JOJO_TOOLS_VST  
**Desenvolvedor:** [IllanSpala](https://github.com/IllanSpala)

> **Status:** o projeto possui implementação e artefatos nativos Linux descritos nesta documentação. A build Windows, a integração com WebView2 e o funcionamento em hosts Windows ainda precisam ser compilados e validados. Não há instalador Windows ou binário Windows confirmado neste repositório.

## Primeiro plugin — Onde é que eu tô?

| Campo | Valor |
|---|---|
| Nome comercial | **Onde é que eu tô?** |
| Fabricante | **JOJO-TOOLS** |
| Versão nativa | `0.1.0` |
| Versão de desenvolvimento | `0.1.0-dev` |
| Target CMake | `OndeEQueEuTo` |
| Bundle físico | `OndeEQueEuTo.vst3` |
| Manufacturer Code | `Jotl` |
| Plugin Code | `Oeqt` |
| Categoria | `VST3 Fx` |

O header do frontend continua exibindo **MÁQUINA DE ESCALAS**; **Onde é que eu tô?** é o nome do produto no modal e nos metadados. O nome físico do bundle não contém `?`, caractere incompatível com nomes de arquivos do Windows.

### Funcionalidades implementadas no projeto Linux

- Aplicativo **Standalone** e plugin **VST3** baseados em JUCE.
- Interface React/Vite incorporada ao binário, sem servidor local obrigatório na execução normal.
- Áudio passante mono/estéreo e controle de ganho principal.
- Síntese nativa simples de notas e escalas, com controle independente de volume.
- Parâmetros automatizáveis e persistência pelo host.
- Fretboard, afinações, CHUG, fórmula intervalar e animações musicais do frontend.

> O reconhecimento efetivo pelo REAPER, os detalhes de automação e a renderização em cada sistema operacional devem ser confirmados nos testes de host. O **Treino do Braço** ainda não está ativo na navegação.

## Estrutura do monorepositório

```text
JOJO_TOOLS_VST/
├── CMakeLists.txt
├── README.md
├── AGENTS.md
├── plugins/
│   └── onde-e-que-eu-to/
│       ├── CMakeLists.txt
│       ├── README.md
│       ├── frontend/      # React, Vite, teoria musical e bridges JS
│       ├── plugin/        # C++, AudioProcessor e WebBrowserComponent JUCE
│       ├── assets/
│       └── tests/
├── shared/                # Código reutilizável dos futuros plugins
├── docs/
├── scripts/
├── third_party/
└── build/                 # Gerado localmente; ignorado pelo Git
```

O site original `../JOJO_TOOLS/` é apenas referência e não faz parte deste repositório. Os comandos de **CMake partem sempre da raiz `JOJO_TOOLS_VST/`**; os comandos de desenvolvimento do frontend partem de `plugins/onde-e-que-eu-to/frontend/`.

---

## Instalação rápida — Linux (usuários de DAW)

**É necessário obter antes um bundle VST3 Linux compilado**, seja de uma distribuição futura do projeto, seja compilando o código conforme a próxima seção. Um `.vst3` compilado no Windows não funciona no Linux, nem o contrário.

Se o projeto já foi compilado localmente:

```bash
cd ~/Documentos/Coding/JOJO_TOOLS_VST
./scripts/install-linux-vst3.sh
```

O script usa, por padrão:

```text
~/.vst3/OndeEQueEuTo.vst3/
```

Para um destino alternativo:

```bash
JOJO_VST3_DIR=/caminho/desejado ./scripts/install-linux-vst3.sh
```

O bundle completo deve ser copiado, não apenas o `.so` interno. Não é necessário `sudo` para instalar em `~/.vst3/`.

### Compilar no Linux (desenvolvedores)

Ambiente de referência: Debian 13/Trixie ou compatível. Requer CMake 3.22+, Ninja, compilador C++20, Git, Node.js/npm, bibliotecas de desenvolvimento ALSA, JACK, GTK 3, WebKit2GTK 4.1, FreeType, Fontconfig e X11 utilizadas pelo JUCE.

A partir da raiz do repositório:

```bash
./scripts/build-linux.sh
```

Ou manualmente:

```bash
cmake -S . -B build/linux -G Ninja -DCMAKE_BUILD_TYPE=Debug
cmake --build build/linux --parallel 4
```

O CMake usa **JUCE 8.0.6** fixado por `FetchContent`; a primeira configuração exige acesso à internet para obter o código do JUCE, se ainda não estiver em cache. A configuração também executa a build do frontend por `npm run build`, portanto as dependências npm devem estar instaladas antes.

Artefatos Debug esperados:

```text
build/linux/plugins/onde-e-que-eu-to/OndeEQueEuTo_artefacts/Debug/
├── Standalone/OndeEQueEuTo
└── VST3/OndeEQueEuTo.vst3/
```

Execute o Standalone numa sessão gráfica Linux:

```bash
./scripts/run-standalone.sh
```

### Vite dentro da WebView no Linux (desenvolvimento)

```bash
cd plugins/onde-e-que-eu-to/frontend
npm ci
npm run dev
```

Em outro terminal, na raiz do hub:

```bash
cmake -S . -B build/linux-vite -G Ninja \
  -DCMAKE_BUILD_TYPE=Debug \
  -DJOJO_USE_VITE_DEV_SERVER=ON
cmake --build build/linux-vite --parallel 4
```

Nesta modalidade de desenvolvimento, mantenha `npm run dev` ativo. O build normal, sem a opção `JOJO_USE_VITE_DEV_SERVER`, utiliza os assets incorporados e não depende de `localhost`.

---

## Instalação rápida — Windows 10/11 (usuários de DAW)

> **Disponibilidade:** ainda não há build Windows validada nem instalador `.exe`/`.msi` publicado. As instruções a seguir se aplicam **quando um bundle Windows x64 tiver sido compilado**. Não copie o bundle Linux para o Windows.

### Requisitos para executar

- Windows 10/11 x64 e DAW com suporte a VST3 (por exemplo, REAPER x64).
- Bundle **Windows x64** `OndeEQueEuTo.vst3`, contendo os binários internos gerados para Windows.
- **Microsoft Edge WebView2 Runtime** instalado, se a versão Windows utilizar o backend WebView2 (recomendado para renderizar o React). Verifique em **Aplicativos instalados**; se necessário, obtenha-o em https://developer.microsoft.com/microsoft-edge/webview2/.

### Instalação para o usuário atual (sem administrador)

1. Feche o REAPER.
2. Obtenha o bundle `OndeEQueEuTo.vst3` **compilado para Windows**.
3. Pressione `Win + R`, cole o caminho abaixo e confirme:

   ```text
   %LOCALAPPDATA%\Programs\Common\VST3
   ```

4. Crie a pasta se ela não existir.
5. Copie **a pasta `OndeEQueEuTo.vst3` inteira** para esse diretório, preservando `Contents` e seus arquivos internos.
6. Inicie o REAPER e faça uma nova varredura VST3.

O destino resultante deverá ser semelhante a:

```text
C:\Users\SEU_USUARIO\AppData\Local\Programs\Common\VST3\OndeEQueEuTo.vst3\
```

### Instalação global (todos os usuários)

Se preferir instalar para todas as contas do computador, utilize:

```text
C:\Program Files\Common Files\VST3\
```

Essa instalação normalmente exige permissão de administrador. Não instale o plugin dentro da pasta de instalação do REAPER.

**Atualização:** feche a DAW e faça backup da versão anterior antes de substituí-la. Evite manter cópias com o mesmo identificador VST3 nos destinos de usuário e global, pois o host poderá escolher uma delas.

### Instalar pelo PowerShell (opcional)

Se você estiver no diretório raiz do projeto **e já possuir um bundle Windows compilado**, use:

```powershell
$bundle = '.\build\windows\plugins\onde-e-que-eu-to\OndeEQueEuTo_artefacts\Release\VST3\OndeEQueEuTo.vst3'
$destino = Join-Path $env:LOCALAPPDATA 'Programs\Common\VST3'

if (-not (Test-Path -LiteralPath $bundle -PathType Container)) {
    throw "Bundle Windows não encontrado: $bundle"
}

New-Item -ItemType Directory -Force -Path $destino | Out-Null

if (Test-Path -LiteralPath (Join-Path $destino 'OndeEQueEuTo.vst3')) {
    throw 'Já existe uma instalação. Feche a DAW e faça backup antes de substituir.'
}

Copy-Item -LiteralPath $bundle -Destination $destino -Recurse
```

O caminho de origem é o **esperado** para a configuração Release; confirme o local real depois do build.

---

## Compilar para Windows (desenvolvedores)

A compilação Windows deve ser executada **no próprio Windows**, com toolchain MSVC. O código-fonte é compartilhado com o Linux, mas os binários não são intercambiáveis.

### Pré-requisitos

- **Visual Studio 2022** ou Build Tools 2022, com o workload **Desenvolvimento para desktop com C++**, MSVC x64 e Windows SDK.
- **CMake 3.22+**.
- **Git**.
- **Node.js LTS e npm**.
- **WebView2 SDK/NuGet** para compilar a integração JUCE WebView2; o **WebView2 Runtime** é necessário na máquina que executará a interface.
- Internet no primeiro configure para obter o JUCE 8.0.6 via `FetchContent` e eventuais dependências.

### Atenção: adaptação Windows ainda necessária no código atual

Na versão atual do repositório, `plugins/onde-e-que-eu-to/CMakeLists.txt` ainda **não declara `NEEDS_WEBVIEW2 TRUE`** e `PluginEditor.cpp` ainda **não seleciona explicitamente o backend `webview2`**. Antes de considerar a build Windows pronta para uso, implementar e testar:

1. Configuração condicional de `NEEDS_WEBVIEW2 TRUE` no target JUCE ao compilar no Windows.
2. Definições de compilação WebView2 recomendadas pelo JUCE 8, quando aplicáveis.
3. `WebBrowserComponent::Options::Backend::webview2` no Windows.
4. Diretório de dados do WebView2 gravável pelo processo da DAW, usando `withWinWebView2Options()`.
5. Localização do pacote WebView2 SDK/NuGet durante a configuração CMake.
6. Testes do React embutido e da comunicação JS ↔ JUCE no REAPER Windows.

Sem essa etapa, uma compilação pode falhar ou apresentar uma WebView incompatível com o frontend moderno. **As instruções abaixo são o procedimento de build previsto, não uma garantia de compatibilidade Windows já validada.**

Referência: https://juce.com/blog/juce-8-feature-overview-webview-uis/

### Clonar e preparar

Abra **PowerShell** ou um terminal de desenvolvimento do Visual Studio:

```powershell
git clone git@github.com:IllanSpala/JOJO_TOOLS_VST.git
cd JOJO_TOOLS_VST

cd plugins/onde-e-que-eu-to/frontend
npm ci
cd ../../..
```

Para um clone público sem SSH configurado, substitua a primeira linha por:

```powershell
git clone https://github.com/IllanSpala/JOJO_TOOLS_VST.git
```

### Configurar e compilar x64 Release

Na raiz `JOJO_TOOLS_VST`:

```powershell
cmake -S . -B build/windows -G 'Visual Studio 17 2022' -A x64 -DJOJO_USE_VITE_DEV_SERVER=OFF
cmake --build build/windows --config Release --parallel 4
```

O Visual Studio utiliza gerador *multi-config*: selecione `Release` no comando de build; `CMAKE_BUILD_TYPE=Release` não é necessário nesse gerador.

### Localizar os artefatos Windows

```powershell
Get-ChildItem .\build\windows -Recurse -Filter '*.vst3'
Get-ChildItem .\build\windows -Recurse -Filter 'OndeEQueEuTo.exe'
```

Diretório esperado (confirmar após compilar):

```text
build\windows\plugins\onde-e-que-eu-to\OndeEQueEuTo_artefacts\Release\
├── Standalone\OndeEQueEuTo.exe
└── VST3\OndeEQueEuTo.vst3\
```

Execute o `.exe` Standalone primeiro para verificar a renderização e o áudio. Depois instale a pasta `.vst3` seguindo a seção **Instalação rápida — Windows** e teste no REAPER.

---

## Testar no REAPER (Linux e Windows)

1. Abra **Options → Preferences → Plug-ins → VST**.
2. Confirme que o diretório de instalação VST3 está entre os caminhos que o REAPER pesquisa.
3. Execute **Re-scan**; se necessário, use uma varredura completa do cache.
4. No navegador de efeitos, procure **Onde é que eu tô?** ou **JOJO-TOOLS**. Se o nome estiver incorreto, consulte as limitações de Unicode abaixo.
5. Insira o plugin numa trilha com áudio de guitarra/baixo ou material gravado.
6. Verifique passagem de áudio mono e estéreo.
7. Teste `OUTPUT` e `NOTES OUTPUT` separadamente.
8. Teste notas individuais, reprodução de escala, animação da fórmula e STOP.
9. Automatize os parâmetros, salve o projeto e reabra-o.
10. Verifique a estabilidade da interface ao fechar/reabrir o editor.

**Atenção aos níveis:** ganhos positivos de até +12 dB podem causar clipping. O plugin não adiciona limiter, compressor ou distorção.

## Frontend no navegador

```bash
cd plugins/onde-e-que-eu-to/frontend
npm ci
npm test
npm run dev
```

Acesse http://localhost:5173. No navegador, o `MockBridge` utiliza Web Audio API; no plugin, o `JuceBridge` comunica-se com o backend C++.

Para gerar somente o frontend:

```bash
npm run build
```

No Windows, execute os comandos acima em PowerShell a partir da mesma pasta relativa.

## Parâmetros nativos

| ID | Interface | Função | Faixa | Padrão |
|---|---|---|---|---|
| `notesOutputGain` | NOTES OUTPUT | Ganho das notas sintetizadas | −12 a +12 dB | 0 dB |
| `mainOutputGain` | OUTPUT | Ganho do áudio passante da DAW | −12 a +12 dB | 0 dB |

Os parâmetros utilizam `AudioProcessorValueTreeState`, são comunicados ao host e integram seu estado salvo. O processador aplica o ganho principal ao áudio recebido e mistura as vozes de referência com ganho independente.

## Arquitetura de áudio e comunicação

A síntese de referência atual utiliza onda senoidal e envelope curto para reduzir cliques. Os eventos vindos do JavaScript passam ao backend por uma fila de capacidade fixa e são processados no contexto de áudio, sem manipular a WebView na thread de áudio.

Eventos React → JUCE:

- `setParameter`
- `playNote`
- `playScale`
- `stopNotes`
- `openExternalUrl`

Eventos JUCE → React:

- `parameterChanged`

No build normal, os assets Vite são incorporados ao programa por `juce_add_binary_data`, sem a necessidade de manter um servidor de desenvolvimento ativo.

## Testes

Frontend:

```bash
cd plugins/onde-e-que-eu-to/frontend
npm test
npm run build
```

Compilação Linux:

```bash
./scripts/build-linux.sh
```

Compilação Windows:

```powershell
cmake -S . -B build/windows -G 'Visual Studio 17 2022' -A x64
cmake --build build/windows --config Release --parallel 4
```

O sucesso da compilação não substitui os testes reais de interface, áudio e automação dentro do REAPER.

## Git e contribuições

O repositório principal da suíte é:

https://github.com/IllanSpala/JOJO_TOOLS_VST

A branch principal é `main`. O frontend e o código JUCE pertencem ao mesmo monorepositório; não é necessário inicializar outro repositório dentro da pasta do plugin. Não repita `git init` ou mova `.git` sem necessidade.

Antes de qualquer commit, confira `git status` e evite incluir `build/`, `node_modules/`, `dist/`, bundles e arquivos `.env` ou credenciais. Para contribuir, utilize branches e pull requests.

## Limitações conhecidas

- A implementação nativa e os artefatos relatados até aqui são do **Linux**; o REAPER ainda precisa de validação em host real conforme os testes previstos.
- **Windows:** WebView2 requer ajustes no CMake e no `PluginEditor.cpp`, seguidos de compilação e validação. Não há `.vst3` Windows validado nesta documentação.
- **Windows:** é necessário verificar a presença do WebView2 Runtime nas máquinas dos usuários e distribuir suas dependências corretamente.
- O helper de manifesto JUCE 8.0.6 apresentou caracteres incorretos (*mojibake*) para `é` e `ô` em `moduleinfo.json`. Conferir o nome do plugin exibido pelo REAPER antes de publicar releases.
- O Standalone Linux requer sessão gráfica GTK válida.
- macOS ainda não foi compilado nem validado.
- O Treino do Braço está preservado no código, mas não é acessível na interface atual.

## Documentação adicional

- [Arquitetura](docs/ARCHITECTURE.md)
- [Plano de implementação](docs/IMPLEMENTATION_PLAN.md)
- [Mapa de portabilidade](docs/PORTING_MAP.md)
- [README do primeiro plugin](plugins/onde-e-que-eu-to/README.md)
- [Documentação de WebViews no JUCE 8](https://juce.com/blog/juce-8-feature-overview-webview-uis/)
- [Locais oficiais de instalação VST3 — Steinberg](https://steinbergmedia.github.io/vst3_dev_portal/pages/Technical%2BDocumentation/Locations%2BFormat/Plugin%2BLocations.html)
- [Distribuição do WebView2 Runtime — Microsoft](https://learn.microsoft.com/microsoft-edge/webview2/concepts/distribution)

## Licença

**Ainda não há uma licença definida no repositório.** A intenção de disponibilizar a JOJO-TOOLS gratuitamente e com código aberto não equivale, por si só, à concessão de direitos de reutilização. Antes de distribuir binários ou aceitar contribuições, escolha e publique uma licença compatível com os termos aplicáveis do JUCE e das demais dependências.