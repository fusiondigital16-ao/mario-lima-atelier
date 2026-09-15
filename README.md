# Mário Lima — proposta de website

Site estático editorial em português, produzido para apresentação privada pela JASP Labs. Não altera o site Wix original.

## Conteúdo

- 12 propostas de projeto com autoria e enquadramento; 36 imagens (seleção de três imagens publicamente acessíveis por projeto).
- Imagens otimizadas e alojadas com o site; fontes originais em `asset-sources.json`.
- Textos portugueses adaptados dos conceitos originais. Não representam confirmação de obra executada, resultados comerciais ou prémios além das classificações identificadas no próprio portefólio.
- As datas de Boat Harbour House e House of Fairy Tales seguem as fichas individuais (2015), que divergem dos cartões do Wix. Confirmar com o autor antes de publicação pública.
- Não se verificou a totalidade das 109 posições anunciadas pelos carrosséis originais; o acesso à fonte integral de galerias estava indisponível. Não descrever os 36 ficheiros como cópia completa.
- O logótipo original e a visualização do projeto em destaque foram fornecidos diretamente pelo autor/utilizador para esta proposta. A hero usa esses dois ativos sem substituir ou redesenhar a identidade.

## Interação

Filtros por tipologia, fichas de projeto com endereço hash, navegação anterior/seguinte, miniaturas, ampliação e gestos de toque. A hero inclui parallax e movimento tridimensional progressivo; a navegação Liquid Glass apresenta o estado da secção atual. Menu móvel, ligações email/telefone e formulário que prepara um email no cliente local. Não existe backend de envio; não exibir confirmação de mensagem enviada.

GSAP 3.13.0 e ScrollTrigger são distribuídos localmente com os avisos de licença existentes nos ficheiros. A navegação mantém-se funcional caso a biblioteca de animação falhe. Preferências de movimento reduzido são respeitadas no carregamento e nos estilos.

## Publicação

Entrada: `dist/index.html`. Site estático sem build. Identidade em `.openai/hosting.json`. `noindex,nofollow` permanece ativo para a proposta. Retirar apenas quando aprovada para divulgação pública e definir domínio/SEO final nessa altura.

Nenhum formulário transmite dados até o visitante enviar a mensagem na sua aplicação de email. Autenticação de acesso privado é fornecida pelo Sites, não pelo código.

## Verificação

Sintaxe JavaScript, correspondência de dados, referências de ficheiros e integridade das 36 imagens verificadas programaticamente. Não foi realizada sessão de testes visuais ou e2e no navegador nesta entrega.
