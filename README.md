# Web of nodes connected by links
All physics is made up! ... well except some of it.

```
reset()                                                 - reposition all nodes
stop()                                                  - stop animation
start()                                                 - start animation
system.field.nodes[X].poke(new vector_cls(P, Q))        - accelerate node X with vector of acceleration (P, Q)
```

### [Test here](http://poseidon4o.eu/js_web/test/)
Drag the nodes to give them a push :)


#### Tests:
```
recursive iteration:
    benchmark(system, 10, 1000) = 1662.4

que optimization and BFS iteration:
    benchmark(system, 10, 1000) = 1159.9

memory allocator 'optimization':
    benchmark(system, 10, 1000) = 1303.5
```