let emprestimos = JSON.parse(localStorage.getItem('emprestimos')) || [];

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('dataInicio').valueAsDate = new Date();
    document.getElementById('btnSalvar').onclick = salvarEmprestimo;
    renderizarTabela();
});

function calcularDataTermino(inicio, parcelas, frequencia) {
    let data = new Date(inicio);
    let qtd = parseInt(parcelas);
    if (frequencia === 'diario') data.setDate(data.getDate() + qtd);
    else if (frequencia === 'semanal') data.setDate(data.getDate() + (qtd * 7));
    else if (frequencia === 'mensal') data.setMonth(data.getMonth() + qtd);
    return data.toISOString().split('T')[0];
}

function salvarEmprestimo() {
    const nome = document.getElementById('nome').value;
    const zap = document.getElementById('whatsapp').value;
    const capital = parseFloat(document.getElementById('valor').value);
    const jurosPerc = parseFloat(document.getElementById('juros').value);
    const freq = document.getElementById('frequencia').value;
    const inicio = document.getElementById('dataInicio').value;
    const parcelas = document.getElementById('parcelas').value;

    if (!nome || !capital) return alert("Preencha Nome e Valor!");

    // CÁLCULO DO JUROS: Ex: 100 + 20% = 120
    const totalComJuros = capital + (capital * (jurosPerc / 100));

    const novo = {
        id: Date.now(),
        nome, zap, 
        valorOriginal: capital,
        totalComJuros: totalComJuros.toFixed(2),
        inicio, 
        termino: calcularDataTermino(inicio, parcelas, freq),
        parcelas,
        frequencia: freq,
        statusPagamentos: {} // Objeto para guardar estado de cada dia {1: 'pago', 2: 'atrasado'}
    };

    emprestimos.push(novo);
    localStorage.setItem('emprestimos', JSON.stringify(emprestimos));
    renderizarTabela();
}

function alternarEstadoDia(idEmprestimo, numeroDia) {
    const emp = emprestimos.find(e => e.id === idEmprestimo);
    if (!emp.statusPagamentos) emp.statusPagamentos = {};

    const estadoAtual = emp.statusPagamentos[numeroDia];

    if (!estadoAtual) {
        emp.statusPagamentos[numeroDia] = 'pago'; // 1º Clique: Verde
    } else if (estadoAtual === 'pago') {
        emp.statusPagamentos[numeroDia] = 'atrasado'; // 2º Clique: Vermelho
    } else {
        delete emp.statusPagamentos[numeroDia]; // 3º Clique: Volta ao cinza
    }

    localStorage.setItem('emprestimos', JSON.stringify(emprestimos));
    renderizarTabela();
}

function renderizarTabela() {
    const lista = document.getElementById('listaClientes');
    lista.innerHTML = '';

    emprestimos.forEach(emp => {
        let checklistHTML = '<div class="checklist">';
        for (let i = 1; i <= emp.parcelas; i++) {
            const estado = emp.statusPagamentos[i] || ''; // 'pago', 'atrasado' ou vazio
            checklistHTML += `<span class="dia ${estado}" onclick="alternarEstadoDia(${emp.id}, ${i})">${i}</span>`;
        }
        checklistHTML += '</div>';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${emp.nome}</strong><br><small>${emp.zap}</small></td>
            <td>Início: ${emp.inicio}<br>Fim: ${emp.termino}</td>
            <td>
                Total: <strong>R$ ${emp.totalComJuros}</strong> <small>(Capital: ${emp.valorOriginal})</small>
                ${checklistHTML}
            </td>
            <td>
                <a href="https://wa.me/55${emp.zap}" target="_blank" class="btn-zap">WhatsApp</a>
                <button onclick="remover(${emp.id})" style="color:red; background:none; border:none; cursor:pointer; margin-left:10px">Excluir</button>
            </td>
        `;
        lista.appendChild(tr);
    });
}

function remover(id) {
    if (confirm("Remover?")) {
        emprestimos = emprestimos.filter(e => e.id !== id);
        localStorage.setItem('emprestimos', JSON.stringify(emprestimos));
        renderizarTabela();
    }
}