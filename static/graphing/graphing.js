
// Helper function that setups WebGL context and initializes MathBox.
window.with_mathbox = function(element, func) {
    require(['mathBox'], function(){
            var mathbox = mathBox({
                                  plugins: ['core', 'controls', 'cursor', 'mathbox'],
                                  controls: { klass: THREE.OrbitControls },
                                  mathbox: {inspect: false},
                                  element: element[0],
                                  loop: {start: false},
                                  
                                  });
            
            var three = mathbox.three;
            three.renderer.setClearColor(new THREE.Color(0xFFFFFF), 1.0);
            three.camera.position.set(-1, 1, 2);
            three.controls.noKeys = true;
            
            three.element.style.height = "400px";
            three.element.style.width = "100%";
            
            function isInViewport(element) {
            var rect = element.getBoundingClientRect();
            var html = document.documentElement;
            var w = window.innerWidth || html.clientWidth;
            var h = window.innerHeight || html.clientHeight;
            return rect.top < h && rect.left < w && rect.bottom > 0 && rect.right > 0;
            }
            
            // Running update/render loop only for visible plots.
            var intervalId = setInterval(function(){
                                         if (three.element.offsetParent === null) {
                                         clearInterval(intervalId);
                                         three.destroy();
                                         return;
                                         }
                                         var visible = isInViewport(three.canvas);
                                         if (three.Loop.running != visible) {
                                         visible? three.Loop.start() : three.Loop.stop();
                                         }
                                         }, 100);
            
            func(mathbox);
            
            window.dispatchEvent(new Event('resize'));
            })
};


// Function for setting up 3D axes and plotting the graph of a 2D function f
window.plotGraph = function(mathbox, f, xlabel='x', ylabel='y', zlabel='f(x,y)', rng=[[-3, 3], [-5, 5], [-3, 3]]) {
    
    var view = mathbox.cartesian({range: rng,
                                 scale: [1, 1, 1]},
                                 {rotation:(t)=>[0, t*0.02, 0]}
                                 ).grid({axes: [1, 3]})
    
    view.area({id: 'yaxis',
              width: 1,
              height: 1,
              axes: [1, 3],
              expr: function (emit, x, y, i, j) {
              emit(4, 0, 0);
              emit(0, 0, 0);
              },
              items: 2,
              channels: 3,
              })
    .text({font: 'Helvetica',
          style: 'bold',
          width:  16,
          height: 5,
          depth:  2,
          expr: function (emit, i, j, k, time) {
          emit(ylabel);
          },
          })
    .label({color: '#000000',
           snap: false,
           outline: 2,
           size: 24,
           offset: [0, -32],
           depth: .5,
           zIndex: 1
           });
    
    view.vector({points: '#yaxis',
                color: 0x000000,
                width: 9,
                start: true
                });
    
    view.area({id: 'xaxis',
              width: 1,
              height: 1,
              axes: [1, 3],
              expr: function (emit, x, y, i, j) {
              emit(0, 0, 4);
              emit(0, 0, 0);
              },
              items: 2,
              channels: 3,
              })
    .text({font: 'Helvetica',
          style: 'bold',
          width:  16,
          height: 5,
          depth:  2,
          expr: function (emit, i, j, k, time) {
          emit(xlabel);
          },
          })
    .label({color: '#000000',
           snap: false,
           outline: 2,
           size: 24,
           offset: [0, -32],
           depth: .5,
           zIndex: 1,
           });
    
    view.vector({points: '#xaxis',
                color: 0x000000,
                width: 9,
                start: true,
                });
    
    view.area({id: 'zaxis',
              width: 1,
              height: 1,
              axes: [1, 3],
              expr: function (emit, x, y, i, j) {
              emit(0, 4, 0);
              emit(0, 0, 0);
              },
              items: 2,
              channels: 3,
              })
    .text({font: 'Helvetica',
          style: 'bold',
          width:  16,
          height: 5,
          depth:  2,
          expr: function (emit, i, j, k, time) {
          emit(zlabel);
          },
          })
    .label({color: '#000000',
           snap: false,
           outline: 2,
           size: 24,
           offset: [0, -32],
           depth: .5,
           zIndex: 1,
           });
    
    view.vector({points: '#zaxis',
                color: 0x000000,
                width: 9,
                start: true,
                });
    
    var graph = view.area({id:'graph',
                          width: 64,
                          height: 64,
                          axes: [1, 3],
                          expr: function (emit, y, x, i, j) {
                          emit(y, f(x, y), x);
                          },
                          items: 1,
                          channels: 3,
                          });
    
    view.surface({shaded: true,
                 lineX: true,
                 lineY: true,
                 points: graph,
                 color: 0x0000FF,
                 width: 1,
                 });
    
    return view;
};

