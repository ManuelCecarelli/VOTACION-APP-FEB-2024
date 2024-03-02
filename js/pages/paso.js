const tipoEleccion = 1;
const tipoRecuento = 1;
let banderaAnio = false;
let banderaCargo = false;

//Apenas se carga la página se piden los períodos a la API:
let consultaPeriodos = fetch("https://resultados.mininterior.gob.ar/api/menu/periodos")
    //Respuesta satisfactoria
    .then(response => response.json())
    .catch(error =>
    {
        //Se produce un error
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

function detectarCargo()
{
    banderaCargo = true;
    console.log("El valor de la variable banderaCargo ahora es: " + banderaCargo);
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
    let consultaCargos = fetch("https://resultados.mininterior.gob.ar/api/menu?año=" + anio.value)
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