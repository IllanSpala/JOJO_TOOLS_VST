# JOJO-TOOLS VST Suite

Monorepositório da coleção de plugins musicais **JOJO-TOOLS**. O primeiro produto é **Onde é que eu tô?**, um efeito educacional para estudar escalas, visualizar notas no braço de guitarra ou baixo e ouvir referências musicais dentro do navegador, do aplicativo Standalone ou da DAW.

## Estado atual

O projeto já produz artefatos JUCE reais para Linux:

- aplicativo Standalone;
- plugin VST3;
- interface React incorporada ao binário e disponível offline;
- áudio passante mono ou estéreo;
- ganho de saída automatizável;
- síntese nativa de notas e escalas;
- persistência dos parâmetros pelo host.

O frontend mantém o título funcional **MÁQUINA DE ESCALAS** no header. O nome comercial **Onde é que eu tô?** aparece no modal institucional e nos metadados nativos.

## Estrutura

```text
JOJO_TOOLS_VST/
├── CMakeLists.txt
├── README.md
├── AGENTS.md
├── plugins/
│   └── onde-e-que-eu-to/
│       ├── CMakeLists.txt
│       ├── README.md
│       ├── frontend/          # React, Vite, teoria musical e bridges JS
│       ├── plugin/            # AudioProcessor e WebBrowserComponent JUCE
│       ├── assets/
│       └── tests/
├── shared/                    # Código comum quando houver mais produtos
├── docs/
├── scripts/
├── third_party/
└── build/                     # Gerado e ignorado pelo Git
```

O site `../JOJO_TOOLS/` é somente referência e não faz parte deste repositório.

## Identidade do primeiro plugin

| Campo | Valor |
|---|---|
| Nome comercial | Onde é que eu tô? |
| Fabricante | JOJO-TOOLS |
| Versão nativa | 0.1.0 |
| Versão de desenvolvimento | 0.1.0-dev |
| Target CMake | OndeEQueEuTo |
| Bundle físico | OndeEQueEuTo.vst3 |
| Manufacturer Code | Jotl |
| Plugin Code | Oeqt |
| Categoria | VST3 Fx |

Os nomes físicos não contêm `?` ou caracteres incompatíveis com Windows.

## Dependências Linux

Ambiente validado em sistema Debian 13/Trixie compatível:

- CMake 3.22 ou superior;
- Ninja;
- GCC com C++20;
- Node.js e npm;
- ALSA e JACK development;
- GTK 3 e WebKit2GTK 4.1;
- FreeType e Fontconfig;
- bibliotecas X11 usadas pelo JUCE.

O CMake baixa automaticamente a versão fixada **JUCE 8.0.6** para dentro de `build/linux/_deps`. O JUCE não é instalado globalmente e não é duplicado por plugin.

## Frontend no navegador

```bash
cd plugins/onde-e-que-eu-to/frontend
npm install
npm test
npm run dev
```

Abra `http://localhost:5173`.

No navegador, `MockBridge` usa Web Audio API. Dentro do plugin, `JuceBridge` envia eventos para o backend C++ e não usa `AudioContext.destination`.

Para gerar somente os arquivos estáticos:

```bash
npm run build
```

## Build nativo Linux

Na raiz do repositório:

```bash
./scripts/build-linux.sh
```

O equivalente manual é:

```bash
cmake -S . -B build/linux \
  -G Ninja \
  -DCMAKE_BUILD_TYPE=Debug

cmake --build build/linux --parallel 4
```

Durante a configuração, o frontend é compilado e seus arquivos são incorporados ao plugin por `juce_add_binary_data`. A build normal não precisa de localhost nem de internet durante a execução.

### Desenvolvimento com Vite dentro da WebView

Use uma pasta de build separada:

```bash
cmake -S . -B build/linux-vite \
  -G Ninja \
  -DCMAKE_BUILD_TYPE=Debug \
  -DJOJO_USE_VITE_DEV_SERVER=ON

cmake --build build/linux-vite --parallel 4
```

Mantenha `npm run dev` ativo em `plugins/onde-e-que-eu-to/frontend`.

## Artefatos

Depois da build Debug:

```text
build/linux/plugins/onde-e-que-eu-to/OndeEQueEuTo_artefacts/Debug/
├── Standalone/OndeEQueEuTo
└── VST3/OndeEQueEuTo.vst3/
```

## Executar o Standalone

Em uma sessão gráfica Linux com `DISPLAY` disponível:

```bash
./scripts/run-standalone.sh
```

O editor abre inicialmente em 1600 × 900 e pode ser redimensionado entre os limites configurados pelo JUCE.

## Instalar o VST3

Não requer `sudo`:

```bash
./scripts/install-linux-vst3.sh
```

