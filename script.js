// Inicialização dos dados (Recupera do navegador ou começa vazio)
let emprestimos = JSON.parse(localStorage.getItem('emprestimos')) || [];

// Evento que roda quando a página carrega
document.addEventListener('DOMContentLoaded', () => {
    // Define a data de hoje como padrão no formulário
    document.getElementById('dataInicio').valueAsDate = new Date();
    
    // Configura o botão de salvar
    document.getElementById('btnSalvar').addEventListener('click', salvarEmprestimo);
    
    // Carrega a tabela inicial
    renderizarTabela();
});

// --- FUNÇÕES DE CÁLCULO ---

function calcularDataTermino(inicio, parcelas, frequencia) {
    let data = new Date(inicio);
    let qtd = parseInt(parcelas);

    if (frequencia === 'diario') {
        data.setDate(data.getDate() + qtd);
    } else if (frequencia === 'semanal') {
        data.setDate(data.getDate() + (qtd * 7));
    } else if (frequencia === 'quinzenal') {
        data.setDate(data.getDate() + (qtd * 15));
    } else if (frequencia === 'mensal') {
        data.setMonth(data.getMonth() + qtd);
    }

    return data.toISOString().split('T')[0]; // Retorna formato YYYY-MM-DD
}

// --- GESTÃO DE DADOS ---

function salvarEmprestimo() {
    const campos = {
        nome: document.getElementById('nome').value,
        zap: document.getElementById('whatsapp').value,
        valor: document.getElementById('valor').value,
        frequencia: document.getElementById('frequencia').value,
        inicio: document.getElementById('dataInicio').value,
        parcelas: document.getElementById('parcelas').value
    };

    // Validação simples
    if (!campos.nome || !campos.valor || !campos.parcelas) {
        alert("Por favor, preencha os campos essenciais (Nome, Valor e Parcelas).");
        return;
    }

    const dataTermino = calcularDataTermino(campos.inicio, campos.parcelas, campos.frequencia);

    const novoEmprestimo = {
        id: Date.now(),
        ...campos,
        dataTermino: dataTermino,
        status: 'em-dia',
        score: 100 // Começa com score máximo
    };

    // Adiciona ao array e salva no LocalStorage
    emprestimos.push(novoEmprestimo);
    localStorage.setItem('emprestimos', JSON.stringify(emprestimos));

    // Feedback e Atualização
    alert("Empréstimo de " + campos.nome + " foi salvo!");
    limparCampos();
    renderizarTabela();
}

function removerEmprestimo(id) {
    if (confirm("Tem certeza que deseja excluir este registro?")) {
        emprestimos = emprestimos.filter(emp => emp.id !== id);
        localStorage.setItem('emprestimos', JSON.stringify(emprestimos));
        renderizarTabela();
    }
}

// --- INTERFACE (UI) ---

function renderizarTabela(filtro = 'todos') {
    const lista = document.getElementById('listaClientes');
    lista.innerHTML = '';

    const dadosFiltrados = emprestimos.filter(emp => {
        if (filtro === 'todos') return true;
        return emp.status === filtro;
    });

    dadosFiltrados.forEach(emp => {
        const tr = document.createElement('tr');
        
        // Lógica visual do Score
        let classeScore = 'score-high';
        if (emp.score < 40) classeScore = 'score-low';
        else if (emp.score < 75) classeScore = 'score-med';

        tr.innerHTML = `
            <td><strong>${emp.nome}</strong><br><small>${emp.zap}</small></td>
            <td>Início: ${formatarData(emp.inicio)}<br>Fim: ${formatarData(emp.dataTermino)}</td>
            <td>R$ ${emp.valor}<br><small>${emp.parcelas}x (${emp.frequencia})</small></td>
            <td><span class="score-badge ${classeScore}">${emp.score} pts</span></td>
            <td>
                <a href="https://wa.me/55${emp.zap}?text=Olá ${emp.nome}, segue o resumo do seu plano de R$ ${emp.valor}." 
                   target="_blank" class="btn-zap">WhatsApp</a>
                <button onclick="removerEmprestimo(${emp.id})" style="color:red; background:none; padding:5px; margin-left:10px">Excluir</button>
            </td>
        `;
        lista.appendChild(tr);
    });
}

function formatarData(dataISO) {
    if (!dataISO) return "--/--/----";
    const [ano, mes, dia] = dataISO.split('-');
    return `${dia}/${mes}/${ano}`;
}

function limparCampos() {
    document.getElementById('nome').value = '';
    document.getElementById('whatsapp').value = '';
    document.getElementById('valor').value = '';
    document.getElementById('parcelas').value = '';
    document.getElementById('dataInicio').valueAsDate = new Date();
}

// Lógica dos botões de filtro
document.querySelectorAll('.btn-filter').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelector('.btn-filter.active').classList.remove('active');
        this.classList.add('active');
        renderizarTabela(this.getAttribute('data-filter'));
    });
});