//Mensajes de error o exitosos
function showMessage(message, cssClass) {
    const div = document.createElement('div');
    div.className = `alert alert-${cssClass} mt-2`;
    div.appendChild(document.createTextNode(message));
    //mostrar en el DOM
    const container = document.querySelector('.container');
    const app = document.querySelector('#App');
    container.insertBefore(div, app);
    setTimeout(function () {
        document.querySelector('.alert').remove();
    }, 3000)
}
//validar formulario
function validarForm() {
    const descripcion = document.getElementById('description').value;
    const tipo = document.getElementById('tipoRegistro').value;
    const costoTotal = document.getElementById('costo-Total').value;
    const fecha = document.getElementById('fecha').value;
    if (descripcion === '' || tipo === '' || costoTotal === '') {
        showMessage('Complete todos los campos por favor!', 'warning');
        return false;
    };
    showMessage('Registro agregado exitosamente', 'success');
    return true;
}
let tablaData;
function actualizarTabla() {
    // Volver a crear la tabla con los nuevos datos
    datos();
    sumarTotales();
}
document.addEventListener('DOMContentLoaded', function () {
    datos();
    sumarTotales();
    $('#crudTable').DataTable({
        footerCallback: function (row, data, start, end, display) {
            let api = this.api();

            // Remove the formatting to get integer data for summation
            let intVal = function (i) {
                return typeof i === 'string'
                    ? i.replace(/[\$,]/g, '') * 1
                    : typeof i === 'number'
                        ? i
                        : 0;
            };

            // Total over all pages
            total = api
                .column(3)
                .data()
                .reduce((a, b) => intVal(a) + intVal(b), 0);

            // Total over this page
            pageTotal = api
                .column(3, { page: 'current' })
                .data()
                .reduce((a, b) => intVal(a) + intVal(b), 0);

            // Update footer
            api.column(3).footer().innerHTML =
                '₡ ' + pageTotal + ' ( ₡ ' + total + ' total general)';

        }
    });

})

//Agregar registros y guardarlos en el localStorage
function datos() {
    var finanzas;
    if (localStorage.getItem("finanzas") == null) {
        finanzas = [];
    } else {
        finanzas = JSON.parse(localStorage.getItem("finanzas"))
    }
    var html = "";
    finanzas.forEach(function (element, index) {
        var tipoHtml = element.tipo === 'Pendiente' ? '<span class="badge bg-danger">Pendiente</span>' : element.tipo;
        html += "<tr>";
        html += "<td>" + element.fecha + "</td>";
        html += "<td>" + tipoHtml + "</td>";
        html += "<td>" + element.descripcion + "</td>";
        html += "<td>" + element.costoTotal + "</td>";
        html += '<td><button onclick="borrarDatos(' + index + ')" class="btn btn-outline-danger btn-sm" data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-original-title="Tooltip on bottom"><i class="fa-solid fa-trash-can"></i></button> <button onclick="actualizarDatos(' + index + ')" class="btn btn-outline-warning btn-sm"><i class="fa-solid fa-pen-to-square"></i></button> </td>';
        html += "</tr>"
    });
    document.querySelector('#crudTable tbody').innerHTML = html;
    sumarTotales();
    
}
//guardar los datos 
document.getElementById('guardar').addEventListener('click', function (e) {
    e.preventDefault();
    if (validarForm()) {
        const descripcion = document.getElementById('description').value;
        const tipo = document.getElementById('tipoRegistro').value;
        const costoTotal = document.getElementById('costo-Total').value;
        const fecha = document.getElementById('fecha').value;
        var finanzas;
        if (localStorage.getItem("finanzas") == null) {
            finanzas = [];
        } else {
            finanzas = JSON.parse(localStorage.getItem("finanzas"))
        }
        finanzas.push({
            fecha: fecha,
            tipo: tipo,
            descripcion: descripcion,
            costoTotal: costoTotal
        });
        localStorage.setItem("finanzas", JSON.stringify(finanzas));
        datos();
        sumarTotales();

        document.getElementById('finanzas-form').reset();
        actualizarTabla();
    }

})
function sumarTotales() {
    var finanzas;
    if (localStorage.getItem("finanzas") == null) {
        finanzas = [];
    } else {
        finanzas = JSON.parse(localStorage.getItem("finanzas"))
    }
    var sumaPendiente = 0;
    var sumaCuenta = 0;
    var total = 0;
    finanzas.forEach(function (element) {
        if (element.tipo === 'Pendiente') {
            sumaPendiente += parseFloat(element.costoTotal);
        } else if (element.tipo === 'En cuenta') {
            sumaCuenta += parseFloat(element.costoTotal)
        }

    });
    total = sumaPendiente + sumaCuenta;
    document.getElementById('totalPendiente').value = sumaPendiente;
    document.getElementById('totalCuenta').value = sumaCuenta;
    document.getElementById('totalGeneral').value = total;
}

//funcion para eliminar datos
function borrarDatos(index) {
    var finanzas;
    if (localStorage.getItem("finanzas") == null) {
        finanzas = [];
    } else {
        finanzas = JSON.parse(localStorage.getItem("finanzas"))
    }
    finanzas.splice(index, 1);
    localStorage.setItem("finanzas", JSON.stringify(finanzas));
    datos();
    sumarTotales();
}
//funcion actualizar datos
function actualizarDatos(index) {
    document.getElementById('guardar').style.display = 'none';
    document.getElementById('actualizar').style.display = 'block';

    var finanzas;
    if (localStorage.getItem("finanzas") == null) {
        finanzas = [];
    } else {
        finanzas = JSON.parse(localStorage.getItem("finanzas"))
    }
    document.getElementById('description').value = finanzas[index].descripcion;
    document.getElementById('tipoRegistro').value = finanzas[index].tipo;
    document.getElementById('costo-Total').value = finanzas[index].costoTotal;
    document.getElementById('fecha').value = finanzas[index].fecha;

    document.querySelector('#actualizar').onclick = function () {
        if (validarForm()) {
            finanzas[index].descripcion = document.getElementById('description').value;
            finanzas[index].tipo = document.getElementById('tipoRegistro').value;
            finanzas[index].costoTotal = document.getElementById('costo-Total').value;
            finanzas[index].fecha = document.getElementById('fecha').value;
            localStorage.setItem("finanzas", JSON.stringify(finanzas))
            datos();
            sumarTotales();
            document.getElementById('description').value = "";
            document.getElementById('tipoRegistro').value = "";
            document.getElementById('costo-Total').value = "";
            document.getElementById('fecha').value = "";
            document.getElementById('guardar').style.display = 'block';
            document.getElementById('actualizar').style.display = 'none';
        }
    }
};