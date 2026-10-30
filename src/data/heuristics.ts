import { NielsenHeuristic } from '../types';

export const NIELSEN_HEURISTICS: NielsenHeuristic[] = [
  {
    number: 1,
    title: 'Visibility of system status',
    titlePt: 'Visibilidade do estado do sistema',
    description: 'O design deve sempre manter os usuários informados sobre o que está acontecendo, através de feedback apropriado dentro de um tempo razoável.',
    howWeApply: 'O planeta em órbita física 3D desacelera, orbita ou congela sincronizado com o cronômetro. Indicadores táteis de status (EM EXECUÇÃO, PAUSADO, EM ESPERA) com telemetria angular em tempo real e atualização dinâmica da aba do navegador.'
  },
  {
    number: 2,
    title: 'Match between system and the real world',
    titlePt: 'Correspondência entre o sistema e o mundo real',
    description: 'O design deve falar a linguagem dos usuários, com palavras, frases e conceitos familiares ao usuário, e não jargões internos.',
    howWeApply: 'Metáfora astronômica intuitiva (translação orbital em torno do núcleo temporal, rotação de 360°, revoluções completas) combinada com terminologia universal de tempo: Dias, Horas, Minutos, Segundos e Milissegundos.'
  },
  {
    number: 3,
    title: 'User control and freedom',
    titlePt: 'Controle e liberdade do usuário',
    description: 'Usuários frequentemente realizam ações por engano. Eles precisam de uma "saída de emergência" claramente marcada para deixar o estado indesejado.',
    howWeApply: 'Fluxo completo de controle com Iniciar, Pausar, Continuar e Resetar. Ao resetar acidentalmente com dados de voltas, um diálogo de segurança com opção de cancelar impede perda de telemetria.'
  },
  {
    number: 4,
    title: 'Consistency and standards',
    titlePt: 'Consistência e padrões',
    description: 'Usuários não devem ter que se perguntar se diferentes palavras, situações ou ações significam a mesma coisa. Siga as convenções de plataforma e indústria.',
    howWeApply: 'Layout Silicon Valley inspirado em ferramentas de engenharia de ponta (Linear, Vercel, Raycast). Barra de topo padronizada em 3 zonas, controles alinhados, atalhos universais da indústria (Espaço para Start/Stop).'
  },
  {
    number: 5,
    title: 'Error prevention',
    titlePt: 'Prevenção de erros',
    description: 'Melhor que boas mensagens de erro é um design cuidadoso que previne a ocorrência de um problema antes que ele aconteça.',
    howWeApply: 'Validação de datas futuras no modo de Contagem de Evento para impedir contagem negativa sem consentimento; desativação contextual do botão de Volta quando o cronômetro estiver parado.'
  },
  {
    number: 6,
    title: 'Recognition rather than recall',
    titlePt: 'Reconhecimento em vez de memorização',
    description: 'Minimize a carga de memória do usuário tornando elementos, ações e opções visíveis. As informações devem ser visíveis ou facilmente recuperáveis.',
    howWeApply: 'Dicas visuais de atalhos de teclado integradas nos próprios botões ([Espaço], [L], [R]). Destaque automático por cor da volta mais rápida e mais lenta, sem exigir que o usuário calcule mentalmente os deltas.'
  },
  {
    number: 7,
    title: 'Flexibility and efficiency of use',
    titlePt: 'Flexibilidade e eficiência de uso',
    description: 'Aceleradores — não vistos pelo usuário novato — podem acelerar a interação para o usuário especialista, acomodando ambos.',
    howWeApply: 'Atalhos de teclado para power users, suporte a modo Tela Cheia para eventos ao vivo, alternância entre três modos (Cronômetro, Contagem de Eventos, Temporizador de Foco) e exportação com 1 clique para CSV/Clipboard.'
  },
  {
    number: 8,
    title: 'Aesthetic and minimalist design',
    titlePt: 'Design estético e minimalista',
    description: 'As interfaces não devem conter informações irrelevantes ou raramente necessárias. Cada unidade extra de informação concorre com as relevantes.',
    howWeApply: 'Disciplina 60-30-10: 60% fundo profundo escuro, 30% painéis estruturais de titânio escuro com bordas hairline, 10% de acentos luminescentes nos dados primários. Sem excesso de cards aninhados ou badges decorativas fúteis.'
  },
  {
    number: 9,
    title: 'Help users recognize, diagnose, and recover from errors',
    titlePt: 'Ajuda para reconhecer, diagnosticar e recuperar de erros',
    description: 'Mensagens de erro devem ser expressas em linguagem simples (sem códigos), indicar precisamente o problema e sugerir construtivamente uma solução.',
    howWeApply: 'Toasts dinâmicos informativos e não-bloqueantes. Se uma data passada for selecionada na contagem regressiva, uma notificação clara orienta o ajuste para uma data futura.'
  },
  {
    number: 10,
    title: 'Help and documentation',
    titlePt: 'Ajuda e documentação',
    description: 'Embora seja melhor se o sistema puder ser usado sem documentação, pode ser necessário fornecer ajuda e documentação facilmente localizável.',
    howWeApply: 'Modal de Heurísticas de Nielsen e guia rápido de atalhos acessível com um clique ou através da tecla ? em qualquer momento da experiência.'
  }
];
