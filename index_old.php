<head>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
<script src="https://momentjs.com/downloads/moment.min.js"></script>
</head>
<html>
    <div class="col-md-12" style="text-align: center;">
        <div>
            <h1>
            Quanto tempo sem ESFIHAS? 
            </h1>
        </div>
        <hr>
            <input type="text" id="dataInicio" value=""></input>
        <div id="contador">
        <br>
        <br>
        </div>
            <input id="intervalo" value=""></input>
        <div>

        </div>
    </div>
</html>

<script>
        window.onload = function() {
            let dataInicio = document.getElementById("dataInicio")
            dataInicio.value = contador.dataAtual('mm/dd/aa')

            console.log(dataInicio.value)

            setTimeout(() => {
                let teste = 1
                
            }, "10");
        };
    
    contador = {
        
        dataAtual: function(format) {
            
            const date = new Date();

            const map = {
                mm: date.getMonth() + 1,
                dd: date.getDate(),
                aa: date.getFullYear().toString().slice(-4),
                aaa: date.getFullYear()
            }

            return format.replace(/mm|dd|aa|aaa/gi, matched => map[matched])
        },

        setData: function(param) {
            
            if($('#dataInicio').val(this.dataAtual(param))) {
                return true;
            } else {
                return false;
            }
            
        },

        intervalo: function() {
            let atual = this.dataAtual('dd/mm/aa');
            let input = $('#dataInicio').val()

            let inicio = moment(atual, "DD/MM/YYYY");
            let fim = moment(input, "DD/MM/YYYY");

            intervalo = {
                diasIntervalo: fim.diff(inicio,'days'),
                mesIntervalo: fim.diff(inicio,'month'),
            }

            return intervalo;
        }

    }
</script>