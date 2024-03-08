import { provincias, colores } from "./mapas.js";

const tipoEleccion = 1; //PASO
const tipoRecuento = 1; //Recuento definitivo.
let banderaAnio = false;
let banderaCargo = false;
let banderaDistrito = false;
let consultaPeriodos;
let consultaCargos;
let consultaResultados;

let botonFiltrar = document.getElementById("filtrar-button");
botonFiltrar.onclick = filtrarDatos;

//Apenas se carga la página se piden los períodos a la API:
consultaPeriodos = fetch("https://resultados.mininterior.gob.ar/api/menu/periodos")
    //Línea para espuesta satisfactoria
    .then(response => response.json())
    //Línea por si se produce un error
    .catch(error =>
    {
        console.error(error); //Muestro el mensaje de error
    });

//Cargamos los perídos recibidos al combo desplegable de "Año":
consultaPeriodos
    .then(data =>
    { 
        data.forEach(periodo =>
        {
            let selectAnio = document.getElementById("select-anio");
            let nuevaOption = document.createElement('option');
            nuevaOption.text = periodo;
            nuevaOption.value = periodo;
            selectAnio.appendChild(nuevaOption);
            selectAnio.onchange = detectarAnio;
        });
    });

//función que se activa con el evento "onchange" del combo desplegable de "año".
function detectarAnio()
{
    if (banderaAnio)
    {
        limpiarSelect("select-cargo", "Cargo");
    }
    banderaAnio = true;
    let selectAnio = document.getElementById("select-anio");
    pedirCargos(selectAnio);
};

//función que se activa con el evento "onchange" del combo desplegable de "cargo".
function detectarCargo()
{
    if (banderaCargo)
    {
        limpiarSelect("select-distrito", "Distrito");
    }
    banderaCargo = true;
    let selectCargo = document.getElementById("select-cargo");
    rellenarComboDistrito(selectCargo);
}

//función que se activa con el evento "onchange" del combo desplegable de "distrito".
function detectarDistrito()
{
    if (banderaDistrito)
    {
        limpiarSelect("select-seccion", "Sección");
    }
    banderaDistrito = true;
    rellenarComboSeccion()
}

//Esta función es para renovar los combos y que no se acumule el contenido
function limpiarSelect(selectId, selectText) //En realidad intercambiamos select existente por uno nuevo
{
    //identificamos nodo padre e hijo
    let elementoPadre = document.getElementById("menu-page");
    let antiguoHijo = document.getElementById(selectId);

    //creamos el nuevo nodo que reemplazará al existente
    let nuevoHijo = document.createElement("select");
    let mismoContenido = document.createElement("option");
    nuevoHijo.appendChild(mismoContenido);
    mismoContenido.text = selectText;
    mismoContenido.setAttribute("disabled", "true");
    mismoContenido.setAttribute("selected", "true");
    mismoContenido.setAttribute("value", "#");
    
    //reemplazamos el antiguo por el nuevo
    elementoPadre.replaceChild(nuevoHijo, antiguoHijo);

    //Seteamos los atributos para que aplique correctamente el estilo CSS
    nuevoHijo.setAttribute("class", "desplegable");
    nuevoHijo.setAttribute("name", selectId);
    nuevoHijo.setAttribute("id", selectId);

    //aquí bifurcamos según corresponda
    if (selectId == "select-cargo")
    {
        nuevoHijo.setAttribute("onchange", "detectarCargo()");
    }
    else if (selectId == "select-distrito")
    {
        nuevoHijo.setAttribute("onchange", "detectarDistrito()");
    };
};

//Esta función se activa cuando el usuario seleccionó algún período en el combo desplegable de "Año".
function pedirCargos(anio)
{
    //pedimos los cargos a la API para el año seleccionado:
    consultaCargos = fetch("https://resultados.mininterior.gob.ar/api/menu?año=" + anio.value)
        //Respuesta satisfactoria
        .then(response => response.json())
        .catch(error =>
        {
            console.error(error);
        });
    console.log(consultaCargos);

    //cargamos los cargos obtenidos en el desplegable de "Cargo":
    consultaCargos.then(data =>  
        data.forEach(indice =>
            {
                if (indice.IdEleccion == tipoEleccion)
                {
                    indice.Cargos.forEach(cargo =>
                        {
                            let selectCargo = document.getElementById("select-cargo");
                            let nuevaOption = document.createElement('option');
                            nuevaOption.text = cargo.Cargo;
                            nuevaOption.value = cargo.IdCargo;
                            selectCargo.appendChild(nuevaOption)
                            selectCargo.onchange = detectarCargo;
                        })
                }
            }))
};

