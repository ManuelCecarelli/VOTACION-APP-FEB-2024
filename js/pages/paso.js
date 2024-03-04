const tipoEleccion = 1; //PASO
const tipoRecuento = 1; //Las respuestas de la API no contenían recuento definitivo.
let banderaAnio = false;
let banderaCargo = false;
let banderaDistrito = false;
let consultaPeriodos;
let consultaCargos;
let consultaResultados;
var variableAuxiliar;

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
function detectarCargo(respuestaCargos)
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
                            nuevaOption.value = cargo.Cargo;
                            selectCargo.appendChild(nuevaOption)
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
                            if (cargo.Cargo == selectCargo.value)
                            {
                                cargo.Distritos.forEach(distrito =>
                                {
                                    let selectDistrito = document.getElementById("select-distrito");
                                    let nuevaOption = document.createElement('option');
                                    nuevaOption.text = distrito.Distrito;
                                    nuevaOption.value = distrito.IdDistrito;
                                    selectDistrito.appendChild(nuevaOption);
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
                            if (cargo.Cargo == selectCargo.value)
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
    let selectDistrito = document.getElementById("select-distrito");
    let selectSeccion = document.getElementById("select-seccion");

    let anio = document.getElementById("select-anio").value;
    let cargo = document.getElementById("select-cargo").value;
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
        let categoriaId = 2;
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
            }
            else
            {
                mostrarTituloYSubtitulo();
                mostrarCuadrosColores()
            }
        });
    }
};