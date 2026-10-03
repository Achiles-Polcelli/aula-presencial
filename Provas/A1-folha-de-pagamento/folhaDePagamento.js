const readline = require("readline/promises");
const { stdin: input, stdout: output } = require("process");

const SALARIO_BASE = 2000;

const moeda = (valor) =>
  valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// classes 

class Colaborador {
  constructor(matricula, nome) {
    this.matricula = matricula;
    this.nome = nome;
  }

  get tipo() {
    return "Colaborador";
  }

  calcularSalario() {
    return SALARIO_BASE;
  }

  detalhes() {
    return `Nome: ${this.nome} | Matrícula: ${this.matricula}`;
  }
}

class FuncionarioPadrao extends Colaborador {
  get tipo() {
    return "Padrão";
  }
  // apenas salário base
}

class FuncionarioComissionado extends Colaborador {
  constructor(matricula, nome, vendas, percentual) {
    super(matricula, nome);
    this.vendas = vendas;
    this.percentual = percentual;
  }

  get tipo() {
    return "Comissionado";
  }

  calcularComissao() {
    return (this.vendas * this.percentual) / 100;
  }

  calcularSalario() {
    return SALARIO_BASE + this.calcularComissao();
  }

  detalhes() {
    return (
      `${super.detalhes()} | Vendas: ${moeda(this.vendas)} | ` +
      `Comissão: ${this.percentual}%`
    );
  }
}

class FuncionarioProducao extends Colaborador {
  constructor(matricula, nome, valorPeca, quantidadeProduzida) {
    super(matricula, nome);
    this.valorPeca = valorPeca;
    this.quantidadeProduzida = quantidadeProduzida;
  }

  get tipo() {
    return "Produção";
  }

  calcularBonus() {
    return this.valorPeca * this.quantidadeProduzida;
  }

  calcularSalario() {
    return SALARIO_BASE + this.calcularBonus();
  }

  detalhes() {
    return (
      `${super.detalhes()} | Peças: ${this.quantidadeProduzida} | ` +
      `Valor da peça: ${moeda(this.valorPeca)}`
    );
  }
}

// programa principal

const colaboradores = [];
const rl = readline.createInterface({ input, output });

async function lerTexto(mensagem) {
  while (true) {
    const texto = (await rl.question(mensagem)).trim();
    if (texto) return texto;
    console.log("  ! Campo obrigatório.");
  }
}

async function lerNumero(mensagem, { inteiro = false, maximo = Infinity } = {}) {
  while (true) {
    const texto = (await rl.question(mensagem)).trim().replace(",", ".");
    const numero = Number(texto);
    if (texto === "" || Number.isNaN(numero) || numero < 0) {
      console.log("  ! Informe um número válido (maior ou igual a zero).");
    } else if (inteiro && !Number.isInteger(numero)) {
      console.log("  ! Informe um número inteiro.");
    } else if (numero > maximo) {
      console.log(`  ! O valor máximo permitido é ${maximo}.`);
    } else {
      return numero;
    }
  }
}

// gera as matrículas em sequencia (4 dígitos; passa a 5 após 9999)
let ultimaMatricula = 1000;

function gerarMatricula() {
  ultimaMatricula += 1;
  return String(ultimaMatricula);
}

async function cadastrarPadrao() {
  console.log("\n--- Cadastrar Funcionário Padrão ---");
  const matricula = gerarMatricula();
  const nome = await lerTexto("Nome completo: ");

  const func = new FuncionarioPadrao(matricula, nome);
  colaboradores.push(func);

  console.log("\n✔ Funcionário cadastrado:");
  console.log(`  Nome: ${func.nome}`);
  console.log(`  Matrícula: ${func.matricula}`);
}

async function cadastrarComissionado() {
  console.log("\n--- Cadastrar Funcionário Comissionado ---");
  const matricula = gerarMatricula();
  const nome = await lerTexto("Nome completo: ");
  const vendas = await lerNumero("Total de vendas no mês (R$): ");
  const percentual = await lerNumero("Percentual de comissão (%): ", { maximo: 100 });

  const func = new FuncionarioComissionado(matricula, nome, vendas, percentual);
  colaboradores.push(func);

  console.log("\n✔ Funcionário cadastrado:");
  console.log(`  Nome: ${func.nome}`);
  console.log(`  Matrícula: ${func.matricula}`);
  console.log(`  Valor das vendas: ${moeda(func.vendas)}`);
  console.log(`  Comissão percentual: ${func.percentual}%`);
}

async function cadastrarProducao() {
  console.log("\n--- Cadastrar Funcionário de Produção ---");
  const matricula = gerarMatricula();
  const nome = await lerTexto("Nome completo: ");
  const quantidade = await lerNumero("Quantidade de peças produzidas no mês: ", {
    inteiro: true,
  });
  const valorPeca = await lerNumero("Valor por peça (R$): ");

  const func = new FuncionarioProducao(matricula, nome, valorPeca, quantidade);
  colaboradores.push(func);

  console.log("\n✔ Funcionário cadastrado:");
  console.log(`  Nome: ${func.nome}`);
  console.log(`  Matrícula: ${func.matricula}`);
  console.log(`  Quantidade de peças: ${func.quantidadeProduzida}`);
  console.log(`  Valor da peça: ${moeda(func.valorPeca)}`);
}

function gerarFolha() {
  console.log("\n=========== FOLHA DE PAGAMENTO ===========");

  if (colaboradores.length === 0) {
    console.log("Nenhum colaborador cadastrado.");
    return;
  }

  let total = 0;
  for (const c of colaboradores) {
    const salario = c.calcularSalario();
    total += salario;

    console.log(`\n[${c.tipo}] ${c.detalhes()}`);
    console.log(`  Salário base: ${moeda(SALARIO_BASE)}`);
    if (c instanceof FuncionarioComissionado) {
      console.log(`  Comissão:     ${moeda(c.calcularComissao())}`);
    } else if (c instanceof FuncionarioProducao) {
      console.log(`  Bônus:        ${moeda(c.calcularBonus())}`);
    }
    console.log(`  Salário final: ${moeda(salario)}`);
  }

  console.log("\n------------------------------------------");
  console.log(`Total de colaboradores: ${colaboradores.length}`);
  console.log(`Total da folha: ${moeda(total)}`);
}

function exibirMenu() {
  console.log(`
============== MENU ==============
1 - Cadastrar Funcionário Padrão
2 - Cadastrar Funcionário Comissionado
3 - Cadastrar Funcionário de Produção
4 - Gerar folha de pagamento
0 - Sair do programa
==================================`);
}

async function main() {
  let opcao;
  do {
    exibirMenu();
    opcao = (await rl.question("Escolha uma opção: ")).trim();

    switch (opcao) {
      case "1":
        await cadastrarPadrao();
        break;
      case "2":
        await cadastrarComissionado();
        break;
      case "3":
        await cadastrarProducao();
        break;
      case "4":
        gerarFolha();
        break;
      case "0":
        console.log("\nEncerrando o programa. Até logo!");
        break;
      default:
        console.log("\n! Opção inválida. Tente novamente.");
    }
  } while (opcao !== "0");

  rl.close();
}

main().catch(() => rl.close());