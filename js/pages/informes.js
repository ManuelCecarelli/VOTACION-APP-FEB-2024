import {comprobarLocalStorage} from "../common.js";
import { provincias } from "./mapas.js";

let botonLimpiarRegistros = document.getElementById("boton-limpiar");
botonLimpiarRegistros.onclick = limpiarRegistrosYRecargar;

let banderaStorage = comprobarLocalStorage();

if (!banderaStorage)
{
    // Si el localStorage está vacío mostramos el mensaje correspondiente al usuario:
    limpiarMsjUsuario();
    mostrarMsjUsuario("msg-alerta", "No hay informes guardados para mostrar");
} 
else
{
    //Si el localStorage contiene datos guardados procedemos con la lógica para el armado de la página:

    //Extraemos el contenido
    let contenidoStoraged = JSON.parse(localStorage.getItem("INFORMES"));
    console.log("El contenido del localStorage es:");
    console.log(contenidoStoraged);

    //Hacemos visibles las secciones ocultas del HTML que vamos a necesitar mostrar
    mostrarSeccionesOcultas();

    //vamos recorriendo cada registro almacenado en el localStorage
    contenidoStoraged.forEach(registro => {
        //hacemos un destructuring para guardar cada parte de la cadena fraccionada en una variable con nombre significativo
        let [anioEleccion, tipoRecuento, tipoEleccion, categoriaId, distritoId, seccionProvincialId, seccionId, circuitoId, mesaId] = registro.split("|");

        //pedimos a la api los datos referidos a los cargos
        let consultaCargos = fetch("https://resultados.mininterior.gob.ar/api/menu?año=" + anioEleccion)
            .then(response => response.json())
            .catch(error =>
            {
                console.error(error);
            });
        console.log("La solicitud con los cargos contiene:");
        console.log(consultaCargos);


        //pedimos a la api los datos referidos a los recuentos
        let consultaResultados = fetch(`https://resultados.mininterior.gob.ar/api/resultados/getResultados?anioEleccion=${anioEleccion}&tipoRecuento=${tipoRecuento}&tipoEleccion=${tipoEleccion}&categoriaId=${categoriaId}&distritoId=${distritoId}&seccionProvincialId=${seccionProvincialId}&seccionId=${seccionId}&circuitoId=${circuitoId}&mesaId=${mesaId}`)
            .then(response => response.json())
            .catch(error =>
            {
                console.error(error);
            });
        console.log("La solicitud con el recuento contiene:");
        console.log(consultaResultados);

        //obtengo el nombre del cargo y de la provincia y armo el la primer parte de mi tabla
        consultaCargos.then(data => {
            data.forEach(item => {
                if (item.IdEleccion == tipoEleccion) {
                    item.Cargos.forEach(cargo => {
                        if (cargo.IdCargo == categoriaId) {
                            cargo.Distritos.forEach(distrito => {
                                if (distrito.IdDistrito == distritoId) {
                                    //agregamos una nueva fila a nuestra tabla en el HTML con parte de la información necesaria
                                    montarProvinciaYTitulos(distritoId, anioEleccion, tipoEleccion==1?"Paso":"Generales", cargo.Cargo, distrito.Distrito, consultaResultados);
                                }
                            })
                        }
                    })        
                }
            })
        });
    });
}

function limpiarMsjUsuario()
{
    //identificamos nodo padre e hijo
    let elementoPadre = document.getElementById("sec-messages");
    let antiguoHijo = document.getElementById("div-container-msg");

    //creamos el nuevo nodo que reemplazará al existente
    let nuevoHijo = document.createElement("div");

    //reemplazamos el antiguo por el nuevo
    elementoPadre.replaceChild(nuevoHijo, antiguoHijo);

    //Seteamos los atributos para que aplique correctamente el estilo CSS
    nuevoHijo.setAttribute("id", "div-container-msg");
};

function mostrarMsjUsuario(tipoMsj, textoMsj) {
    let zonaMensaje = document.getElementById("div-container-msg");

    let cuadroMensaje = document.createElement("div");
    cuadroMensaje.setAttribute("class", "cuadro-msg");
    cuadroMensaje.setAttribute("id", tipoMsj);

    let cuerpoMensaje = document.createElement("p");

    let iconoMensaje = document.createElement("i");

    let contenidoMensaje = document.createTextNode(textoMsj);

    if (cuadroMensaje.id == "msg-exito")
    {
        iconoMensaje.setAttribute("class", "fa-solid fa-thumbs-up");
    }
    else if (cuadroMensaje.id == "msg-error")
    {
        iconoMensaje.setAttribute("class", "fa-solid fa-triangle-exclamation");
    }
    else
    {
        iconoMensaje.setAttribute("class", "fa-solid fa-exclamation");
    };

    //anidamos todo
    cuerpoMensaje.appendChild(iconoMensaje);
    cuerpoMensaje.appendChild(contenidoMensaje);
    cuadroMensaje.appendChild(cuerpoMensaje);
    zonaMensaje.appendChild(cuadroMensaje);
};

