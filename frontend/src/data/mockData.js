// src/data/mockData.js

export const formsData = [
    { 
        id: 1, 
        name: 'Formulário de Contato', 
        submissions: 2, 
        fields: ['Nome', 'Email', 'Endereço'],
        responses: [
            { 'Nome': 'João Silva', 'Email': 'joao.silva@email.com', 'Endereço': 'Rua das Flores, 123' },
            { 'Nome': 'Maria Oliveira', 'Email': 'maria.o@email.com', 'Endereço': 'Av. Principal, 456' }
        ]
    },
    { 
        id: 2, 
        name: 'Formulário de Pedido', 
        submissions: 1, 
        fields: ['Produto', 'Quantidade', 'Email'],
        responses: [
            { 'Produto': 'Pneu Aro 15', 'Quantidade': 4, 'Email': 'joao.silva@email.com' }
        ]
    },
    { 
        id: 3, 
        name: 'Formulário de Feedback', 
        submissions: 1, 
        fields: ['Avaliação', 'Comentários'],
        responses: [
            { 'Avaliação': 5, 'Comentários': 'Excelente atendimento!' }
        ]
    },
];