window.addSegment = function(view, p0, p1, col) {
    
    view.array({width: 128,
               expr: function (emit, i, time) {
               var b = i/128;
               var a = 1-b;
               emit(a*p0[1] + b*p1[1], a*p0[2] + b*p1[2], a*p0[0] + b*p1[0]);
               },
               channels: 3,
               });
    
    view.line({color: col,
              width: 10,
              size: 2.5,
              stroke: 'dotted',
              start: false,
              end: false,
              });
    
};

window.addPoint = function(view, p, col, label) {
    view.array({width: 4,
               items: 2,
               channels: 3,
               expr: function (emit, i, t) {
               emit(p[1],p[2],p[0]);
               },
               })
    .point({color:  col,
           points: '<',
           size: 15,
           depth: .5,
           zBias: 50,
           })
    .text({font: 'Helvetica',
          style: 'bold',
          width:  16,
          height: 5,
          depth:  2,
          expr: function (emit, i, j, k, time) {
          emit(label);
          },
          })
    .label({color: col,
           snap: false,
           outline: 2,
           size: 24,
           offset: [0, -32],
           depth: .5,
           zIndex: 1,
           });
};

window.addCurve = function(view, ab, x, y, z, col) {
    
    view.array({width: 128,
               expr: function (emit, i, time) {
               var t = (ab[1]-ab[0])*(i/128) + ab[0];
               emit(y(t), z(t), x(t));
               },
               channels: 3,
               });
    
    view.line({color: col,
              width: 20,
              size: 2.5,
              start: true,
              end: true,
              });
};

window.addClosedCurve = function(view, ab, x, y, z, col) {
    
    view.array({width: 128,
               expr: function (emit, i, time) {
               var t = (ab[1]-ab[0])*(i/128) + ab[0];
               emit(y(t), z(t), x(t));
               },
               channels: 3,
               });
    
    view.line({color: col,
              width: 20,
              size: 2.5,
              start: false,
              end: false,
              });
};


window.addSurface = function(view, ab, cd, x, y, z, col, opa) {
    
    view.matrix({width: 64,
                height: 64,
                expr: function (emit, i, j, time) {
                var p = (ab[1]-ab[0])*(i/64) + ab[0];
                var q = (cd[1]-cd[0])*(j/64) + cd[0];
                emit(y(p, q), z(p, q), x(p, q));
                },
                items: 1,
                channels: 3
                })
    .surface({shaded: true,
             lineX: false,
             lineY: false,
             color: col,
             width: 1,
             opacity: opa
             });
}

window.addSequence = function(view, seq, col) {
    
    var idx = 0;
    var d = new Date();
    var start = d.getTime();
    view.array({width: 1,
               expr: function (emit, i, time) {
               var nd = new Date();
               var now = nd.getTime();
               if (1000 < now-start) {
               idx = idx + 1;
               if (seq.length <= idx) {
               idx = 0;
               }
               start = now;
               }
               emit(seq[idx][1], seq[idx][2], seq[idx][0]);
               },
               items: 1,
               channels: 3
               })
    .point({color:  col,
           points: '<',
           size: 15,
           depth: .5,
           zBias: 50,
           });
    
}