function mostrarSeccionesOcultas() {
    let secTitulo = document.getElementById("sec-titulo");
    secTitulo.removeAttribute("hidden");
    let secContenido = document.getElementById("sec-contenido");
    secContenido.removeAttribute("hidden");
};

async function montarProvinciaYTitulos(provinciaId, anio, tipoEleccion, cargo, distrito, consulta) {
    //seleccionamos el elemento padre
    let divContainerGrilla = document.getElementById("div-container-grilla");

    //creamos, seteamos y anidamos el div para la provincia
    let divProvincia = document.createElement("div");
    divProvincia.setAttribute("class","div-cuerpo-grilla grilla-provincia");
    divContainerGrilla.appendChild(divProvincia);
    divProvincia.innerHTML = provincias[provinciaId];

    //creamos, seteamos y anidamos el div para la elección
    let divEleccion = document.createElement("div");
    divEleccion.setAttribute("class","div-cuerpo-grilla grilla-eleccion");
    divContainerGrilla.appendChild(divEleccion);
    let parrTextoNegro = document.createElement("p");
    parrTextoNegro.setAttribute("class","texto-elecciones-chico");
    divEleccion.appendChild(parrTextoNegro);
    let parrTextoCeleste = document.createElement("p");
    parrTextoCeleste.setAttribute("class","texto-path-chico");
    divEleccion.appendChild(parrTextoCeleste);
    parrTextoNegro.innerHTML = `Elecciones ${anio} | ${tipoEleccion}`;
    parrTextoCeleste.innerHTML = `${anio} > ${tipoEleccion} > Provisorio > ${cargo} > ${distrito}`;

    /*consulta.then(data => {
        montarDatosGenerales(data.estadoRecuento.mesasTotalizadas, data.estadoRecuento.cantidadElectores, data.estadoRecuento.participacionPorcentaje);
        montarDatosPorAgrupacion(data.valoresTotalizadosPositivos);
    });*/

    await consulta.then(data => {
        montarDatosGenerales(data.estadoRecuento.mesasTotalizadas, data.estadoRecuento.cantidadElectores, data.estadoRecuento.participacionPorcentaje);
        montarDatosPorAgrupacion(data.valoresTotalizadosPositivos);
    });
};

function montarDatosGenerales(cantMesas, cantElectores, porcentParticipacion) {
    //seleccionamos el elemento padre
    let divContainerGrilla = document.getElementById("div-container-grilla");

    //creamos, seteamos y anidamos el div para los recuadros de colores
    let divRecuadros = document.createElement("div");
    divRecuadros.setAttribute("class","div-cuerpo-grilla grilla-datos-generales");
    divContainerGrilla.appendChild(divRecuadros);

    let divMesasEscrutadas = document.createElement("div");
    divMesasEscrutadas.setAttribute("class","recuadro-datos mesas-escrutadas");
    divRecuadros.appendChild(divMesasEscrutadas);
    let imgSvgUrna = document.createElement("img");
    imgSvgUrna.setAttribute("src","img/svg/urna.svg")
    imgSvgUrna.setAttribute("alt","urna");
    divMesasEscrutadas.appendChild(imgSvgUrna);
    let contenidoMesas = document.createTextNode(`Mesas escrutadas: ${cantMesas}`);
    divMesasEscrutadas.append(contenidoMesas);

    let divElectores = document.createElement("div");
    divElectores.setAttribute("class","recuadro-datos electores");
    divRecuadros.appendChild(divElectores);
    let imgSvgPersonas = document.createElement("img");
    imgSvgPersonas.setAttribute("src","img/svg/personas.svg")
    imgSvgPersonas.setAttribute("alt","personas");
    divElectores.appendChild(imgSvgPersonas);
    let contenidoElectores = document.createTextNode(`Electores: ${cantElectores}`);
    divElectores.append(contenidoElectores);

    let divParticipacion = document.createElement("div");
    divParticipacion.setAttribute("class","recuadro-datos participacion");
    divRecuadros.appendChild(divParticipacion);
    let imgSvgManos = document.createElement("img");
    imgSvgManos.setAttribute("src","img/svg/manos.svg")
    imgSvgManos.setAttribute("alt","manos");
    divParticipacion.appendChild(imgSvgManos);
    let contenidoParticipacion = document.createTextNode(`Participación sobre escrutado: ${porcentParticipacion}`);
    divParticipacion.append(contenidoParticipacion);

};

