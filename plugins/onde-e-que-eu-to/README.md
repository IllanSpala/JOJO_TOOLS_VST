# Onde é que eu tô?

Primeiro plugin da suíte JOJO-TOOLS. O header da interface identifica a função **MÁQUINA DE ESCALAS**; o modal e os metadados nativos identificam o produto **Onde é que eu tô?**.

## Desenvolvimento web

```bash
cd frontend
npm install
npm test
npm run dev
```

## Artefatos Linux

Após `./scripts/build-linux.sh` na raiz:

- Standalone: `build/linux/plugins/onde-e-que-eu-to/OndeEQueEuTo_artefacts/Debug/Standalone/OndeEQueEuTo`
- VST3: `build/linux/plugins/onde-e-que-eu-to/OndeEQueEuTo_artefacts/Debug/VST3/OndeEQueEuTo.vst3`

O build normal é offline em runtime: a interface Vite é incorporada ao binário. Para desenvolvimento com hot reload, configure outra pasta de build com `-DJOJO_USE_VITE_DEV_SERVER=ON` e mantenha `npm run dev` ativo.

## REAPER Linux

Execute `./scripts/install-linux-vst3.sh`. No REAPER, adicione `~/.vst3` aos caminhos VST se necessário e faça um rescan. Procure por **Onde é que eu tô?**, fabricante **JOJO-TOOLS**. Teste áudio mono/estéreo, automação de `Output` e `Notes Output`, salvamento da sessão e reprodução das referências.

O ganho positivo pode clipar; use material com headroom. Não há limiter por decisão de escopo.
