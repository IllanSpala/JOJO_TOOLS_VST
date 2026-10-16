# Plano de implementação

## Estado da Fase 2

- [x] Migrar o frontend aprovado para `plugins/onde-e-que-eu-to/frontend`.
- [x] Preservar header, fretboard, CHUG, animação e testes.
- [x] Fixar JUCE 8.0.6 no CMake central.
- [x] Gerar Standalone e VST3.
- [x] Incorporar a build React em WebBrowserComponent/ResourceProvider.
- [x] Implementar APVTS e persistência dos dois ganhos.
- [x] Implementar passagem mono/estéreo e ganho OUTPUT.
- [x] Implementar síntese simples de referências na saída do plugin.
- [x] Implementar scripts de build, instalação e execução.
- [ ] Validar reconhecimento e operação no REAPER; o executável não está instalado neste ambiente.
- [ ] Validar builds Windows e macOS em seus respectivos sistemas.

Observação de metadados: o bundle físico continua `SeEncontre.vst3`, enquanto o nome apresentado ao host é o texto ASCII `SeEncontre`, evitando o problema de codificação observado anteriormente no manifesto do JUCE 8.0.6.

## Próximos testes

1. Abrir o Standalone e confirmar carregamento offline da interface.
2. Instalar o bundle em `~/.vst3/`, rescanear no REAPER e verificar metadados.
3. Testar mono e estéreo com níveis seguros, automação dos dois parâmetros e restauração da sessão.
4. Confirmar notas, escala e interrupção no caminho nativo da DAW.
