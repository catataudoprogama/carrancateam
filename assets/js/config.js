/* Carranca Team: único arquivo que o cliente precisa editar.
   WhatsApp de cada unidade, endereços e grades de horário saem daqui; o site monta o resto
   (próxima aula, "aberto agora", quiz de turma, mensagens prontas do WhatsApp). */
window.CARRANCA = {
  /* ---------- contatos ----------
     whatsapp      = número padrão, usado quando a pessoa ainda não escolheu unidade (Mestre Fábio, igual ao Google Maps)
     contatoMestre = botão "Falar com o Mestre Fábio" (página do mestre) */
  whatsapp: '5573988320975',
  telefoneLabel: '(73) 98832-0975',
  contatoMestre: '5573988320975',

  /* ---------- unidades (a ordem aqui é a ordem na página) ----------
     whatsapp = número da unidade (só dígitos, 55 + DDD + número). mensagem = texto pronto que abre no WhatsApp.
     grade: [hora, [seg, ter, qua, qui, sex, sab]]  (null = sem aula)
     "A + B" na mesma célula = duas modalidades no mesmo horário. */
  unidades: [
    {
      id: 'jardim',
      nome: 'Carranca Team Jardim América',
      curto: 'Jardim América',
      tag: 'O novo Dojo',
      resumo: 'O novo Dojo: Jiu-Jitsu, Judô, Muay Thai, Boxe, Luta Livre e MMA',
      endereco: 'Estrada da Colônia · Jardim América',
      cidade: 'Eunápolis – BA',
      cep: '45821-600',
      lat: -16.3710416, lng: -39.6041838,
      whatsapp: '5573999422186',
      mensagem: 'Olá! Vim pelo site e quero agendar uma aula experimental na Carranca Team Jardim América.',
      instagram: 'carrancateamjardimamerica', seguidores: '398',
      grade: [
        ['06:00', ['Jiu-Jitsu + Boxe', 'Luta Livre + Muay Thai', 'Jiu-Jitsu + Boxe', 'Luta Livre + Muay Thai', 'Jiu-Jitsu + Boxe', 'Luta Livre + Muay Thai']],
        ['09:00', ['Jiu-Jitsu Kids', 'Judô Kids', 'Jiu-Jitsu Kids', 'Judô Kids', 'Jiu-Jitsu Kids', 'Judô Kids']],
        ['10:00', ['Jiu-Jitsu + Boxe', 'Luta Livre + Muay Thai', 'Jiu-Jitsu + Boxe', 'Luta Livre + Muay Thai', 'Jiu-Jitsu + Boxe', 'Luta Livre + Muay Thai']],
        ['12:00', ['Jiu-Jitsu', 'MMA', 'Jiu-Jitsu', 'MMA', 'Jiu-Jitsu', null]],
        ['15:00', ['Jiu-Jitsu Kids', 'Judô Kids', 'Jiu-Jitsu Kids', 'Judô Kids', 'Jiu-Jitsu Kids', null]],
        ['17:00', ['Jiu-Jitsu Adolescente', 'Muay Thai', 'Jiu-Jitsu Adolescente', 'Muay Thai', 'Jiu-Jitsu Adolescente', null]],
        ['18:00', ['Jiu-Jitsu + Muay Thai', 'Boxe + Judô', 'Jiu-Jitsu + Muay Thai', 'Boxe + Judô', 'Jiu-Jitsu + Muay Thai', null]],
        ['19:00', ['Jiu-Jitsu + Boxe', 'Luta Livre + Muay Thai', 'Jiu-Jitsu + Boxe', 'Luta Livre + Muay Thai', 'Jiu-Jitsu + Boxe', null]]
      ]
    },
    {
      id: 'centro',
      nome: 'Carranca Team Centro',
      curto: 'Centro',
      tag: 'Escola de Jiu-Jitsu',
      resumo: 'Escola de Jiu-Jitsu: Jiu-Jitsu, Muay Thai, Luta Livre e Carranca Kids',
      endereco: 'Av. Duque de Caxias, 787 · Centro',
      cidade: 'Eunápolis – BA',
      cep: '45820-090',
      lat: -16.3728581, lng: -39.5869182,   // pino do Google Maps para "Av. Duque de Caxias, 787"
      whatsapp: '5573988320975',
      mensagem: 'Olá! Vim pelo site e quero agendar uma aula experimental na Carranca Team Centro (Escola de Jiu-Jitsu).',
      instagram: 'ctlcarrancateam', seguidores: '3,1 mil',
      grade: [
        ['06:00', ['Jiu-Jitsu Master', 'Jiu-Jitsu Misto', 'Jiu-Jitsu Misto', 'Jiu-Jitsu Master', 'Luta Livre', null]],
        ['09:00', ['Carranca Kids', null, null, 'Carranca Kids', null, null]],
        ['15:30', ['Carranca Kids I', null, 'Carranca Kids I', null, null, null]],
        ['16:30', ['Carranca Kids II', 'Carranca Kids II', 'Carranca Kids II', 'Carranca Kids II', null, null]],
        ['17:50', ['Jiu-Jitsu Misto', 'Jiu-Jitsu Adolescentes', 'Jiu-Jitsu Misto', 'Jiu-Jitsu Adolescentes', 'Jiu-Jitsu Misto', null]],
        ['19:00', ['Muay Thai', 'Jiu-Jitsu Graduados', 'Muay Thai', 'Jiu-Jitsu Graduados', 'Muay Thai', null]],
        ['20:00', ['Jiu-Jitsu Misto', 'Jiu-Jitsu Branca de Ouro', 'Jiu-Jitsu Misto', 'Jiu-Jitsu Branca de Ouro', 'Luta Livre', null]]
      ]
    },
    {
      id: 'jucarosa',
      nome: 'Carranca Team Juca Rosa',
      curto: 'Juca Rosa',
      tag: 'Prof. Fabiano Carvalho',
      resumo: 'Jiu-Jitsu, Muay Thai, Luta Livre e Kids, com o professor Fabiano Carvalho',
      endereco: 'Bairro Juca Rosa',
      cidade: 'Eunápolis – BA',
      cep: '',
      enderecoPeloZap: true,   // sem ficha no Google Maps: o site manda pedir o endereço exato no WhatsApp
      whatsapp: '5573981195574',
      mensagem: 'Olá! Vim pelo site e quero agendar uma aula experimental na Carranca Team Juca Rosa.',
      instagram: 'carranca_team_juca_rosa', seguidores: '239',
      parcial: true,           // a grade que temos é só uma parte (segunda/terça, kids e sexta)
      grade: [
        ['06:00', ['Muay Thai', 'Jiu-Jitsu', null, null, null, null]],
        ['09:00', ['Carranca Kids', null, 'Carranca Kids', null, 'Carranca Kids', null]],
        ['15:00', ['Carranca Kids', null, 'Carranca Kids', null, 'Carranca Kids', null]],
        ['16:00', ['Carranca Kids', null, 'Carranca Kids', null, 'Carranca Kids', null]],
        ['18:30', ['Muay Thai', 'Jiu-Jitsu', null, null, null, null]],
        ['19:30', [null, null, null, null, 'Luta Livre', null]],
        ['19:40', ['Muay Thai', 'Jiu-Jitsu', null, null, null, null]]
      ]
    },
    {
      id: 'fit',
      nome: 'Carranca Fit',
      curto: 'Carranca Fit',
      tag: 'Arena · Musculação e Muay Thai',
      resumo: 'Academia de musculação e Muay Thai (Arena Carranca Team)',
      endereco: 'Centro',
      cidade: 'Eunápolis – BA',
      cep: '45821-680',
      lat: -16.3775625, lng: -39.5838125,   // pino do Google "Arena Carranca Team" (4,9 · 29 avaliações)
      whatsapp: '5573982403361',
      mensagem: 'Olá! Vim pelo site e quero conhecer a Carranca Fit (musculação e Muay Thai).',
      instagram: 'carranca.fit', seguidores: '664',
      google: { nota: '4,9', avaliacoes: 29 },
      academia: true,          // tem horário de funcionamento + aulas de Muay Thai
      modalidades: ['muay-thai'],
      beneficios: ['Gympass', 'TotalPass'],
      /* Muay Thai (bloco de notas do cliente): segunda, quarta e sexta, 6h e 19h */
      grade: [
        ['06:00', ['Muay Thai', null, 'Muay Thai', null, 'Muay Thai', null]],
        ['19:00', ['Muay Thai', null, 'Muay Thai', null, 'Muay Thai', null]]
      ],
      /* faixas de funcionamento: dia (0 = domingo) → [[abre, fecha], ...] em horas decimais */
      funcionamento: {
        0: [],
        1: [[5, 10], [15, 21]],
        2: [[5, 10], [15, 21]],
        3: [[5, 10], [15, 21]],
        4: [[5, 10], [15, 21]],
        5: [[5, 10], [15, 21]],
        6: [[9, 12]]
      }
    }
  ],

  /* ---------- treinos da faixa branca (página faixas-brancas.html) ----------
     O horário é lido da grade acima (turmas com "Branca de Ouro" / "Iniciante" no nome).
     unidades = onde mostrar os botões de WhatsApp. Se uma turma "Iniciante" entrar na grade, o horário aparece sozinho. */
  faixasBrancas: {
    iniciante: {
      nome: 'Faixa Branca Iniciante',
      unidades: ['jardim', 'centro', 'jucarosa'],
      mensagem: 'Olá! Sou iniciante e quero participar do treino de Faixa Branca Iniciante. Qual o horário?'
    },
    ouro: {
      nome: 'Branca de Ouro',
      unidades: ['centro'],
      mensagem: 'Olá! Quero participar do treino Branca de Ouro. Qual o horário?'
    }
  },

  /* ---------- modalidades ----------
     lema = frase que a própria Carranca usa nos materiais; texto/pontos = descrição geral (revise com o mestre). */
  modalidades: [
    {
      id: 'jiu-jitsu', nome: 'Jiu-Jitsu', kanji: '柔術', lema: 'Técnica e estratégia',
      texto: 'A arte suave: alavancas e posição para controlar o oponente, mesmo contra alguém maior. Treino de raciocínio, não só de força.',
      pontos: ['Defesa pessoal real', 'Flexibilidade, força e fôlego', 'Evolução clara por faixas']
    },
    {
      id: 'judo', nome: 'Judô', kanji: '柔道', lema: 'Disciplina e equilíbrio',
      texto: 'Quedas, projeções e controle no solo. Ensina a cair, a se equilibrar e a respeitar o parceiro: a base de qualquer luta.',
      pontos: ['Equilíbrio e coordenação', 'Etiqueta e respeito no tatame', 'Ótimo para os pequenos']
    },
    {
      id: 'muay-thai', nome: 'Muay Thai', kanji: '', lema: 'Força e resistência',
      texto: 'A arte das oito armas: socos, chutes, joelhos e cotoveladas. Treino intenso de condicionamento e potência.',
      pontos: ['Cardio e queima calórica altos', 'Defesa pessoal em pé', 'Alívio do estresse do dia']
    },
    {
      id: 'boxe', nome: 'Boxe', kanji: '', lema: 'Disciplina e autocontrole',
      texto: 'Jogo de pernas, esquiva e combinações de soco. Coordenação, ritmo e cabeça fria sob pressão.',
      pontos: ['Coordenação e reflexo', 'Condicionamento completo', 'Foco e controle emocional']
    },
    {
      id: 'luta-livre', nome: 'Luta Livre', kanji: '', lema: 'Liberdade de movimento',
      texto: 'Quedas, raspagens e finalizações com pegada livre. Força funcional e muita estratégia no chão e em pé.',
      pontos: ['Força funcional', 'Quedas e controle', 'Treino técnico e dinâmico']
    },
    {
      id: 'mma', nome: 'MMA', kanji: '', lema: 'Preparação completa',
      texto: 'Mistura golpes em pé, quedas e solo. Para quem quer o pacote completo de artes marciais.',
      pontos: ['Pacote completo de lutas', 'Preparação física e mental', 'Para quem quer competir']
    }
  ]
};
