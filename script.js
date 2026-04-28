let clientes = JSON.parse(localStorage.getItem('credito_v6_data')) || [];

function adicionarCliente() {
    const nome = document.getElementById('nomeCliente').value;
    const tel = document.getElementById('telCliente').value;
    const val = parseFloat(document.getElementById('valorEmprestimo').value);
    const taxa = parseFloat(document.getElementById('taxaJuros').value);
    const qtd = parseInt(document.getElementById('qtdParcelas').value);
    const freq = parseInt(document.getElementById('frequencia').value);

    if (!nome || isNaN(val) || isNaN(qtd)) return alert("Preencha todos os campos!");

    const montante = val + (val * (taxa / 100));
    
    // Criamos um array de parcelas com o tamanho que o usuário definiu (ex: 20)
    let parcelasArray = [];
    for(let i=0; i < qtd; i++) {
        parcelasArray.push(0); // 0 = pendente, 1 = pago, 2 = atrasado
    }

    clientes.push({
        id: Date.now(),
        nome,
        telefone: tel,
        valorOriginal: montante,
        valorParcela: montante / qtd,
        frequencia: freq,
        parcelas: parcelasArray
    });

    salvar();
    limpar();
}

function alternarParcela(cId, pIdx) {
    const c = clientes.find(x => x.id === cId);
    if (!c) return;

    // Ciclo: 0 -> 1 (Pago) -> 2 (Atrasado) -> 0
    if (c.parcelas[pIdx] === 0) c.parcelas[pIdx] = 1;
    else if (c.parcelas[pIdx] === 1) c.parcelas[pIdx] = 2;
    else c.parcelas[pIdx] = 0;

    salvar();
}

function calcularResumo(cliente) {
    let pagos = cliente.parcelas.filter(p => p === 1).length;
    let atrasados = cliente.parcelas.filter(p => p === 2).length;
    
    let saldoAtual = cliente.valorOriginal - (pagos * cliente.valorParcela);
    
    // Score começa em 500. Ganha 25 por pago, perde 60 por atrasado.
    let scoreBase = 500 + (pagos * 25) - (atrasados * 60);
    let scoreFinal = Math.max(0, Math.min(1000, scoreBase));

    return { saldoAtual, scoreFinal, pagos, total: cliente.parcelas.length };
}

function salvar() {
    localStorage.setItem('credito_v6_data', JSON.stringify(clientes));
    renderizar();
}

function renderizar() {
    const container = document.getElementById('listaContainer');
    container.innerHTML = '';

    clientes.forEach(c => {
        const resumo = calcularResumo(c);
        const corScore = resumo.scoreFinal > 700 ? '#16a34a' : (resumo.scoreFinal < 400 ? '#dc2626' : '#f59e0b');

        let parcelasHtml = '';
        c.parcelas.forEach((status, idx) => {
            let classe = status === 1 ? 'pago' : (status === 2 ? 'atrasado' : '');
            parcelasHtml += `
                <div class="parcela-item ${classe}" onclick="alternarParcela(${c.id}, ${idx})">
                    P${idx + 1}
                </div>`;
        });

        container.innerHTML += `
            <div class="cliente-card">
                <div class="cliente-header">
                    <div>
                        <strong style="font-size: 18px;">${c.nome}</strong><br>
                        <a href="https://wa.me/55${c.telefone.replace(/\D/g,'')}" target="_blank" class="btn-zap">📱 WhatsApp</a>
                    </div>
                    <div class="score-container">
                        <div style="font-size: 10px; font-weight: bold; color: ${corScore}">SCORE: ${resumo.scoreFinal} pts</div>
                        <div class="score-bar-bg">
                            <div class="score-bar-fill" style="width: ${resumo.scoreFinal/10}%; background: ${corScore}"></div>
                        </div>
                    </div>
                    <button class="btn-del" onclick="excluir(${c.id})">🗑</button>
                </div>
                
                <div style="display: flex; gap: 20px; font-size: 13px; margin-bottom: 10px;">
                    <span><b>Saldo Devedor:</b> <span style="color:red">R$ ${resumo.saldoAtual.toFixed(2)}</span></span>
                    <span><b>Parcela:</b> R$ ${c.valorParcela.toFixed(2)}</span>
                    <span><b>Progresso:</b> ${resumo.pagos} / ${resumo.total}</span>
                </div>

                <div class="parcelas-grid">${parcelasHtml}</div>
                <small style="display:block; margin-top:10px; color:#94a3b8;">Clique na parcela: 1x Pago (Verde) | 2x Atrasado (Vermelho)</small>
            </div>
        `;
    });
}

function excluir(id) {
    if(confirm("Excluir este empréstimo?")) {
        clientes = clientes.filter(x => x.id !== id);
        salvar();
    }
}

function limpar() {
    document.querySelectorAll('input').forEach(i => i.value = '');
}

renderizar();