Destino padrão:

```text
~/.vst3/OndeEQueEuTo.vst3
```

Para usar outro destino:

```bash
JOJO_VST3_DIR=/caminho/desejado ./scripts/install-linux-vst3.sh
```

O script verifica se o bundle compilado existe e copia a estrutura completa, não apenas o arquivo `.so`.

## Testar no REAPER

1. Abra **Preferences → Plug-ins → VST**.
2. Confirme que `~/.vst3` está nos caminhos pesquisados.
3. Execute **Re-scan**.
4. Procure por **Onde é que eu tô?**, fabricante **JOJO-TOOLS**.
5. Insira o plugin em uma faixa com áudio.
6. Teste áudio mono e estéreo.
7. Confirme que `OUTPUT` altera o áudio passante.
8. Confirme que `NOTES OUTPUT` altera somente as notas de referência.
9. Automatize os dois parâmetros e salve/reabra o projeto.
10. Teste notas individuais, reprodução de escala e STOP.

Use níveis seguros ao testar ganhos positivos. O plugin não adiciona limiter, compressor ou distorção.

## Parâmetros nativos

| ID | Interface | Função | Faixa | Padrão |
|---|---|---|---|---|
| `notesOutputGain` | NOTES OUTPUT | Ganho das referências sintetizadas | −12 a +12 dB | 0 dB |
| `mainOutputGain` | OUTPUT | Ganho do áudio recebido da DAW | −12 a +12 dB | 0 dB |

Os parâmetros vivem em `AudioProcessorValueTreeState`, notificam o host e são serializados na sessão.

## Arquitetura de áudio

O processador aplica `mainOutputGain` ao buffer recebido e depois mistura as vozes de referência. A interface nunca acessa a WebView pela thread de áudio. Notas vindas do JavaScript entram em um FIFO de capacidade fixa e são agendadas por amostras.

A síntese atual é deliberadamente simples: onda senoidal com envelope curto para evitar cliques. `NOTES OUTPUT` controla seu ganho de forma independente.

## Comunicação React ↔ JUCE

Eventos enviados ao C++:

- `setParameter`;
- `playNote`;
- `playScale`;
- `stopNotes`;
- `openExternalUrl`.

O backend devolve mudanças do host pelo evento `parameterChanged`, mantendo os knobs sincronizados com automação externa.

## Testes

Frontend:

```bash
cd plugins/onde-e-que-eu-to/frontend
npm test
npm run build
```

Build nativa:

```bash
./scripts/build-linux.sh
```

O teste completo do VST3 ainda exige um host real, como o REAPER.

## Git e primeiro commit

Os `.gitignore` já excluem dependências npm, builds CMake, `dist`, bundles, binários, logs, arquivos de IDE e variáveis de ambiente.

Neste ambiente foi encontrado:

- um `.git` vazio e somente leitura na raiz;
- outro `.git` vazio, sem commits e sem remote, em `plugins/onde-e-que-eu-to/frontend`.

O segundo diretório faz o frontend parecer um repositório separado. Antes de criar um único commit do monorepositório, mova esse metadado para backup — não apague sem confirmar:

```bash
mv plugins/onde-e-que-eu-to/frontend/.git \
   plugins/onde-e-que-eu-to/frontend/.git.backup
```

Depois que a raiz Git estiver gravável:

```bash
git init
git add .
git status
git commit -m "feat: initialize JOJO-TOOLS VST suite"
```

Revise sempre `git status` antes do commit. Não versione `build/`, `node_modules/`, `dist/` nem `.git.backup/`. Se usar o comando de backup acima, mova o backup para fora do repositório antes de executar `git add .`.

## Limitações conhecidas

- O REAPER não estava disponível no ambiente de compilação; reconhecimento e automação ainda precisam ser validados no host.
- O helper de manifesto do JUCE 8.0.6 mostrou mojibake para `é/ô` no `moduleinfo.json`. O nome Unicode permanece configurado, mas deve ser conferido no REAPER antes da distribuição.
- O Standalone precisa de uma sessão gráfica GTK válida.
- Builds Windows e macOS ainda não foram executados.
- O código do Treino do Braço permanece preservado, mas não está ativo na navegação.

## Documentação adicional

- [Arquitetura](docs/ARCHITECTURE.md)
- [Plano de implementação](docs/IMPLEMENTATION_PLAN.md)
- [Mapa de portabilidade](docs/PORTING_MAP.md)
- [README do plugin](plugins/onde-e-que-eu-to/README.md)

## Licença

Ainda não há um arquivo de licença definido no repositório. Antes de publicação ou distribuição pública, escolha uma licença compatível com o objetivo de código aberto e com os termos do JUCE.