//Función que rellena el combo "Distrito" cuando el usuario selecciona un cargo.
function rellenarComboDistrito(selectCargo)
{
    consultaCargos.then(data =>  
        data.forEach(indice =>
            {
                if (indice.IdEleccion == tipoEleccion)
                {
                    indice.Cargos.forEach(cargo =>
                        {
                            if (cargo.IdCargo == selectCargo.value)
                            {
                                cargo.Distritos.forEach(distrito =>
                                {
                                    let selectDistrito = document.getElementById("select-distrito");
                                    let nuevaOption = document.createElement('option');
                                    nuevaOption.text = distrito.Distrito;
                                    nuevaOption.value = distrito.IdDistrito;
                                    selectDistrito.appendChild(nuevaOption);
                                    selectDistrito.onchange = detectarDistrito;
                                })
                                
                            }
                        })
                }
            }))
};

function rellenarComboSeccion()
{
    let selectCargo = document.getElementById("select-cargo");
    let selectDistrito = document.getElementById("select-distrito");

    consultaCargos.then(data =>  
        data.forEach(indice =>
            {
                if (indice.IdEleccion == tipoEleccion)
                {
                    indice.Cargos.forEach(cargo =>
                        {
                            if (cargo.IdCargo == selectCargo.value)
                            {
                                cargo.Distritos.forEach(distrito =>
                                {
                                    if (distrito.IdDistrito == selectDistrito.value)
                                    {
                                        distrito.SeccionesProvinciales.forEach(elemento =>
                                            {
                                                let datoOculto = document.getElementById("hdSeccionProvincial");
                                                datoOculto.value = elemento.IDSeccionProvincial;
                                                elemento.Secciones.forEach(seccion =>
                                                    {
                                                        let selectSeccion = document.getElementById("select-seccion");
                                                        let nuevaOption = document.createElement('option');
                                                        nuevaOption.text = seccion.Seccion;
                                                        nuevaOption.value = seccion.IdSeccion;
                                                        selectSeccion.appendChild(nuevaOption);
                                                    })
                                            })
                                    }
                                    
                                })
                                
                            }
                        })
                }
            }))
};

function comprobarSelecciones()
{
    let combos = document.getElementsByClassName("desplegable");
    let bandera = true;
    let i = 0;

    while (i < combos.length && bandera)
    {
        if (combos[i].value == "#")
        {
            bandera = false;
        }
        i++;
    }
    return bandera;
};

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

