        document.addEventListener('DOMContentLoaded', () => {

            // 1. Textos del formulario físico para el Modal
            const descripciones = {
                p1: {
                    optimo: "Más de 70% del sustrato es estable y puede ser colonizado por la epifauna. El tramo presenta una mezcla de piedras, troncos sumergidos o superficiales o cualquier otro sustrato estable.",
                    suboptimo: "Entre 40 y 70% del sustrato es estable. Aún existe un sustrato nuevo aun sin condiciones para ser habitado.",
                    marginal: "Entre 20 y 40% del sustrato es estable. Frecuentemente perturbado o removido.",
                    pobre: "Menos de un 20% del sustrato es estable. Ausencia de hábitats adecuados."
                },
                p2: {
                    optimo: "Entre 0 y 25% de la superficie de rocas, piedras y grava está rodeada de sedimento fino.",
                    suboptimo: "Entre 25 y 50% de la superficie de rocas, piedras y grava rodeadas de sedimento fino.",
                    marginal: "Entre 50 y 75% de la superficie de rocas, piedras y grava rodeadas de sedimento fino.",
                    pobre: "Más de un 75% de la superficie de rocas, piedras y grava rodeadas de sedimento fino."
                },
                p3: {
                    optimo: "El tramo del río presenta las cuatro combinaciones siguientes: a) lento/profundo, b) lento/bajo, c) rápido/profundo, d) rápido/bajo.",
                    suboptimo: "Sólo tres combinaciones. La ausencia de rápido/bajo determina el menor puntaje.",
                    marginal: "Sólo dos combinaciones. La ausencia de rápido/bajo y lento/bajo determina el menor puntaje.",
                    pobre: "Una sola combinación presente. Usualmente lento/profundo."
                },
                p4: {
                    optimo: "Poca presencia de islas o barreras, menos del 20 % del fondo afectado por deposición de sedimentos.",
                    suboptimo: "Aumento de la formación de barreras, principalmente de canto rodado, arena o sedimento fino. 20-50 % del fondo afectado, poca deposición en pozas.",
                    marginal: "Deposición moderada de canto rodado, grava y sedimento fino en barras viejas y nuevas. Del 50-80 % del fondo afectado.",
                    pobre: "Depósitos grandes de material fino, incremento del desarrollo de barras, más del 80 % del fondo afectado."
                },
                p5: {
                    optimo: "El nivel del agua alcanza la base de los márgenes y la exposición del sustrato de fondo es mínima.",
                    suboptimo: "El agua sólo cubre el 75 % del cauce o menos del 25 % del sustrato de fondo queda expuesto.",
                    marginal: "El nivel del agua cubre entre el 25 y 75 % del cauce y queda expuesta la mayor parte del sustrato de los rápidos.",
                    pobre: "Muy poca agua sobre el cauce y la mayoría como pozas."
                },
                p6: {
                    optimo: "Ausencia o mínima presencia de canalización o dragado. Corriente con cauce normal.",
                    suboptimo: "Cierta canalización presente por puentes. Evidencia de canalización actual o pasada.",
                    marginal: "Canalización extensiva. Diques u otras estructuras presentes en ambas márgenes. Entre el 40 y 80% del trecho del río canalizado y alterado.",
                    pobre: "Márgenes protegidas con gabiones o cemento. Más del 80 % del trecho del río canalizada y alterado. Los hábitats internos eliminados totalmente."
                },
                p7: {
                    optimo: "Ocurrencia de rápidos relativamente frecuente. La relación distancia entre rápidos y el ancho del río es < 7.",
                    suboptimo: "Ocurrencia de rápidos poco frecuente. La relación distancia entre rápidos y ancho del río entre 7 y 15.",
                    marginal: "Ocurrencia ocasional de rápidos. La relación distancia entre rápidos y el ancho del río se encuentra entre 15 y 25.",
                    pobre: "Por lo general el agua corre sin interrupción o rápidos muy bajos. La relación distancia entre rápidos y el ancho del río es mayor a 25."
                },
                p8: {
                    optimo: "Orillas estables, mínima o ausente evidencia de erosión de las orillas, <5 % de las orillas afectadas.",
                    suboptimo: "Orilla moderadamente estable, pequeñas áreas de erosión, 5-30 % de la orilla está erosionada.",
                    marginal: "Ribera del 30-60 % de erosión en las orillas, alto potencial de erosión de orillas durante descargas.",
                    pobre: "Orillas poco estables, entre 60-100 % están erosionadas."
                },
                p9: {
                    optimo: "Más del 90 % de las márgenes y la zona ribereña está cubierta por vegetación nativa incluyendo árboles, arbustos, macrófitas.",
                    suboptimo: "Entre el 70 y 90 % de las márgenes cubiertas por vegetación nativa. Vegetación algo abierta.",
                    marginal: "Entre el 50 y 70 % de las márgenes cubiertas por vegetación nativa. Vegetación abierta.",
                    pobre: "Menos del 50 % de las márgenes cubiertas por vegetación nativa."
                },
                p10: {
                    optimo: "Extensión de la vegetación ribereña mayor a 18 m y sin impacto antrópico.",
                    suboptimo: "Extensión de la vegetación ribereña entre 12 y 18 m y un mínimo impacto.",
                    marginal: "Extensión de la vegetación ribereña entre 6 y 12 m y un impacto evidente.",
                    pobre: "Extensión de la vegetación ribereña menor a 6 m. Poca o ninguna vegetación debido a un fuerte impacto."
                },
                // Si necesitas descripciones únicas para los demás, agrégalas aquí.
                // Por defecto usaré unas genéricas si no existen en este objeto.
                default: {
                    optimo: "Condiciones excelentes y estables para el hábitat.",
                    suboptimo: "Condiciones adecuadas, pero con ligeras alteraciones.",
                    marginal: "Condiciones alteradas que afectan moderadamente el hábitat.",
                    pobre: "Condiciones muy alteradas, hábitat severamente impactado."
                }
            };

            // 2. Elementos del DOM
            const rows = document.querySelectorAll('.parameter-row');
            const totalScoreSpan = document.getElementById('totalScore');
            const modalDetalle = new bootstrap.Modal(document.getElementById('modalDetalle'));
            const modalTitulo = document.getElementById('modalNivelTitulo');
            const modalDesc = document.getElementById('modalDescripcion');

            const btnModificar = document.getElementById('btnModificarParametros');
            const inputs = document.querySelectorAll('.score-input');

            // 3. Función para evaluar el puntaje
            function evaluarPuntaje(score) {
                if (score >= 16) return "ÓPTIMO";
                if (score >= 11) return "SUBÓPTIMO";
                if (score >= 6) return "MARGINAL";
                return "POBRE";
            }

            // 4. Actualizar toda la tabla y el total
            function actualizarTabla() {
                let total = 0;
                rows.forEach(row => {
                    const input = row.querySelector('.score-input');
                    const levelText = row.querySelector('.level-text');
                    const score = parseInt(input.value) || 0;

                    total += score;

                    // Actualizar el texto del nivel en la fila
                    const nivel = evaluarPuntaje(score);
                    levelText.textContent = nivel;
                });
                totalScoreSpan.textContent = total;
            }

            // 5. Eventos de los Inputs (cuando el admin edita)
            inputs.forEach(input => {
                input.addEventListener('input', () => {
                    // Limitar entre 0 y 20
                    if (input.value > 20) input.value = 20;
                    if (input.value < 0) input.value = 0;
                    actualizarTabla();
                });
            });

            // 6. Botones de "Detalle del nivel"
            rows.forEach(row => {
                const btn = row.querySelector('.btn-detalle');
                btn.addEventListener('click', () => {
                    const paramId = row.getAttribute('data-param');
                    const score = parseInt(row.querySelector('.score-input').value) || 0;
                    const nivel = evaluarPuntaje(score);

                    // Obtener descripción (busca en el objeto, si no existe usa default)
                    const dataDesc = descripciones[paramId] || descripciones.default;
                    const texto = dataDesc[nivel.toLowerCase().replace('ó', 'o')]; // quita acentos para buscar

                    // Actualizar Modal
                    modalTitulo.textContent = nivel;
                    // Cambiar color del título según nivel
                    if (nivel === 'ÓPTIMO') modalTitulo.style.color = '#2196F3';
                    if (nivel === 'SUBÓPTIMO') modalTitulo.style.color = '#4CAF50';
                    if (nivel === 'MARGINAL') modalTitulo.style.color = '#FFC107';
                    if (nivel === 'POBRE') modalTitulo.style.color = '#F44336';

                    modalDesc.textContent = texto;

                    // Mostrar Modal
                    modalDetalle.show();
                });
            });

           // 7. Lógica del Botón Modificar (Solo Admin)
            if (btnModificar) {
                btnModificar.addEventListener('click', () => {
                    const isEditing = !inputs[0].disabled;
                    
                    if (isEditing) {
                        // Bloquear campos y volver al botón AZUL
                        inputs.forEach(i => i.disabled = true);
                        btnModificar.innerHTML = '<i class="fas fa-edit me-2"></i> Modificar puntajes';
                        btnModificar.classList.replace('btn-success', 'btn-modificar'); // Cambia a azul
                    } else {
                        // Habilitar campos y cambiar el botón a VERDE
                        inputs.forEach(i => i.disabled = false);
                        btnModificar.innerHTML = '<i class="fas fa-save me-2"></i> Guardar puntajes';
                        btnModificar.classList.replace('btn-modificar', 'btn-success'); // Cambia a verde
                    }
                });
            }

            // Iniciar calculando el total inicial
            actualizarTabla();
        });
