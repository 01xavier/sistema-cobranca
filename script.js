let emprestimos = JSON.parse(localStorage.getItem('emprestimos')) || [];

window.onload = () => {
    document.getElementById('dataInicio').valueAsDate = new Date();
    document.getElementById('btnSalvar').onclick = salvarEmprestimo;
    renderizarTabela();
};

function salvarEmprestimo() {
    const nome = document.getElementById('nome').value;
    const zap = document.getElementById('whatsapp').value;
    const capital = parseFloat(document.getElementById('valor').value);
    const jurosPerc = parseFloat(document.getElementById('juros').value);
    const parcelas = document.getElementById('parcelas').value;
    const freq = document.getElementById('frequencia').value;
    const inicio = document.getElementById('dataInicio').value;

    if (!nome || isNaN(capital)) return alert("Preencha Nome e Valor!");

    // Valor + Juros (ex: 100 + 20% = 120)
    const total = capital + (capital * (jurosPerc / 100));

    const novo = {
        id: Date.now(),
        nome, zap, 
        total: total.toFixed(2),
        inicio, parcelas,
        statusPagos: {} // Guarda se é 'pago' ou 'atrasado'
    };

    emprestimos.push(novo);
    localStorage.setItem('emprestimos', JSON.stringify(emprestimos));
    renderizarTabela();
    // Limpar campos
    document.getElementById('nome').value = '';
    document.getElementById('valor').value = '';
}

function alternarEstado(idEmp, numDia) {
    const emp = emprestimos.find(e => e.id === idEmp);
    const atual = emp.statusPagos[numDia];

    if (!atual) emp.statusPagos[numDia] = 'pago';
    else if (atual === 'pago') emp.statusPagos[numDia] = 'atrasado';
    else delete emp.statusPagos[numDia];

    localStorage.setItem('emprestimos', JSON.stringify(emprestimos));
    renderizarTabela();
}

function renderizarTabela() {
    const lista = document.getElementById('listaClientes');
    lista.innerHTML = '';

    emprestimos.forEach(emp => {
        let diasHTML = '<div class="checklist">';
        for (let i = 1; i <= emp.parcelas; i++) {
            const status = emp.statusPagos[i] || '';
            diasHTML += `<span class="dia ${status}" onclick="alternarEstado(${emp.id}, ${i})">${i}</span>`;
        }
        diasHTML += '</div>';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${emp.nome}</strong></td>
            <td>Início: ${emp.inicio}</td>
            <td>R$ ${emp.total} ${diasHTML}</td>
            <td>
                <a href="https://wa.me/55${emp.zap}" target="_blank" class="btn-zap">Zap</a>
                <button onclick="remover(${emp.id})" style="color:red; background:none; border:none; margin-left:10px; cursor:pointer">X</button>
            </td>
        `;
        lista.appendChild(tr);
    });
}

function remover(id) {
    if(confirm("Excluir?")) {
        emprestimos = emprestimos.filter(e => e.id !== id);
        localStorage.setItem('emprestimos', JSON.stringify(emprestimos));
        renderizarTabela();
    }
}