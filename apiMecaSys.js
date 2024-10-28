const express = require('express');
const app = express();
const port = 3000;
const cors = require('cors')
const mysql = require('mysql2');


const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "chipote10",
    database: "tp4"
});

db.connect(err => {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }
    console.log('connected as id ' + db.threadId);
});

module.exports = db;
app.use(express.json())

app.use(express.urlencoded({ extended: true }));
app.use(cors())

/*app.get("/traerTurnos",(req,res)=>{
    const sql="SELECT * FROM turno"
    db.query(sql,(error,results)=>{
            const response= results.forEach(turno => {
            const sql2 = "SELECT * FROM detalleTurno where turno=" + turno.idturno;
            let detalle = 'caca';
            db.query(sql2, (_, response2) => {
                detalle = response2;
                console.log( detalle)
            }) 
            return {
                ...turno,
                fecha: turno.fecha.toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                }),
                detalle
            }
        });
         res.status(200).send(response);
    });
})*/


app.get("/traerTurnos", (req, res) => {
    const sql = "SELECT * FROM turno";

    db.query(sql, (error, results) => {
        console.log(results)
        if (error) {
            return res.status(400).send(error);
        }

        let finalResults = [];
        let completedQueries = 0;

        results.forEach(turno => {
            const sql2 = "SELECT s.nombreServicio as servicio , r.descripcion as nombreRepuesto,r.marca as marcaRepuesto FROM detalleturno AS dt LEFT JOIN servicio s ON s.idServicio=dt.servicio LEFT JOIN repuesto r ON r.idRepuesto=dt.repuesto WHERE dt.turno = " + turno.idturno;
               
                db.query(sql2, (error, response2) => {
                if (error) {
                    return res.status(500).send(error);
                }


                const turnoFormateado = {
                    ...turno,
                    fecha: turno.fecha.toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    }),
                    detalle: response2

                };
                
                finalResults.push(turnoFormateado)



                completedQueries++;


                if (completedQueries === results.length) {
                    return res.status(200).send(finalResults);
                }
            });
        });


        if (results.length === 0) {
            return res.status(200).send(finalResults);
        }
    });
});


app.delete("/eliminarTurno/:id", (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM turno WHERE idturno = ?';
    db.query(query, [id], (err, result) => {
        if (err) throw err;
        const query2 = 'DELETE FROM detalleturno WHERE turno= ?';
        db.query(query2, [id], (err2,) => {
            if (err2) throw err2
            res.status(204).send(result);
        })

    });

})


app.get("/traerClientes", (req, res) => {
    const sql = 'SELECT * FROM cliente  JOIN persona ON persona.idPersona=cliente.persona JOIN direccion ON persona.direccion=direccion.idDireccion'
    db.query(sql, (error, respuesta) => {
        if (error) {
            return res.status(400).send(error);
        }
        return res.status(200).send(respuesta);
    })
})

app.get("/traerVehiculo/:id", (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM vehiculo WHERE vehiculo.idCliente=?'
    db.query(sql, [id], (error, result) => {
        if (error) {
            return res.status(400).send(error);
        }
        return res.status(200).send(result);
    })

})

app.get("/traerMecanicos", (req, res) => {
    const sql = 'SELECT * FROM mecanico  JOIN persona ON persona.idPersona=mecanico.perosna JOIN direccion ON persona.direccion=direccion.idDireccion'
    db.query(sql, (error, respuesta) => {
        if (error) {
            return res.status(400).send(error);
        }
        return res.status(200).send(respuesta);
    })

})

app.get("/traerRepuestos"), (req, res) => {
    const sql = 'SELECT * FROM repuesto'
    db.query(sql, (error, respuesta) => {
        if (error) {
            return res.status(400).send(error)
        }
        return res.status(400).send(respuesta)
    })
}


app.get("/traerServicios"), (req, res) => {
    const sql = 'SELECT * FROM servicio'
    db.query(sql, (error, respuesta) => {
        if (error) {
            return res.status(400).send(error)
        }
        return res.status(400).send(respuesta)
    })
}

app.listen(port, () => {
    console.log("server ok")
})