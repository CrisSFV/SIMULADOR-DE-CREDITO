const IVA       = 0.16;
const CAT_EXTRA = 0.031; // diferencial CAT sobre tasa nominal (aprox Banamex)
 
/* ─── FORMATO DE MONEDA ─── */
function fmt(n) {
  return '$' + Math.abs(n).toLocaleString('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}
 
/* ─── CALCULAR CAT APROXIMADO ─── */
function calcularCAT(tasaAnual, plazoMeses, comisionPct) {
  // Aproximación CAT usando iteración numérica (método Newton-Raphson simplificado)
  // CAT incluye comisión de apertura e IVA sobre intereses
  const base = tasaAnual + CAT_EXTRA + (comisionPct * 12 / plazoMeses);
  return (base * 100).toFixed(1) + '%';
}
 
/* ─── PAGO POR MIL ─── */
function calcularPagoPorMil(tasaAnual, plazoMeses) {
  // Pago mensual por cada $1,000 bajo esquema de cuota nivelada (referencia)
  const tm = tasaAnual / 12;
  const ppm = (1000 * tm * Math.pow(1 + tm, plazoMeses)) / (Math.pow(1 + tm, plazoMeses) - 1);
  return ppm;
}
 
/* ─── ACTUALIZACIÓN EN TIEMPO REAL ─── */
function actualizarDerivados() {
  const monto      = parseFloat(document.getElementById('monto').value)    || 0;
  const comisionPct = parseFloat(document.getElementById('comision').value) || 0;
  const tasaAnual  = parseFloat(document.getElementById('tasa').value) / 100 || 0;
  const plazo      = parseInt(document.getElementById('plazo').value)       || 12;
 
  // Comisión con IVA
  const comisionConIva = monto * comisionPct;
  document.getElementById('monto-comision-display').textContent = fmt(comisionConIva);
 
  // Total a financiar
  const totalFinanciar = monto + comisionConIva;
  document.getElementById('total-financiar').value = fmt(totalFinanciar);
 
  // Pago por mil
  const ppm = calcularPagoPorMil(tasaAnual, plazo);
  document.getElementById('pago-por-mil').textContent = '$' + ppm.toFixed(2);
 
  // CAT
  document.getElementById('cat-display').value = calcularCAT(tasaAnual, plazo, comisionPct);
}
 
/* ─── SIMULACIÓN PRINCIPAL ─── */
function procesarSimulacion() {
  const nombreCliente  = document.getElementById('nombre').value.trim() || 'CLIENTE';
  const montoBase      = parseFloat(document.getElementById('monto').value);
  const comisionPct    = parseFloat(document.getElementById('comision').value);
  const tasaAnual      = parseFloat(document.getElementById('tasa').value) / 100;
  const plazoMeses     = parseInt(document.getElementById('plazo').value);
 
  if (isNaN(montoBase) || montoBase <= 0 || isNaN(tasaAnual) || tasaAnual <= 0) {
    alert('Ingrese parámetros válidos para continuar.');
    return;
  }
 
  // Monto total a amortizar (incluye comisión)
  const comisionMonto  = montoBase * comisionPct;
  const montoFinanciar = montoBase + comisionMonto;
  const tasaMensual    = tasaAnual / 12;
 
  // Capital fijo mensual
  const amortCapital   = montoFinanciar / plazoMeses;
 
  let saldo            = montoFinanciar;
  const tbody          = document.getElementById('tbody');
  tbody.innerHTML      = '';
 
  let totalIntereses   = 0;
  let totalIva         = 0;
  let totalPagos       = 0;
  let primerPago       = null;
  let ultimoPago       = null;
 
  for (let i = 1; i <= plazoMeses; i++) {
    const interes      = saldo * tasaMensual;
    const iva          = interes * IVA;
    const pagoTotal    = amortCapital + interes + iva;
    const saldoFinal   = Math.max(0, saldo - amortCapital);
 
    totalIntereses    += interes;
    totalIva          += iva;
    totalPagos        += pagoTotal;
 
    if (i === 1)           primerPago = pagoTotal;
    if (i === plazoMeses)  ultimoPago = pagoTotal;
 
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${i}</td>
      <td>${fmt(saldo)}</td>
      <td>${fmt(amortCapital)}</td>
      <td>${fmt(interes)}</td>
      <td>${fmt(iva)}</td>
      <td class="pago-total">${fmt(pagoTotal)}</td>
      <td>${fmt(saldoFinal)}</td>
    `;
    tbody.appendChild(tr);
    saldo = saldoFinal;
  }
 
  /* ─── RESUMEN ─── */
  document.getElementById('r-primer-pago').textContent = fmt(primerPago);
  document.getElementById('r-ultimo-pago').textContent = fmt(ultimoPago);
  document.getElementById('r-intereses').textContent   = fmt(totalIntereses + totalIva);
  document.getElementById('r-total').textContent       = fmt(totalPagos);
 
  /* ─── INFO EN ENCABEZADO DE TABLA ─── */
  document.getElementById('tbl-nombre').textContent = nombreCliente.toUpperCase();
  document.getElementById('tbl-monto').textContent  = fmt(montoFinanciar);
  document.getElementById('tbl-plazo').textContent  = plazoMeses + ' meses';
  document.getElementById('tbl-tasa').textContent   = (tasaAnual * 100).toFixed(0) + '%';
  document.getElementById('tbl-cat').textContent    = document.getElementById('cat-display').value;
 
  /* ─── MOSTRAR TABLA ─── */
  document.getElementById('tabla-section').style.display = 'block';
  document.getElementById('tabla-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
 
/* ─── LIMPIAR ─── */
function limpiarTabla() {
  document.getElementById('tabla-section').style.display = 'none';
  document.getElementById('tbody').innerHTML = '';
}
 
/* ─── EVENTOS REACTIVOS ─── */
['monto', 'comision', 'tasa', 'plazo'].forEach(id => {
  document.getElementById(id).addEventListener('input', actualizarDerivados);
  document.getElementById(id).addEventListener('change', actualizarDerivados);
});
 
/* ─── INICIALIZAR AL CARGAR ─── */
document.addEventListener('DOMContentLoaded', actualizarDerivados);
 