function montarDatosPorAgrupacion(arrayAgrupaciones) {
    //seleccionamos el elemento padre
    let divContainerGrilla = document.getElementById("div-container-grilla");
    
    let divDatosPorAgrupacion = document.createElement("div");
    divDatosPorAgrupacion.setAttribute("class","div-cuerpo-grilla grilla-datos-por-agrupacion");
    divContainerGrilla.appendChild(divDatosPorAgrupacion);

    arrayAgrupaciones.forEach(agrupacion => {
        let divNombreAgrupacion = document.createElement("div");
        divNombreAgrupacion.setAttribute("class","texto-agrupacion-oscuro subcuadro-agrupacion");
        divDatosPorAgrupacion.appendChild(divNombreAgrupacion);
        divNombreAgrupacion.innerHTML = agrupacion.nombreAgrupacion;
        let divVotosAgrupacion = document.createElement("div");
        divVotosAgrupacion.setAttribute("class","texto-agrupacion-claro subcuadro-agrupacion");
        divDatosPorAgrupacion.appendChild(divVotosAgrupacion);
        divVotosAgrupacion.innerHTML = `${agrupacion.votosPorcentaje}%${"<br>"}${agrupacion.votos} votos`;
    })
}

function limpiarRegistrosYRecargar() {
    localStorage.clear();
    location.reload();
};

/*
ESTRUCTURA BASE DE LA TABLA DE INFORMES DEL HTML:

<section id="sec-contenido" hidden>
    <!--Seccion para contenido de la página-->
    <div class="div-container" id="div-container-grilla">
        <div class="div-cabecera-grilla">PROVINCIA</div>
        <div class="div-cabecera-grilla">ELECCION</div>
        <div class="div-cabecera-grilla">DATOS GENERALES</div>
        <div class="div-cabecera-grilla">DATOS POR AGRUPACION</div>
        <!--primera fila-->
        <div class="div-cuerpo-grilla grilla-provincia">
        </div>
        <div class="div-cuerpo-grilla grilla-eleccion">
            <p class="texto-elecciones-chico">Elecciones 2020 | Generales</p>
            <p class="texto-path-chico">2020 > Generales > Provisorio > Senadores Nacionales > Buenos Aires</p>
        </div>
        <div class="div-cuerpo-grilla grilla-datos-generales">
            <div class="recuadro-datos mesas-escrutadas">
                <img src="img/svg/urna.svg" alt="urna">
                Mesas escrutadas
            </div>
            <div class="recuadro-datos electores">
                <img src="img/svg/personas.svg" alt="personas">
                Electores
            </div>
            <div class="recuadro-datos participacion">
                <img src="img/svg/manos.svg" alt="manos">
                Participación sobre escrutado
            </div>
        </div>
        <div class="div-cuerpo-grilla grilla-datos-por-agrupacion">
            <div class="texto-agrupacion-oscuro">Juntos</div>
            <div class="texto-agrupacion-claro">38%<br>30000 votos</div>
            <div class="texto-agrupacion-oscuro">PJ</div>
            <div class="texto-agrupacion-claro">20%<br>12000 votos</div>
        </div>
        <!--segunda fila-->
        <div class="div-cuerpo-grilla grilla-provincia">
            <img src="img/mapas/caba.svg" alt="caba">
        </div>
        <div class="div-cuerpo-grilla grilla-eleccion">
            <p class="texto-elecciones-chico">Elecciones 2020 | Generales</p>
            <p class="texto-path-chico">2020 > Generales > Provisorio > Senadores Nacionales > Buenos Aires</p>
        </div>
        <div class="div-cuerpo-grilla grilla-datos-generales">
            <div class="recuadro-datos mesas-escrutadas">
                <img src="img/svg/urna.svg" alt="urna">
                Mesas escrutadas
            </div>
            <div class="recuadro-datos electores">
                <img src="img/svg/personas.svg" alt="personas">
                Electores
            </div>
            <div class="recuadro-datos participacion">
                <img src="img/svg/manos.svg" alt="manos">
                Participación sobre escrutado
            </div>
        </div>
        <div class="div-cuerpo-grilla grilla-datos-por-agrupacion">
            <div class="texto-agrupacion-oscuro">Juntos</div>
            <div class="texto-agrupacion-claro">38%<br>30000 votos</div>
            <div class="texto-agrupacion-oscuro">PJ</div>
            <div class="texto-agrupacion-claro">20%<br>12000 votos</div>
        </div>
    </div>
</section>
*/