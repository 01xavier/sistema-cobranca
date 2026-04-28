let emprestimos = JSON.parse(localStorage.getItem('dados_cobranca')) || [];

window.onload = () => {
    document.getElementById('btnSalvar').onclick = cadastrar;
    desenharTabela();
};

function cadastrar() {
    const nome = document.getElementById('nome').value;
    const zap = document.getElementById('whatsapp').value;
    const capital = parseFloat(document.getElementById('valor').value);
    const juros = parseFloat(document.getElementById('juros').value);
    const parcelas = parseInt(document.getElementById('parcelas').value);

    if (!nome || !capital) return alert("Preencha o Nome e o Valor!");

    // Cálculo: Capital + Juros (ex: 100 + 20% = 120)
    const total = capital + (capital * (juros / 100));

    const novo = {
        id: Date.now(),
        nome, zap, parcelas,
        total: total.toFixed(2),
        status: {} // Guardará se cada dia está 'pago' ou 'atrasado'
    };

    emprestimos.push(novo);
    localStorage.setItem('dados_cobranca', JSON.stringify(emprestimos));
    desenharTabela();
    
    // Limpa os campos
    document.getElementById('nome').value = '';
    document.getElementById('valor').value = '';
}

function alternarDia(idEmp, numDia) {
    const emp = emprestimos.find(e => e.id === idEmp);
    const estado = emp.status[numDia];

    if (!estado) emp.status[numDia] = 'pago';
    else if (estado === 'pago') emp.status[numDia] = 'atrasado';
    else delete emp.status[numDia];

    localStorage.setItem('dados_cobranca', JSON.stringify(emprestimos));
    desenharTabela();
}

function desenharTabela() {
    const corpo = document.getElementById('lista');
    corpo.innerHTML = '';

    emprestimos.forEach(emp => {
        let diasHTML = '<div class="checklist">';
        for (let i = 1; i <= emp.parcelas; i++) {
            const classe = emp.status[i] || '';
            diasHTML += `<span class="dia ${classe}" onclick="alternarDia(${emp.id}, ${i})">${i}</span>`;
        }
        diasHTML += '</div>';

        corpo.innerHTML += `
            <tr>
                <td><strong>${emp.nome}</strong></td>
                <td>R$ ${emp.total}</td>
                <td>${diasHTML}</td>
                <td>
                    <a href="https://wa.me/55${emp.zap}" target="_blank" class="btn-zap">Zap</a>
                    <button onclick="excluir(${emp.id})" style="color:red; cursor:pointer; background:none; border:none; margin-left:10px">X</button>
                </td>
            </tr>
        `;
    });
}

function excluir(id) {
    if (confirm("Deseja apagar?")) {
        emprestimos = emprestimos.filter(e => e.id !== id);
        localStorage.setItem('dados_cobranca', JSON.stringify(emprestimos));
        desenharTabela();
    }
}