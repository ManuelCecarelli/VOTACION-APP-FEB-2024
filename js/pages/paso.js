const tipoEleccion = 1; //PASO
const tipoRecuento = 1; //Las respuestas de la API no contenían recuento definitivo.
let banderaAnio = false;
let banderaCargo = false;
let consultaPeriodos;
let consultaCargos;

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
        limpiarSelectCargo();
    }
    banderaAnio = true;
    let selectAnio = document.getElementById("select-anio");
    pedirCargos(selectAnio);
};

function detectarCargo(respuestaCargos)
{
    if (banderaCargo)
    {
        limpiarSelectDistrito();
    }
    banderaCargo = true;
    console.log("El valor de la variable banderaCargo ahora es: " + banderaCargo);
    let selectCargo = document.getElementById("select-cargo");
    rellenarComboDistrito(selectCargo);
}

//Esta función es para renovar el combo de cargo y que no se acumulen cargos.
function limpiarSelectCargo() //En realidad intercambiamos select existente por uno nuevo
{
    //identificamos nodo padre e hijo
    let elementoPadre = document.getElementById("menu-page");
    let antiguoHijo = document.getElementById("select-cargo");

    //creamos el nuevo nodo que reemplazará al existente
    let nuevoHijo = document.createElement("select");
    let mismoContenido = document.createElement("option");
    nuevoHijo.appendChild(mismoContenido);
    mismoContenido.text = "Cargo";
    mismoContenido.setAttribute("disabled", "true");
    mismoContenido.setAttribute("selected", "true");
    
    //reemplazamos el antiguo por el nuevo
    elementoPadre.replaceChild(nuevoHijo, antiguoHijo);

    //Seteamos los atributos para que aplique correctamente el estilo CSS
    nuevoHijo.setAttribute("class", "desplegable");
    nuevoHijo.setAttribute("name", "select-cargo");
    nuevoHijo.setAttribute("id", "select-cargo");
    nuevoHijo.setAttribute("onchange", "detectarCargo()");
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
                                    nuevaOption.value = distrito.Distrito;
                                    selectDistrito.appendChild(nuevaOption);
                                })
                                
                            }
                        })
                }
            }))
}

function limpiarSelectDistrito()
{
    //identificamos nodo padre e hijo
    let elementoPadre = document.getElementById("menu-page");
    let antiguoHijo = document.getElementById("select-distrito");

    //creamos el nuevo nodo que reemplazará al existente
    let nuevoHijo = document.createElement("select");
    let mismoContenido = document.createElement("option");
    nuevoHijo.appendChild(mismoContenido);
    mismoContenido.text = "Distrito";
    mismoContenido.setAttribute("disabled", "true");
    mismoContenido.setAttribute("selected", "true");
    
    //reemplazamos el antiguo por el nuevo
    elementoPadre.replaceChild(nuevoHijo, antiguoHijo);

    //Seteamos los atributos para que aplique correctamente el estilo CSS
    nuevoHijo.setAttribute("class", "desplegable");
    nuevoHijo.setAttribute("name", "select-distrito");
    nuevoHijo.setAttribute("id", "select-distrito");
    //nuevoHijo.setAttribute("onchange", "detectarCargo()");
}