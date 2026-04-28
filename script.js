let emprestimos = JSON.parse(localStorage.getItem('emprestimos')) || [];

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('dataInicio').valueAsDate = new Date();
    document.getElementById('btnSalvar').addEventListener('click', salvarEmprestimo);
    renderizarTabela();
});

function calcularDataTermino(inicio, parcelas, frequencia) {
    let data = new Date(inicio);
    let qtd = parseInt(parcelas);
    if (frequencia === 'diario') data.setDate(data.getDate() + qtd);
    else if (frequencia === 'semanal') data.setDate(data.getDate() + (qtd * 7));
    else if (frequencia === 'quinzenal') data.setDate(data.getDate() + (qtd * 15));
    else if (frequencia === 'mensal') data.setMonth(data.getMonth() + qtd);
    return data.toISOString().split('T')[0];
}

function salvarEmprestimo() {
    const nome = document.getElementById('nome').value;
    const zap = document.getElementById('whatsapp').value;
    const valor = document.getElementById('valor').value;
    const freq = document.getElementById('frequencia').value;
    const inicio = document.getElementById('dataInicio').value;
    const parcelas = document.getElementById('parcelas').value;

    if (!nome || !valor || !parcelas) {
        alert("Preencha os campos obrigatórios!");
        return;
    }

    const novo = {
        id: Date.now(),
        nome, zap, valor, frequencia: freq, inicio, parcelas,
        dataTermino: calcularDataTermino(inicio, parcelas, freq),
        pagamentos: [], // Array para guardar quais dias foram marcados
        score: 100
    };

    emprestimos.push(novo);
    localStorage.setItem('emprestimos', JSON.stringify(emprestimos));
    renderizarTabela();
    limparCampos();
}

function marcarPagamento(idEmprestimo, numeroParcela) {
    const emp = emprestimos.find(e => e.id === idEmprestimo);
    if (!emp.pagamentos) emp.pagamentos = [];

    const index = emp.pagamentos.indexOf(numeroParcela);
    if (index > -1) emp.pagamentos.splice(index, 1); // Desmarca
    else emp.pagamentos.push(numeroParcela); // Marca pago

    localStorage.setItem('emprestimos', JSON.stringify(emprestimos));
    renderizarTabela();
}

function renderizarTabela() {
    const lista = document.getElementById('listaClientes');
    lista.innerHTML = '';

    emprestimos.forEach(emp => {
        // Gera o checklist de quadradinhos
        let checklistHTML = '<div class="checklist">';
        for (let i = 1; i <= emp.parcelas; i++) {
            const isPago = emp.pagamentos && emp.pagamentos.includes(i);
            checklistHTML += `<span class="dia ${isPago ? 'pago' : ''}" onclick="marcarPagamento(${emp.id}, ${i})">${i}</span>`;
        }
        checklistHTML += '</div>';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${emp.nome}</strong><br><small>${emp.zap}</small></td>
            <td>Início: ${formatarData(emp.inicio)}<br>Fim: ${formatarData(emp.dataTermino)}</td>
            <td>
                R$ ${emp.valor} (${emp.parcelas}x ${emp.frequencia})
                ${checklistHTML}
            </td>
            <td><span class="score-badge score-high">${emp.score} pts</span></td>
            <td>
                <a href="https://wa.me/55${emp.zap}?text=Olá ${emp.nome}" target="_blank" class="btn-zap">WhatsApp</a>
                <button onclick="remover(${emp.id})" style="border:none; background:none; color:red; cursor:pointer; margin-left:10px">Excluir</button>
            </td>
        `;
        lista.appendChild(tr);
    });
}

function formatarData(iso) {
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
}

function remover(id) {
    if (confirm("Excluir registro?")) {
        emprestimos = emprestimos.filter(e => e.id !== id);
        localStorage.setItem('emprestimos', JSON.stringify(emprestimos));
        renderizarTabela();
    }
}

function limparCampos() {
    document.getElementById('nome').value = '';
    document.getElementById('whatsapp').value = '';
    document.getElementById('valor').value = '';
    document.getElementById('parcelas').value = '';
}