function mostrarMsjUsuario(tipoMsj, textoMsj)
{
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

function mostrarTituloYSubtitulo()
{
    let selectCargo = document.getElementById("select-cargo");
    let selectDistrito = document.getElementById("select-distrito");
    let selectSeccion = document.getElementById("select-seccion");

    let anio = document.getElementById("select-anio").value;
    let cargo = selectCargo.options[selectCargo.selectedIndex].text;
    let distrito = selectDistrito.options[selectDistrito.selectedIndex].text;
    let seccion = selectSeccion.options[selectSeccion.selectedIndex].text;
    let eleccion = determinarTipoEleccion();

    let contenedorTitulo = document.getElementById("div-titulo");
    let titulo = document.createElement("h1");
    let subtitulo = document.createElement("p");
    contenedorTitulo.appendChild(titulo);
    contenedorTitulo.appendChild(subtitulo);

    let contenidoTitulo = document.createTextNode(`Elecciones ${anio} | ${eleccion}`);
    titulo.appendChild(contenidoTitulo);

    let contenidoSubtitulo = document.createTextNode(`${anio} > ${eleccion} > ${cargo} > ${distrito} > ${seccion}`);
    subtitulo.appendChild(contenidoSubtitulo);
};

function determinarTipoEleccion()
{
    if (tipoEleccion == 1)
    {
        return "Paso";
    } 
    else
    {
        return "Generales";
    };
};

function mostrarCuadrosColores()
{
    //creamos y ubicamos el botón de "agregar a iforme":
    let divContenedor = document.getElementById("div-contenido");
    let divBotonAgregar = document.createElement("div");
    divBotonAgregar.setAttribute("id", "div-agregar-a-informe");
    let botonAgregar = document.createElement("button");
    botonAgregar.setAttribute("id", "button-agregar-a-informe");
    botonAgregar.onclick = agregarAInforme;
    let textoBotonAgregar = document.createTextNode("+ AGREGAR A INFORME")

    divContenedor.appendChild(divBotonAgregar);
    divBotonAgregar.appendChild(botonAgregar);
    botonAgregar.appendChild(textoBotonAgregar);

    //creamos y ubicamos el contenedor para los recuadros de resumen:
    let divRecuadrosResumen = document.createElement("div");
    divRecuadrosResumen.setAttribute("id", "div-recuadros-resumen");

    divContenedor.appendChild(divRecuadrosResumen);

    //Creamos el recuadro mesas escrutadas:
    let recuadroUrna = document.createElement("div");
    recuadroUrna.setAttribute("class", "recuadro-resumen");
    recuadroUrna.setAttribute("id", "recuadro-urna");

    divRecuadrosResumen.appendChild(recuadroUrna);

    let imagenUrna = document.createElement("img");
    imagenUrna.setAttribute("src", "img/svg/urna.svg");

    recuadroUrna.appendChild(imagenUrna);

    //Creamos el recuadro electores:
    let recuadroElectores = document.createElement("div");
    recuadroElectores.setAttribute("class", "recuadro-resumen");
    recuadroElectores.setAttribute("id", "recuadro-personas");

    divRecuadrosResumen.appendChild(recuadroElectores);

    let imagenPersonas = document.createElement("img");
    imagenPersonas.setAttribute("src", "img/svg/personas.svg");

    recuadroElectores.appendChild(imagenPersonas);

    //Creamos el recuadro participación sobre escrutado:
    let recuadroParticipacion = document.createElement("div");
    recuadroParticipacion.setAttribute("class", "recuadro-resumen");
    recuadroParticipacion.setAttribute("id", "recuadro-manos");

    divRecuadrosResumen.appendChild(recuadroParticipacion);

    let imagenManos = document.createElement("img");
    imagenManos.setAttribute("src", "img/svg/manos.svg");

    recuadroParticipacion.appendChild(imagenManos);

    consultaResultados.then(data =>
        {
            let electores = data.estadoRecuento.cantidadElectores;
            let mesasEscrut = data.estadoRecuento.mesasTotalizadas;
            let participacion = data.estadoRecuento.participacionPorcentaje;

            let textoRecuadroUrna = document.createTextNode(`Mesas escrutadas: ${mesasEscrut}`);
            recuadroUrna.appendChild(textoRecuadroUrna);

            let textoRecuadroPersonas = document.createTextNode(`Electores: ${electores}`);
            recuadroElectores.appendChild(textoRecuadroPersonas);

            let textoRecuadroManos = document.createTextNode(`Participacion sobre escrutado: ${participacion}%`);
            recuadroParticipacion.appendChild(textoRecuadroManos);
        });
};

function limpiarTituloYContenido()
{
    //limpiamos la zona de titulo
    let nodoPadreTitulo = document.getElementById("sec-titulo");
    let antiguoNodoTitulo = document.getElementById("div-titulo");
    let nuevoNodoTitulo = document.createElement("div");
    nodoPadreTitulo.replaceChild(nuevoNodoTitulo, antiguoNodoTitulo);
    nuevoNodoTitulo.setAttribute("id", "div-titulo");

    //limpiamos la zona de contenido(boton agregar a informe + 3 cuadros de colores)
    let nodoPadreContenido = document.getElementById("sec-contenido");
    let antiguoNodoContenido = document.getElementById("div-contenido");
    let nuevoNodoContenido = document.createElement("div");
    nodoPadreContenido.replaceChild(nuevoNodoContenido, antiguoNodoContenido);
    nuevoNodoContenido.setAttribute("id", "div-contenido");
};

function armarCuadroProvincia()
{
    let selectDistrito = document.getElementById("select-distrito");
    let containerDivMapa = document.getElementById("grafico-mapa");
    containerDivMapa.removeAttribute("hidden");
    let divMapa = document.getElementById("mapa-de-grafico");
    divMapa.innerHTML = provincias[selectDistrito.value];
    let nombreMapa = document.getElementById("nombre-mapa");
    nombreMapa.innerText = selectDistrito.options[selectDistrito.selectedIndex].text;
};

function filtrarDatos()
{
    let permiso = comprobarSelecciones();
    
    if (!permiso)
    {
        limpiarMsjUsuario();
        mostrarMsjUsuario("msg-alerta", " No ha seleccionado todos los datos requeridos en los combos desplegables");
    }
    else
    {
        limpiarMsjUsuario();
        limpiarTituloYContenido();

        let anioEleccion = document.getElementById("select-anio").value;
        let categoriaId = document.getElementById("select-cargo").value;
        let distritoId = document.getElementById("select-distrito").value;
        let seccionProvincialId = 0; //lo seteé manualmente en cero porque cuando lo capturamos contenía "null"
        let seccionId = document.getElementById("select-seccion").value;
        let circuitoId = "";
        let mesaId = "";

        consultaResultados = fetch(`https://resultados.mininterior.gob.ar/api/resultados/getResultados?anioEleccion=${anioEleccion}&tipoRecuento=${tipoRecuento}&tipoEleccion=${tipoEleccion}&categoriaId=${categoriaId}&distritoId=${distritoId}&seccionProvincialId=${seccionProvincialId}&seccionId=${seccionId}&circuitoId=${circuitoId}&mesaId=${mesaId}`)
            .then(response => response.json())
            .catch(error =>
            {
                mostrarMsjUsuario("msg-error", "No se ha recibido correctamente el archivo de respuesta desde la API");
                console.error(error);
            });

        console.log(consultaResultados);

        consultaResultados.then(data =>
        {
            let electores = data.estadoRecuento.cantidadElectores;
            let mesasEscrut = data.estadoRecuento.mesasTotalizadas;
            let participacion = data.estadoRecuento.participacionPorcentaje;

            if (electores == 0 && mesasEscrut == 0 && participacion == null)
            {
                mostrarTituloYSubtitulo();
                mostrarMsjUsuario("msg-alerta", " No se obtuvieron datos del escrutinio solicitado")
                ocultarCuadrosGrandes();
            }
            else
            {
                mostrarTituloYSubtitulo();
                mostrarCuadrosColores();
                mostrarCuadrosGrandes()
                armarCuadroProvincia();
                armarCuadroPartidos()
            }
        });
    }
};

function agregarAInforme()
{
    let anioEleccion = document.getElementById("select-anio").value;
    let categoriaId = document.getElementById("select-cargo").value;
    let distritoId = document.getElementById("select-distrito").value;
    let seccionProvincialId = 0;
    let seccionId = document.getElementById("select-seccion").value;
    let circuitoId = "";
    let mesaId = "";

    //localStorage.clear();
    //validación
    if (localStorage.length == 0)
    {
        let cadenaAGuardar = [`${anioEleccion}|${tipoRecuento}|${tipoEleccion}|${categoriaId}|${distritoId}|${seccionProvincialId}|${seccionId}|${circuitoId}|${mesaId}`];
        localStorage.setItem("INFORMES", JSON.stringify(cadenaAGuardar));
        console.log("Se almacenó el contenido en el localStorage");
        limpiarMsjUsuario()
        mostrarMsjUsuario("msg-exito", " La información filtrada se agregó correctamente");

    }
    else
    {
        let i = 0;
        let bandera = true;
        let cadenaAGuardar = `${anioEleccion}|${tipoRecuento}|${tipoEleccion}|${categoriaId}|${distritoId}|${seccionProvincialId}|${seccionId}|${circuitoId}|${mesaId}`;
        let contenidoStoraged = JSON.parse(localStorage.getItem("INFORMES"));

        while (i < contenidoStoraged.length && bandera)
        {
            if (contenidoStoraged[i] == cadenaAGuardar)
            {
                console.log("El localStorage ya contiene la información que intenta guardar");
                bandera = false;
                limpiarMsjUsuario()
                mostrarMsjUsuario("msg-alerta", " La información filtrada ya se encuentra agregada al área de informes");
            }
            i++;
        }

        if (bandera)
        {
            contenidoStoraged.push(cadenaAGuardar);
            console.log("El contenido almacenado actual es:");
            console.log(contenidoStoraged);
            localStorage.setItem("INFORMES", JSON.stringify(contenidoStoraged));
            console.log("Se volvió a almacenar el contenido en el localStorage");
            limpiarMsjUsuario()
            mostrarMsjUsuario("msg-exito", " La información filtrada se agregó correctamente");
        }
    }
};

function mostrarCuadrosGrandes()
{
    let seccionBloques = document.getElementById("sec-bloques-graficos");
    seccionBloques.removeAttribute("hidden");
}

function ocultarCuadrosGrandes()
{
    let seccionBloques = document.getElementById("sec-bloques-graficos");
    seccionBloques.setAttribute("hidden", "true");
}

function armarCuadroPartidos()
{
    consultaResultados.then(data =>
        {
            data.valoresTotalizadosPositivos.forEach(agrupacion =>
                {
                    let nombreAgrupacion = agrupacion.nombreAgrupacion;
                    let nombreLista;
                    let cantidadVotosAgrupacion = agrupacion.votos;
                    let porcentajeVotosAgrupacion = agrupacion.votosPorcentaje;

                    //creamos nuevo bloque de agrupación, y lo ubicamos
                    let divBloqueAgrupacion = document.createElement("div");
                    divBloqueAgrupacion.setAttribute("class", "bloque-agrupacion");
                    let divContainerAgrupacion = document.getElementById("container-agrupacion");
                    divContainerAgrupacion.appendChild(divBloqueAgrupacion);
                    //creamos lugar para el nombre, lo ubicamos y rellenamos
                    let divNombreAgrupacion = document.createElement("div");
                    divNombreAgrupacion.setAttribute("class", "nombre-agrupacion");
                    divBloqueAgrupacion.appendChild(divNombreAgrupacion);
                    let textoNombreAgrupacion = document.createTextNode(nombreAgrupacion);
                    divNombreAgrupacion.appendChild(textoNombreAgrupacion);

                    if (agrupacion.listas) //lógica para más de una lista
                    {
                        agrupacion.listas.forEach(lista =>
                            {
                                nombreLista = lista.nombre;
                                let cantidadVotosLista = lista.votos;
                                let porcentajeVotosLista = cantidadVotosLista * 100 / cantidadVotosAgrupacion;

                                //creamos nuevo bloque de lista, y lo ubicamos:
                                let divBloqueLista = document.createElement("div");
                                divBloqueLista.setAttribute("class", "bloque-lista");
                                divBloqueAgrupacion.appendChild(divBloqueLista);
                                //creamos divs para el nombre y los votos:
                                //nombre lista
                                let divNombreLista = document.createElement("div");
                                divNombreLista.setAttribute("class", "nombre-lista");
                                divBloqueLista.appendChild(divNombreLista);
                                let textoNombreLista = document.createTextNode(nombreLista);
                                divNombreLista.appendChild(textoNombreLista);
                                //votos lista
                                let divVotosLista = document.createElement("div");
                                divVotosLista.setAttribute("class", "votos-lista");
                                divBloqueLista.appendChild(divVotosLista);
                                let textoVotosLista1 = document.createTextNode(porcentajeVotosLista);
                                let textoVotosLista2 = document.createTextNode(cantidadVotosLista);
                                let saltoLinea = document.createElement("br");
                                divVotosLista.appendChild(textoVotosLista1);
                                divVotosLista.appendChild(saltoLinea);
                                divVotosLista.appendChild(textoVotosLista2);
                            });
                    }
                    else //lógica para una única lista
                    {
                        nombreLista = "Lista Única";
                        //Armamos el bloque similar al caso anterior
                        //creamos nuevo bloque de lista, y lo ubicamos:
                        let divBloqueLista = document.createElement("div");
                        divBloqueLista.setAttribute("class", "bloque-lista");
                        divBloqueAgrupacion.appendChild(divBloqueLista);
                        //creamos divs para el nombre y los votos:
                        //nombre lista
                        let divNombreLista = document.createElement("div");
                        divNombreLista.setAttribute("class", "nombre-lista");
                        divBloqueLista.appendChild(divNombreLista);
                        let textoNombreLista = document.createTextNode(nombreLista);
                        divNombreLista.appendChild(textoNombreLista);
                        //votos lista
                        let divVotosLista = document.createElement("div");
                        divVotosLista.setAttribute("class", "votos-lista");
                        divBloqueLista.appendChild(divVotosLista);
                        let textoVotosLista1 = document.createTextNode(porcentajeVotosAgrupacion);
                        let textoVotosLista2 = document.createTextNode(cantidadVotosAgrupacion);
                        let saltoLinea = document.createElement("br");
                        divVotosLista.appendChild(textoVotosLista1);
                        divVotosLista.appendChild(saltoLinea);
                        divVotosLista.appendChild(textoVotosLista2);
                    }   
                });
        });

    /*<div id="div-container-graficos">
                <div class="div-grafico" id="container-agrupacion"> x
                    <div class="titulo-de-grafico">Agrupaciones políticas</div> x
                --------
                --------
                    <div class="bloque-agrupacion"> x
                        <div class="nombre-agrupacion">Juntos por el cambio</div> x
                        <div class="bloque-lista"> x
                            <div class="nombre-lista">Juntos</div> x
                            <div class="votos-lista">80.55%<br>11500 votos</div> x
                        </div>

                        --------
                        --------

                        <div class="progress" style="background: var(--grafica-amarillo-claro);">
                            <div class="progress-bar" style="width:15%; background: var(--grafica-amarillo);"><span
                                    class="progress-bar-text">15%</span>
                            </div>
                        </div>
                    </div>
                </div> */
};